# Project Structure

```text
.
├── .env.local
├── .gitignore
├── GEMINI.md
├── README.md
├── eslint.config.mjs
├── generate_tree.py
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── lists/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── (public)/
│   │   │   ├── movies/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── people/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── search/
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── lists/
│   │   │   └── movies/
│   │   │       └── MovieCard.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   └── TrendingSection.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLists.ts
│   │   └── useProfile.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── api-server.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   ├── providers/
│   │   └── query-provider.tsx
│   ├── store/
│   │   └── useAuthStore.ts
│   └── types/
│       ├── auth.d.ts
│       ├── imdb.d.ts
│       └── users.d.ts
└── tsconfig.json
```
