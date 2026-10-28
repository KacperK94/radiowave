# RadioWave 📻

RadioWave is a Polish-language internet-radio and community app with a retro-2000s visual identity.

## First version

- Responsive dark UI with red accents and a vinyl-inspired player animation.
- Stream cards for sample internet radio stations.
- Audio playback with play/pause, live station switching, and stream error feedback.
- Nickname profile stored in the current browser.
- Realtime shoutbox powered by Convex when configured.
- Admin-oriented station management preview (browser-local in this first slice).

## Requirements

- Node.js 20+
- npm
- A Convex project

## Run locally

```bash
npm install
npx convex dev
```

Copy the Convex deployment URL printed by the CLI into `.env.local`:

```dotenv
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Then run the web app in another terminal:

```bash
npm run dev
```

The Convex CLI generates `convex/_generated` for the backend functions.

## Deployment

Import `KacperK94/radiowave` into Vercel and set `NEXT_PUBLIC_CONVEX_URL` to the URL of the existing Convex deployment. Deploying the frontend does not automatically configure Convex environment variables.

## Important MVP notes

- The profile nickname is browser-local and is not authentication.
- Station management is currently a local admin preview, not a secure server-side admin system.
- Do not put secrets or admin credentials in client-side code.
- Add authenticated roles and server-side authorization before exposing moderation or station management publicly.
- The included public sample stream URLs are examples; availability and licensing vary by provider.
