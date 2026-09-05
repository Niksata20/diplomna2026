const router = require('express').Router();
const ctrl = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', auth, upload.single('document'), ctrl.apply);
router.get('/my', auth, ctrl.getMyApplications);
router.get('/pending-count', auth, role('admin', 'manager'), ctrl.getPendingCount);
router.get('/', auth, role('admin', 'manager'), ctrl.getAll);
router.put('/:id/status', auth, role('admin', 'manager'), ctrl.updateStatus);

module.exports = router;
