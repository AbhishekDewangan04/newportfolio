# Abhishek Dewangan - Personal Portfolio

Personal portfolio website showcasing engineering projects, academic background at NIT Raipur, and contact channels.

## Features

- **Smooth Interactive Experience**: High-performance custom canvas shaders, liquid neon reveal, magnetic navigation, and Lenis smooth scrolling.
- **Projects Showcase**: Interactive showcase for Volsentra AI, Voxaryn AI, CiviclensAI, and StudyTrack with live demos and repository links.
- **Serverless Contact Form**: Direct message delivery via Resend API with server-side validation and in-memory rate limiting.
- **AI Portfolio Assistant**: Context-aware portfolio assistant powered by Anthropic's Claude API, answering questions strictly based on profile data.
- **Zero Framework Bloat**: Pure Vite + React 18 frontend with Tailwind CSS styling and lightweight Vercel serverless functions.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Lenis
- **Backend / Serverless (Vercel)**:
  - `api/contact.js`: Form submission handler with in-memory IP rate limiting and Resend email integration.
  - `api/chat.js`: AI chatbot endpoint using Anthropic Messages API.
- **Deployment**: Vercel

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root based on `.env.example`:
   ```env
   RESEND_API_KEY=your_resend_api_key
   OWNER_EMAIL=your_email@domain.com
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

## Deployment

Deploy directly to Vercel:
1. Push this repository to GitHub (`https://github.com/AbhishekDewangan04/new-portfolio`).
2. Import the project in Vercel.
3. In Project Settings > Environment Variables, add:
   - `RESEND_API_KEY`
   - `OWNER_EMAIL`
   - `ANTHROPIC_API_KEY`
4. Click Deploy.
