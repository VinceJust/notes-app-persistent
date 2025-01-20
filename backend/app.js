const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.NOTES_API_PORT || 8080;
const Database = require("better-sqlite3");
const path = require("path");

const DB_FILE = path.join(__dirname, "notes.db");
const db = new Database(DB_FILE);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

// Middleware json-Format
app.use(express.json());

// Middleware cors
const corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

let notes = [
  {
    id: 1,
    note: "My new Note",
    author: "Max Mustermann",
    date: "2025-01-15",
  },
];

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

app.get("/", (request, response) => {
  response.send("Hello World");
});

app.get("/notes", (request, response) => {
  const rows = db.prepare("SELECT * FROM notes").all();
  response.json(rows);
});

app.get("/notes/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (row) {
    response.json(row);
  } else {
    response.status(404).json({ message: `Note with id ${id} not found` });
  }
});

app.post("/notes", (request, response) => {
  const { note, author } = request.body;
  const date = new Date().toISOString();

  const stmt = db.prepare(
    "INSERT INTO notes (note, author, date) VALUES (?, ?, ?)"
  );
  stmt.run(note, author, date);

  const rows = db.prepare("SELECT * FROM notes").all();
  response.json(rows);
});

app.put("/notes/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const { note, author } = request.body;
  const date = new Date().toISOString();

  const stmt = db.prepare(
    "UPDATE notes SET note = ?, author = ?, date = ? WHERE id = ?"
  );
  const result = stmt.run(note, author, date, id);

  if (result.changes > 0) {
    const rows = db.prepare("SELECT * FROM notes").all();
    response.json(rows);
  } else {
    response.status(404).json({ message: `Note with id ${id} not found` });
  }
});

app.delete("/notes/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
  stmt.run(id);

  const rows = db.prepare("SELECT * FROM notes").all();
  response.json(rows);
});
