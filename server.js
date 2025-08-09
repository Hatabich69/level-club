const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Swagger налаштування
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Level VR Club API',
      version: '1.0.0',
      description: 'Документація API для бекенду Level VR Club',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Роутери
app.use('/auth', authRouter);
app.use('/users', usersRouter);

// Помилка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));

// Вкінці файлу
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));
}

module.exports = app;

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хв
  max: 100, // максимум 100 запитів з однієї IP за 15 хв
});

app.use(limiter);

