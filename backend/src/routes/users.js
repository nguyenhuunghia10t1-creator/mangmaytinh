const express = require('express');
const { list, getOne, create, update, remove } = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', list);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
