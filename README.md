# 🌿 Junta — Environmental Events Platform

> **A platform where people can discover, join, and manage environmental events like tree planting, coastal cleanups, and workshops — all in one place, with a live map.**

This is our Capstone/Thesis Project. This README explains everything: what the system is, who the users are, how they all work together, how to run the project locally, and what APIs we used.

---

## 1. 🌍 System Overview

### What is Junta?

Junta is a web-based environmental event management platform. Think of it like a community bulletin board, but smarter. Organizers post events (like "Beach Cleanup sa Zamboanga"), and volunteers can discover them, see them on a live map, and register to join — all in one website.

### 🗺️ Why the Name "Junta"?

The name **Junta** comes from the **Chavacano language** — a creole language spoken in **Zamboanga City**, Philippines. In Chavacano, *"Junta"* means **"to come together" or "gathering."**

We chose this name because it perfectly describes what the system is all about — bringing volunteers, organizers, and communities together for environmental activities. It is also our way of representing the platform's roots, since **Junta is built specifically for Zamboanga City**. The name is a nod to the local culture and language of the community it serves.

> *"Junta" — Chavacano for "together." Because protecting the environment is something we do as one.*

### The Problem It Solves

Before Junta, event announcements were scattered across Facebook groups, GC chats, and flyers. There was no centralized place to see all ongoing environmental activities, no way to track your participation history, and no system to verify who the organizers really are.

Junta fixes this by providing:
- A **unified platform** where all events are listed and updated in real-time
- A **live map** so you can see what activities are happening near you
- **Identity verification (KYC)** so you know the organizers are legit
- A **gamification system** to reward active volunteers and organizers

---

## 2. 👥 User Roles (There are 3 Actors)

There are **three types of users** in Junta. Each one has a different set of things they can do.

### 🌱 Role 1: Participant (Regular Volunteer)
This is the most common user. They are everyday people who want to discover and join environmental activities.

**What they can do:**
- Browse and search for events
- See events on a live interactive map
- View the event schedule on a calendar
- Click "Join" to register for an event
- Track all their past and upcoming events in "My Participation"
- Rate events after they are completed
- Earn XP points and level up
- View their notifications and profile

**What they cannot do:**
- Create or publish events
- Access any admin features

---

### 🎯 Role 2: Organizer (Event Creator)
An organizer is someone who leads environmental activities. They can be from an NGO, a school, or a barangay. To become an organizer, a participant must request to be upgraded — and an admin has to approve that request.

**What they can do:**
- Everything a Participant can do, plus:
- Create new events (title, description, date, location on map, capacity, etc.)
- Manage their own submitted events
- View the approval status of their events (pending, approved, rejected)
- Mark their events as "Ongoing" and then "Completed"
- View the list of participants who joined their event
- Rate individual participants after the event
- Earn Organizer Points (OP) and level up their tier

**What they cannot do:**
- Access admin tools
- Approve other organizers' events

---

### 🛡️ Role 3: Admin (Platform Manager)
The admin has full control over the platform. They are usually the system maintainer or the team lead. The first admin account is created manually using a seed script.

**What they can do:**
- Everything an Organizer can do, plus:
- **Approve or reject** events submitted by organizers
- **Verify user identities (KYC)** — review ID photos and selfie comparison scores powered by Face++ AI
- **Approve or reject organizer upgrade requests** from participants
- View and manage ALL events in the system
- View and manage ALL users in the system
- See real-time badges on the sidebar showing how many things are pending

**What they cannot do:**
- Nothing is off-limits for the admin 😄

---

### Quick Comparison Table

| Feature | Participant | Organizer | Admin |
|---|---|---|---|
| Browse Events | ✅ | ✅ | ✅ |
| View Map | ✅ | ✅ | ✅ |
| Join Events | ✅ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ |
| Manage Own Events | ❌ | ✅ | ✅ |
| Approve/Reject Events | ❌ | ❌ | ✅ |
| KYC Verification | ❌ | ❌ | ✅ |
| Manage All Users | ❌ | ❌ | ✅ |
| Earn XP & Levels | ✅ | ✅ | ❌ |
| Earn OP & Tiers | ❌ | ✅ | ❌ |

---

## 3. 🔄 How the Three Roles Work Together

Here is the full story of how the system works from start to finish:

```
[Organizer] Creates an event
      ↓
[Admin] Gets a notification → Reviews and Approves the event
      ↓
[Participant] Sees the event on the map/list → Clicks "Join"
      ↓
[Organizer] Gets a notification → Sees new participants joined
      ↓
On event day → [Organizer/Admin] Marks event as "Ongoing"
      ↓  (all participants get notified)
After the event → [Organizer/Admin] Marks event as "Completed"
      ↓
[Participants] get XP points automatically
[Organizer] gets Organizer Points (OP) based on number of participants
      ↓
[Organizer] rates each participant → participants get more XP
[Participants] can rate the event → organizer gets a rating bonus
      ↓
Badges and level-ups are checked automatically
```

---

## 4. 🚀 How to Start the System

Junta has two separate servers you need to run at the same time: the **frontend** (the website) and the **backend** (the API server).

### Prerequisites
- Node.js installed
- A Firebase project set up
- API keys for Mapbox, Resend, Cloudinary, and Face++ (see `.env` setup below)

---

### Step 1: Set Up Environment Variables

**Frontend** — create a `.env` file in the root folder:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5001/api
```

**Backend** — create a `.env` file inside the `/server` folder:
```
PORT=5001
JWT_SECRET=your_strong_random_secret
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_OTP_TEMPLATE_ID=your_otp_template_id
EMAILJS_RESET_TEMPLATE_ID=your_reset_template_id
FRONTEND_URL=http://localhost:5173
MAPBOX_ACCESS_TOKEN=your_mapbox_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FACEPLUSPLUS_API_KEY=your_facepp_key
FACEPLUSPLUS_API_SECRET=your_facepp_secret
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

Also place your Firebase Service Account key file as `server/serviceAccountKey.json`.

---

### Step 2: Install Dependencies

```bash
# Install frontend dependencies (run in root folder)
npm install

# Install backend dependencies
cd server
npm install
```

---

### Step 3: Run the App

Open **two separate terminals** and run one command in each:

```bash
# Terminal 1 — Frontend (run in root folder)
npm run dev
# Opens at http://localhost:5173

# Terminal 2 — Backend (run in /server folder)
cd server
npm run dev
# Runs at http://localhost:5001
```

---

### Step 4: Create the First Admin Account

The admin account has to be created manually using a seed script (you only do this once):

```bash
# Inside the /server folder
npm run seed:admin
```

After this, you can log in with the admin credentials and start using the full system.

---

## 5. 🗺️ How the System Works (Key Flows)

### Registration Flow
1. User fills in their name, email, and password on the Register page
2. System sends a **6-digit OTP** to their email via **EmailJS API**
3. User enters the OTP to verify their email
4. (Optional) User uploads their government ID and selfie for **KYC verification**
5. Account is created → user is automatically logged in and taken to the Dashboard
6. User earns **+5 XP (Participants)** or **+10 OP (Organizers)** just for registering

### KYC Identity Verification Flow
1. User uploads their valid ID (front) and a selfie
2. Images are uploaded to **Cloudinary** for storage
3. System calls **Face++ API** to:
   - Run **OCR** on the ID to confirm it is a valid ID card and extract the name
   - Run **Face Detection** to confirm there is a real face in the selfie
   - Run **Face Comparison** to check if the face on the ID matches the selfie (returns a confidence score out of 100)
4. All results (score, OCR data, errors) are stored in Firestore and shown to the Admin
5. Admin reviews and clicks "Approve" or "Reject"

### Organizer Upgrade Flow
1. Participant goes to Settings and clicks "Request to be Organizer"
2. They write a short reason
3. Admin sees this in **Organizer Requests** and either approves or rejects
4. If approved, the user's role is changed to `organizer` and they can now create events

---

## 6. ⚡ API Integrations

Here are all the third-party APIs we connected to the system:

---

### 🔥 1. Firebase Auth + Firestore (Frontend)
**What it does:** Handles Google login on the frontend and powers all real-time database updates.

**Where in the code:** `src/lib/firebase.ts`

**How it works:**
- `getAuth()` handles Google Sign-In on the client side
- `getFirestore()` listens to live changes using `onSnapshot()` — so when an organizer updates an event or an admin approves something, everyone's screen updates automatically without refreshing
- The Sidebar badges (showing pending approvals count) are powered by real-time Firestore listeners

---

### 🛡️ 2. Firebase Admin SDK (Backend)
**What it does:** Gives our backend "admin powers" to verify tokens and manage users securely.

**Where in the code:** `server/config/firebase-admin.ts`

**How it works:**
- When a user logs in via Google, the frontend sends the Firebase ID Token to our backend
- Our backend uses `auth.verifyIdToken()` to confirm the token is real and not fake
- We then issue our own **JWT** (JSON Web Token) so all our protected API routes can use a single, consistent authentication system

---

### 🗺️ 3. Mapbox API
**What it does:** Shows the interactive map with event location pins.

**Where in the code:** `src/app/events/MapViewPage.tsx`, `src/hooks/useMapboxToken.ts`

**How it works:**
- The frontend calls our own backend at `/api/config/mapbox` to get the Mapbox Access Token securely (so we don't expose it in the frontend code)
- We use `react-map-gl` to render the map
- Each event's GPS coordinates (latitude + longitude) stored in Firestore are plotted as custom markers on the map
- Clicking a marker opens a popup with event details

---

### 📧 4. EmailJS API
**What it does:** Sends emails automatically — specifically, the OTP code for registration and password reset.

**Where in the code:** `server/routes/auth.ts`, `server/config/mailer.ts`

**How it works:**
- When a user registers, our backend generates a random 6-digit OTP and stores it in Firestore with a 10-minute expiry
- We call the EmailJS Node SDK to deliver a nicely formatted HTML email with the OTP code to the user
- When the user types in the correct OTP, we delete it from Firestore and continue registration
- The same flow is used for **Forgot Password** — user gets a reset code via email

---

### ☁️ 5. Cloudinary API
**What it does:** Stores all uploaded images (profile photos, event cover images, KYC IDs and selfies).

**Where in the code:** `server/services/upload.ts`, `server/config/cloudinary.ts`

**How it works:**
- When a user uploads an image (e.g., their profile picture or valid ID during KYC), the image data goes to our Express backend
- Our backend uploads it directly to Cloudinary servers using the `cloudinary` npm package
- Cloudinary returns a permanent, optimized URL
- We save that URL into Firestore — so we never store raw image files in our database, just the links

---

### 👁️ 6. Face++ API (Biometric KYC)
**What it does:** Automatically analyzes uploaded ID photos and selfies to verify a user's identity.

**Where in the code:** `server/services/face-verification.ts`, `server/routes/auth.ts`

**How it works in 3 steps:**

**Step A — OCR (ID Card Check)**
- We send the uploaded ID photo to `Face++/v3/ocr/idcard`
- It tells us if the image is actually a valid ID card, and extracts the name and ID number from it

**Step B — Face Detection**
- We send the selfie to `Face++/v3/detect`
- It checks if there is a real human face in the photo and returns a quality score
- If no face is detected, we reject the submission immediately

**Step C — Face Comparison**
- We compare the face from the selfie against the face on the ID card using `Face++/v3/compare`
- It returns a **confidence score out of 100**
- A score of 80 or above means the faces likely match (the system uses the same threshold Face++ recommends for a 1-in-100,000 error rate)

All results (score, OCR data, errors) are saved to Firestore. The Admin Dashboard shows these results clearly so the admin can make an informed decision.

---

## 7. 🎮 Gamification System

This is one of the special features of Junta. We built a reward system to encourage people to be more active.

### For Participants — XP (Experience Points) and Levels

Every time a participant does something on the platform, they earn XP:

| Action | XP Earned |
|---|---|
| Register an account | +5 XP |
| Join an event | +10 XP |
| Attend an event (marked ongoing) | +25 XP |
| Complete an event | +50 XP |
| Rate an event | +15 XP |
| Get verified (KYC approved) | +20 XP |
| Receive a 5-star rating | +25 XP |
| 3-event streak | +30 XP |
| 7-event streak | +75 XP |

XP leads to Level-ups:

| Level | XP Needed | Title |
|---|---|---|
| 1 | 0 | Seedling 🌱 |
| 2 | 100 | Eco Starter |
| 3 | 300 | Green Guardian |
| 4 | 600 | Eco Warrior |
| 5 | 1,000 | Planet Defender 🌍 |

### For Organizers — OP (Organizer Points) and Tiers

Organizers earn OP for successfully running events:

| Action | OP Earned |
|---|---|
| Register an account | +10 OP |
| Event approved by admin | +25 OP |
| Event completed (base) | +100 OP |
| Per participant who attended | +5 OP each |
| Average rating ≥ 4.0 | +50 OP bonus |
| Perfect average rating (5.0) | +100 OP bonus |

OP leads to Tier-ups:

| Tier | OP Needed | Title |
|---|---|---|
| 1 | 0 | Bronze Partner 🥉 |
| 2 | 500 | Silver Guardian 🥈 |
| 3 | 1,500 | Gold Champion 🥇 |
| 4 | 3,000 | Platinum Leader 💎 |

### Badges
Badges are automatically awarded based on milestones (e.g., completing 10 events earns the "Veteran Volunteer" badge, getting a 5-star rating earns the "5-Star Volunteer" badge).

---

## 8. 🔔 Notification System

Junta has a real-time notification system. Notifications are stored in Firestore and delivered instantly using `onSnapshot` listeners.

Notifications are triggered automatically for these events:

| Event | Who Gets Notified |
|---|---|
| New event submitted | All Admins |
| Event approved ✅ | The Organizer |
| Event rejected ❌ | The Organizer |
| Someone joins your event | The Organizer |
| Event is starting 🟢 | All Participants of that event |
| Event is completed 🏁 | All Participants of that event |
| You received a rating ⭐ | The Participant |
| You earned XP 🌟 | The Participant |
| You earned OP 🛡️ | The Organizer |

---

## 9. 🏗️ Technology Stack

### Frontend (The Website)
| Technology | Why We Used It |
|---|---|
| **React + Vite** | Fast development with Hot Module Replacement (HMR) |
| **TypeScript** | Catches type errors before runtime, makes the code safer |
| **Tailwind CSS** | Utility-first styling, no messy separate CSS files |
| **ShadCN UI + Radix UI** | Professional-looking ready-made components |
| **Framer Motion** | Smooth page and component animations |
| **DayFlow Calendar** | The interactive calendar for the Schedule page |
| **react-map-gl + Mapbox** | Interactive event map with GPS markers |
| **React Router v6** | Client-side routing between pages |
| **React Hook Form + Zod** | Form validation and schema checking |

### Backend (The API Server)
| Technology | Why We Used It |
|---|---|
| **Node.js + Express** | Lightweight and fast API server |
| **TypeScript** | Same type safety as the frontend, prevents data mismatches |
| **bcryptjs** | Securely hashes passwords before storing them |
| **jsonwebtoken (JWT)** | Handles our own custom login sessions |
| **express-rate-limit** | Prevents abuse of sensitive endpoints |

### Database & Storage
| Technology | Why We Used It |
|---|---|
| **Firebase Firestore** | Real-time NoSQL database — updates instantly across all clients |
| **Cloudinary** | Efficient image storage and delivery |

### Deployment
| Part | Platform |
|---|---|
| Frontend | Firebase Hosting (`junta-a4eca.web.app`) |
| Backend | Render.com |

---

## 10. 📁 Folder Structure

```
Junta/
├── src/                        # Frontend source code
│   ├── app/                    # All page screens
│   │   ├── admin/              # Admin-only pages (approvals, verification, etc.)
│   │   ├── auth/               # Login, Register, Forgot Password pages
│   │   ├── events/             # Events list, map, schedule, event details
│   │   ├── organizer/          # Create event, my events, submissions
│   │   └── user/               # Participation history, notifications, settings
│   ├── components/             # Reusable UI components (buttons, cards, sidebar, etc.)
│   ├── features/               # Core feature logic
│   │   ├── auth/               # AuthContext, ProtectedRoute, PublicRoute
│   │   ├── events/             # EventCard, CreateEventModal, RateEventModal
│   │   └── gamification/       # Gamification-related UI components
│   ├── hooks/                  # Custom React hooks (useScheduleEvents, useNotifications, etc.)
│   ├── lib/                    # External configs (firebase.ts, api.ts, utils.ts)
│   └── styles/                 # Global CSS
│
├── server/                     # Backend API source code
│   ├── config/                 # API configurations (firebase-admin, cloudinary, mailer)
│   ├── middleware/             # Auth middleware (JWT token verification)
│   ├── routes/                 # Express API routes
│   │   ├── auth.ts             # Register, Login, OTP, KYC, Profile
│   │   ├── events.ts           # Create, Join, Approve, Rate events
│   │   └── upload.ts           # Image upload handler
│   ├── services/               # Business logic services
│   │   ├── face-verification.ts # Face++ API calls (OCR, Detect, Compare)
│   │   ├── gamification.ts     # XP, OP, Badge, Level, Tier logic
│   │   ├── notifications.ts    # Create and send notifications
│   │   └── upload.ts           # Cloudinary upload helper
│   ├── scripts/                # Utility scripts (seed-admin.ts)
│   └── index.ts                # Server entry point
│
├── public/                     # Static assets
├── .env                        # Frontend environment variables
├── package.json                # Frontend dependencies
└── render.yaml                 # Backend deployment config for Render
```

---

## 11. 🔑 Available API Endpoints (Quick Reference)

| Method | Endpoint | Access | What It Does |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | Public | Send OTP to email |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP code |
| `POST` | `/api/auth/register` | Public | Create new account |
| `POST` | `/api/auth/login` | Public | Login with email/password |
| `POST` | `/api/auth/google-sync` | Public | Exchange Google token for Junta JWT |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | Public | Reset password using OTP |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `PUT` | `/api/auth/update-profile` | Protected | Update profile fields |
| `POST` | `/api/auth/submit-verification` | Protected | Submit KYC documents |
| `GET` | `/api/events` | Public | Get all public events |
| `GET` | `/api/events/:id` | Public/Protected | Get single event details |
| `POST` | `/api/events` | Organizer | Create new event |
| `PUT` | `/api/events/:id` | Organizer/Admin | Update event |
| `DELETE` | `/api/events/:id` | Organizer/Admin | Delete event |
| `POST` | `/api/events/:id/join` | Participant | Join an event |
| `PATCH` | `/api/events/:id/status` | Admin | Approve/reject event |
| `PATCH` | `/api/events/:id/mark-ongoing` | Organizer/Admin | Mark event as ongoing |
| `PATCH` | `/api/events/:id/mark-completed` | Organizer/Admin | Mark event as completed |
| `GET` | `/api/events/:id/participants` | Organizer/Admin | Get participant list |
| `POST` | `/api/events/:id/participants/:userId/rate` | Organizer/Admin | Rate a participant |
| `POST` | `/api/events/:id/rate-event` | Participant | Rate an event |
| `GET` | `/api/config/mapbox` | Public | Get Mapbox token securely |

---

## 12. 👨‍💻 The Team

This project was built as a **Capstone/Thesis project** by the following students:

| Name | Role |
|---|---|
| **John Harold Rueda** | Programmer |
| **Angelito Halmain** | UI/UX Designer |
| **Rea Mae Millosa** | Documentation |
| **John Nazareth Araneta** | Tester |

---

*This README was written as a complete system guide for the Junta Capstone Defense. It covers everything from architecture to user roles, API integrations, gamification, and setup instructions. Built with ❤️ for Zamboanga City.*
