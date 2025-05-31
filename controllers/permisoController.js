const permisoService = require('../services/permisoService');

const permisoController = {
  async handleCrearPermiso(req, res, next) {
    try {
      const nuevoPermiso = await permisoService.crearPermiso(req.body);
      res.status(201).json({ message: 'Permiso creado exitosamente.', data: nuevoPermiso });
    } catch (error) { next(error); }
  },
  async handleObtenerTodosLosPermisos(req, res, next) {
    try {
      const { limite, pagina, nombre, incluirEliminados } = req.query;
      const resultado = await permisoService.obtenerTodosLosPermisos({
        limite, pagina, nombre,
        incluirEliminados: incluirEliminados === 'true'
      });
      res.status(200).json({ message: 'Permisos obtenidos exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },
  async handleObtenerPermisoPorId(req, res, next) {
    try {
      const idPermiso = parseInt(req.params.id, 10);
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const permiso = await permisoService.obtenerPermisoPorId(idPermiso, incluirEliminados);
      if (!permiso) { const error = new Error('Permiso no encontrado.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Permiso obtenido exitosamente.', data: permiso });
    } catch (error) { next(error); }
  },
  async handleActualizarPermiso(req, res, next) {
    try {
      const idPermiso = parseInt(req.params.id, 10);
      const permisoActualizado = await permisoService.actualizarPermiso(idPermiso, req.body);
      res.status(200).json({ message: 'Permiso actualizado exitosamente.', data: permisoActualizado });
    } catch (error) { next(error); }
  },
  async handleEliminarPermiso(req, res, next) {
    try {
      const idPermiso = parseInt(req.params.id, 10);
      await permisoService.eliminarPermiso(idPermiso);
      res.status(200).json({ message: 'Permiso eliminado (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },
  async handleRestaurarPermiso(req, res, next) {
    try {
      const idPermiso = parseInt(req.params.id, 10);
      const permisoRestaurado = await permisoService.restaurarPermiso(idPermiso);
      res.status(200).json({ message: 'Permiso restaurado exitosamente.', data: permisoRestaurado });
    } catch (error) { next(error); }
  }
};
module.exports = permisoController;