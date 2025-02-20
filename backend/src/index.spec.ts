import request from 'supertest';
import index from './index';

describe('API Tests', () => {
  it('should return API Running', async () => {
    const res = await request(index).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('API Running with Auth0 Authentication');
  });
});
