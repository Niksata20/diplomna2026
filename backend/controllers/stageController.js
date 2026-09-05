const db = require('../config/db');

exports.getByProject = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM stages WHERE project_id = ? ORDER BY order_num', [req.params.projectId]);
    res.json(rows);
};

exports.create = async (req, res) => {
    const { project_id, title, description, order_num } = req.body;
    await db.query('INSERT INTO stages (project_id, title, description, order_num) VALUES (?, ?, ?, ?)',
        [project_id, title, description, order_num || 0]);
    res.status(201).json({ message: 'Stage created' });
};

exports.update = async (req, res) => {
    const { title, description, status } = req.body;
    await db.query('UPDATE stages SET title=?, description=?, status=? WHERE id=?',
        [title, description, status, req.params.id]);
    res.json({ message: 'Stage updated' });
};

exports.remove = async (req, res) => {
    await db.query('DELETE FROM stages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Stage deleted' });
};
