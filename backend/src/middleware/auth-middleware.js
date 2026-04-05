import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el token JWT
 * Este es el "Portero" que revisa si el usuario ha iniciado sesión.
 */
export const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado (Header: Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Si no hay token, enviamos un error 401 (No Autenticado)
  if (!token) {
    return res.status(401).json({
      error:
        'Sesión no encontrada. Por favor, inicia sesión para acceder a este recurso.',
    });
  }

  try {
    // 3. Verificar si el token es válido y no ha expirado
    const cifrado = jwt.verify(
      token,
      process.env.JWT_SECRET || 'clave_secreta_sena',
    );

    /**
     * 4. Guardar los datos del usuario en la petición (req)
     * Guardamos todo el objeto cifrado (id, rol, nombre) en 'req.usuario'
     * Esto es vital para que el siguiente middleware (verificarRol) funcione.
     */
    req.usuario = cifrado;

    // 5. ¡Todo bien! Pasamos al siguiente paso (Middleware de Rol o Controlador)
    next();
  } catch (error) {
    console.error('❌ Error de validación de token:', error.message);

    // Si el token expiró o es falso, devolvemos 401
    return res.status(401).json({
      error:
        'Tu sesión ha expirado o el token es inválido. Por favor, reingresa al sistema.',
    });
  }
};
