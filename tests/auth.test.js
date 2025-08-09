const request = require('supertest');
const app = require('../server'); // треба трохи змінити server.js, щоб експортувати app

describe('Auth API', () => {
  it('should signup new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Test', email: 'test@example.com', password: 'test123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Користувача створено');
  });

  it('should fail signup with existing email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Test', email: 'test@example.com', password: 'test123' });

    expect(res.statusCode).toEqual(400);
  });
});
