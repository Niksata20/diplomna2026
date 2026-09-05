const router = require('express').Router();
const ctrl = require('../controllers/taskController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/stage/:stageId', auth, ctrl.getByStage);
router.post('/', auth, role('admin', 'manager'), ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
