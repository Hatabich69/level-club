const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Імпорти роутерів
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Backend працює 🚀');
});

// Обробка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});


// Дозволяємо CORS для фронтенду
app.use(cors({
  origin: 'http://localhost:3000', // адреса твого фронтенду
  credentials: true
}));

app.use(express.json());

// Маршрути
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

app.listen(5000, () => {
  console.log('Сервер запущено на порту 5000');
});
