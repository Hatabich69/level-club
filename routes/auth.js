const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userSchema } = require('../validation/userValidation');
require('dotenv').config();

// POST /auth/signup — реєстрація
router.post('/signup', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, password } = req.body;

  // Перевірка чи користувач існує
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Помилка сервера' });
    if (results.length > 0) return res.status(400).json({ error: 'Користувач вже існує' });

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додаємо користувача
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name, email, hashedPassword], (err, results) => {
        if (err) return res.status(500).json({ error: 'Помилка сервера' });
        res.status(201).json({ message: 'Користувача створено' });
    });
  });
});

// POST /auth/signin — логін
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email та пароль потрібні' });

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Помилка сервера' });
    if (results.length === 0) return res.status(400).json({ error: 'Користувача не знайдено' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Невірний пароль' });

    // Генеруємо JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Успішний вхід', token });
  });
});

module.exports = router;
