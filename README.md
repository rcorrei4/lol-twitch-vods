# LoL Twitch VODs

A web application for browsing League of Legends streamers and their match VODs with synchronized Twitch video playback.

## Project Structure

```
lol-twitch-vods/
├── frontend/          # React + Vite frontend
└── backend/           # ASP.NET Core API
```

## Prerequisites

- **Frontend**: [Bun](https://bun.sh/) 1.0+
- **Backend**: [.NET 9 SDK](https://dotnet.microsoft.com/download)
- **Database**: Docker & Docker Compose (for PostgreSQL)

## Quick Start

### Backend Setup

```bash
cd backend

# Start PostgreSQL database
docker compose up -d

# Run migrations
dotnet ef database update

# Configure User Secrets (if needed)
dotnet user-secrets set "TwitchApi:ClientId" "your_client_id"
dotnet user-secrets set "TwitchApi:ClientSecret" "your_client_secret"

# Run the API
dotnet run
```

API will be available at `http://localhost:5240`

### Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Run development server
bun run dev
```

Frontend will be available at `http://localhost:5173`

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5240/api
VITE_TWITCH_PARENT_DOMAIN=localhost
```

### Backend (User Secrets)
```
TwitchApi:ClientId=<your_twitch_client_id>
TwitchApi:ClientSecret=<your_twitch_client_secret>
```

## Tech Stack

**Frontend:**
- React 19
- Vite
- React Router v7
- Tailwind CSS v4
- TypeScript

**Backend:**
- ASP.NET Core 9
- Entity Framework Core
- PostgreSQL 18
- Minimal APIs
