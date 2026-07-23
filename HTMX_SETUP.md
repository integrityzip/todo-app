# htmx setup legend

How htmx is wired into this BETH (Bun + Elysia + Turso + htmx) app, and how to work with it.

## File map

| File | Runs where | Purpose |
|---|---|---|
| `src/index.tsx` | server (Bun) | Elysia app, routes, JSX pages |
| `src/client/htmx.ts` | browser | imports `htmx.org`, attaches it to `window.htmx` |
| `public/htmx.js` | browser | **generated** — bundled output of `src/client/htmx.ts`, served statically |
| `tsconfig.json` | build time | tells TypeScript/Bun how to compile JSX |

## The golden rule

**Server code and browser code are different worlds.** `index.tsx` runs in Bun and never touches `window`/`document`. Anything that needs the browser (htmx itself, future JS you add) goes in `src/client/*`, gets bundled with `bun build`, and is served as a static file. Never `import` a browser-only file directly into `index.tsx`.

## How a request flows

1. Browser requests `/` → `index.tsx` returns JSX that includes `<script src="/public/htmx.js">`.
2. Browser fetches `/public/htmx.js` → served by the `@elysiajs/static` plugin from the `public/` folder.
3. That script runs `window.htmx = htmx` (from `src/client/htmx.ts`), so `hx-*` attributes on the page start working — htmx scans the DOM itself, no manual init needed.
4. A `hx-get="/hello"` click sends `GET /hello` → Elysia route returns an HTML fragment → htmx swaps it into `hx-target`.

## Commands

```bash
bun run dev            # rebuilds public/htmx.js, then starts the server in watch mode
bun run build:client    # rebuild ONLY the client bundle (public/htmx.js)
```

`--watch` on the server does **not** rebuild the client bundle. If you edit `src/client/htmx.ts` (e.g. add an extension), rerun `bun run build:client` (or restart `bun run dev`).

## Adding an htmx extension (e.g. SSE, WebSockets)

Edit `src/client/htmx.ts`:

```ts
import htmx from "htmx.org";
import "htmx.org/dist/ext/sse.js"; // side-effect import registers the extension

window.htmx = htmx;
```

Then rebuild (`bun run build:client`) and use it in markup as usual: `hx-ext="sse"`.

## tsconfig requirement

`@elysiajs/html` is built on `@kitajs/html`, which needs explicit JSX config — Bun does not infer it:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html"
  }
}
```

Without this, JSX files fail to build with `Cannot find module 'react/jsx-dev-runtime'`.

## CDN alternative

If you'd rather not bundle locally, swap the `<script>` tag in `index.tsx` back to a CDN link and drop `src/client/htmx.ts` + the static plugin:

```html
<script src="https://unpkg.com/htmx.org@2.0.2"></script>
```

Keep the version pinned to whatever's in `package.json`'s `htmx.org` dependency so client and installed types stay in sync. Simpler, but requires internet access and re-fetches on every page load unless cached.

## Gotchas hit while setting this up (so they don't recur)

- Multiple `bun run` processes can end up bound to the same port on Windows without erroring — if routes behave inconsistently, check `netstat -ano | grep 3000` and kill stray `bun.exe` processes.
- `.env` is gitignored — never commit Turso credentials.
- `public/` is generated and gitignored — don't hand-edit files in it.
