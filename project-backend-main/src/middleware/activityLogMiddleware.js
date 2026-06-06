const ActivityLogModel = require('../models/activityLogModel');

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.headers['x-real-ip'] ||
  req.connection?.remoteAddress ||
  req.ip ||
  'unknown';

const SKIP_ROUTES = ['/health', '/api/v1/health'];

const activityLogMiddleware = (req, res, next) => {
  if (SKIP_ROUTES.some((r) => req.path === r)) return next();
  if (req.method === 'OPTIONS') return next();

  const startTime = Date.now();
  const originalJson = res.json;

  res.json = function (body) {
    const duration = Date.now() - startTime;
    const user = req.user || {};
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
    const activityName = `${req.method} ${req.path}`;

    ActivityLogModel.create({
      userId: user.uid || null,
      userEmail: user.email || null,
      userRole: user.role || 'guest',
      activityName,
      activityDescription: `${req.method} ${req.path}`,
      resourceType: req.path.split('/')[2] || null,
      httpMethod: req.method,
      endpoint: req.path,
      status: isSuccess ? 'success' : 'failure',
      statusCode: res.statusCode,
      ipAddress: getClientIp(req),
      durationMs: duration,
    }).catch(() => {});

    return originalJson.call(this, body);
  };
  next();
};

module.exports = { activityLogMiddleware };
