const router = require('express').Router();
const ctrl = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'avatar-' + Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', auth, ctrl.getProfile);
router.put('/', auth, ctrl.updateProfile);
router.put('/password', auth, ctrl.changePassword);
router.post('/avatar', auth, upload.single('avatar'), ctrl.uploadAvatar);
router.get('/stats', auth, ctrl.getMyStats);

module.exports = router;
