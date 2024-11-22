const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('estoque.db', (err) => {
    if (err) console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco REAL NOT NULL
)`);

app.post('/api/produtos', (req, res) => {
    const { nome, quantidade, preco } = req.body;
    db.run(`INSERT INTO produtos (nome, quantidade, preco) VALUES (?, ?, ?)`,
        [nome, quantidade, preco],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID, nome, quantidade, preco });
        });
});

app.get('/api/produtos', (req, res) => {
    db.all(`SELECT * FROM produtos`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM produtos WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco } = req.body;
    db.run(`UPDATE produtos SET nome = ?, quantidade = ?, preco = ? WHERE id = ?`,
        [nome, quantidade, preco, id],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ updatedID: id, nome, quantidade, preco });
        });
});

app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM produtos WHERE id = ?`, id, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ deletedID: id });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
