/**
 * Tests for authController — register and login.
 * DynamoDB is mocked via jest.mock so no AWS credentials needed.
 */

jest.mock('../config/dynamodb', () => {
  const mockSend = jest.fn();
  return { send: mockSend, __mockSend: mockSend };
});

const dynamoDB = require('../config/dynamodb');
const { registerUser, loginUser } = require('../controllers/authController');

// Helper to build Express-like req/res objects
const mockReq = (body = {}, headers = {}) => ({ body, headers });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

// ============================
// REGISTER
// ============================
describe('registerUser', () => {
  test('returns 400 when required fields missing', async () => {
    const req = mockReq({ email: 'a@b.com' }); // no fullname, no password
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Required fields missing' })
    );
  });

  test('returns 400 when user already exists', async () => {
    dynamoDB.__mockSend.mockResolvedValueOnce({ Item: { email: 'a@b.com' } });
    const req = mockReq({ fullname: 'A', email: 'a@b.com', password: 'pass123' });
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User already exists' })
    );
  });

  test('registers new user and returns 201 + token', async () => {
    dynamoDB.__mockSend
      .mockResolvedValueOnce({ Item: undefined })   // GetCommand — no existing user
      .mockResolvedValueOnce({});                    // PutCommand — save user
    const req = mockReq({ fullname: 'Farmer', email: 'f@f.com', password: 'pw123' });
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('token');
    expect(body.email).toBe('f@f.com');
  });
});

// ============================
// LOGIN
// ============================
describe('loginUser', () => {
  test('returns 400 when email or password missing', async () => {
    const req = mockReq({ email: 'a@b.com' });
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 for non-existent user', async () => {
    dynamoDB.__mockSend.mockResolvedValueOnce({ Item: undefined });
    const req = mockReq({ email: 'no@user.com', password: 'pw' });
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid credentials' })
    );
  });

  test('returns 400 for wrong password', async () => {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('correct', 10);
    dynamoDB.__mockSend.mockResolvedValueOnce({
      Item: { email: 'u@u.com', fullname: 'U', password: hashed },
    });
    const req = mockReq({ email: 'u@u.com', password: 'wrong' });
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 + token on valid login', async () => {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('rightpw', 10);
    dynamoDB.__mockSend.mockResolvedValueOnce({
      Item: { email: 'u@u.com', fullname: 'U', password: hashed },
    });
    const req = mockReq({ email: 'u@u.com', password: 'rightpw' });
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('token');
    expect(body.message).toBe('Login successful');
  });
});
