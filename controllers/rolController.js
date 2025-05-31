const rolService = require('../services/rolService');

const rolController = {
  async handleCrearRol(req, res, next) {
    try {
      const nuevoRol = await rolService.crearRol(req.body);
      res.status(201).json({ message: 'Rol creado exitosamente.', data: nuevoRol });
    } catch (error) { next(error); }
  },
  async handleObtenerTodosLosRoles(req, res, next) {
    try {
      const { limite, pagina, nombre, incluirEliminados } = req.query;
      const resultado = await rolService.obtenerTodosLosRoles({
        limite, pagina, nombre,
        incluirEliminados: incluirEliminados === 'true'
      });
      res.status(200).json({ message: 'Roles obtenidos exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },
  async handleObtenerRolPorId(req, res, next) {
    try {
      const idRol = parseInt(req.params.id, 10);
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const rol = await rolService.obtenerRolPorId(idRol, incluirEliminados);
      if (!rol) { const error = new Error('Rol no encontrado.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Rol obtenido exitosamente.', data: rol });
    } catch (error) { next(error); }
  },
  async handleActualizarRol(req, res, next) {
    try {
      const idRol = parseInt(req.params.id, 10);
      const rolActualizado = await rolService.actualizarRol(idRol, req.body);
      res.status(200).json({ message: 'Rol actualizado exitosamente.', data: rolActualizado });
    } catch (error) { next(error); }
  },
  async handleEliminarRol(req, res, next) {
    try {
      const idRol = parseInt(req.params.id, 10);
      await rolService.eliminarRol(idRol);
      res.status(200).json({ message: 'Rol eliminado (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },
  async handleRestaurarRol(req, res, next) {
    try {
      const idRol = parseInt(req.params.id, 10);
      const rolRestaurado = await rolService.restaurarRol(idRol);
      res.status(200).json({ message: 'Rol restaurado exitosamente.', data: rolRestaurado });
    } catch (error) { next(error); }
  },
  async handleAsignarPermisosARol(req, res, next) {
    try {
      const idRol = parseInt(req.params.id, 10);
      const { idsPermisos } = req.body; // Espera un array de IDs: [1, 2, 3]
      if (!Array.isArray(idsPermisos)) {
          const error = new Error('idsPermisos debe ser un array.'); error.status = 400; throw error;
      }
      const rolConPermisos = await rolService.asignarPermisosARol(idRol, idsPermisos);
      res.status(200).json({ message: 'Permisos asignados/actualizados al rol exitosamente.', data: rolConPermisos });
    } catch (error) { next(error); }
  }
};
module.exports = rolController;