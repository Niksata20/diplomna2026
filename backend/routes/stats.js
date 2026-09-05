const router = require('express').Router();
const ctrl = require('../controllers/statsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin', 'manager'), ctrl.getStats);
router.get('/by-status', auth, role('admin', 'manager'), ctrl.getProjectsByStatus);

module.exports = router;
