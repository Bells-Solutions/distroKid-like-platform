import request from 'supertest';
import index from './index';

describe('API Tests', () => {
  it('should return API Running', async () => {
    const res = await request(index).get('/');
    console.log(res);
  });
});
