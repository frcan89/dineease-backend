// services/__tests__/permisoService.test.js

// Mockear el módulo de modelos ANTES de importar el servicio
const mockPermisoInstance = {
  update: jest.fn(),
  destroy: jest.fn(),
  restore: jest.fn(),
  getRoles: jest.fn(), // Para verificar dependencias en eliminarPermiso
};

const mockPermisoModel = {
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

jest.mock('../../models', () => ({ // Ajusta la ruta
  Permiso: mockPermisoModel,
  // Rol: mockRolModel, // Si necesitaras mockear Rol para getRoles
  Op: {
    like: Symbol.for('like'),
    ne: Symbol.for('ne'),
  }
}));

const permisoService = require('../permisoService');
const db = require('../../models');

describe('PermisoService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para crearPermiso ---
  describe('crearPermiso', () => {
    it('debería crear un permiso exitosamente', async () => {
      const datosPermiso = { nombre: 'ver_usuarios', descripcion: 'Permite ver usuarios' };
      const permisoCreado = { id_permiso: 1, ...datosPermiso, fecha_eliminacion: null, eliminado: false };
      db.Permiso.findOne.mockResolvedValue(null);
      db.Permiso.create.mockResolvedValue(permisoCreado);

      const resultado = await permisoService.crearPermiso(datosPermiso);
      expect(db.Permiso.create).toHaveBeenCalledWith(datosPermiso);
      expect(resultado).toEqual(permisoCreado);
    });
    // ... casos de error para crearPermiso (falta nombre, nombre duplicado, nombre duplicado pero eliminado) ...
  });

  // --- Pruebas para obtenerTodosLosPermisos ---
  describe('obtenerTodosLosPermisos', () => {
    it('debería devolver permisos con paginación (sin incluir eliminados por defecto)', async () => {
      const mockPermisos = [{ id_permiso: 1, nombre: 'permiso1' }];
      db.Permiso.findAndCountAll.mockResolvedValue({ count: 1, rows: mockPermisos });
      const resultado = await permisoService.obtenerTodosLosPermisos({ limite: 5, pagina: 1 });
      expect(db.Permiso.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ paranoid: true }));
      expect(resultado.permisos).toEqual(mockPermisos);
    });
     it('debería incluir eliminados si se especifica', async () => {
      db.Permiso.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      await permisoService.obtenerTodosLosPermisos({ incluirEliminados: true });
      expect(db.Permiso.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ paranoid: false }));
    });
  });

  // --- Pruebas para obtenerPermisoPorId ---
  // ... (similares a RolService) ...

  // --- Pruebas para actualizarPermiso ---
  // ... (similares a RolService) ...

  // --- Pruebas para eliminarPermiso ---
  describe('eliminarPermiso', () => {
    it('debería eliminar (lógicamente) un permiso si no está asociado a roles activos', async () => {
      // Mockear la instancia devuelta por findByPk
      const mockInstanciaPermiso = {
        ...mockPermisoInstance, // Incluye el mock de getRoles
        id_permiso: 1,
        destroy: jest.fn().mockResolvedValue(true) // Mockear destroy en esta instancia específica
      };
      db.Permiso.findByPk.mockResolvedValue(mockInstanciaPermiso);
      mockInstanciaPermiso.getRoles.mockResolvedValue([]); // No hay roles asociados

      const resultado = await permisoService.eliminarPermiso(1);
      expect(mockInstanciaPermiso.destroy).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });

    it('debería lanzar error 409 si el permiso está asignado a roles activos', async () => {
      const mockInstanciaPermiso = { ...mockPermisoInstance, id_permiso: 1 };
      db.Permiso.findByPk.mockResolvedValue(mockInstanciaPermiso);
      // Simular que getRoles devuelve un rol activo
      mockInstanciaPermiso.getRoles.mockResolvedValue([{ id_rol: 1, nombre: 'Rol Activo', fecha_eliminacion: null }]);

      await expect(permisoService.eliminarPermiso(1))
        .rejects.toMatchObject({ status: 409, message: 'No se puede eliminar el permiso porque está asignado a uno o más roles activos.' });
    });
    // ... caso no encontrado ...
  });

  // --- Pruebas para restaurarPermiso ---
  // ... (similares a RolService) ...

});