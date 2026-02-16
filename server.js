const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data.sqlite');
const dbExists = fs.existsSync(DB_PATH);
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  if (!dbExists) {
    db.run(
      `CREATE TABLE comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        personaje TEXT NOT NULL,
        nombre TEXT NOT NULL,
        texto TEXT NOT NULL,
        fecha INTEGER NOT NULL
      )`
    );
  }
});

app.use(express.static(__dirname));

app.get('/api/comentarios', (req, res) => {
  const personaje = req.query.personaje || '';
  const params = [];
  let sql = 'SELECT id, personaje, nombre, texto, fecha FROM comentarios';
  if (personaje) {
    sql += ' WHERE personaje = ?';
    params.push(personaje);
  }
  sql += ' ORDER BY fecha DESC LIMIT 100';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error leyendo comentarios' });
    res.json(rows);
  });
});

app.post('/api/comentarios', (req, res) => {
  const { personaje, nombre, texto } = req.body || {};
  if (!personaje || !nombre || !texto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const fecha = Date.now();
  db.run(
    'INSERT INTO comentarios (personaje, nombre, texto, fecha) VALUES (?,?,?,?)',
    [personaje, nombre, texto, fecha],
    function (err) {
      if (err) return res.status(500).json({ error: 'Error guardando comentario' });
      res.status(201).json({ id: this.lastID, personaje, nombre, texto, fecha });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
