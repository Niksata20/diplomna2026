const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email, role, avatar_path, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
};

exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
        res.json({ message: 'Profile updated', user: { id: req.user.id, name, role: req.user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Email already in use' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully' });
};

exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await db.query('UPDATE users SET avatar_path = ? WHERE id = ?', [req.file.path, req.user.id]);
    res.json({ message: 'Avatar uploaded', avatar_path: req.file.path });
};

exports.getMyStats = async (req, res) => {
    const userId = req.user.id;

    const [[{ my_projects }]] = await db.query(
        'SELECT COUNT(*) as my_projects FROM projects WHERE created_by = ?', [userId]
    );
    const [[{ my_applications }]] = await db.query(
        'SELECT COUNT(*) as my_applications FROM applications WHERE user_id = ?', [userId]
    );
    const [[{ approved_applications }]] = await db.query(
        'SELECT COUNT(*) as approved_applications FROM applications WHERE user_id = ? AND status = "approved"', [userId]
    );
    const [[{ pending_applications }]] = await db.query(
        'SELECT COUNT(*) as pending_applications FROM applications WHERE user_id = ? AND status = "pending"', [userId]
    );
    const [[{ rejected_applications }]] = await db.query(
        'SELECT COUNT(*) as rejected_applications FROM applications WHERE user_id = ? AND status = "rejected"', [userId]
    );
    const [[{ assigned_tasks }]] = await db.query(
        'SELECT COUNT(*) as assigned_tasks FROM tasks WHERE assigned_to = ?', [userId]
    );
    const [[{ completed_tasks }]] = await db.query(
        'SELECT COUNT(*) as completed_tasks FROM tasks WHERE assigned_to = ? AND status = "completed"', [userId]
    );

    res.json({
        my_projects, my_applications, approved_applications,
        pending_applications, rejected_applications,
        assigned_tasks, completed_tasks
    });
};
