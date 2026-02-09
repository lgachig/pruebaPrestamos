/**
 * Utilidades para consultas SQL seguras.
 * Siempre usar parámetros ($1, $2, ...) - NUNCA concatenar strings.
 * Previene inyección SQL.
 */

/**
 * Valida que los valores no contengan caracteres peligrosos para SQL.
 * Los parámetros de pg.query ya escapan, pero esto añade validación extra.
 */
function sanitizeId(value) {
  if (value === null || value === undefined) return null;
  const str = String(value);
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (str.length > 100 || /[;'"\\]/.test(str)) {
    throw new Error('Valor inválido para consulta');
  }
  return str;
}

module.exports = { sanitizeId };
