function success(res, data = {}, message = 'OK', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function fail(res, message = 'Error', status = 400, data = {}) {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
}

module.exports = { success, fail };
