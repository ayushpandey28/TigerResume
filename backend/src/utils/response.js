const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Server Error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { success, error };
