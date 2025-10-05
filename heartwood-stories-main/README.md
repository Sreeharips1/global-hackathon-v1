# 👵 Memory Keeper for Grandparents

Preserving family stories with AI ❤️

## 📌 Overview

Memory Keeper is a web app where grandparents can easily record their life stories.
The app transforms spoken or typed memories into **beautiful blog posts**, saved for the whole family to read and cherish.

We built this for the **ACTA Global Hackathon (24h)** with the goal of making it effortless to capture family wisdom before it fades.

## ✨ Features

* 📝 **Story Input** – Type or speak your memory.
* 🤖 **AI Blog Generation** – Converts raw stories into structured, polished blogs.
* 💾 **Saved Blogs** – Family can revisit all memories in one place.
* 📤 **Export** – Download stories as PDF/Word for keepsakes.
* 👨‍👩‍👧 **Family Access** – (optional) Invite members to view blogs.

## 🛠 Tech Stack

* **Frontend**: Next.js, React, Tailwind CSS
* **Backend**: Node.js, Express
* **Database**: Supabase (Postgres + Auth)
* **AI**: OpenAI GPT models

## ⚡ Workflow

1. Grandparent speaks or types a memory.
2. Transcript is saved in Supabase.
3. OpenAI generates a polished blog from transcript.
4. Blog is saved in Supabase and displayed to family.
5. Family can view, export, or download the stories.

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
# create .env file with:
# OPENAI_API_KEY=your-key
# SUPABASE_URL=your-url
# SUPABASE_ANON_KEY=your-key
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

## 📤 Submission Requirements

* ✅ Public GitHub repo
* ✅ Demo video (60s)
* ✅ Live deployed app

## 🌱 Future Enhancements

* Supabase Auth for multi-user login
* Blog editor with images
* Voice-to-voice playback (grandparent voice synthesis)
* Family comments & reactions

---

💡 *Built with love in 24h for ACTA Global Hackathon.*

