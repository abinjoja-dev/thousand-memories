# 1000 Stories — Wedding Photography & Design Studio site

A static, no-build portfolio site (plain HTML/CSS/JS). This is a showcase
site, not a booking or e-commerce platform — its job is to show past work,
build trust, and make it easy to say hello (via a contact form or the chat
widget).

## Files

```
index.html             all page content lives here
css/style.css           all styling + the color/type "tokens" at the top
js/script.js             nav, scroll reveal, portfolio filter, testimonials, FAQ, form
js/chat.js               the chat agent widget (see below)
server-example/          a working backend you can deploy to power the chat agent
assets/video/            put your hero video(s) here
assets/images/gallery    put your wedding gallery photos here
assets/images/misc       misc photos (about section, hero poster fallback)
```

## Swapping the hero video

1. Drop your video file into `assets/video/` — name it `hero.mp4` to match
   what's already wired up, or use a different name and update the path.
2. In `index.html`, find the `<video>` tag inside `<section class="hero">`
   and confirm the `src` points to your file:
   ```html
   <video autoplay muted loop playsinline poster="assets/images/misc/hero-poster.jpg">
     <source src="assets/video/hero.mp4" type="video/mp4">
   </video>
   ```
3. `poster` is the image shown before the video loads (and as a fallback).
   Replace `assets/images/misc/hero-poster.jpg` with a still frame from
   your video, or any strong photo, at roughly 1920×1080.
4. Keep the file small — under ~8MB and 10–15 seconds looped works best for
   fast loading. Compress with ffmpeg if needed:
   ```
   ffmpeg -i input.mov -vf scale=1920:-2 -crf 26 -preset slow -an assets/video/hero.mp4
   ```

## Swapping photos

Every `<img>` tag has a `src="https://images.unsplash.com/..."` placeholder
right now. To use your own:

1. Add your image files to `assets/images/gallery/` (or `misc/`).
2. Replace the `src="..."` with the relative path, e.g.
   `src="assets/images/gallery/anjali-rohan-01.jpg"`.
3. Keep the accompanying `alt="..."` text accurate.
4. Each portfolio image has a `data-category="..."` attribute
   (`destination`, `intimate`, `traditional`, or `editorial`) that drives
   the filter chips above the gallery — update it if you recategorize a
   photo, or add new category values (and a matching filter button) if
   you want more categories.

## Editing text content

All copy lives directly in `index.html` — no CMS or config file. The file
is commented with section headers (`<!-- PORTFOLIO / FEATURED WEDDINGS -->`
etc.) to make it easy to find what you're looking for.

## The chat agent

There's a chat widget in the bottom-right corner (`js/chat.js`) that
visitors can use to ask about the studio. It ships in **demo mode**:
answers come from a small set of canned, keyword-matched replies pulled
from the FAQ, and the header clearly reads "Studio assistant · Demo" so
nobody mistakes it for a live AI. No setup required to see it working.

**To make it a real AI-powered assistant:**

1. Deploy the backend in `server-example/` (a small Express server) so it's
   reachable at a public URL. It proxies chat messages to the Claude API —
   this indirection is required because API keys must never live in
   browser-side code.
   - `cd server-example`
   - `cp .env.example .env` and add your Anthropic API key (get one at
     console.anthropic.com)
   - `npm install`
   - `npm start` (runs locally on port 3001), or deploy it to something
     like Render, Railway, Fly.io, or a small VPS.
2. In `js/chat.js`, update `CHAT_CONFIG`:
   ```js
   const CHAT_CONFIG = {
     endpoint: 'https://your-backend-url.com/api/chat',
     demoMode: false,
   };
   ```
3. That's it — the widget will now send real conversations to Claude,
   grounded in a system prompt (in `server-example/server.js`) describing
   the studio, its style, and what it can and can't answer. Edit that
   prompt to keep it accurate as your business changes.

**A note on scope:** the assistant is instructed to talk about the studio
and its work, and to redirect anything requiring a real commitment
(pricing, availability, bookings) to the contact form or email — it's a
concierge for the showcase, not a booking system.

## Wiring up the contact form

The enquiry form near the bottom of the page (`#contact`) currently just
shows a "thank you" message locally — it doesn't send anywhere yet. To make
it functional, pick one:

- **Formspree / Basin / similar** (fastest): sign up, set the form's
  `action` attribute to the URL they give you, and add `method="POST"`.
- **Your own backend**: extend `server-example/server.js` with a
  `/api/enquiry` route, or point it at your own API, then edit the submit
  handler in `js/script.js` (marked with a `TODO` comment).

## Colors & fonts

Open `css/style.css` and look at the `:root { ... }` block at the top —
every color and font in the site is defined there as a CSS variable.

## Running locally

No build step needed for the site itself:
- Open `index.html` directly in a browser, or
- Serve it locally for the most accurate behavior:
  ```
  python3 -m http.server 8000
  ```
  then visit `http://localhost:8000`.

The chat backend (`server-example/`) is a separate Node process — see
"The chat agent" above for how to run it.
