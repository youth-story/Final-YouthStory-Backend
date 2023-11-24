const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const { createNewUser, loginUser, requestOTP, verifyOTP, forgotPassword } = require('../helper/authentication');
const nodemailer = require('nodemailer');
require('dotenv').config();

// User registration
router.post('/sign-up', async (req, res) => {
  createNewUser(req, res, jwt, User, OTP, bcrypt, process.env.OFFICIAL_EMAIL, process.env.APP_PASS);
});

// User login
router.post('/login', async (req, res) => {
  loginUser(req, res, jwt, User, bcrypt);
});

// Request OTP route
router.post('/request-otp', async (req, res) => {
  requestOTP(req, res, OTP, User, process.env.OFFICIAL_EMAIL, process.env.APP_PASS, req.body.type);
});

// Verify OTP and create user route
router.post('/verify-otp', (req, res) => {
  verifyOTP(req, res, User, OTP, req.body.type, req.body.type);
});

router.post('/forgot-password', (req, res) => {
  forgotPassword(req, res, User, bcrypt);
});

module.exports = router;