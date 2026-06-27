const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Restrict all these endpoints to Super Admins only
router.use(protect);
router.use(restrictTo('Super Admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.get('/audit-logs', userController.getAuditLogs);

router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
