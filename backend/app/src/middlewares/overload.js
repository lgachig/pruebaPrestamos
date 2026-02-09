let currentRequests = 0;
const MAX_REQUESTS = 5;

module.exports = function overload(req, res, next) {
  currentRequests++;

  if (currentRequests > MAX_REQUESTS) {
    req.overloaded = true;
  }

  res.on('finish', () => {
    currentRequests--;
  });

  next();
};