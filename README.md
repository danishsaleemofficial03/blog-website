# blog-website: React + Firebase Blog (admin-only publishing)

**Stack:** React 18 (Vite), Firebase Authentication, Cloud Firestore, Firebase Hosting.

## Features
- Only the admin (one email) can log in to the dashboard and create/edit/delete/publish posts. Enforced by **Firestore security rules**, not just the UI.
- Public reading of published posts; drafts visible only to admin.
- Markdown editor with toolbar + live preview
- **YouTube embedding**: paste a YouTube link on its own line (or use the YouTube button)
- Images, code blocks, quotes, tables, links
- Cover image, tags, search, tag filter, reading time, auto excerpt
- Reader accounts (email/password + Google) who can comment; admin can moderate
- Dark mode, responsive

## Setup (about 10 minutes)

1. **Create Firebase project** at https://console.firebase.google.com
2. **Authentication** > Get started > enable **Email/Password** and **Google**.
3. **Firestore Database** > Create database (production mode).
4. **Project settings > Your apps > Web (</>)** > register app, copy the config.
5. In this folder:
   ```bash
   npm install
   cp .env.example .env      # fill in the Firebase values + VITE_ADMIN_EMAIL
   ```
6. Open `firestore.rules`, replace `you@example.com` with your admin email.
7. Publish the rules: paste them in Firestore > Rules tab > Publish (or use the CLI below).
8. Run locally: `npm run dev`
9. In Firebase Console > **Authentication > Users**, create a test user with an email you control and a temporary password. Set that email as `VITE_ADMIN_EMAIL` in `.env` and as the admin email in `firestore.rules`, then publish the rules. Restart the dev server and sign in at `/login`; the **Dashboard** link appears.

   For a quick local test, you can instead use **Create an account** at `/login` with that configured email and a password you choose. Do not put a reusable password in source code or commit it. The Firebase account must exist in the same project configured in `.env`, and the email must match both admin settings exactly.

The home page includes three built-in sample stories for previewing the layout. They are read-only examples and are not written to Firestore; your published and sample stories appear together.

## Deploy (live URL)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose existing project, public dir: dist, SPA: yes, don't overwrite index.html
npm run build
firebase deploy
```
Your live URL will be `https://<project-id>.web.app`.
Add that domain under Authentication > Settings > Authorized domains if Google sign-in complains.

## GitHub
```bash
git init && git add . && git commit -m "Firebase blog"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
`.env` is git-ignored. (Firebase web config values are not secrets; security comes from the rules.)

## Integrating with your existing portfolio
- Easiest: deploy this app and link to it from your portfolio ("Blog").
- Or, if your portfolio is already React: copy `src/pages`, `src/components`, `src/firebase.js`, `src/AuthContext.jsx`, `src/utils.js`, `src/styles.css` and add the routes from `App.jsx` to your router.

## Video outline (2-3 min)
1. Demo: public home page, open a post with embedded YouTube video
2. Log in as admin, create a post, insert a YouTube link, preview, publish
3. Show a normal user account: can read and comment, but no dashboard
4. Show the code: `firebase.js`, `AuthContext.jsx` (admin check), `firestore.rules` (the real protection), `PostContent.jsx` (YouTube embedding)
5. Show the Firestore console and the deployed URL
