function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  let message;
  if (status >= 500) {
    if (isProd) {
      message = 'Internal Server Error';
    } else {
      message = err.message || 'Internal Server Error';
      // eslint-disable-next-line no-console
      console.error('[errorHandler]', err);
    }
  } else {
    message = err.message || 'Error';
  }

  res.status(status).json({
    success: false,
    message,
    data: {},
  });
}

module.exports = errorHandler;
