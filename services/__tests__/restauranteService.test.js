// services/__tests__/restauranteService.test.js

// Mockear el módulo de modelos de Sequelize ANTES de importar el servicio
const mockRestauranteModel = {
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  // destroy, update, restore se mockearán en la instancia devuelta por findByPk/findOne
};

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

// Mockear el módulo 'db' completo.
jest.mock('../../models', () => ({ // Ajusta la ruta a tu archivo de modelos
  Restaurante: mockRestauranteModel,
  Usuario: { count: jest.fn() },
  sequelize: {
    transaction: jest.fn(() => mockTransaction), // Devuelve el objeto mockTransaction
  },
  Op: {
    like: Symbol.for('like'),
    ne: Symbol.for('ne'),
  }
}));


const restauranteService = require('../restauranteService');
const db = require('../../models'); // Para acceder a los mocks si es necesario directamente

describe('RestauranteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Resetea los mocks de transacción para cada prueba
    mockTransaction.commit.mockClear();
    mockTransaction.rollback.mockClear();
    db.sequelize.transaction.mockClear();
  });

  describe('crearRestaurante', () => {
    it('debería crear un restaurante exitosamente', async () => {
      const datosRestaurante = { nombre: 'Restaurante Nuevo', direccion: 'Calle Test 123' };
      const restauranteCreadoMock = { id_restaurante: 1, ...datosRestaurante, fecha_eliminacion: null };

      mockRestauranteModel.findOne.mockResolvedValue(null);
      mockRestauranteModel.create.mockResolvedValue(restauranteCreadoMock);

      const resultado = await restauranteService.crearRestaurante(datosRestaurante);

      expect(mockRestauranteModel.findOne).toHaveBeenCalledWith({
        where: { nombre: datosRestaurante.nombre },
        paranoid: false
      });
      expect(mockRestauranteModel.create).toHaveBeenCalledWith(datosRestaurante);
      expect(resultado).toEqual(restauranteCreadoMock);
    });

    it('debería lanzar un error si el nombre es obligatorio y no se proporciona', async () => {
      const datosRestaurante = { direccion: 'Calle Test 123' };
      await expect(restauranteService.crearRestaurante(datosRestaurante))
        .rejects
        .toMatchObject({ message: 'El nombre del restaurante es obligatorio.', status: 400 });
      expect(mockRestauranteModel.create).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si ya existe un restaurante con el mismo nombre', async () => {
      const datosRestaurante = { nombre: 'Restaurante Existente' };
      mockRestauranteModel.findOne.mockResolvedValue({ id_restaurante: 1, ...datosRestaurante, fecha_eliminacion: null });

      await expect(restauranteService.crearRestaurante(datosRestaurante))
        .rejects
        .toMatchObject({ message: 'Ya existe un restaurante con ese nombre.', status: 409 });
    });

     it('debería lanzar un error si ya existe un restaurante con el mismo nombre pero está eliminado', async () => {
      const datosRestaurante = { nombre: 'Restaurante Eliminado' };
      mockRestauranteModel.findOne.mockResolvedValue({ id_restaurante: 1, ...datosRestaurante, fecha_eliminacion: new Date() });

      await expect(restauranteService.crearRestaurante(datosRestaurante))
        .rejects
        .toMatchObject({ message: `Ya existe un restaurante con el nombre '${datosRestaurante.nombre}' pero está eliminado. Considere restaurarlo.`, status: 409 });
    });
  });

  describe('obtenerTodosLosRestaurantes', () => {
    it('debería devolver una lista de restaurantes con paginación', async () => {
      const mockRestaurantes = [{ id_restaurante: 1, nombre: 'Test 1' }, { id_restaurante: 2, nombre: 'Test 2' }];
      mockRestauranteModel.findAndCountAll.mockResolvedValue({ count: 2, rows: mockRestaurantes });

      const resultado = await restauranteService.obtenerTodosLosRestaurantes({ limite: 5, pagina: 1 });

      expect(mockRestauranteModel.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 5,
        offset: 0,
        paranoid: true
      }));
      expect(resultado.totalRestaurantes).toBe(2);
      expect(resultado.restaurantes).toEqual(mockRestaurantes);
      expect(resultado.paginaActual).toBe(1);
      expect(resultado.totalPaginas).toBe(1);
    });

    it('debería filtrar por nombre', async () => {
        mockRestauranteModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await restauranteService.obtenerTodosLosRestaurantes({ nombre: 'Buscado' });

        expect(mockRestauranteModel.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { nombre: { [db.Op.like]: '%Buscado%' } },
            paranoid: true
        }));
    });

    it('debería incluir eliminados si se especifica', async () => {
        mockRestauranteModel.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await restauranteService.obtenerTodosLosRestaurantes({ incluirEliminados: true });

        expect(mockRestauranteModel.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            paranoid: false
        }));
    });
  });

  describe('obtenerRestaurantePorId', () => {
    it('debería devolver un restaurante si se encuentra', async () => {
      const mockRestaurante = { id_restaurante: 1, nombre: 'Encontrado' };
      mockRestauranteModel.findByPk.mockResolvedValue(mockRestaurante);

      const resultado = await restauranteService.obtenerRestaurantePorId(1);

      expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(1, { paranoid: true });
      expect(resultado).toEqual(mockRestaurante);
    });

    it('debería devolver null si el restaurante no se encuentra', async () => {
      mockRestauranteModel.findByPk.mockResolvedValue(null);
      const resultado = await restauranteService.obtenerRestaurantePorId(99);
      expect(resultado).toBeNull();
    });
  });

  describe('actualizarRestaurante', () => {
    it('debería actualizar un restaurante exitosamente', async () => {
      const datosActualizacion = { nombre: 'Nombre Actualizado' };
      const mockRestauranteInstancia = {
        id_restaurante: 1,
        nombre: 'Nombre Antiguo',
        fecha_eliminacion: null,
        update: jest.fn().mockImplementation(function(data) {
            Object.assign(this, data);
            return Promise.resolve(this);
        }),
      };
      mockRestauranteModel.findByPk.mockResolvedValue(mockRestauranteInstancia);
      mockRestauranteModel.findOne.mockResolvedValue(null);

      const resultado = await restauranteService.actualizarRestaurante(1, datosActualizacion);

      expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(1, { paranoid: false });
      expect(mockRestauranteInstancia.update).toHaveBeenCalledWith(datosActualizacion);
      expect(resultado.nombre).toBe('Nombre Actualizado');
    });

    it('debería lanzar error 404 si el restaurante a actualizar no se encuentra', async () => {
      mockRestauranteModel.findByPk.mockResolvedValue(null);
      await expect(restauranteService.actualizarRestaurante(99, { nombre: 'Test' }))
        .rejects
        .toMatchObject({ status: 404, message: 'Restaurante no encontrado.' });
    });

    it('debería lanzar error 409 si el nuevo nombre ya existe en otro restaurante', async () => {
      const mockRestauranteInstancia = { id_restaurante: 1, nombre: 'Nombre Antiguo', update: jest.fn() };
      mockRestauranteModel.findByPk.mockResolvedValue(mockRestauranteInstancia);
      mockRestauranteModel.findOne.mockResolvedValue({ id_restaurante: 2, nombre: 'Nombre Duplicado' });

      await expect(restauranteService.actualizarRestaurante(1, { nombre: 'Nombre Duplicado' }))
        .rejects
        .toMatchObject({ status: 409, message: 'Ya existe otro restaurante con ese nombre.' });
    });
  });

  describe('eliminarRestaurante', () => {
    it('debería eliminar (lógicamente) un restaurante y actualizar "eliminado"', async () => {
      const mockRestauranteInstancia = {
        id_restaurante: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      };
      mockRestauranteModel.findByPk.mockResolvedValue(mockRestauranteInstancia);
      db.Usuario.count.mockResolvedValue(0);

      const resultado = await restauranteService.eliminarRestaurante(1);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(db.Usuario.count).toHaveBeenCalledWith({ where: { id_restaurante: 1 }, transaction: mockTransaction });
      expect(mockRestauranteInstancia.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockRestauranteInstancia.update).toHaveBeenCalledWith({ eliminado: true }, { transaction: mockTransaction, paranoid: false });
      expect(resultado).toBe(true);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('debería devolver false si el restaurante a eliminar no se encuentra', async () => {
      mockRestauranteModel.findByPk.mockResolvedValue(null);
      const resultado = await restauranteService.eliminarRestaurante(99);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(99, { transaction: mockTransaction });
      expect(resultado).toBe(false);
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('debería lanzar error 409 si el restaurante tiene usuarios asociados', async () => {
      const mockRestauranteInstancia = { id_restaurante: 1 };
      mockRestauranteModel.findByPk.mockResolvedValue(mockRestauranteInstancia);
      db.Usuario.count.mockResolvedValue(1); // Hay 1 usuario asociado

      await expect(restauranteService.eliminarRestaurante(1))
        .rejects
        .toMatchObject({ status: 409, message: 'No se puede eliminar el restaurante porque tiene usuarios asociados.' });

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(db.Usuario.count).toHaveBeenCalledWith({ where: { id_restaurante: 1 }, transaction: mockTransaction });
      // Corrected expectation: rollback is called twice
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(2);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('restaurarRestaurante', () => {
    const restauranteId = 1;
    let mockRestauranteInstancia;

    beforeEach(() => {
        // Este mock de instancia se usará en varias pruebas de restaurar
        mockRestauranteInstancia = {
            id_restaurante: restauranteId,
            nombre: 'Restaurante Borrado',
            fecha_eliminacion: new Date(), // Simula estar borrado
            eliminado: true,             // Simula estar borrado
            restore: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockImplementation(function(data) {
                // Simular la actualización en la instancia mock
                if (data.eliminado === false) {
                    this.eliminado = false;
                    this.fecha_eliminacion = null; // Restore ya lo haría, pero para ser explícitos
                }
                return Promise.resolve(this);
            }),
        };
    });

    it('debería restaurar un restaurante exitosamente', async () => {
        // Primera llamada a findByPk (para encontrar el restaurante a restaurar)
        mockRestauranteModel.findByPk.mockResolvedValueOnce(mockRestauranteInstancia);
        // Segunda llamada a findByPk (para devolver el restaurante restaurado)
        // Devolvemos una copia "actualizada" de la instancia
        const mockRestaurado = { ...mockRestauranteInstancia, fecha_eliminacion: null, eliminado: false };
        mockRestauranteModel.findByPk.mockResolvedValueOnce(mockRestaurado);


        const resultado = await restauranteService.restaurarRestaurante(restauranteId);

        expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
        expect(mockRestauranteModel.findByPk).toHaveBeenNthCalledWith(1, restauranteId, {
            paranoid: false,
            transaction: mockTransaction
        });
        expect(mockRestauranteInstancia.restore).toHaveBeenCalledWith({ transaction: mockTransaction });
        expect(mockRestauranteInstancia.update).toHaveBeenCalledWith({ eliminado: false }, { transaction: mockTransaction });
        expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(mockRestauranteModel.findByPk).toHaveBeenNthCalledWith(2, restauranteId); // Segunda llamada
        expect(resultado).toEqual(mockRestaurado);
        expect(resultado.eliminado).toBe(false);
        expect(resultado.fecha_eliminacion).toBeNull();
    });

    it('debería lanzar error 404 si el restaurante a restaurar no se encuentra', async () => {
        mockRestauranteModel.findByPk.mockResolvedValue(null); // No se encontró

        await expect(restauranteService.restaurarRestaurante(99))
            .rejects
            .toMatchObject({ status: 404, message: 'Restaurante no encontrado.' });

        expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
        expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(99, {
            paranoid: false,
            transaction: mockTransaction
        });
        // Corrected expectation: rollback is called twice
        expect(mockTransaction.rollback).toHaveBeenCalledTimes(2);
        expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('debería lanzar error 400 si el restaurante no está eliminado', async () => {
        const mockRestauranteActivo = {
            id_restaurante: restauranteId, // Make sure restauranteId is 1 as per your setup
            nombre: 'Restaurante Activo',
            fecha_eliminacion: null, // No está eliminado
            eliminado: false,        // No está eliminado
            restore: jest.fn(),
            update: jest.fn(),
        };
        mockRestauranteModel.findByPk.mockResolvedValue(mockRestauranteActivo);

        await expect(restauranteService.restaurarRestaurante(restauranteId))
            .rejects
            .toMatchObject({ status: 400, message: 'El restaurante no está eliminado.' });

        expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
        expect(mockRestauranteModel.findByPk).toHaveBeenCalledWith(restauranteId, {
            paranoid: false,
            transaction: mockTransaction
        });
        // Corrected expectation: rollback is called twice
        expect(mockTransaction.rollback).toHaveBeenCalledTimes(2);
        expect(mockTransaction.commit).not.toHaveBeenCalled();
        expect(mockRestauranteActivo.restore).not.toHaveBeenCalled();
        expect(mockRestauranteActivo.update).not.toHaveBeenCalled();
    });
  });
});