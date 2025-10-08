# 🧠 AI CV & Project Evaluator

An automated evaluation system that uses **OpenAI**, **Ragie**, and **Supabase** to assess candidates’ **CVs and project reports** asynchronously.
The system analyzes both documents, compares them against a **case study** and **scoring rubric**, and produces structured feedback with match rates and project scores.

---
## 🚀 Features

- 📄 **File Upload** — Upload CV and project report via REST API (Supabase Storage integration)
- ⚙️ **Asynchronous Job Queue** — Uses BullMQ + Redis for non-blocking AI processing
- 🤖 **AI Evaluation** — OpenAI LLM evaluates documents based on context and rubric
- 📚 **RAG Integration** — Retrieves relevant sections from Ragie for factual grounding
- 🗄️ **Persistent Storage** — All jobs and documents stored in Supabase (PostgreSQL)
- 🧾 **Structured Output** — Returns JSON with `cv_match_rate`, `project_score`, and detailed feedback

---

## 🧩 Environment Setup
Docker is mandatory since Redis is easier to setup on Docker
### If you can use Makefile
```
#Development
make dev

#Production
make proc

#Removing Docker Compose
make down-dev
#or
make down-prod
```
### If you can't use Makefile
```
#Development
docker compose -f docker-compose.dev.yml up --build --force-recreate

#Production
docker compose -f docker-compose.prod.yml up --build -d

#Removing Docker Compose
docker compose -f docker-compose.dev.yml down -v
#or
docker compose -f docker-compose.prod.yml down -v
```
## 🪄 Tradeoff Explanation
| Component      | Advantages                                                                | Trade-offs / Limitations                                                                             |
| -------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **OpenAI API** | More stable and predictable responses compared to Gemini                  | No free tier available, which increases cost for continuous evaluation                               |
| **Supabase**   | Fast to set up with integrated database, authentication, and file storage | Adds dependency on Supabase’s hosted infrastructure — limited flexibility for on-premise control     |
| **Ragie**      | Handles document parsing and retrieval efficiently with minimal code      | Relies on Ragie’s external API availability and performance — limited fallback if API latency occurs |
