const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'секретний_ключ';

// Реєстрація
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Всі поля обовʼязкові' });
    }

    // Перевірка чи є вже користувач з таким email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return next(err);
      if (results.length > 0) {
        return res.status(400).json({ error: 'Користувач з таким email вже існує' });
      }

      // Хешуємо пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Додаємо користувача
      db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, results) => {
          if (err) return next(err);
          res.status(201).json({ message: 'Користувача створено' });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// Логін
router.post('/signin', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email та пароль обовʼязкові' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return next(err);
    if (results.length === 0) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    const user = results[0];

    // Перевіряємо пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Невірний email або пароль' });
    }

    // Створюємо JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ message: 'Успішний вхід', token });
  });
});

module.exports = router;
