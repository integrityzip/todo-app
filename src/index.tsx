import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { db } from "./db/index";
import { postsTable } from "./db/schema";

const app = new Elysia()
  .use(html())
  .use(staticPlugin())
  .get("/", () => (
    <html>
      <head>
        <script src="/public/htmx.js"></script>
      </head>
      <body>
        <h1>HTMX Test</h1>
        <button hx-get="/hello" hx-target="#result">
          Click me
        </button>
        <div id="result"></div>
      </body>
    </html>
  ))
  .get("/hello", () => <p>Hello from the server 👋</p>)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
