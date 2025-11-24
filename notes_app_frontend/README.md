This is a Next.js notes app implementing a modern Ocean Professional UI.

Features:
- Client-side only (no backend required)
- Create, view, edit, delete notes
- Search/filter notes in sidebar
- Changes persist to localStorage
- Seed demo notes for first-time experience
- Accessibility: keyboard focus states, labels, operation feedback
- Keyboard shortcut: Cmd/Ctrl+N for new note

Run locally:
- npm install
- npm run dev
- Open http://localhost:3000

Environment variables:
- The app respects NEXT_PUBLIC_* variables but does not require any for client-side mode. It will fully function without backend connectivity.

Design:
- Ocean Professional theme (blue primary, amber accent)
- Subtle gradients, rounded corners, and soft shadows
