# Final Task — Variant A (Tickets)

You will receive the full task statement on paper. Use this README only as a short checklist + run instructions.

---

## How to run

From the **root** directory run:

```bash
npm run install:all
```

- This installs all the dependencies

Then still from the **root** directory run:

```bash
npm run start
```

- This will start **mock-api** + **Angular** together.
- Open the app at: `http://localhost:4200`
- You must see the **Tickets list page** working without errors.
- You can start.

---

## Rules

- Do your work **ONLY** in: `frontend/`
- **Do not change** anything in: `mock-api/`
- Keep the **starter folder structure** (create new files inside the existing structure).
- Data models are already prepared here:
  - `frontend/src/app/models`

---

## API endpoints

- `GET /calls?page=&limit=&status=&from=&to=`
- `GET /calls/:id/`
- `POST /calls/:id/start`
- `POST /calls/:id/finish`
- `GET /calls/:id/transcript`

---

## What to do (25 points total)

### 1) Filters (5 pts)

Add filters:

- **Agent** (with `All agents`)
- **Priority** (with `All priorities`)

All filters must work **together** with pagination and search.

---

### 2) Ticket details page `/tickets/:id` (10 pts)

Create a details view with:

- Full ticket details (`GET /tickets/:id`)
- Ticket change history (`GET /tickets-log?ticketId=`)

In ticket details:

- Add UI to change **status**
- **Comment is required**
- Send update via:
  - `PATCH /tickets/:id` `{ status, comment }`

After success:

- Ticket status must update in the **details UI**
- Ticket log must show a **new record**

---

### 3) Refactor HTTP usage (5 pts)

- Components must **NOT** use `HttpClient` directly.
- Put all API calls into a dedicated service (e.g. `CallsApiService` / `TicketsApiService`).
- Components must work via **RxJS streams** and call service methods.
- Use RxJS so that:
  - One stream loads the **list** based on filters + pagination + search
  - Another stream handles **actions** (start/finish) with proper loading handling

### 4) Keep UI style consistent (5 pts)

- Match the existing app style (layout, paddings, dropdowns, buttons).

---

## Notes

- Make sure your solution compiles and runs with `npm run start` from the root.
- Keep changes consistent with the starter code.
