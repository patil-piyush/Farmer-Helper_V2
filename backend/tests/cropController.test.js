/**
 * Tests for cropController.
 * Mocks axios so no real ML service needed.
 */

jest.mock('axios');
const axios = require('axios');
const { recommendCrop } = require('../controllers/cropController');

const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ML_SERVICE_URL = 'http://ml:5001';
});

const VALID_BODY = {
  N: 90, P: 42, K: 43,
  temperature: 20.8, humidity: 82.0, ph: 6.5, rainfall: 202.9,
};

describe('recommendCrop', () => {
  test('returns 400 when a required field is missing', async () => {
    const req = mockReq({ N: 90 }); // missing other fields
    const res = mockRes();
    await recommendCrop(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 with ML prediction on success', async () => {
    const mlData = { crops: ['rice', 'wheat', 'maize'], probs: [0.6, 0.2, 0.1] };
    axios.post.mockResolvedValueOnce({ data: mlData });
    const req = mockReq(VALID_BODY);
    const res = mockRes();
    await recommendCrop(req, res);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/predict/crop'), VALID_BODY
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mlData);
  });

  test('returns 503 when ML service is unreachable', async () => {
    const err = new Error('ECONNREFUSED');
    err.request = {}; // indicates request was made but no response
    axios.post.mockRejectedValueOnce(err);
    const req = mockReq(VALID_BODY);
    const res = mockRes();
    await recommendCrop(req, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('ML service unavailable') })
    );
  });

  test('forwards ML service error status when ML returns an error', async () => {
    const err = new Error('Bad Request');
    err.response = { status: 400, data: { error: 'Invalid input' } };
    axios.post.mockRejectedValueOnce(err);
    const req = mockReq(VALID_BODY);
    const res = mockRes();
    await recommendCrop(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
