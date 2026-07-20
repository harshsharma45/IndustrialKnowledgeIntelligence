# Aegis Industrial Intelligence 🏭

**Aegis Industrial Intelligence** is an AI-powered platform designed to eliminate heavy industry knowledge fragmentation. It unifies heterogeneous documents—like P&IDs, safety manuals, and maintenance logs—into a single queryable brain. By providing technicians with real-time, expert answers alongside accurate source citations, Aegis helps reduce unplanned downtime and enhances operational safety.

## 🏆 Hackathon Context

This project was developed by **Team Debuggers** for the **Ecomomic Times AI Hackathon 2026**.

* **Track:** Problem Statement 8 (Industrial Knowledge Intelligence: Unified Asset & Operations Brain)


* **Theme:** Industrial Intelligence / Document Management / Knowledge Engineering / Quality



## ✨ Key Features

* **Expert Knowledge Copilot:** A conversational RAG interface that answers complex operational and engineering queries across the full document corpus, complete with source document citations.


* **Universal Document Ingestion:** Drag-and-drop capability to process unstructured manuals (`.txt`, `.md`, `.pdf`) and structured maintenance logs (`.csv`).


* **Relational Asset Tracking:** Cross-references unstructured safety procedures with real-time equipment statuses using a structured database approach.
* **Mobile-Responsive UI:** Built to work flawlessly on mobile devices for field technicians as well as desktops for engineers.



## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Google Stitch (UI generation)
* **Backend:** Next.js API Routes, Vercel AI SDK
* **Database & Vector Storage:** Supabase (PostgreSQL with `pgvector`)
* **AI/LLM:** Google Gemini 2.5 Flash

---

## 🚀 Getting Started

First, ensure you have your environment variables set up. Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI / Gemini API Key Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

Open [http://localhost:3000] with your browser to see the result. The page auto-updates as you edit the file in `app/page.tsx`.

## 📚 Learn More About the Framework

To learn more about the underlying Next.js framework, take a look at the following resources:

* [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
* [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
