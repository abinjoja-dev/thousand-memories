/**
 * 1000 Stories — example chat backend
 * -----------------------------------
 * A minimal Express server that proxies chat messages from the
 * website's widget (js/chat.js) to the Claude API. This exists so
 * the ANTHROPIC_API_KEY never has to touch the browser.
 *
 * This is a reference implementation, not a production deployment.
 * Before going live, add at minimum:
 *   - rate limiting (e.g. express-rate-limit) per IP
 *   - a stricter CORS origin allowlist (see below)
 *   - request size limits and basic input validation
 *   - logging/monitoring for errors and abuse
 *
 * Run locally:
 *   1. cp .env.example .env      and fill in ANTHROPIC_API_KEY
 *   2. npm install
 *   3. npm start
 *   4. Point CHAT_CONFIG.endpoint in js/chat.js at
 *      http://localhost:3001/api/chat and set demoMode = false
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// REPLACE ME: lock this down to your real domain(s) before going live.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500').split(',');
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: '20kb' }));

// Everything the assistant is allowed to know about the studio.
// Keep this in sync with the actual site content in index.html.
const SYSTEM_PROMPT = `You are the studio assistant for 1000 Stories, a wedding
photography and design studio based in Kochi, India.

What 1000 Stories is:
- A wedding photography and design studio — NOT a full-service wedding
  planning company. It does not run weddings day-to-day, manage vendors,
  or handle bookings/payments.
- Founded by Meera (Founder & Creative Director), around 12 years in
  business, 300+ weddings documented, works across roughly 18 cities.
- Travels across India regularly for destination weddings, plus a small
  number of international dates each year.
- Covers a range of styles: intimate ceremonies, multi-day traditional
  weddings, and destination celebrations. Some collaborations include
  styling input alongside photography; always be upfront that scope
  varies per wedding.

How to talk:
- Warm, concise, a little personal — never salesy or corporate.
- Keep replies short (2-4 sentences) unless the visitor asks for more detail.
- You do not know real-time availability, exact pricing, or specific dates.
  For anything requiring a commitment (pricing, availability, contracts),
  direct the visitor to the contact form on the page or
  hello@1000stories.studio, rather than guessing or promising anything.
- If asked something unrelated to weddings/the studio, gently redirect
  back to what you can help with.
- Never invent portfolio details, testimonials, or couple names beyond
  what's described here.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    if (messages.length > 20) {
      return res.status(400).json({ error: 'conversation too long' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 2000),
      })),
    });

    const reply = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('/healthz', (_req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`1000 Stories chat backend listening on port ${PORT}`);
});
