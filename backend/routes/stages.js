const router = require('express').Router();
const ctrl = require('../controllers/stageController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/project/:projectId', auth, ctrl.getByProject);
router.post('/', auth, role('admin', 'manager'), ctrl.create);
router.put('/:id', auth, role('admin', 'manager'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
