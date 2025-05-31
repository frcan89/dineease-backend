// services/__tests__/rolService.test.js

// Mockear el módulo de modelos ANTES de importar el servicio
const mockRolInstance = {
  update: jest.fn(),
  destroy: jest.fn(),
  restore: jest.fn(),
  setPermisos: jest.fn(), // Para asignarPermisosARol
  // getPermisos: jest.fn(), // Si lo usaras para verificar después
};

const mockRolModel = {
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
};
const mockPermisoModel = {
  findAll: jest.fn(), // Para verificar existencia de permisos
};
const mockUsuarioModel = {
  count: jest.fn(), // Para verificar dependencias en eliminarRol
};

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../models', () => ({ // Ajusta la ruta
  Rol: mockRolModel,
  Permiso: mockPermisoModel,
  Usuario: mockUsuarioModel,
  sequelize: {
    transaction: jest.fn(() => Promise.resolve(mockTransaction)), // Mockear para que devuelva una promesa
  },
  Op: {
    like: Symbol.for('like'),
    ne: Symbol.for('ne'),
    in: Symbol.for('in'),
  }
}));

const rolService = require('../rolService');
const db = require('../../models'); // Para acceder a Op

describe('RolService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para crearRol ---
  describe('crearRol', () => {
    it('debería crear un rol exitosamente', async () => {
      const datosRol = { nombre: 'Nuevo Rol', descripcion: 'Descripción del rol' };
      const rolCreado = { id_rol: 1, ...datosRol, fecha_eliminacion: null, eliminado: false };
      db.Rol.findOne.mockResolvedValue(null); // No existe previamente
      db.Rol.create.mockResolvedValue(rolCreado);

      const resultado = await rolService.crearRol(datosRol);

      expect(db.Rol.findOne).toHaveBeenCalledWith({ where: { nombre: datosRol.nombre }, paranoid: false });
      expect(db.Rol.create).toHaveBeenCalledWith(datosRol);
      expect(resultado).toEqual(rolCreado);
    });

    it('debería lanzar error si falta el nombre', async () => {
      await expect(rolService.crearRol({ descripcion: 'Test' }))
        .rejects.toMatchObject({ status: 400, message: 'El nombre del rol es obligatorio.' });
    });

    it('debería lanzar error si el rol ya existe y está activo', async () => {
      const datosRol = { nombre: 'Rol Existente' };
      db.Rol.findOne.mockResolvedValue({ ...datosRol, fecha_eliminacion: null });
      await expect(rolService.crearRol(datosRol))
        .rejects.toMatchObject({ status: 409, message: 'Ya existe un rol con ese nombre.' });
    });

    it('debería lanzar error si el rol ya existe pero está eliminado', async () => {
      const datosRol = { nombre: 'Rol Eliminado Previamente' };
      db.Rol.findOne.mockResolvedValue({ ...datosRol, fecha_eliminacion: new Date() });
      await expect(rolService.crearRol(datosRol))
        .rejects.toMatchObject({ status: 409, message: `Ya existe un rol con el nombre '${datosRol.nombre}' pero está eliminado. Considere restaurarlo.` });
    });
  });

  // --- Pruebas para obtenerTodosLosRoles ---
  describe('obtenerTodosLosRoles', () => {
    it('debería devolver roles con paginación (sin incluir eliminados por defecto)', async () => {
      const mockRoles = [{ id_rol: 1, nombre: 'Admin' }];
      db.Rol.findAndCountAll.mockResolvedValue({ count: 1, rows: mockRoles });
      const resultado = await rolService.obtenerTodosLosRoles({ limite: 5, pagina: 1 });
      expect(db.Rol.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ paranoid: true, limit: 5, offset: 0 }));
      expect(resultado.roles).toEqual(mockRoles);
    });
    it('debería devolver roles incluyendo eliminados si se especifica', async () => {
      db.Rol.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      await rolService.obtenerTodosLosRoles({ incluirEliminados: true });
      expect(db.Rol.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ paranoid: false }));
    });
  });

  // --- Pruebas para obtenerRolPorId ---
  describe('obtenerRolPorId', () => {
    it('debería devolver un rol y sus permisos si se encuentra', async () => {
        const mockPermisos = [{ id_permiso: 1, nombre: 'ver_dashboard' }];
        const mockRol = { id_rol: 1, nombre: 'Gerente', Permisos: mockPermisos }; // Sequelize puede devolver así con 'include'
        db.Rol.findByPk.mockResolvedValue(mockRol);

        const resultado = await rolService.obtenerRolPorId(1);

        expect(db.Rol.findByPk).toHaveBeenCalledWith(1, {
            include: [{
                model: db.Permiso,
                attributes: ['id_permiso', 'nombre'],
                through: { attributes: [] }
            }],
            paranoid: true
        });
        expect(resultado).toEqual(mockRol);
    });
    // ... caso no encontrado ...
  });


  // --- Pruebas para actualizarRol ---
describe('actualizarRol', () => {
    it('debería actualizar un rol exitosamente', async () => {
      const datosActualizacion = { nombre: 'Rol Actualizado', descripcion: 'Desc actualizada' };
      // Crear una instancia mock específica para esta prueba con su propio método update mockeado
      const mockInstanciaRolEncontrada = {
        id_rol: 1,
        nombre: 'Rol Original',
        descripcion: 'Desc Original',
        fecha_eliminacion: null, // Importante para que no se considere eliminado
        // Mockear el método update para esta instancia específica
        update: jest.fn().mockImplementation(function(data) {
          // Simular la actualización de los campos de la instancia
          Object.assign(this, data);
          return Promise.resolve(this); // Devolver la instancia "actualizada"
        }),
      };

      db.Rol.findByPk.mockResolvedValue(mockInstanciaRolEncontrada);
      db.Rol.findOne.mockResolvedValue(null); // Para la verificación de nombre duplicado

      const resultado = await rolService.actualizarRol(1, datosActualizacion);

      expect(db.Rol.findByPk).toHaveBeenCalledWith(1); // Por defecto, findByPk no encuentra eliminados (paranoid: true)
      expect(mockInstanciaRolEncontrada.update).toHaveBeenCalledWith(datosActualizacion);
      // El resultado debería ser la instancia mockeada después de la "actualización"
      expect(resultado.nombre).toBe(datosActualizacion.nombre);
      expect(resultado.descripcion).toBe(datosActualizacion.descripcion);
    });

    it('debería lanzar error 404 si el rol a actualizar no se encuentra', async () => {
      db.Rol.findByPk.mockResolvedValue(null);
      await expect(rolService.actualizarRol(99, { nombre: 'Test' }))
        .rejects
        .toMatchObject({ status: 404, message: 'Rol no encontrado.' });
    });

    it('debería lanzar error 409 si el nuevo nombre ya existe en otro rol (no eliminado)', async () => {
      const mockInstanciaRolAActualizar = { id_rol: 1, nombre: 'Nombre Antiguo', update: jest.fn() };
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRolAActualizar);
      // Otro rol activo con el nombre deseado
      db.Rol.findOne.mockResolvedValue({ id_rol: 2, nombre: 'Nombre Duplicado', fecha_eliminacion: null });

      await expect(rolService.actualizarRol(1, { nombre: 'Nombre Duplicado' }))
        .rejects
        .toMatchObject({ status: 409, message: 'Ya existe otro rol con ese nombre.' });
    });

    it('debería lanzar error 409 si el nuevo nombre ya existe en otro rol (eliminado)', async () => {
      const mockInstanciaRolAActualizar = { id_rol: 1, nombre: 'Nombre Antiguo', update: jest.fn() };
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRolAActualizar);
      // Otro rol eliminado con el nombre deseado
      db.Rol.findOne.mockResolvedValue({ id_rol: 2, nombre: 'Nombre Duplicado', fecha_eliminacion: new Date() });

      await expect(rolService.actualizarRol(1, { nombre: 'Nombre Duplicado' }))
        .rejects
        .toMatchObject({ status: 409, message: "Ya existe un rol con el nombre 'Nombre Duplicado' pero está eliminado." });
    });
  });

  // --- Pruebas para eliminarRol ---
  describe('eliminarRol', () => {
    it('debería eliminar (lógicamente) un rol', async () => {
      const mockInstanciaRol = { ...mockRolInstance, id_rol: 1, destroy: jest.fn().mockResolvedValue(true) };
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRol);
      db.Usuario.count.mockResolvedValue(0); // No hay usuarios

      const resultado = await rolService.eliminarRol(1);
      expect(mockInstanciaRol.destroy).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
    // ... caso no encontrado, caso con usuarios asociados ...
  });

  // --- Pruebas para restaurarRol ---
  
  describe('restaurarRol', () => {
    it('debería restaurar un rol eliminado lógicamente y actualizar el campo "eliminado"', async () => {
      const mockInstanciaRolEliminado = {
        id_rol: 1,
        nombre: 'Rol Eliminado',
        fecha_eliminacion: new Date(),
        eliminado: true,
        // Mockear el método restore para esta instancia
        restore: jest.fn().mockImplementation(async function() {
          // Simular lo que hace Sequelize internamente (pone fecha_eliminacion a null)
          this.fecha_eliminacion = null;

          // SIMULAR LA EJECUCIÓN DEL HOOK 'afterRestore'
          // El hook llama a this.update({ eliminado: false }, { hooks: false, ... })
          // Así que llamamos al método 'update' de esta misma instancia mockeada.
          await this.update({ eliminado: false }, { hooks: false /*, transaction: ... si se pasa */ });

          return Promise.resolve(this); // Devuelve la instancia "restaurada y actualizada por el hook"
        }),
        // El método update que será llamado por el 'restore' mockeado (y por el hook simulado)
        update: jest.fn().mockImplementation(function(data) {
            Object.assign(this, data);
            return Promise.resolve(this);
        })
      };

      // Configurar findByPk para que devuelva esta instancia cuando se busca con paranoid: false
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRolEliminado);

      const resultado = await rolService.restaurarRol(1);

      expect(db.Rol.findByPk).toHaveBeenCalledWith(1, { paranoid: false });
      expect(mockInstanciaRolEliminado.restore).toHaveBeenCalled(); // Verificamos que restore se llamó

      // Ahora, gracias a la simulación en el mock de restore, el 'update' debería haber sido llamado
      expect(mockInstanciaRolEliminado.update).toHaveBeenCalledWith(
        { eliminado: false },
        expect.objectContaining({ hooks: false })
      );

      // El resultado es la instancia después de que restore() y el update simulado del hook se completaron
      expect(resultado.fecha_eliminacion).toBeNull();
      expect(resultado.eliminado).toBe(false);
    });

    // ... (otras pruebas de restaurarRol: no encontrado, no eliminado) ...
    it('debería lanzar error 404 si el rol a restaurar no se encuentra', async () => {
      db.Rol.findByPk.mockResolvedValue(null);
      await expect(rolService.restaurarRol(99))
        .rejects
        .toMatchObject({ status: 404, message: 'Rol no encontrado.' });
    });

    it('debería lanzar error 400 si el rol no está eliminado', async () => {
      const mockInstanciaRolActivo = { id_rol: 1, nombre: 'Rol Activo', fecha_eliminacion: null, eliminado: false };
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRolActivo);
      await expect(rolService.restaurarRol(1))
        .rejects
        .toMatchObject({ status: 400, message: 'El rol no está eliminado.' });
    });
  });
  // --- Pruebas para asignarPermisosARol ---
  describe('asignarPermisosARol', () => {
    it('debería asignar permisos a un rol', async () => {
      const mockInstanciaRol = { ...mockRolInstance, id_rol: 1, setPermisos: jest.fn().mockResolvedValue(undefined) };
      db.Rol.findByPk.mockResolvedValue(mockInstanciaRol); // El primer findByPk
      db.Permiso.findAll.mockResolvedValue([{id_permiso: 10}, {id_permiso: 11}]); // Todos los permisos solicitados existen
      // Mock para el findByPk final que devuelve el rol con permisos actualizados
      db.Rol.findByPk.mockResolvedValueOnce(mockInstanciaRol) // Para la búsqueda inicial del rol
                       .mockResolvedValueOnce({ ...mockInstanciaRol, Permisos: [{id_permiso: 10}, {id_permiso: 11}] }); // Para la devolución final


      const idsPermisos = [10, 11];
      await rolService.asignarPermisosARol(1, idsPermisos);

      expect(db.sequelize.transaction).toHaveBeenCalled(); // Verifica que se inicie una transacción
      expect(db.Rol.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(db.Permiso.findAll).toHaveBeenCalledWith({
        where: { id_permiso: { [db.Op.in]: idsPermisos } },
        attributes: ['id_permiso'],
        transaction: mockTransaction
      });
      expect(mockInstanciaRol.setPermisos).toHaveBeenCalledWith(idsPermisos, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
    // ... caso rol no encontrado, caso permiso no válido, caso idsPermisos no es array ...
    it('debería hacer rollback si un permiso no existe', async () => {
        const mockInstanciaRol = { ...mockRolInstance, id_rol: 1 };
        db.Rol.findByPk.mockResolvedValue(mockInstanciaRol);
        db.Permiso.findAll.mockResolvedValue([{ id_permiso: 10 }]); // Solo uno de los permisos existe

        const idsPermisos = [10, 99]; // 99 no existe
        await expect(rolService.asignarPermisosARol(1, idsPermisos))
            .rejects.toMatchObject({ status: 400, message: 'Uno o más IDs de permisos no son válidos.' });
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});