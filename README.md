# 📊 Tracker All

**Tracker All** is a modern, unified platform designed to track and manage the progress of your personal development and entertainment media. With real-time synchronization and smart media lookup, the application allows you to organize your reading habits, online courses, and watchlists in a single, beautiful dashboard.

---

## 🎯 Project Context

In our daily lives, we consume various forms of media: we read books, take online courses, and watch movies or TV series. Keeping track of where we left off across multiple websites or apps can be tedious. 

**Tracker All** solves this by consolidating these three pillars into an intuitive and interactive hub:
1. **📚 Books**: Monitor pages read, reading formats (Physical, Kindle, PDF, Audiobook), update progress, and log reading counts.
2. **🎓 Courses**: Track study progress in either hours or minutes, categorize by learning platform (Udemy, Coursera, YouTube, Alura, etc.), and monitor completion status.
3. **🎬 Movies & Series**: Lookup title metadata automatically via the OMDb API, set watch status (Unwatched, Watching, Watched), rate titles, and track current seasons/episodes.

---

## 🚀 Key Features

- 🔑 **Secure Authentication**: Traditional Email/Password signup/login and quick social login via **Google** powered by Firebase Auth.
- 🔄 **Real-Time Sync**: Instant database synchronization using **Cloud Firestore** so your progress updates seamlessly across all devices.
- 🔍 **Smart Media Search**: Seamless integration with the **OMDb API** handled by a secure backend proxy route inside Next.js to protect secret API keys.
- 📈 **Dynamic Progress Tracking**: Real-time progress bars showing your percentage of completion for books and courses.
- 🎨 **Premium Responsive UI**: Sleek, state-of-the-art dark-themed interface built using Styled Components, optimized for an engaging experience on both desktop and mobile.

---

## 🛠️ Tech Stack

This project is built using modern, industry-standard web development technologies:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) — Utilizing server components, modern routing, and backend API routes.
- **Frontend Library**: [React 19](https://react.dev/) — Employing modern state management hooks and performance features.
- **Styling**: [Styled Components](https://styled-components.com/) — For scoped component styles and seamless Server-Side Rendering (SSR) integration.
- **Database & Auth**: [Firebase v12](https://firebase.google.com/) — Using **Cloud Firestore** for real-time CRUD listeners and **Firebase Auth** for user sessions.
- **Language**: [TypeScript](https://www.typescriptlang.org/) — Providing strict static typing for enhanced reliability and code maintainability.

---

## 📐 System Architecture

The project follows Next.js **App Router** architecture guidelines. The directory structure is organized as follows:

```text
web-tracker-all/
├── public/                 # Static assets (icons, images)
├── src/
│   ├── app/                # Application routes and pages (App Router)
│   │   ├── api/            # Backend API routes (OMDb Proxy)
│   │   │   └── search/     # API search endpoint for movies/series
│   │   ├── login/          # Login and register pages
│   │   ├── globals.css     # Global styles and CSS variables
│   │   ├── layout.tsx      # Root layout wrapping the application with context providers
│   │   └── page.tsx        # Main Tracker dashboard page
│   ├── context/            # Global React Contexts (AuthContext)
│   ├── lib/                # Third-party configurations and helper modules
│   │   ├── firebase.ts     # Client-side Firebase app initialization
│   │   ├── firestore.ts    # Firestore database queries, mutations, and real-time listeners
│   │   └── registry.tsx    # Styled Components SSR registry config
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configurations
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and npm scripts
```

### Data Flow & Logic
1. **Authentication**: The [AuthContext](file:///c:/projects/web-tracker-all/src/context/AuthContext.tsx) listens to Firebase Auth status. The application consumes the user state to load the dashboard or redirect unauthenticated traffic to the login page.
2. **Firestore Real-time Data**: Modules in [lib/firestore.ts](file:///c:/projects/web-tracker-all/src/lib/firestore.ts) subscribe directly to Firestore collections (`shows`, `books`, `courses`) filtered by the authenticated user's ID using `onSnapshot`. Changes instantly propagate to the client view.
3. **OMDb Backend Proxy**: Rather than exposing the OMDb API key in client-side code, the client queries our server-side route `/api/search`. Next.js fetches the data securely using the server's environment variable and returns it to the client.

---

## ⚙️ How to Run the Project

Follow these steps to set up and run the application in your local environment:

### 📋 Prerequisites
Ensure you have the following installed:
- **Node.js** (v20 or higher recommended)
- A package manager like **npm**, yarn, pnpm, or bun

### 1. Clone the Repository
```bash
git clone https://github.com/MatheusRodri/web-tracker-all.git
cd web-tracker-all
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` (or `.env.local`) file at the root of the project to store your Firebase credentials and OMDb API key:
```bash
# Copy the example file
cp .env.example .env
```
Open the `.env` file and replace the placeholder values with your actual keys:
```env
# OMDb API Configuration (Get yours at http://www.omdbapi.com/apikey.aspx)
OMDB_API_KEY=your_omdb_api_key_here

# Firebase Console Configuration (Project Settings -> General -> Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for Production
To generate an optimized build and run it:
```bash
npm run build
npm start
```

---

## 💡 Additional Recommendations

To enhance the project's documentation and development lifecycle, consider adding:

1. **Status Badges**: Include badges from [Shields.io](https://shields.io) at the top of the README showing Next.js/React versions and build status.
2. **Firestore Security Rules (`firestore.rules`)**: Write and document security rules to ensure users can only CRUD their own documents (e.g., `request.auth.uid == resource.data.userId`).
3. **Conventional Commits**: Encourage contributors to follow standard commit messaging prefix guidelines (`feat:`, `fix:`, `docs:`).
4. **Vercel One-Click Deploy**: Add a "Deploy with Vercel" button in the README to allow users to quickly duplicate the stack to their hosting workspace.
