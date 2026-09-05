const db = require('../config/db');

exports.getStats = async (req, res) => {
    const [[{ total_projects }]] = await db.query('SELECT COUNT(*) as total_projects FROM projects');
    const [[{ active_projects }]] = await db.query('SELECT COUNT(*) as active_projects FROM projects WHERE status = "active"');
    const [[{ completed_projects }]] = await db.query('SELECT COUNT(*) as completed_projects FROM projects WHERE status = "completed"');
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_applications }]] = await db.query('SELECT COUNT(*) as total_applications FROM applications');
    const [[{ pending_applications }]] = await db.query('SELECT COUNT(*) as pending_applications FROM applications WHERE status = "pending"');
    res.json({ total_projects, active_projects, completed_projects, total_users, total_applications, pending_applications });
};

exports.getProjectsByStatus = async (req, res) => {
    const [rows] = await db.query('SELECT status, COUNT(*) as count FROM projects GROUP BY status');
    res.json(rows);
};
