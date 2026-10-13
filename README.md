# Stored XSS Lab

A small, self-contained web app for learning how **Stored (persistent) Cross-Site Scripting** works — and how to fix it. Built with Express + EJS.

> ⚠️ **Intentionally vulnerable.** This app contains deliberate security flaws for teaching purposes. Run it **only locally**, never expose it to the internet or deploy it to production.

## What it demonstrates

- **Stored XSS** — a review you submit is saved server-side and rendered unescaped, so an injected `<script>` runs for every visitor who views the page.
- **Reflected input** — a search page that echoes the query back.
- **Cookie theft** — a logger endpoint shows how an injected script can exfiltrate `document.cookie`, and how `HttpOnly` defeats it.
- **The fix** — toggling `SAFE_MODE` turns on HTML-escaping so you can compare vulnerable vs. patched behaviour side by side.

## Requirements

- Node.js 18+ (uses `String.prototype.replaceAll`)

## Setup

```bash
cd stored-xss-lab
npm install
npm start
```

Then open **http://localhost:3000**.

**Login:** `alice` / `password123` (the one seeded account)

## Routes

| Route           | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `/login`        | Log in                                                         |
| `/labs`         | Dashboard showing current mode and activity                    |
| `/product`      | Product page with the review form — the stored-XSS sink        |
| `/search`       | Reflected-input page                                           |
| `/logger`       | Views cookies captured by `/logger/catch`                      |
| `/logger/catch` | Collection endpoint (`?c=...`) an injected script can call     |

## Modes (environment variables)

Both default to off (vulnerable). Restart the server with them set to see the difference:

| Variable          | Effect                                                        |
| ----------------- | ------------------------------------------------------------- |
| `SAFE_MODE=true`  | HTML-escapes review and search output — the fix for the XSS   |
| `HTTPONLY=true`   | Sets the session cookie `HttpOnly` so JS can't read it        |

```bash
# Patched / defended
SAFE_MODE=true HTTPONLY=true npm start
```

## Docker

```bash
cd stored-xss-lab
docker build -t stored-xss-lab .
docker run -p 3000:3000 stored-xss-lab
```

## Example payload

With `SAFE_MODE` off, submitting a review like the following will execute for anyone viewing `/product`:

```html
<script>new Image().src='/logger/catch?c='+encodeURIComponent(document.cookie)</script>
```

Check `/logger` to see the captured cookie — then restart with `HTTPONLY=true` and `SAFE_MODE=true` and confirm the attack no longer works.

## License

For educational use.
