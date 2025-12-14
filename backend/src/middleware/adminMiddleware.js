const adminMiddleware = (req, res, next) => {
  console.log('🔍 req.user in adminMiddleware:', req.user);

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = adminMiddleware;
