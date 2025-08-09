const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Помилка виконання запиту:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.json(results);
  });
});

// POST /users
router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Імʼя та email обовʼязкові' });
  }

  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.query(query, [name, email], (err, results) => {
    if (err) {
      console.error('Помилка додавання користувача:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }
    res.status(201).json({ message: 'Користувача додано', userId: results.insertId });
  });
});

// PUT /users/:id
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Імʼя та email обовʼязкові' });
  }

  const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  db.query(query, [name, email, userId], (err, results) => {
    if (err) {
      console.error('Помилка оновлення користувача:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json({ message: 'Користувача оновлено' });
  });
});

// DELETE /users/:id
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Помилка видалення користувача:', err);
      return res.status(500).json({ error: 'Помилка сервера' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json({ message: 'Користувача видалено' });
  });
});

module.exports = router;

const { userSchema } = require('../validation/userValidation');

router.post('/', (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, email } = req.body;
  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.query(query, [name, email], (err, results) => {
    if (err) return next(err);
    res.status(201).json({ message: 'Користувача додано', userId: results.insertId });
  });
});

router.put('/:id', (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const userId = req.params.id;
  const { name, email } = req.body;
  const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  db.query(query, [name, email, userId], (err, results) => {
    if (err) return next(err);
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json({ message: 'Користувача оновлено' });
  });
});
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
  // Тепер цей маршрут доступний тільки авторизованим
});

router.get('/', authMiddleware, (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const query = 'SELECT * FROM users LIMIT ? OFFSET ?';
  db.query(query, [limit, offset], (err, results) => {
    if (err) return next(err);
    res.json({ page, limit, data: results });
  });
});

router.get('/search', authMiddleware, (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Параметр пошуку q обовʼязковий' });

  const search = `%${q}%`;
  const query = 'SELECT * FROM users WHERE name LIKE ? OR email LIKE ?';
  db.query(query, [search, search], (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Реєстрація користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ярослав
 *               email:
 *                 type: string
 *                 example: yaroslav@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Користувача створено
 *       400:
 *         description: Некоректні дані або користувач вже існує
 */

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Логін користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: yaroslav@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Успішний вхід
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Успішний вхід
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Некоректні дані або невірний логін/пароль
 */

