# 🗓️ Dev Standup Bot

A full-stack web app where dev teams log daily standups and an AI automatically generates weekly summary reports, highlights blockers, and posts digests to **Slack** or **email**.

**Built with:** MongoDB · Express · React · Node.js (MERN) + AI Integration

---

## 🚀 Features

- **Daily Standup Submission** — Submit your daily updates with: What I Did, What I'm Doing, Blockers
- **Team Dashboard** — Weekly timeline view of all team members' standups with status indicators
- **AI-Generated Weekly Digests** — Automatically summarizes the week using Claude or OpenAI
- **Slack & Email Integration** — Send weekly summaries directly to your team channels or inboxes
- **Multi-Tenant Workspaces** — Invite-code-based workspace system for multiple teams
- **Landing Zone Redirect** — New users are prompted to create or join a workspace before accessing the app

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| AI | Anthropic Claude API / OpenAI GPT |
| Notifications | Slack Webhooks + Resend (email) |
| Build Tool | Vite |

---

## 📁 Folder Structure

```
standup-bot/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Auth, Dashboard, Standup, Digest, History
│   │   ├── context/         # Auth context provider
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API calls
│   │   └── types/           # TypeScript interfaces
│   └── package.json
│
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── middleware/          # Auth middleware
│   ├── services/            # AI, Slack, email logic
│   ├── config/              # DB connection
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

Create `/server/.env` with the following:

```env
PORT=5000
MONGO_URI=mongodb+srv://mahimoges901992_db_user:9A7oWXHrcRsFqM5v@cluster0.6kkaykx.mongodb.net/?appName=Cluster0
JWT_SECRET=74jvXMfPGBbIMdO43sC4s7flGTB9p4xyJPW8XR6zCkI=

# AI - pick one (optional, fallback summaries work without)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Notifications (optional)
RESEND_API_KEY=re_...
FROM_EMAIL=digest@yourdomain.com
```

Create `/client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🛠️ Local Setup

### 1. Clone & navigate
```bash
git clone <your-repo>
cd standup-bot
```

### 2. Start the backend
```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:5000`

### 3. Start the frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### 4. Open in browser
Go to `http://localhost:5173` and register a new account.

---

## 🧪 Testing the Flow

1. **Register** a new account
2. **Create a workspace** (or join via invite code)
3. **Submit your standup** at `/standup`
4. Invite teammates to join with your workspace invite code
5. **Generate a digest** at `/digests`
6. **Send it** via Slack, email, or both

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces` | Create workspace |
| POST | `/api/workspaces/join` | Join via invite code |
| GET | `/api/workspaces/:id` | Get workspace + members |
| PUT | `/api/workspaces/:id/settings` | Update Slack/email settings |

### Standups
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/standups` | Submit today's standup (upsert) |
| GET | `/api/standups/today` | Get my today's standup |
| GET | `/api/standups/workspace` | Get workspace standups (this week) |
| GET | `/api/standups/history` | Get my standup history |

### Digests
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/digests/generate` | Trigger AI digest generation |
| POST | `/api/digests/send` | Send digest to Slack/email |
| GET | `/api/digests` | List past digests |

---

## 🧠 AI Prompt Design

The digest is generated using this prompt structure:

```
You are a technical team assistant. Below are the daily standup logs
for the week of {weekStart} to {weekEnd} for the "{workspaceName}" team.

{formatted standup data per user per day}

Please generate:
1. A concise paragraph summary of what the team accomplished this week
2. A bullet list of ongoing blockers that appeared more than once
3. Any patterns or concerns worth flagging to the team lead

Keep the tone professional and brief. Output as plain text.
```

**If no AI key is configured**, a fallback summary is generated locally so the app always works.

---

## 🗄️ Data Models

### User
```js
{ _id, name, email, passwordHash, workspaceId, role, createdAt }
```

### Workspace
```js
{ _id, name, inviteCode, slackWebhookUrl, notificationEmail, members, createdAt }
```

### Standup
```js
{ _id, userId, workspaceId, date, did, doing, blockers, createdAt }
```

### WeeklyDigest
```js
{ _id, workspaceId, weekStart, weekEnd, summary, blockerHighlights, sentAt, sentVia }
```

---

## 📦 Deployment Notes

- **Frontend:** Deploy the `client/dist/` folder to Vercel, Netlify, or any static host
- **Backend:** Deploy the `server/` folder to Railway, Render, or any Node.js host
- **Set environment variables** on both platforms (do not commit `.env` to git)
- **Allowed origins:** Update CORS settings in `server/index.js` for production

---

## 📄 License

MIT
# Dev-standup-bot
