# Junta - Environmental Events Platform 🌍

Welcome to the **Junta** repository! This document serves as the full system guide and mock presentation reference for our Capstone/Thesis Project. It explains everything from the overview down to exactly how the specific APIs are integrated into the system based on our complete codebase implementation.

---

## 1. System Overview

**What is Junta?**  
Junta is a web-based environmental platform designed to track, manage, and coordinate environmental events like tree planting and coastal cleanups.

**The Problem It Solves:**  
There is a lack of a centralized platform where organizers and volunteers can connect. Usually, events are scattered across social media, making them hard to track and join. Junta solves this by providing a unified, map-based platform where environmental activities are visually pinned and updated in real-time.

**Main Users & Purpose:**
*   **Volunteers (Participants):** Everyday users who want to discover, volunteer, and join activities.
*   **Organizers:** Leaders who plan and create these events on the platform.
*   **Admins:** Platform administrators who monitor all activities, approve users, and manage the system.

---

## 2. System Flow

The system is designed to be very smooth and easy to follow:

1.  **Authentication:** The flow starts when a user visits the platform. They must **Log In** or **Register** an account. During registration, they verify their email using an OTP (One-Time Password) to ensure their account is real. 
2.  **Dashboard:** After logging in, users are taken to their dashboard where they see statistics and a list of active events.
3.  **Map View:** The heart of the platform. Users can interact with a live map. Pinned locations represent ongoing or upcoming environmental events. 
4.  **User Actions:** 
    *   *If they are a Volunteer*, they can click an event on the map to view the full details and click "Join".
    *   *If they are an Organizer*, they can fill out a form to "Create an Event". They pin the location, add a description, and the event instantly goes live on the map.
5.  **Admin Flow:** The data inputted by users seamlessly moves to our database. Admins log into a separate Admin Panel where they can view tables of all users and events, allowing them to delete or manage things as needed.

---

## 3. Technology Stack

We chose a modern web stack to ensure the system is fast, beautiful, and functional.

### 💻 Frontend (User Interface)
*   **React (with Vite) & TypeScript:** React makes the user interface smooth, allowing a "Single Page Application" feel. We paired it with **Vite** because Vite provides Lightning-fast hot module replacements (HMR) ensuring our development is incredibly fast compared to older setups like Create-React-App. Most importantly, the entire frontend is written in **TypeScript**. We chose TypeScript over plain JavaScript to ensure "type safety"—meaning the code automatically catches errors before we even run the app, making the system much more stable and preventing crash bugs in production.
*   **Tailwind CSS:** A tool that allows us to style our system quickly using utility classes, removing the need for messy separate CSS files.
*   **ShadCN UI & Radix UI:** A modern component library. It gave us ready-to-use, professional-looking components like Modals, Buttons, dropdowns, and Input OTPs so the system looks premium right away.

### ⚙️ Backend (Server)
*   **Node.js, Express & TypeScript:** We built our own custom backend server (found in the `/server` folder) to handle API routes, OTP processing, and Cloudinary uploads. Just like the frontend, the backend uses **TypeScript** to ensure the data moving between the server and the frontend perfectly matches, preventing data mismatch errors.

### 🗄️ Database
*   **Firebase Firestore:** We chose Firebase because it operates in real-time. 

---

## 4. Folder Structure (Codebase Architecture)

We kept our project highly organized so the code is easy for the developer team (and the panelists) to understand.

### Frontend (`/src`)
*   `/app` — Holds the main page screens routing (e.g., `MapViewPage.tsx`, `AdminPanelPage.tsx`, `RegisterPage.tsx`).
*   `/components` — Holds reusable UI elements like buttons, cards, and UI libraries.
*   `/features` — Organizes complex custom logic (e.g., `features/events/components` holds `EventCard.tsx` and `CreateEventModal.tsx`, `features/auth` handles Auth Context).
*   `/lib` — Contains external integrations and configs, such as `firebase.ts` and `api.ts`.
*   `/hooks` — Reusable react hooks like `useMapboxToken`.

### Backend (`/server`)
*   `/routes` — Holds our Express API routes (e.g., `events.ts`, `auth.ts`, `upload.ts`).
*   `/config` — Server configuration files for external APIs (e.g., `cloudinary.ts`, `firebase-admin.ts`).
*   `/scripts` — Utility scripts (like `seed-admin.ts` to create the first admin account).

---

## 5. API Integrations (Complete Details & How They Are Integrated)

Here is the exact technical breakdown of how we connected our third-party APIs across the frontend and backend of the codebase:

### 🔐 1. Firebase Authentication & Firestore (Frontend SDK)
**Purpose:** For Real-time Database and secure client-side user sessions.
**How it is integrated in the codebase:** 
*   Located in `src/lib/firebase.ts`. We initialized the `firebase/app`, `getAuth`, `getFirestore`, and `getStorage` modules here.
*   **Firestore:** Whenever an Organizer creates an event, the React App listens using Firestore's built-in `onSnapshot()` feature. This ensures the dashboard and active map markers update in true real-time when data changes, without needing manual page reloads.

### 🛡️ 2. Firebase Admin SDK (Backend)
**Purpose:** For secure backend authority, creating custom tokens, and bypassing client restrictions safely.
**How it is integrated in the codebase:** 
*   Located in `server/config/firebase-admin.ts`. 
*   While the frontend handles user logins, our Node/Express backend uses the `firebase-admin` package with a secure Service Account Key to verify incoming API requests, check user privileges via UID, and safely manage accounts on the server level (such as `routes/auth.ts` checking for admin roles).

### 🗺️ 3. Mapbox API
**Purpose:** To render the interactive events map.
**How it is integrated in the codebase:**
*   Integrated on the frontend using `mapbox-gl` and `react-map-gl`.
*   We use a custom hook `useMapboxToken.ts` to securely fetch and load the Mapbox Access Token.
*   In `src/app/events/MapViewPage.tsx`, we plot geographical coordinates (longitude and latitude) saved from our Firestore directly onto the `<Map>` component to show customized `<Marker>` pins of ongoing activities.

### 📧 4. Resend API
**Purpose:** To automatically email users an OTP (One-Time Password) code during registration.
**How it is integrated in the codebase:**
*   This is integrated strictly on our Node/Express Backend inside `server/routes/auth.ts`. 
*   When a user submits their info on `RegisterPage.tsx`, it calls our `/auth/send-otp` backend route.
*   Our server generates a 6-digit random code and triggers the `resend` Node SDK (`new Resend(process.env.RESEND_API_KEY)`) to dispatch a beautifully formatted email straight to the user's inbox securely before they are fully activated.

### ☁️ 5. Cloudinary API
**Purpose:** To securely and efficiently store uploaded media (like profile pictures, valid IDs for KYC, and event banners).
**How it is integrated in the codebase:**
*   Configured inside `server/config/cloudinary.ts` using the `cloudinary` and `multer-storage-cloudinary` NPM packages.
*   We created custom Multi-Part Form interceptors (`uploadImage` and `uploadDocument`). 
*   When a user clicks "Upload" on the frontend, the image goes to our `/upload` express route (e.g., `server/routes/upload.ts`). Our server uploads the raw file directly to Cloudinary servers. Cloudinary immediately returns a permanent, optimized image URL, and we just save that URL into our Firebase database to save bandwidth.

---
*This guide provides all the necessary architectural details for a complete, highly technical system demonstration during your Capstone Defense.*
