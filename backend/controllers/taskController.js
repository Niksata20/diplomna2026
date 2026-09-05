const db = require('../config/db');

exports.getByStage = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM tasks WHERE stage_id = ?', [req.params.stageId]);
    res.json(rows);
};

exports.create = async (req, res) => {
    const { stage_id, title, description, assigned_to, deadline } = req.body;
    await db.query('INSERT INTO tasks (stage_id, title, description, assigned_to, deadline) VALUES (?, ?, ?, ?, ?)',
        [stage_id, title, description, assigned_to || null, deadline || null]);
    res.status(201).json({ message: 'Task created' });
};

exports.update = async (req, res) => {
    const { title, description, status, assigned_to, deadline } = req.body;
    await db.query('UPDATE tasks SET title=?, description=?, status=?, assigned_to=?, deadline=? WHERE id=?',
        [title, description, status, assigned_to || null, deadline || null, req.params.id]);
    res.json({ message: 'Task updated' });
};

exports.remove = async (req, res) => {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
};
