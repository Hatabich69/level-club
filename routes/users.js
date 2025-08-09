const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /users - захищений маршрут, список користувачів
router.get('/', authMiddleware, (req, res, next) => {
  db.query('SELECT id, name, email FROM users', (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

module.exports = router;
