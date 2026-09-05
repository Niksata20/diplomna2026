const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, ctrl.getAll);
router.get('/progress/all', auth, ctrl.getProgress);
router.get('/:id', auth, ctrl.getOne);
router.post('/', auth, role('admin', 'manager'), ctrl.create);
router.put('/:id', auth, role('admin', 'manager'), ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
