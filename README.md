# [STARTERGATE.DEV](https://startergate.dev)

Built with Next.js, Deployed by GitHub Pages

The previous Gatsby site lives at [startergate/startergate.dev-v1](https://github.com/startergate/startergate.dev-v1) and is still served under [`/v1/`](https://startergate.dev/v1/).

## Prerequisites

- Node.js 24
- npm

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build a static export into `out/` |
| `npm run lint` | Lint with ESLint |
| `node scripts/fetch-satellites.mjs` | Refresh `public/data/satellites.json` from CelesTrak |

## Project Structure

| Path | Contents |
|---|---|
| `app/` | Routes: `/{lang}/`, `/{lang}/projects/`, `/{lang}/projects/{id}/`, `/{lang}/timeline/` (`lang` is `ko` or `en`) |
| `components/` | UI components, grouped by page and layout |
| `lib/` | i18n dictionaries, theme, analytics, satellite calculation |
| `data/` | Site content: profile, projects, experiences, timeline, links |
| `public/` | Static files: CV PDFs, images, satellite data |
| `docs/` | Specification (`spec.md`) and design mockups |

## Deployment

The static export is pushed to [startergate/startergate.github.io](https://github.com/startergate/startergate.github.io), which serves `startergate.dev`.

- On every new GitHub Release, GitHub Actions runs `lint` → `build` → deploy, bundling the v1 site into `/v1/`.
- Once a day, satellite data is refreshed from [CelesTrak](https://celestrak.org) and the latest release is redeployed with it.
- Manual runs are also available from the Actions tab.

## Credits

Some parts of this codebase were written with the assistance of [Claude Code](https://claude.ai/code).
