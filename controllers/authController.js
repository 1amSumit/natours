const crypto = require('crypto');
// const bcrypt = require('bcrypt')
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/sendMail');
const AppError = require('../utils/appError');
const { fileURLToPath } = require('url');

const tokenGen = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createToken = (user, statusCode, res) => {
  const token = tokenGen(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `{req.protocol}://${req.get('host')}/me`;
  console.log(fileURLToPath);

  await new Email(newUser, url).sendWelcome();

  createToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide your correct email and password'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password'));
  }

  createToken(user, 201, res);
  next();
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Validating Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not LogedIn please login again'));
  }

  //2) VERIFIYNG TOKEN by using inbuilt util called promisify as jwt.verify does not return promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Checking user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError('User belonging to this token does not exists'));
  }

  // 4 Checking user changed password after getting token
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password, please login Again')
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLogedIn = async (req, res, next) => {
  //1) Validating Token
  try {
    if (req.cookies.jwt) {
      //2) VERIFIYNG TOKEN by using inbuilt util called promisify as jwt.verify does not return promise
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Checking user still exists
      const freshUser = await User.findById(decoded.id);

      if (!freshUser) {
        return next();
      }

      // 4 Checking user changed password after getting token
      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGED IN USER
      //res.locals is accessible for pug
      res.locals.user = freshUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (res, req, next) => {
    if (!roles.includes(res.user.role)) {
      return next(
        new AppError('You do not have permission to perform the action.')
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user with this email'));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/Users/reset/${resetToken}`;

  const message = `Forgot your password? Submit patch request with new password and confirmPassword to: ${resetURL}.\nIf you did not forget your password please ignore this email!`;
  try {
    // await sendMail({
    //   email: user.email,
    //   subject: 'Password reset , valid for 10 mins',
    //   message,
    // });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was error sending the email.Please try again.', 500)
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //1)getiing current user and checking with token valid or not
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expires', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.createPasswordResetToken = undefined;
  user.passwordResetExpires = undefined;
  try {
    await user.save();

    createToken(user, 200, res);
  } catch (err) {
    // res.status(500).json({
    //   status: 'fail',
    //   error: err,
    //   message: err.message,
    // });
    return next(new AppError(err.message, 500));
  }
};

exports.updatePassword = async (req, res, next) => {
  //1) get the user from collection after login user
  const user = await User.findById(req.user.id).select('+password');

  //2)checking if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect!'));
  }

  //3)updating the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  try {
    await user.save();

    createToken(user, 201, res);
  } catch (err) {
    return next(new AppError(err.message, 404));
  }
};
