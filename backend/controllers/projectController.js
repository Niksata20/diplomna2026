const db = require('../config/db');

exports.getAll = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
};

exports.getOne = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
};

exports.create = async (req, res) => {
    const { title, description, deadline } = req.body;
    await db.query('INSERT INTO projects (title, description, deadline, created_by) VALUES (?, ?, ?, ?)',
        [title, description, deadline || null, req.user.id]);
    res.status(201).json({ message: 'Project created' });
};

exports.update = async (req, res) => {
    const { title, description, deadline, status } = req.body;
    await db.query('UPDATE projects SET title=?, description=?, deadline=?, status=? WHERE id=?',
        [title, description, deadline || null, status, req.params.id]);
    res.json({ message: 'Project updated' });
};

exports.remove = async (req, res) => {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
};

// Връща брой завършени/общо задачи за всеки проект - използва се за progress bar
exports.getProgress = async (req, res) => {
    const [rows] = await db.query(`
        SELECT 
            p.id as project_id,
            COUNT(t.id) as total_tasks,
            SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM projects p
        LEFT JOIN stages s ON s.project_id = p.id
        LEFT JOIN tasks t ON t.stage_id = s.id
        GROUP BY p.id
    `);
    const progressMap = {};
    rows.forEach(r => {
        const total = Number(r.total_tasks) || 0;
        const completed = Number(r.completed_tasks) || 0;
        progressMap[r.project_id] = {
            total,
            completed,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    });
    res.json(progressMap);
};
