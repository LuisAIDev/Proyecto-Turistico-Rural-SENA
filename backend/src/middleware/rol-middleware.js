/**
 * ==========================================
 * MIDDLEWARE: VERIFICACIÓN DE ROLES
 * PROYECTO: TURISMO RURAL - SENA
 * ==========================================
 */

export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // 1. Verificamos que el usuario exista en la petición 
      // (Esto lo inyecta previamente el auth-middleware)
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado. Inicie sesión nuevamente.',
        });
      }

      const { rol } = req.usuario;

      // 2. Comprobamos si el rol del usuario está en la lista de permitidos
      if (!rolesPermitidos.includes(rol)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: No tienes los permisos necesarios para esta acción.',
        });
      }

      // 3. Si todo está bien, permitimos el paso al controlador
      next();
    } catch (error) {
      console.error('Error en rol-middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno verificando permisos.',
      });
    }
  };
};