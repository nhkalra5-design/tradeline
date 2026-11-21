# Tradeline

A working prototype for the Sirion case: negotiation judgement for procurement teams.

**Every supplier change gets a price tag and an owner.** AI reads and writes. The maths decides. People approve.

- Live site: https://tradeline-dusky-zeta.vercel.app
- Static front end (index.html, styles.css, data.js, app.js, flow.js, story.js), no build step
- `api/extract.js`: Vercel serverless function that calls Gemini (needs `GEMINI_API_KEY`). If it is unavailable, the app falls back to pre-analysed output.

All company, people, deal and history data is synthetic. Contract terms are modelled on real supplier contracts; wording is original.
