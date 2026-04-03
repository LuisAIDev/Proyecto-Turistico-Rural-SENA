import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el token JWT
 * Protege las rutas privadas del backend
 */
export const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado de la petición
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  // 2. Si no hay token, denegar el acceso
  if (!token) {
    return res.status(403).json({
      error: 'Acceso denegado. No se proporcionó un token de seguridad.',
    });
  }

  try {
    // 3. Verificar si el token es válido y no ha expirado
    const cifrado = jwt.verify(
      token,
      process.env.JWT_SECRET || 'clave_secreta_sena',
    );

    // 4. Guardar los datos del usuario en la petición para usarlo después
    req.usuario = cifrado;

    // 5. ¡Todo bien! Continuar a la siguiente función (el controlador)
    next();
  } catch (error) {
    console.error('❌ Error de validación de token:', error.message);
    return res.status(401).json({
      error: 'Token inválido o expirado. Por favor, inicia sesión de nuevo.',
    });
  }
};
