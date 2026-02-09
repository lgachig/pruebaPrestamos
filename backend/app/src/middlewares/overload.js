/**
 * Middleware de sobrecarga (Overload Pattern).
 * Cuando el sistema está saturado (más de MAX_REQUESTS concurrentes),
 * marca req.overloaded = true para que las rutas activen estrategias
 * alternativas: caché (Redis) o cola (Queue).
 * 
 * Jerarquía: Todas las rutas pasan por este middleware global.
 * Las rutas sensibles a saturación (report, POST loan) aplican
 * lógica condicional según req.overloaded.
 */
let currentRequests = 0;
const MAX_REQUESTS = parseInt(process.env.OVERLOAD_THRESHOLD, 10) || 5;

function overload(req, res, next) {
  currentRequests++;

  if (currentRequests > MAX_REQUESTS) {
    req.overloaded = true;
    req.overloadInfo = {
      current: currentRequests,
      max: MAX_REQUESTS,
      mode: 'saturated'
    };
  } else {
    req.overloaded = false;
    req.overloadInfo = {
      current: currentRequests,
      max: MAX_REQUESTS,
      mode: 'normal'
    };
  }

  res.on('finish', () => {
    currentRequests = Math.max(0, currentRequests - 1);
  });

  next();
}

/** Factory: crea middleware con límite personalizado (sobrecarga de configuración) */
overload.withThreshold = (threshold) => {
  const max = threshold || MAX_REQUESTS;
  return (req, res, next) => {
    currentRequests++;
    req.overloaded = currentRequests > max;
    res.on('finish', () => {
      currentRequests = Math.max(0, currentRequests - 1);
    });
    next();
  };
};

module.exports = overload;
