const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const route = express.Router();

route.post('/signup', authController.signup);
route.post('/login', authController.login);

route.post('/forgot', authController.forgotPassword);
route.patch('/reset/:token', authController.resetPassword);
route.patch('/updateMe', authController.protect, userController.updateMe);
route.delete('/deleteMe', authController.protect, userController.deleteMe);

route.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

route
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

route
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = route;
