import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /generate-blog
 * Body: { userId, transcript }
 */
app.post("/generate-blog", async (req, res) => {
  try {
    const { userId, transcript } = req.body;

    // Ask OpenAI to convert transcript → blog
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a kind writer who formats memories into family blogs.",
        },
        { role: "user", content: transcript },
      ],
      max_tokens: 800,
    });

    const blogContent = response.choices[0].message.content;

    // Save transcript
    const { data: transcriptRow, error: transcriptError } = await supabase
      .from("transcripts")
      .insert([{ user_id: userId, content: transcript }])
      .select()
      .single();

    if (transcriptError) throw transcriptError;

    // Save blog
    const { data: blogRow, error: blogError } = await supabase
      .from("blogs")
      .insert([
        {
          user_id: userId,
          title: "Life Memory",
          summary: blogContent.slice(0, 100),
          content_html: blogContent,
        },
      ])
      .select()
      .single();

    if (blogError) throw blogError;

    res.json({ transcript: transcriptRow, blog: blogRow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * GET /blogs/:userId
 */
app.get("/blogs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch blogs" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

// const express = require("express");
// const bodyParser = require("body-parser");

// const { createClient } = require("@supabase/supabase-js");
// const PDFDocument = require("pdfkit");
// require("dotenv").config();
// const OpenAI = require("openai");

// const app = express();
// app.use(bodyParser.json());

// // OpenAI setup
// // Setup OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Supabase setup
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
// );

// // ✅ Test route
// app.get("/", (req, res) => res.send("Memory Keeper backend running!"));

// // Save transcript
// app.post("/api/transcript", async (req, res) => {
//   const { userId, content } = req.body;
//   const { data, error } = await supabase
//     .from("transcripts")
//     .insert([{ user_id: userId, content }])
//     .select();
//   if (error) return res.status(500).json({ error });
//   res.json({ transcript: data[0] });
// });

// // Generate blog
// app.post("/api/generate-blog", async (req, res) => {
//   try {
//     const { transcript, userId } = req.body;
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a compassionate writer. Turn spoken memories into blog format JSON with title, summary, and content_html.",
//         },
//         { role: "user", content: transcript },
//       ],
//       max_tokens: 800,
//     });

//     let blog;
//     try {
//       blog = JSON.parse(response.data.choices[0].message.content);
//     } catch {
//       blog = {
//         title: "Untitled Memory",
//         summary: "",
//         content_html: `<p>${response.data.choices[0].message.content}</p>`,
//       };
//     }

//     const { data, error } = await supabase
//       .from("blogs")
//       .insert([
//         {
//           user_id: userId,
//           title: blog.title,
//           summary: blog.summary,
//           content_html: blog.content_html,
//         },
//       ])
//       .select();

//     if (error) throw error;
//     res.json({ blog: data[0] });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Blog generation failed" });
//   }
// });

// // Export blog to PDF
// app.get("/api/export/:id", async (req, res) => {
//   const { id } = req.params;
//   const { data, error } = await supabase
//     .from("blogs")
//     .select("*")
//     .eq("id", id)
//     .single();
//   if (error) return res.status(404).send("Blog not found");

//   const doc = new PDFDocument();
//   res.setHeader(
//     "Content-disposition",
//     `attachment; filename="${data.title || "memory"}.pdf"`
//   );
//   res.setHeader("Content-type", "application/pdf");
//   doc.pipe(res);
//   doc.fontSize(18).text(data.title, { underline: true }).moveDown();
//   doc.fontSize(12).text(data.content_html.replace(/<\/?[^>]+(>|$)/g, ""));
//   doc.end();
// });

// app.listen(process.env.PORT, () =>
//   console.log(`✅ Backend running at http://localhost:${process.env.PORT}`)
// );
