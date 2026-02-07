import {
  VoiceConnectionStatus,
  type VoiceConnection,
} from "@discordjs/voice";
import { SttService } from "./pipeline/stt.service";
import { LlmService } from "./pipeline/llm.service";
import { TtsService } from "./pipeline/tts.service";
import { subscribeToUser } from "./voice/audio-receiver";
import {
  playAudio,
  stopPlayback,
  destroyPlayer,
} from "./voice/audio-player";
import { databaseService } from "../database";

/**
 * Represents the state of a single coaching session.
 */
interface CoachingSession {
  userId: string;
  discordUserId: string;
  walletAddress: string;
  guildId: string;
  channelId: string;
  connection: VoiceConnection;
  stt: SttService;
  llm: LlmService;
  tts: TtsService | null;
  unsubscribeAudio: (() => void) | null;
  isProcessing: boolean;
  interrupted: boolean;
  utteranceBuffer: string;
  topicsDiscussed: string[];
  nudgesDelivered: string[];
  startedAt: Date;
}

/** Active sessions keyed by Discord user ID. */
const sessions = new Map<string, CoachingSession>();

interface StartSessionParams {
  userId: string;
  discordUserId: string;
  walletAddress: string;
  guildId: string;
  channelId: string;
  connection: VoiceConnection;
  tokenAddress?: string;
}

/**
 * Starts a new coaching session for a user.
 *
 * Wires up the full pipeline:
 *   Discord audio -> Deepgram STT -> DeepSeek LLM
 *     -> ElevenLabs TTS -> Discord playback
 *
 * Includes voice connection monitoring for auto-cleanup.
 */
async function startSession(
  params: StartSessionParams
): Promise<void> {
  const {
    userId,
    discordUserId,
    walletAddress,
    guildId,
    channelId,
    connection,
    tokenAddress,
  } = params;

  console.log(
    `[Session] Starting for ${discordUserId} ` +
      `(wallet: ${walletAddress})`
  );

  const llm = new LlmService(walletAddress, tokenAddress);
  await llm.initialize();
  console.log("[Session] LLM initialized");

  const session: CoachingSession = {
    userId,
    discordUserId,
    walletAddress,
    guildId,
    channelId,
    connection,
    stt: null as unknown as SttService,
    llm,
    tts: null,
    unsubscribeAudio: null,
    isProcessing: false,
    interrupted: false,
    utteranceBuffer: "",
    topicsDiscussed: [],
    nudgesDelivered: [],
    startedAt: new Date(),
  };

  // Create STT with transcript handler
  const stt = new SttService((transcript, isFinal) => {
    handleTranscript(session, transcript, isFinal);
  });

  session.stt = stt;
  await stt.start();
  console.log("[Session] STT started");

  // Subscribe to the user's audio in the voice channel
  const unsubscribe = subscribeToUser(
    connection,
    discordUserId,
    (opusPacket) => {
      // Forward audio to STT -- interruption is handled
      // separately in handleTranscript to avoid races
      stt.sendAudio(opusPacket);
    },
    () => {
      console.log("[Audio] User stopped speaking");
    }
  );

  session.unsubscribeAudio = unsubscribe;
  sessions.set(discordUserId, session);
  console.log("[Session] Audio subscription active");

  // Monitor voice connection -- auto-cleanup on disconnect
  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log(
      `[Session] Voice connection destroyed for ` +
        `${discordUserId}`
    );
    cleanupSession(discordUserId).catch((err) => {
      console.error(
        "[Session] Cleanup on disconnect failed:",
        err
      );
    });
  });

  // Send an initial greeting via TTS
  try {
    await processLlmResponse(
      session,
      "The user just joined the coaching session. " +
        "Give a brief, warm greeting and reference one " +
        "interesting pattern from their wallet data."
    );
    console.log("[Session] Initial greeting delivered");
  } catch (err) {
    console.error("[Session] Initial greeting failed:", err);
    // Session is still usable even if greeting fails
  }
}

/**
 * Handles incoming transcripts from Deepgram.
 *
 * Accumulates interim results and triggers the LLM pipeline
 * on final transcripts.
 */
function handleTranscript(
  session: CoachingSession,
  transcript: string,
  isFinal: boolean
): void {
  if (!isFinal) {
    session.utteranceBuffer = transcript;
    return;
  }

  // Final transcript -- process the complete utterance
  const finalText = transcript || session.utteranceBuffer;
  session.utteranceBuffer = "";

  if (!finalText.trim()) return;

  console.log(
    `[Pipeline] User said: "${finalText}"`
  );
  session.topicsDiscussed.push(finalText);

  // If already processing, mark as interrupted so the current
  // pipeline knows to stop, then queue this utterance
  if (session.isProcessing) {
    console.log(
      "[Pipeline] Interrupting current response"
    );
    session.interrupted = true;
    stopPlayback(session.guildId);
    if (session.tts) {
      session.tts.stop();
      session.tts = null;
    }
    // Wait briefly for the current pipeline to notice and exit,
    // then process the new utterance
    setTimeout(() => {
      session.isProcessing = false;
      session.interrupted = false;
      processLlmResponse(session, finalText).catch((err) => {
        console.error("[Pipeline] Error after interrupt:", err);
        session.isProcessing = false;
      });
    }, 100);
    return;
  }

  processLlmResponse(session, finalText).catch((err) => {
    console.error("[Pipeline] Error processing response:", err);
    session.isProcessing = false;
  });
}

/**
 * Runs the LLM -> TTS -> playback pipeline for a single turn.
 *
 * Collects all TTS audio before playing to avoid choppy output.
 * Checks the `interrupted` flag between stages so we can bail
 * out quickly when the user speaks over the bot.
 */
async function processLlmResponse(
  session: CoachingSession,
  text: string
): Promise<void> {
  session.isProcessing = true;
  session.interrupted = false;

  console.log("[Pipeline] Starting LLM -> TTS -> playback");

  // Collect all audio chunks, play when done
  const audioChunks: Buffer[] = [];
  let ttsResolve: (() => void) | null = null;
  const ttsDonePromise = new Promise<void>((resolve) => {
    ttsResolve = resolve;
  });

  const tts = new TtsService(
    (pcmChunk) => {
      audioChunks.push(pcmChunk);
    },
    () => {
      ttsResolve?.();
    }
  );

  session.tts = tts;

  try {
    await tts.start();
    console.log("[Pipeline] TTS connected");
  } catch (err) {
    console.error("[Pipeline] Failed to start TTS:", err);
    session.tts = null;
    session.isProcessing = false;
    return;
  }

  // Bail if interrupted while TTS was connecting
  if (session.interrupted) {
    tts.stop();
    session.tts = null;
    session.isProcessing = false;
    return;
  }

  try {
    let sentenceBuffer = "";

    await session.llm.respond(
      text,
      (chunk) => {
        // Bail mid-stream if interrupted
        if (session.interrupted) return;

        sentenceBuffer += chunk;
        // Send to TTS in sentence-sized chunks
        const sentenceEnd = sentenceBuffer.match(/[.!?]\s/);
        if (sentenceEnd && sentenceEnd.index !== undefined) {
          const sentence = sentenceBuffer.slice(
            0,
            sentenceEnd.index + 1
          );
          tts.sendText(sentence);
          sentenceBuffer = sentenceBuffer.slice(
            sentenceEnd.index + 2
          );
        }
      },
      (fullResponse) => {
        if (session.interrupted) return;
        // Flush remaining text
        if (sentenceBuffer.trim()) {
          tts.sendText(sentenceBuffer);
        }
        tts.flush();
        session.nudgesDelivered.push(fullResponse);
        console.log(
          `[LLM] Response: "${fullResponse.slice(0, 80)}..."`
        );
      }
    );
  } catch (err) {
    console.error("[Pipeline] LLM response failed:", err);
    tts.stop();
    session.tts = null;
    session.isProcessing = false;
    return;
  }

  // Bail if interrupted during LLM streaming
  if (session.interrupted) {
    tts.stop();
    session.tts = null;
    session.isProcessing = false;
    return;
  }

  // Wait for TTS to finish generating audio
  await ttsDonePromise;
  console.log(
    `[Pipeline] TTS done, ${audioChunks.length} chunks ` +
      `(${audioChunks.reduce((s, c) => s + c.length, 0)} bytes)`
  );

  // Bail if interrupted during TTS
  if (session.interrupted) {
    tts.stop();
    session.tts = null;
    session.isProcessing = false;
    return;
  }

  // Play the collected audio
  if (audioChunks.length > 0) {
    const fullAudio = Buffer.concat(audioChunks);
    try {
      console.log(
        `[Pipeline] Playing ${fullAudio.length} bytes of audio`
      );
      await playAudio(
        session.connection,
        fullAudio,
        session.guildId
      );
      console.log("[Pipeline] Playback finished");
    } catch (err) {
      console.error("[Pipeline] Audio playback error:", err);
    }
  } else {
    console.warn("[Pipeline] No audio chunks received from TTS");
  }

  tts.stop();
  session.tts = null;
  session.isProcessing = false;
}

/**
 * Internal cleanup -- stops all pipeline components without
 * persisting to database. Used for unexpected disconnects.
 */
async function cleanupSession(
  discordUserId: string
): Promise<void> {
  const session = sessions.get(discordUserId);
  if (!session) return;

  session.stt.stop();
  if (session.tts) session.tts.stop();
  if (session.unsubscribeAudio) session.unsubscribeAudio();
  destroyPlayer(session.guildId);
  sessions.delete(discordUserId);
}

/**
 * Ends a coaching session and persists the summary to the database.
 */
async function endSession(discordUserId: string): Promise<void> {
  const session = sessions.get(discordUserId);
  if (!session) return;

  // Clean up pipeline
  session.stt.stop();
  if (session.tts) session.tts.stop();
  if (session.unsubscribeAudio) session.unsubscribeAudio();
  destroyPlayer(session.guildId);

  // Generate a session summary from conversation history
  const history = session.llm.getHistory();
  const summaryText = history
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n")
    .slice(0, 2000);

  // Persist to database
  try {
    await databaseService.saveDiscordSession({
      userId: session.userId,
      discordUserId: session.discordUserId,
      guildId: session.guildId,
      channelId: session.channelId,
      startedAt: session.startedAt,
      endedAt: new Date(),
      nudgesDelivered: session.nudgesDelivered,
      topicsDiscussed: session.topicsDiscussed,
      sessionSummary: summaryText,
    });
  } catch (err) {
    console.error(
      "[Session] Failed to save session to database:",
      err
    );
  }

  sessions.delete(discordUserId);
}

/**
 * Checks if a user has an active session.
 */
function hasSession(discordUserId: string): boolean {
  return sessions.has(discordUserId);
}

/**
 * Gets a user's active session, if any.
 */
function getSession(
  discordUserId: string
): CoachingSession | undefined {
  return sessions.get(discordUserId);
}

export const sessionManager = {
  startSession,
  endSession,
  hasSession,
  getSession,
};
