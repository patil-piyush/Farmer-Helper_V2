/**
 * Tests for authMiddleware (protect function).
 * Uses real JWT signing (jsonwebtoken) — lightweight, no AWS.
 */

const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');

const SECRET = 'test-secret';

const mockReq = (authHeader) => ({ headers: { authorization: authHeader } });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
});

describe('protect middleware', () => {
  test('returns 401 when no Authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is invalid', () => {
    const req = mockReq('Bearer bad.token.here');
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, token failed' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() and sets req.user on valid token', () => {
    const token = jwt.sign({ id: 'farmer@test.com' }, SECRET);
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = jest.fn();
    protect(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ email: 'farmer@test.com' });
  });
});
