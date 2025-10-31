# Staff Management Platform — Full-Stack Starter

This is a working starter for your project with:
- **Backend**: Express + TypeScript (Auth, Staff, Shifts/Timesheets, Payroll (naive), AI (RAG-lite over local docs))
- **Frontend**: Vite + React + TS (Login, Staff list, AI chat demo)

## Run locally
### Backend
```bash
cd backend
cp .env.example .env
npm i
npm run db:seed   # seed in-memory data (admin + 2 staff)
npm run dev
```

### Frontend
```bash
cd frontend
npm i
echo 'VITE_API_URL=http://localhost:4000' > .env
npm run dev
```

## Next steps
- Replace in-memory DB with Postgres + Prisma.
- Add RBAC middleware to protect routes with JWT.
- Expand AI to use embeddings (pgvector/Pinecone) and chunked documents.
- Implement scheduling constraints and real payroll rules.
```