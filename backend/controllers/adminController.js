const db = require('../config/db');

exports.getUsers = async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Role updated' });
};

exports.deleteUser = async (req, res) => {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
};
