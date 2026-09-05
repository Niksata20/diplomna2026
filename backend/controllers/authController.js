const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
        res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Email already exists' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, rows[0].password);
        if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign(
            { id: rows[0].id, role: rows[0].role, name: rows[0].name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token, user: { id: rows[0].id, name: rows[0].name, role: rows[0].role } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
