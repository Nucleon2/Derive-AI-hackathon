import {
  createClient,
  LiveTranscriptionEvents,
  type ListenLiveClient,
} from "@deepgram/sdk";

export type TranscriptHandler = (
  transcript: string,
  isFinal: boolean
) => void;

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

/**
 * Manages a Deepgram WebSocket connection for real-time
 * speech-to-text on Discord Opus audio.
 *
 * Discord sends Opus at 48kHz stereo -- Deepgram accepts it natively.
 * Includes automatic reconnection on unexpected disconnects.
 */
export class SttService {
  private connection: ListenLiveClient | null = null;
  private onTranscript: TranscriptHandler;
  private keepAliveInterval: ReturnType<typeof setInterval> | null =
    null;
  private reconnectAttempts = 0;
  private isStopped = false;

  constructor(onTranscript: TranscriptHandler) {
    this.onTranscript = onTranscript;
  }

  /**
   * Opens a streaming connection to Deepgram.
   */
  async start(): Promise<void> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error(
        "DEEPGRAM_API_KEY environment variable is not set"
      );
    }

    this.isStopped = false;
    const deepgram = createClient(apiKey);

    this.connection = deepgram.listen.live({
      model: "nova-3",
      language: "en",
      encoding: "opus",
      sample_rate: 48000,
      channels: 2,
      punctuate: true,
      interim_results: true,
      utterance_end_ms: 1500,
      endpointing: 500,
      smart_format: true,
    });

    this.connection.on(
      LiveTranscriptionEvents.Transcript,
      (data: {
        is_final: boolean;
        speech_final: boolean;
        channel: {
          alternatives: Array<{ transcript: string }>;
        };
      }) => {
        const transcript =
          data.channel?.alternatives?.[0]?.transcript;
        if (!transcript) return;

        // speech_final means the utterance is complete (endpointing)
        const isFinal = data.speech_final ?? data.is_final;
        this.onTranscript(transcript, isFinal);
      }
    );

    this.connection.on(
      LiveTranscriptionEvents.Error,
      (err: unknown) => {
        console.error("[STT] Deepgram error:", err);
      }
    );

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      this.cleanupTimers();
      // Auto-reconnect if we didn't stop intentionally
      if (!this.isStopped) {
        this.attemptReconnect();
      }
    });

    // Keep connection alive during silence
    this.keepAliveInterval = setInterval(() => {
      this.connection?.keepAlive();
    }, 10_000);

    this.reconnectAttempts = 0;
  }

  /**
   * Attempts to reconnect to Deepgram after an unexpected disconnect.
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(
        `[STT] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`
      );
      this.connection = null;
      return;
    }

    this.reconnectAttempts++;
    const delay =
      RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1);
    console.log(
      `[STT] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
    );

    await new Promise((r) => setTimeout(r, delay));

    if (this.isStopped) return;

    try {
      await this.start();
      console.log("[STT] Reconnected to Deepgram successfully.");
    } catch (err) {
      console.error("[STT] Reconnect failed:", err);
      this.attemptReconnect();
    }
  }

  /**
   * Sends an Opus audio chunk to Deepgram for transcription.
   * Silently drops packets if connection is unavailable.
   */
  sendAudio(opusPacket: Buffer): void {
    if (!this.connection) return;
    try {
      this.connection.send(
        opusPacket.buffer.slice(
          opusPacket.byteOffset,
          opusPacket.byteOffset + opusPacket.byteLength
        ) as ArrayBuffer
      );
    } catch (err) {
      console.error("[STT] Failed to send audio packet:", err);
    }
  }

  /**
   * Returns whether the STT connection is active.
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  /**
   * Gracefully closes the Deepgram connection.
   */
  stop(): void {
    this.isStopped = true;
    try {
      this.connection?.requestClose();
    } catch {
      // Connection may already be closed
    }
    this.cleanupTimers();
    this.connection = null;
  }

  private cleanupTimers(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}
