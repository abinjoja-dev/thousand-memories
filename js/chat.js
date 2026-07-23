/* =========================================================
   1000 STORIES — chat agent widget
   =========================================================

   HOW THIS WORKS
   --------------
   This widget is a real chat UI wired to call a backend endpoint
   (CHAT_CONFIG.endpoint) that you control. It never calls the
   Anthropic API directly from the browser — API keys should never
   live in client-side code, so a small backend is required to go
   live. A ready-to-adapt example backend is in /server-example.

   DEMO_MODE
   ---------
   Until you deploy that backend, DEMO_MODE keeps the widget usable
   with a small set of canned, keyword-matched replies drawn from
   this site's FAQ — clearly labelled "Demo" in the header so
   visitors aren't misled into thinking it's a live AI assistant.

   TO GO LIVE
   ----------
   1. Deploy /server-example (or your own backend) so it's reachable
      at some URL, e.g. https://api.yoursite.com/chat
   2. Set CHAT_CONFIG.endpoint to that URL below.
   3. Set CHAT_CONFIG.demoMode to false.
---------------------------------------------------------------- */

const CHAT_CONFIG = {
  endpoint: '/api/chat',   // REPLACE ME once your backend is deployed
  demoMode: true,          // set to false once endpoint above is live
};

document.addEventListener('DOMContentLoaded', () => {
  const launcher = document.getElementById('chatLauncher');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const messagesEl = document.getElementById('chatMessages');
  const suggestionsEl = document.getElementById('chatSuggestions');
  const formEl = document.getElementById('chatForm');
  const inputEl = document.getElementById('chatInput');
  const subtitleEl = document.getElementById('chatSubtitle');

  if (!launcher || !panel) return;

  let history = []; // { role: 'user' | 'assistant', content: string }
  let hasOpened = false;

  subtitleEl.textContent = CHAT_CONFIG.demoMode ? 'Studio assistant · Demo' : 'Studio assistant';

  /* ---------- Open / close ---------- */
  function openPanel() {
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!hasOpened) {
      hasOpened = true;
      addMessage('assistant', "Hi! I'm the studio assistant for 1000 Stories. Ask me about our style, past weddings, or how to get in touch.");
    }
    inputEl.focus();
  }
  function closePanel() {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
  }
  launcher.addEventListener('click', () => {
    panel.classList.contains('is-open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  /* ---------- Rendering ---------- */
  function addMessage(role, text, opts = {}) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble from-${role === 'user' ? 'user' : 'agent'}${opts.note ? ' is-note' : ''}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chatTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    const typing = document.getElementById('chatTypingIndicator');
    if (typing) typing.remove();
  }

  /* ---------- Demo-mode canned responder ----------
     Simple keyword matching against this site's own FAQ content.
     Replace by setting CHAT_CONFIG.demoMode = false once a real
     backend (see /server-example) is deployed.
  ---------------------------------------------------------------- */
  const DEMO_RESPONSES = [
    { keywords: ['travel', 'destination', 'kochi', 'city', 'cities'],
      reply: "We're based in Kochi and travel across India regularly, plus a handful of international dates each year. Take a look at the Destination filter in the portfolio above for examples." },
    { keywords: ['style', 'kind', 'type', 'photograph', 'shoot', 'cover'],
      reply: "Mostly Indian weddings — intimate ceremonies, multi-day traditional weddings, and destination celebrations. The portfolio section above is a fair sample of what we love shooting." },
    { keywords: ['contact', 'touch', 'reach', 'email', 'phone', 'call'],
      reply: "Easiest is the form in the Contact section below, or email hello@1000stories.studio directly — we usually reply within two working days." },
    { keywords: ['price', 'cost', 'budget', 'package', 'rate'],
      reply: "Pricing depends a lot on the wedding — city, days, and what's needed. Best to share a few details through the contact form and we'll get back to you directly." },
    { keywords: ['style only', 'design', 'styling', 'planning', 'plan'],
      reply: "We offer photography and, for some weddings, styling input — but we're not a full-service planning company. Happy to talk through what a specific wedding would need." },
    { keywords: ['hi', 'hello', 'hey'],
      reply: "Hello! Happy to help — ask me anything about our work or how to get in touch." },
  ];
  const FALLBACK_REPLY = "I don't have a great answer for that one yet — the fastest way to get a real answer is through the contact form below, or email hello@1000stories.studio.";

  function getDemoReply(userText) {
    const lower = userText.toLowerCase();
    const match = DEMO_RESPONSES.find(r => r.keywords.some(k => lower.includes(k)));
    return match ? match.reply : FALLBACK_REPLY;
  }

  /* ---------- Sending a message ---------- */
  async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    suggestionsEl.style.display = 'none';
    showTyping();

    if (CHAT_CONFIG.demoMode) {
      // Simulated latency so the typing indicator reads naturally.
      await new Promise(res => setTimeout(res, 650 + Math.random() * 500));
      hideTyping();
      const reply = getDemoReply(text);
      addMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
      return;
    }

    try {
      const res = await fetch(CHAT_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      hideTyping();
      addMessage('assistant', data.reply);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      hideTyping();
      addMessage(
        'assistant',
        "I'm having trouble connecting right now. Please try the contact form below, or email hello@1000stories.studio directly.",
        { note: true }
      );
      console.error('Chat request failed:', err);
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value;
    inputEl.value = '';
    sendMessage(text);
  });

  suggestionsEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
});
