const db = require('../config/db');

exports.apply = async (req, res) => {
    const { project_id, message } = req.body;
    const document_path = req.file ? req.file.path : null;
    await db.query('INSERT INTO applications (project_id, user_id, message, document_path) VALUES (?, ?, ?, ?)',
        [project_id, req.user.id, message, document_path]);
    res.status(201).json({ message: 'Application submitted' });
};

exports.getMyApplications = async (req, res) => {
    const [rows] = await db.query(
        'SELECT a.*, p.title as project_title FROM applications a JOIN projects p ON a.project_id = p.id WHERE a.user_id = ? ORDER BY a.created_at DESC',
        [req.user.id]
    );
    res.json(rows);
};

exports.getAll = async (req, res) => {
    const [rows] = await db.query(
        'SELECT a.*, p.title as project_title, u.name as user_name FROM applications a JOIN projects p ON a.project_id = p.id JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
    );
    res.json(rows);
};

exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
};

// Брой чакащи кандидатури - използва се за известия badge в sidebar-а
exports.getPendingCount = async (req, res) => {
    const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'");
    res.json({ count });
};
