# Kairos
The Opportune Interview Simulator

Kairós (from the ancient Greek word for the right, critical, or opportune moment) is an AI-powered interview simulator that helps job seekers practice and perfect their responses under realistic pressure. Upload your résumé, get dynamically generated questions, and engage in a real‑time mock interview with an AI hiring manager – all within a sleek, responsive web app.

Live Demo: [https://kairos-nine-lac.vercel.app/](https://kairos-nine-lac.vercel.app/)

---

Problem Statement :

Job seekers often fail not due to lack of skill, but because they struggle to articulate their experience under pressure. Traditional interview prep is static, one‑size‑fits‑all, and rarely mimics the unpredictability of a live conversation. Kairós bridges this gap by:

- Analyzing your résumé to extract hard/soft skills and experience.
- Generating tailored behavioral and technical questions using advanced prompt chaining.
- Simulating a realistic, stress‑free interview environment where you can practice speaking and receive constructive, real‑time feedback.

The result: you walk into your real interview confident and prepared – ready to seize the opportune moment.

---

##  Features :

- Résumé Parsing & Analysis – Paste your résumé text; the AI extracts skills, experience, and key talking points.
- Custom Question Generation – Receive 5 behavioral (STAR‑based) and 5 technical questions tailored to your profile.
- Live Interview Mode – Role‑played AI hiring manager asks one question at a time; your answers are streamed and evaluated.
- Real‑time Feedback– After each answer, get constructive feedback on clarity, relevance, and missing keywords.
- Responsive Design – Built with Tailwind CSS, works flawlessly on desktop, tablet, and mobile.
- Supabase Integration – Securely store user profiles, résumé data, and interview history (optional).
- Streaming Responses – See AI answers type out letter‑by‑letter for a natural conversation feel.

---

##  Tech Stack :

| Layer                | Technology                                                                 |
|----------------------|----------------------------------------------------------------------------|
|   Frontend           | React 18, TypeScript, Vite, Tailwind CSS                                   |
|   Backend (BaaS)     | Supabase (PostgreSQL, Auth, Storage)                                       |
|   AI / LLM           | OpenAI GPT‑4o‑mini / Anthropic Claude 3 Haiku (via Supabase Edge Functions or direct API) |
|   Deployment         | Vercel (Frontend) + Supabase (Backend)                                     |
|   Package Manager    | npm                                                                        |
|   Linting            | ESLint, TypeScript‑ESLint                                                  |

---

##  Getting Started :

### Prerequisites :

- Node.js (v18 or later)
- npm or yarn
- A Supabase account (free tier works)
- An API key for your chosen LLM provider (OpenAI or Anthropic)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kairos.git
   cd kairos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key   # if using OpenAI directly
   # or use Supabase Edge Functions to proxy the LLM call
   ```
   > **Security Note:** Never commit `.env` to version control. The `.env` is already listed in `.gitignore`.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

##  Project Structure :

```
.
├── src/
│   ├── components/       # Reusable UI components (button, input, card, etc.)
│   ├── pages/            # Main views (Dashboard, Interview, Results)
│   ├── hooks/            # Custom React hooks (useAuth, useStreaming, etc.)
│   ├── lib/              # Supabase client, API helpers
│   ├── types/            # TypeScript interfaces/types
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment variables (ignored)
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── vite.config.ts        # Vite configuration
└── README.md
```

---

##  Available Scripts :

- `npm run dev` – Start development server with hot reload.
- `npm run build` – Build the production bundle.
- `npm run preview` – Preview the built app locally.
- `npm run lint` – Run ESLint to check code quality.
- `npm run typecheck` – Run TypeScript type checking without emitting.

---

##  Deployment :

### Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Add the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) in the Vercel project settings.
4. Deploy – Vercel will automatically build and host your app.

### Deploy to Netlify / Render

Similar steps; just ensure environment variables are set in the respective dashboard.

---

##  Security & Best Practices :

- **Never expose API keys** in client‑side code. All LLM calls should be proxied through a secure backend (Supabase Edge Functions, Vercel Serverless Functions, or a dedicated backend).
- **Supabase Row Level Security (RLS)** is enforced to ensure users can only access their own data.
- All user‑submitted content is sanitized before being sent to the LLM.
- Budget alerts are configured for the LLM API to prevent unexpected costs.

---

##  Contributing :

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code adheres to the existing style and passes all lint/type checks.

---

Acknowledgements :

- [OpenAI](https://openai.com) and [Anthropic](https://www.anthropic.com) for their powerful LLMs.
- [Supabase](https://supabase.com) for a seamless backend experience.
- [Vite](https://vitejs.dev) and the React ecosystem for a blazing‑fast development environment.

---

Built with ❤️ for job seekers everywhere. Good luck – your opportune moment awaits!

```
