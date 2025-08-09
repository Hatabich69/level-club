const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'секретний_ключ';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Авторизація потрібна' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Токен не знайдено' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Невірний токен' });
  }
}

module.exports = authMiddleware;
