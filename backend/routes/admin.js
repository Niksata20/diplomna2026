const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/users', auth, role('admin'), ctrl.getUsers);
router.put('/users/:id/role', auth, role('admin'), ctrl.updateUserRole);
router.delete('/users/:id', auth, role('admin'), ctrl.deleteUser);

module.exports = router;
