const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Inicialização do Banco de Dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');

        // Tabela de Usuários
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) console.error('Erro ao criar tabela "users":', err.message);
            else console.log('Tabela "users" pronta.');
        });

        // Tabela de Resultados (Scores)
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            profile TEXT NOT NULL,
            userId INTEGER,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err.message);
            } else {
                console.log('Tabela "scores" pronta.');
            }
        });
    }
});

// Rotas de Autenticação
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Faltam dados.' });

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Usuário já existe.' });
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registrado!', userId: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Credenciais inválidas.' });
        res.json({ message: 'Logado!', userId: row.id, username: row.username });
    });
});

// Rotas da API
app.post('/api/save-score', (req, res) => {
    const { name, profile, userId } = req.body;

    if (!name || !profile) {
        return res.status(400).json({ error: 'Nome e perfil são obrigatórios.' });
    }

    const query = `INSERT INTO scores (name, profile, userId) VALUES (?, ?, ?)`;
    db.run(query, [name, profile, userId || null], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Pontuação salva com sucesso!',
            id: this.lastID
        });
    });
});

app.get('/api/scores', (req, res) => {
    db.all(`SELECT * FROM scores ORDER BY date DESC LIMIT 10`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
