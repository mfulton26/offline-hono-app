import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";

import Users, { User } from "./schemas/Users.tsx";

import ms from "npm:ms@^2.1.3";

async function fetchUsers() {
  const request = "https://jsonplaceholder.typicode.com/users";
  const cache = await caches.open("users");
  const cachedResponse = await cache.match(request);
  const expiresAtValue = cachedResponse?.headers.get("x-expires-at");
  if (
    cachedResponse === undefined ||
    !expiresAtValue ||
    (Date.now() - Date.parse(expiresAtValue)) > ms("1 day")
  ) {
    const response = await fetch(request);
    if (!response.ok) throw new TypeError("bad response status");
    const responseToCache = new Response(response.body, response);
    responseToCache.headers.set("x-expires-at", Date.now() + ms("1 day"));
    await cache.put(request, responseToCache.clone());
    return responseToCache;
  }
  return cachedResponse;
}

async function getUsers(): Promise<User[]> {
  const response = await fetchUsers();
  return Users.parse(await response.json());
}

export default new Hono()
  .use(
    jsxRenderer(({ children }) => (
      <html lang="en">
        <head>
          <title>Offline Hono App Demo</title>
          {"Deno" in globalThis && <script src="/install.js" type="module" />}
        </head>
        <body>
          <nav>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/users">Users</a>
              </li>
            </ul>
          </nav>
          {children}
        </body>
      </html>
    )),
  )
  .get("/", (c) => c.render(<h1>Welcome</h1>))
  .get("/about", (c) =>
    c.render(
      <>
        <h1>About</h1>
        <p>
          This page was generated using{" "}
          {"Deno" in globalThis ? "Deno" : "your browser"}.
        </p>
        <label>
          Timestamp: <output>{new Date().toISOString()}</output>
        </label>
      </>,
    ))
  .get("/users", async (c) => {
    const users = await getUsers();
    return c.render(
      <>
        <h1>Users</h1>
        <ol>
          {users.map(({ id, name }) => (
            <li>
              <a href={`job/${id}`}>
                {name}
              </a>
            </li>
          ))}
        </ol>
      </>,
    );
  })
  .get("/job/:id", async (c) => {
    const id = +c.req.param("id");
    // todo: store/index users by id for constant-time lookups by caching each job on its own or using IndexedDB/SQLite-Wasm
    const users = await getUsers();
    const job = users.find((user) => user.id === id);
    if (job === undefined) return c.notFound();
    const { name } = job;
    return c.render(
      <>
        <h1>{name}</h1>
        <output></output>
      </>,
    );
  })
  .onError((e, c) => {
    console.error(e);
    return c.text("Boom!\n\n" + e.message);
  });
