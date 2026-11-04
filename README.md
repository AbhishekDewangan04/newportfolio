# Abhishek Dewangan · Portfolio

Personal portfolio of Abhishek Dewangan, B.Tech CSE student at NIT Raipur and full-stack web developer (C++, JavaScript, Java).

**Live:** https://<your-vercel-url>

## Features
- Hero with cursor-driven portrait reveal on canvas
- Smooth scrolling (Lenis), parallax and scroll-triggered animations
- "The Work So Far" animated lap track that lists my projects
- Project showcase with GitHub and live links
- Contact form that emails me through a serverless function
- AI assistant that answers questions from my profile data
- Responsive layout, keyboard-accessible, respects reduced-motion

## Projects shown
| Project | Links |
|---|---|
| Volsentra AI: electricity theft detection with explainable ML | [GitHub](https://github.com/AbhishekDewangan04/volsentraai) · [Live](https://volsentraai.vercel.app/) |
| Voxaryn AI: customizable AI voice agent platform | [GitHub](https://github.com/AbhishekDewangan04/voxarynai) · [Live](https://voxarynai.vercel.app/) |
| CiviclensAI: civic intelligence with geospatial incident tracking | [GitHub](https://github.com/AbhishekDewangan04/CiviclensAI) · [Live](https://civiclens-frontend-nine.vercel.app/) |
| StudyTrack: student productivity app | [GitHub](https://github.com/AbhishekDewangan04/StudyTrack) · [Live](https://frontend-delta-fawn-99.vercel.app/) |

## Tech stack
React · Vite · Tailwind CSS · Lenis · Canvas API · Vercel Serverless Functions · Resend (email) · Anthropic API (assistant)

## Run locally
```bash
git clone https://github.com/AbhishekDewangan04/newportfolio.git
cd newportfolio
npm install
cp .env.example .env   # add your own keys
npm run dev
```
The contact form and assistant live in `api/` and need `npx vercel dev` to run locally.

## Environment variables
| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact-form emails |
| `OWNER_EMAIL` | Where messages are delivered |
| `ANTHROPIC_API_KEY` | Powers the AI assistant (optional) |

## Project data
Edit `src/data/` (profile, projects, education) to update content.

## Deploy
Import the repo into Vercel (Vite preset), add the environment variables above and deploy.

## Contact
LinkedIn: https://www.linkedin.com/in/abhishek-dewangan-30a176317
