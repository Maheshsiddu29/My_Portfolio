# Terminal Portfolio (GitHub Pages)

A terminal-style portfolio built with Next.js **Pages Router** + Tailwind, exported to static HTML for GitHub Pages.

## Local dev
```bash
npm i
npm run dev
```

## Deploy (GitHub Pages)
1. Push to `main`.
2. In GitHub repo: Settings → Pages → **Build and deployment** → Source: **GitHub Actions**.
3. The workflow deploys `./out`.

## Customize
Edit `lib/resume.ts`:
- links.github / links.linkedin
- projects[].links.repo (put your real repos)

Commands live in `lib/commands.ts`.
