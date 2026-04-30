const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const notFound = (res, message = 'Resource not found') =>
  error(res, message, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  error(res, message, 403);

const badRequest = (res, message = 'Bad request', errors = null) =>
  error(res, message, 400, errors);

const paginate = (res, data, total, page, limit, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page : parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });

module.exports = { success, created, error, notFound, unauthorized, forbidden, badRequest, paginate };
