const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const route = express.Router();

route.post('/signup', authController.signup);
route.post('/login', authController.login);
route.get('/logout', authController.logOut);

route.post('/forgot', authController.forgotPassword);
route.patch('/reset/:token', authController.resetPassword);

route.use(authController.protect);

route.patch(
  '/updateMe',
  userController.uploadPhoto,
  userController.resizeUploadPhoto,
  userController.updateMe
);
route.delete('/deleteMe', userController.deleteMe);

route.patch('/updatePassword', authController.updatePassword);

route.route(
  '/me',

  userController.getMe,
  userController.getUser
);

route.use(authController.restrictTo('admin'));
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
