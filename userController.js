import crypto from 'crypto'
import asyncHandler from 'express-async-handler'

// imports //
import User from '../models/User.js'
import ErrorResponse from '../utils/errorResponse.js'
import sendEmail from '../utils/sendEmail.js'

// @desc        Register user
// @route       POST   /api/v1/auth/register
// @access      Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body
  const checkUser = await User.findOne({ email })
  if (checkUser) {
    return next(
      new ErrorResponse(`User already exists, please login intead`, 400)
    )
  }
  // create user //
  const user = await User.create({
    name,
    email,
    password,
    role,
  })

  // send a cookie along with token //
  sendTokenResponse(user, 200, res)
})

// @desc        Login user
// @route       POST   /api/v1/auth/login
// @access      Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  // validate email and password //
  if (!email || !password) {
    return next(new ErrorResponse(`Please Provide An Email And Password`, 400))
  }
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401))
  }
  // check if password matches //
  const match = await user.matchPassword(password)
  if (!match) {
    return next(new ErrorResponse(`Invalid Credentials`, 401))
  }
  // send a cookie along with token response //
  sendTokenResponse(user, 200, res)
})

// @desc        Get Current user
// @route       POST   /api/v1/auth/me
// @access      Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc        Logout user
// @route       GET   /api/v1/auth/logout
// @access      Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  // remove token from localstorage @todo //

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc        Update user details
// @route       PUT   /api/v1/auth/updatedetails
// @access      Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const filedsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }
  const user = await User.findByIdAndUpdate(req.user.id, filedsToUpdate, {
    new: true,
    runValidators: true,
  })
  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc        Update Password
// @route       PUT   /api/v1/auth/updatepassword
// @access      Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')
  // check current password //
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse(`Password Is Incorrect`, 400))
  }
  if (currentPassword === newPassword) {
    return next(new ErrorResponse(`Both Password Are Same`, 400))
  }
  user.password = newPassword
  await user.save()
  sendTokenResponse(user, 200, res)
})

// @desc        Frogot Password
// @route       POST   /api/v1/auth/forgotpassword
// @access      Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new ErrorResponse(`There Is No User With That Email`, 404))
  }
  // get reset token //
  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`
  const message = `You are reciving this email because your (or somone else) has requested the reset of a password. Plese click to:\n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    })
    return res.status(200).json({
      success: true,
      data: `Email sent`,
    })
  } catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    return next(new ErrorResponse(`Email could not be sent`, 500))
  }
})

// @desc        Reset Password
// @route       PUT   /api/v1/auth/resetpassword/:resetToken
// @access      Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) {
    return next(new ErrorResponse(`Please add a password to change`, 400))
  }
  // get the hashed token with crypto //
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  })
  if (!user) {
    return next(new ErrorResponse(`Invalid Token`, 400))
  }
  // set new password //
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})

// Get token from model, create cookie and send response token //
const sendTokenResponse = async (user, statusCode, res) => {
  // send a token //
  const token = await user.getToken()
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 60 * 1000
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  })
}
