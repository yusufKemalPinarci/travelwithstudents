
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('../middleware/rateLimit');
const authenticateJWT = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  register,
  login,
  googleLogin,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');

// Public routes
router.post(
  '/google',
  rateLimit,
  [
    body('email').isEmail().withMessage('Geçerli email girin'),
    body('name').notEmpty().withMessage('İsim zorunlu'),
    body('googleId').notEmpty().withMessage('Google ID zorunlu'),
  ],
  validate,
  googleLogin
);

router.post(
  '/register',
  rateLimit,
  [
    body('email').isEmail().withMessage('Geçerli email girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('name').notEmpty().withMessage('İsim zorunlu'),
    body('role').notEmpty().withMessage('Rol zorunlu'),
  ],
  validate,
  register
);

router.post(
  '/login',
  rateLimit,
  [
    body('email').isEmail().withMessage('Geçerli email girin'),
    body('password').notEmpty().withMessage('Şifre zorunlu'),
  ],
  validate,
  login
);

// Protected routes
router.get('/profile/:id', rateLimit, authenticateJWT, getUserProfile);
router.put(
  '/profile/:id',
  rateLimit,
  authenticateJWT,
  upload.single('avatar'), // Dosya yükleme örneği
  [body('name').optional().notEmpty().withMessage('İsim boş olamaz')],
  validate,
  updateUserProfile
);

module.exports = router;
