# Presentation Prompt for EthosAI Hackathon Slides

You are creating a professional slide presentation for EthosAI, an AI-powered trading analyst built for the Deriv hackathon challenge "Intelligent Trading Analyst." The presentation should be visually clean, compelling, and directly address the challenge requirements.

## Context: The Challenge

**Challenge Title:** Intelligent Trading Analyst

**Core Problem:** Traders face two interconnected challenges:
1. Understanding what's happening in markets (price movements, news, patterns)
2. Managing their own trading behavior (emotional trading, losing streaks, impulsive decisions)

Professional traders have analyst teams and coaches. Retail traders have neither.

**The Challenge Ask:** Build an AI-powered trading analyst that combines:
- **Market Analysis** -- Explain price movements, identify patterns, summarize news, provide sentiment analysis
- **Behavioral Insights** -- Detect emotional/impulsive trading patterns, provide gentle nudges, help traders recognize winning/losing patterns, suggest breaks
- **Social Media Personas & Content** -- Generate AI analyst personas for LinkedIn/X, create platform-appropriate content, transform analysis into shareable posts

**What Would Blow Their Minds:**
- Real-time market explanations combined with behavioral awareness
- An analyst who says "The market just did X, and based on your history, you tend to Y in these situations"
- AI personas with distinct voices (calm analyst, data nerd, trading coach)
- Something that catches revenge trading before it starts
- Social content so good people don't realize it's AI-generated

**Key Constraints:**
- Must demo live (no slide decks for the demo itself, but this is the pitch deck)
- AI must be core to the solution
- No predictions or buy/sell signals -- only analysis and explanation
- Supportive, not restrictive (advise and inform, don't block trades)
- Brand-safe content for social media

---

## What We Built: EthosAI

EthosAI is an AI-powered behavioral analyst and voice coach for Ethereum traders. It directly addresses all three challenge pillars:

### 1. Market Analysis ✅
- **Token Market Analysis:** Pulls live data from CoinGecko (price, volume, market cap, sentiment, technical patterns like uptrend/downtrend/volatility)
- **Price-Timing Correlation:** Analyzes your transfer activity against 6-hour price windows to show if you're timing moves well or poorly
- **Transfer Size Metrics:** Identifies large vs. small transfer patterns and what they correlate with
- **Market Brief Generation:** DeepSeek LLM generates plain-language summaries of technical patterns, news events, and sentiment

### 2. Behavioral Insights ✅
- **Wallet Behavior Analysis:** Fetches full on-chain history from Etherscan (transactions, swaps, transfers, NFTs)
- **Pattern Detection:** AI identifies dominant patterns (e.g., "high-frequency trader," "dip buyer," "late-night overtrader")
- **Activity Classification:** Dormant, occasional, steady, active, or high-frequency based on real transaction data
- **Risk Signals:** Flags behaviors like revenge trading patterns, impulsive swap bursts, exposure to volatile small-cap tokens
- **Token Habits:** Tracks your behavior around specific tokens (accumulation, quick flips, hold duration)
- **Reflection Questions:** AI generates personalized questions to prompt self-awareness ("Do you notice you trade more after losses?")
- **Behavioral Nudges:** Gentle suggestions based on detected patterns ("You tend to swap 3+ times in 30 minutes after moves like this. Want a 60-second recap first?")

### 3. Social Media Personas & Content ✅ (Bonus: Voice Coach)
Instead of generating static social posts, we built something more powerful:
- **Discord Voice Coach:** A real-time AI coach that joins your Discord voice channel
- **Live Conversational Analysis:** Listens to you via Deepgram STT, responds through ElevenLabs TTS
- **Context-Aware Coaching:** Loads your full wallet behavioral profile into the conversation context
- **Natural Interruption:** You can interrupt the bot mid-sentence and it stops to listen
- **Session Persistence:** All coaching sessions logged with summaries, topics discussed, and nudges delivered
- **Persona: "Derive Coach"** -- Supportive, habit-focused, psychology-aware tone (one of the three personas requested)

### 4. The "Blow Your Mind" Moment ✅
**We deliver the exact quote from the challenge:**
> "The market just did X, and based on your history, you tend to Y in these situations"

When you analyze a token, EthosAI says things like:
- "ETH dropped 8% in the last 6 hours. In your history, you made 4 large transfers during similar moves, with 3 of them occurring right before further drops."
- "Your average transfer size is 0.5 ETH, but your large transfers (2+ ETH) tend to happen during high volatility windows."
- "You've held this token for an average of 12 days before swapping. Your longest hold was 45 days, shortest was 2 hours."

The Discord voice coach takes it further by having a live conversation grounded in your behavioral data.

---

## Slide Structure (10 slides)

### Slide 1: Title
**Title:** EthosAI
**Subtitle:** AI-Powered Behavioral Analyst for Ethereum Traders
**Tagline:** "Understand the market. Understand yourself."
**Visuals:** Clean, minimal design. Ethereum logo + brain/analysis iconography. Dark theme preferred.

---

### Slide 2: The Problem + Challenge
**Headline:** Retail Traders Face Two Problems
**Two columns (condensed quotes):**
- **Understanding Markets:** "I see the price dropped but don't know why" | "Pros have analyst teams. I have Google."
- **Managing Behavior:** "I didn't realize I was on a losing streak" | "I trade badly when emotional but don't realize it in the moment"

**Challenge Box (bottom third):**
Deriv Challenge: Build an AI analyst combining **Market Analysis** + **Behavioral Insights** + **Social Personas**

---

### Slide 3: Our Solution
**Headline:** EthosAI: Your Personal Trading Analyst
**Visual:** Dashboard screenshot or clean 3-part diagram
**Three boxes:**
1. **Wallet Analysis** -- AI reads your on-chain history, identifies patterns
2. **Token Analysis** -- Correlates your behavior with market movements
3. **Voice Coach** -- Real-time Discord conversations grounded in your data

**Bottom:** "Built on Ethereum. Powered by AI. No predictions. Only awareness."

---

### Slide 4: How It Works (Combined Flow)
**Headline:** Paste Your Wallet → Get Behavioral Insights
**Left (Wallet Analysis):**
- Fetches transaction history from Etherscan
- AI identifies: trade frequency, token habits, risk signals, holding patterns
- Classifies activity: dormant → occasional → steady → active → high-frequency

**Right (Token Analysis):**
- Add a token contract → pulls CoinGecko market data
- Correlates YOUR transfers with price movements (6-hour windows)
- Shows timing quality: "4 large transfers during similar moves, 3 before further drops"

**Visual:** Split-screen screenshot showing both wallet insight card and token analysis

---

### Slide 5: The "Blow Your Mind" Moment
**Headline:** "The market did X, and you tend to do Y"
**Large centered quote (from challenge):**
> "An analyst who says, 'The market just did X, and based on your history, you tend to Y in these situations'"

**Example outputs (3 bubbles):**
- "ETH dropped 8%. Your history shows you increase trade frequency within 2 hours and swap into volatile tokens. Want a 5-min cooldown?"
- "Your large transfers (2+ ETH) happen during high volatility. Average size: 0.5 ETH."
- "You accumulate ETH during dips but swap into small-caps during rallies (73% confidence)"

---

### Slide 6: Discord Voice Coach (Live AI)
**Headline:** Talk to Your AI Coach in Real Time
**How it works (left):**
- `/link <wallet>` → connects your wallet to Discord
- `/coach` → bot joins voice channel
- Listens via Deepgram STT, responds via ElevenLabs TTS
- Loaded with your full behavioral profile
- Natural interruption support

**Visual (right):** Discord screenshot or mockup with bot speaking
**Quote bubble:** "Your history shows you often regret swaps made within 30 minutes of price spikes. Want to talk through what you're feeling?"

**Bottom:** "Not a chatbot. A conversation grounded in your real on-chain data."

---

### Slide 7: Dashboard & Persistence
**Headline:** All Your Insights in One Place
**Visual:** Dashboard screenshot showing 3 tabs
**Three sections:**
1. **Insights** -- Current behavioral profile with patterns, habits, risk signals
2. **History** -- Past analyses, expandable with summaries and reflections
3. **Coaching** -- Discord session logs with duration, topics, nudges, summaries

**Bottom:** "Track your behavioral evolution over time."

---

### Slide 8: Tech Stack + Challenge Alignment
**Headline:** How We Built It & How We Delivered
**Left column (Tech):**
- **Backend:** ElysiaJS, Bun, PostgreSQL, Prisma 7
- **AI:** DeepSeek LLM, Deepgram STT, ElevenLabs TTS
- **Data:** Etherscan API, CoinGecko API
- **Frontend:** React 19, Vite, Tailwind v4, Zustand

**Right column (Challenge Alignment):**
- ✅ **Market Analysis** -- Technical patterns, price correlation, sentiment
- ✅ **Behavioral Insights** -- Pattern detection, risk signals, nudges, reflection questions
- ✅ **Social Personas** -- Discord voice coach with "Trading Coach" persona
- ✅ **No Predictions** -- Only explains behavior. Never suggests buy/sell.
- ✅ **Live Demo** -- Fully functional web app + Discord bot

---

### Slide 9: What Makes EthosAI Different
**Headline:** Why This Matters
**Four points (large text):**
1. **Grounded in Real Data** -- Every insight from YOUR on-chain behavior
2. **Conversational AI** -- Real conversations, not scripted responses
3. **Behavioral, Not Financial** -- We help you see patterns, not predict prices
4. **Built for Retail** -- Pros have teams. You have EthosAI.

**Bottom quote:** "Trading platforms provide execution. EthosAI provides intelligence."

---

### Slide 10: Demo + Thank You
**Headline:** Let's See It Live
**Three demo flows (icons/boxes):**
1. Paste wallet → behavioral analysis
2. Paste token → market + behavior correlation
3. `/coach` → live voice conversation

**Bottom section:**
**Thank You | Questions?**
- GitHub: [repo link]
- Live Demo: [URL]
- Contact: [team]

**Visual:** QR code for demo + EthosAI logo

---

## Design Guidelines

- **Color Scheme:** Dark theme with Ethereum-inspired accent colors (blues, purples, subtle reds for risk signals). Professional, not flashy.
- **Typography:** Clean sans-serif. Geist font if possible (matches our UI). Large, readable text.
- **Visuals:** Use actual screenshots from the app wherever possible. If mockups are needed, keep them realistic.
- **Tone:** Confident but not overselling. Acknowledge the problem, show the solution, demonstrate value.
- **Length:** 10 slides total. Tight, punchy, impactful.
- **Flow:** Problem → Challenge → Solution → How It Works → Tech → Demo CTA

---

## Key Talking Points for Presenter

1. **Open with the problem:** Retail traders have no analyst team, no behavioral coach. EthosAI is both.
2. **Tie to the challenge:** Show the challenge requirements slide. Then show how we hit every single one.
3. **Emphasize the "blow your mind" moment:** The quote "The market just did X, and you tend to do Y" — that's our core value prop.
4. **Demo the Discord bot:** This is the most impressive part. Show a live voice conversation grounded in real wallet data.
5. **Highlight behavioral focus:** We're not a trading bot. We're a mirror. We help you see yourself.
6. **Close with impact:** "Deriv's mission is to make trading accessible. EthosAI makes trading *intelligent*."

---

## Output Format

Create a slide deck in Google Slides, PowerPoint, or Keynote using this structure. Export as PDF for submission if required. Ensure all screenshots are high-quality, all text is legible, and the design is consistent across slides.

If you're using an AI design tool like Gamma, Canva, or Beautiful.ai, paste this entire prompt and let it generate the deck. Review and refine as needed.

---

## Final Note

This is a hackathon. The judges want to see:
1. Does it work? (Yes — live demo)
2. Does it solve the problem? (Yes — addresses all three pillars)
3. Is it impressive? (Yes — voice coach + behavioral correlation is novel)
4. Can I use it today? (Yes — fully functional)

Make sure the presentation reflects that confidence.
