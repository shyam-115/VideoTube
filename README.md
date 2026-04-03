# 🎬 VideoTube

A full-stack video sharing platform built with **React** on the front-end and **Node.js / Express** on the back-end, backed by **MongoDB** and **Cloudinary** for media storage.

---

## 📁 Project Structure

```
VideoTube/
├── back-end/   # Node.js + Express REST API
└── front-end/  # React + Vite SPA
```

---

## ✨ Features

- 🔐 **Authentication** – Register, login, logout with JWT access & refresh tokens
- 🎥 **Video Management** – Upload, browse, search, and watch videos
- 👍 **Likes / Dislikes** – Toggle reactions on videos
- 🔔 **Subscriptions** – Subscribe / unsubscribe to channels, view subscriber counts
- 👤 **User Profiles** – Avatar & cover image upload, watch history, channel pages
- 🔍 **Channel Search** – Find channels by username or full name
- 🛡️ **Security** – Helmet, CORS, rate limiting (general + auth-specific)
- ☁️ **Cloud Storage** – Videos and images hosted on Cloudinary

---

## 🛠️ Tech Stack

### Back-end
| Tool | Purpose |
|------|---------|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Cloudinary | Media (video/image) storage |
| Multer | File upload handling |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Joi | Request validation |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |
| Pino | Structured logging |

### Front-end
| Tool | Purpose |
|------|---------|
| React 19 + Vite | UI framework & bundler |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP client |
| react-hot-toast | Toast notifications |
| lucide-react / react-icons | Icon libraries |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account

---

### Back-end Setup

```bash
cd back-end
npm install
cp .env.example .env   # fill in your values (see below)
npm run dev            # starts with nodemon on port 8000
```

**Back-end environment variables** (`.env`):

```env
PORT=8000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017

ACCESS_TOKEN_SECRET=your_access_token_secret_min_32_chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_32_chars
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Comma-separated for multiple origins
CORS_ORIGIN=http://localhost:5173
```

---

### Front-end Setup

```bash
cd front-end
npm install
cp .env.example .env   # fill in your values (see below)
npm run dev            # starts Vite dev server on port 5173
```

**Front-end environment variables** (`.env`):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server & DB health check |

### Users – `/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register (avatar + cover image upload) |
| POST | `/login` | ❌ | Login, returns JWT cookies |
| POST | `/logout` | ✅ | Logout |
| POST | `/refresh-token` | ❌ | Refresh access token |
| POST | `/change-password` | ✅ | Change password |
| GET | `/current-user` | ✅ | Get logged-in user |
| PATCH | `/update-details` | ✅ | Update name / email |
| PATCH | `/avatar` | ✅ | Update avatar |
| PATCH | `/cover-image` | ✅ | Update cover image |
| GET | `/c/:username` | ❌ | Get channel profile |
| GET | `/watch-history` | ✅ | Get watch history |
| GET | `/search?query=` | ❌ | Search channels |

### Videos – `/videos`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | ✅ | Upload video + thumbnail |
| GET | `/` | ❌ | Get all published videos |
| GET | `/:id` | ❌ | Get video by ID (increments views) |
| GET | `/channel/:userId` | ❌ | Get all videos for a channel |

### Likes – `/likes`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:id` | ✅ | Toggle like / dislike |
| GET | `/:id/count` | ✅ | Get like & dislike counts |
| GET | `/status/:id` | ✅ | Get current user's reaction |

### Subscriptions – `/subscriptions`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:channelId` | ✅ | Subscribe to channel |
| DELETE | `/:channelId` | ✅ | Unsubscribe from channel |
| GET | `/isSubscribed/:channelId` | ✅ | Check subscription status |
| GET | `/count/:channelId` | ✅ | Get subscriber count |
| GET | `/subscribed` | ✅ | Get subscribed channels list |

---

## 🖥️ Front-end Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section + video feed with sort options |
| `/login` | Login | User login form |
| `/register` | Register | User registration form |
| `/upload` | VideoUpload | Upload a new video |
| `/search` | Search | Search channels |
| `/video/:id` | VideoDetail | Watch a video |
| `/profile` | Profile | Current user's profile |
| `/channel/:username` | ChannelProfile | Public channel page |

---

## 📜 Scripts

### Back-end
```bash
npm run dev    # Start with nodemon (hot reload)
npm run start  # Start production server
```

### Front-end
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📄 License

ISC © [shyam-115](https://github.com/shyam-115)
