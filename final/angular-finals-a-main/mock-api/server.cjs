const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// latency
server.use((req, res, next) => setTimeout(next, 150));

/**
 * GET /tickets?page=&limit=&status=&priority=&agentId=&q=
 * Returns { items, page, totalPages, totalItems }
 */
server.get("/tickets", (req, res) => {
  const db = router.db;
  const allTickets = db.get("tickets").value() || [];

  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "10", 10);
  const status = req.query.status; // open|in_progress|resolved|closed|all (если хочешь)
  const agentId = req.query.agentId; // IMPORTANT: agentId
  const priority = req.query.priority; // low|medium|high|all
  const q = (req.query.q || "").toLowerCase();

  let filtered = allTickets;

  if (status && status !== "all") {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (agentId && agentId !== "all") {
    // IMPORTANT: ticket must store agentId (not assigneeId)
    filtered = filtered.filter((t) => t.agentId === agentId);
  }

  if (priority && priority !== "all") {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (q) {
    filtered = filtered.filter((t) => {
      const title = (t.title || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }

  const totalItems = filtered.length;
  const safeLimit = limit > 0 ? limit : totalItems || 1;
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

  const start = (safePage - 1) * safeLimit;
  const items = filtered.slice(start, start + safeLimit);

  res.json({ items, page: safePage, totalPages, totalItems });
});

/**
 * GET /tickets-log?ticketId=
 * Returns { items: TicketLog[] }
 */
server.get("/tickets-log", (req, res) => {
  const ticketId = req.query.ticketId;
  if (!ticketId) return res.status(400).json({ error: "ticketId is required" });

  const db = router.db;
  const logs = db.get("ticketsLog").value() || [];
  const items = logs
    .filter((l) => l.ticketId === ticketId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ items });
});

/**
 * GET /agents
 * Returns Agent[]
 */
server.get("/agents", (req, res) => {
  const db = router.db;
  const agents = db.get("agents").value() || [];
  res.json(agents.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
});

/**
 * PATCH /tickets/:id
 * Body: { status, comment }
 * - validates comment required
 * - updates ticket
 * - appends record to ticketsLog
 */
server.patch("/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  if (!status) return res.status(400).json({ error: "status is required" });
  if (!comment || String(comment).trim().length === 0) {
    return res.status(400).json({ error: "comment is required" });
  }

  // если хочешь строго:
  const allowed = ["open", "in_progress", "resolved", "closed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const db = router.db;

  const ticketChain = db.get("tickets").find({ id });
  const existing = ticketChain.value();
  if (!existing) return res.status(404).json({ error: "Ticket not found" });

  const from = existing.status;

  const updated = ticketChain
    .assign({ status, updatedAt: new Date().toISOString() })
    .write();

  // add log record
  const logs = db.get("ticketsLog");
  const logId = `l${Date.now()}`; // достаточно для mock
  logs
    .push({
      id: logId,
      ticketId: id,
      action: "status_changed",
      from,
      to: status,
      comment,
      createdAt: new Date().toISOString(),
    })
    .write();

  res.json(updated);
});

server.use(router);

const PORT = 4100;
server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
