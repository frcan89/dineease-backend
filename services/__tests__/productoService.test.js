const productoService = require('../productoService');
const db = require('../../models'); // Adjust path as needed
const { Op } = require('sequelize');

// Mock the db.Producto model and other dependencies as needed
jest.mock('../../models', () => {
  const originalModels = jest.requireActual('../../models');
  const mockProducto = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    // Mock other methods used by productoService like destroy, restore, update
    destroy: jest.fn(),
    restore: jest.fn(),
    update: jest.fn(),
  };
  // Mock transaction
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  const mockSequelize = {
    transaction: jest.fn(() => Promise.resolve(mockTransaction)),
  };

  return {
    ...originalModels, // Keep original models for other tests if any
    Producto: mockProducto,
    IngredienteReceta: { // If IngredienteReceta is checked in delete
        count: jest.fn()
    },
    sequelize: { // Mock sequelize instance for transactions
        ...originalModels.sequelize,
        transaction: jest.fn(() => Promise.resolve(mockTransaction)),
    },
    // Mock other models if they are directly used and need mocking
  };
});


describe('ProductoService', () => {
  let mockTransaction;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup mock transaction that can be resolved/rejected in tests
    mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
    };
    db.sequelize.transaction.mockImplementation(() => Promise.resolve(mockTransaction));

  });

  describe('crearProducto', () => {
    it('should create a product successfully', async () => {
      const datosProducto = { nombre: 'Test Product', unidad_medida: 'kg', idRestaurante: 1, idUsuario: 1 };
      const mockCreatedProducto = { ...datosProducto, idProducto: 1 };
      db.Producto.findOne.mockResolvedValue(null); // No existing product
      db.Producto.create.mockResolvedValue(mockCreatedProducto);

      const result = await productoService.crearProducto(datosProducto);

      expect(db.Producto.findOne).toHaveBeenCalledWith({
        where: { nombre: datosProducto.nombre, idRestaurante: datosProducto.idRestaurante },
        paranoid: false,
      });
      expect(db.Producto.create).toHaveBeenCalledWith(datosProducto);
      expect(result).toEqual(mockCreatedProducto);
    });

    it('should throw an error if product name already exists in the restaurant', async () => {
      const datosProducto = { nombre: 'Test Product', unidad_medida: 'kg', idRestaurante: 1 };
      db.Producto.findOne.mockResolvedValue({ ...datosProducto, fecha_eliminacion: null }); // Product exists and is not deleted

      await expect(productoService.crearProducto(datosProducto))
        .rejects.toMatchObject({
          status: 409,
          message: `Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante.`
        });
    });

    it('should throw an error if product name exists but is deleted', async () => {
        const datosProducto = { nombre: 'Test Product', unidad_medida: 'kg', idRestaurante: 1 };
        db.Producto.findOne.mockResolvedValue({ ...datosProducto, fecha_eliminacion: new Date() }); // Product exists and IS deleted

        await expect(productoService.crearProducto(datosProducto))
          .rejects.toMatchObject({
            status: 409,
            message: `Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante, pero está eliminado. Considere restaurarlo.`
          });
      });

    it('should throw an error if required fields are missing', async () => {
      const datosProducto = { nombre: 'Test Product' }; // Missing unidad_medida and idRestaurante
      await expect(productoService.crearProducto(datosProducto))
        .rejects.toMatchObject({
            status: 400,
            message: 'Nombre, unidad de medida e ID del restaurante son obligatorios.'
        });
    });
  });

  describe('obtenerTodosLosProductos', () => {
    it('should return a paginated list of products', async () => {
      const mockProductos = [{ idProducto: 1, nombre: 'Product A' }];
      const mockCount = 1;
      db.Producto.findAndCountAll.mockResolvedValue({ rows: mockProductos, count: mockCount });

      const filtros = { limite: 5, pagina: 1, idRestaurante: 1 };
      const result = await productoService.obtenerTodosLosProductos(filtros);

      expect(db.Producto.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { idRestaurante: 1 },
        limit: 5,
        offset: 0,
        paranoid: true
      }));
      expect(result.productos).toEqual(mockProductos);
      expect(result.totalProductos).toBe(mockCount);
    });
  });

  describe('obtenerProductoPorId', () => {
    it('should return a product if found', async () => {
      const mockProducto = { idProducto: 1, nombre: 'Test Product' };
      db.Producto.findByPk.mockResolvedValue(mockProducto);

      const result = await productoService.obtenerProductoPorId(1);
      expect(db.Producto.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({paranoid: true}));
      expect(result).toEqual(mockProducto);
    });

    it('should return null if product not found', async () => {
      db.Producto.findByPk.mockResolvedValue(null);
      const result = await productoService.obtenerProductoPorId(99);
      expect(result).toBeNull();
    });
  });

  describe('actualizarProducto', () => {
    const mockProductoInstance = {
        idProducto: 1,
        nombre: 'Old Name',
        idRestaurante: 1,
        update: jest.fn(),
      };

    it('should update a product successfully', async () => {
      db.Producto.findByPk.mockResolvedValue(mockProductoInstance);
      db.Producto.findOne.mockResolvedValue(null); // No conflict with new name
      mockProductoInstance.update.mockResolvedValue({ ...mockProductoInstance, nombre: 'New Name' });

      const datosActualizacion = { nombre: 'New Name' };
      const result = await productoService.actualizarProducto(1, datosActualizacion);

      expect(db.Producto.findByPk).toHaveBeenCalledWith(1, {paranoid: false});
      expect(db.Producto.findOne).toHaveBeenCalledTimes(1); // Or more if other fields are checked
      expect(mockProductoInstance.update).toHaveBeenCalledWith(datosActualizacion);
      expect(result.nombre).toBe('New Name');
    });

    it('should throw 404 if product to update is not found', async () => {
      db.Producto.findByPk.mockResolvedValue(null);
      await expect(productoService.actualizarProducto(99, { nombre: 'New Name' }))
        .rejects.toMatchObject({ status: 404, message: 'Producto no encontrado.' });
    });

    it('should throw 409 if new product name conflicts with an existing one in the same restaurant', async () => {
      db.Producto.findByPk.mockResolvedValue(mockProductoInstance);
      db.Producto.findOne.mockResolvedValue({ idProducto: 2, nombre: 'New Name', idRestaurante: 1 }); // Conflict

      await expect(productoService.actualizarProducto(1, { nombre: 'New Name' }))
        .rejects.toMatchObject({ status: 409 });
    });

    it('should throw 400 if trying to change idRestaurante', async () => {
        db.Producto.findByPk.mockResolvedValue(mockProductoInstance);

        await expect(productoService.actualizarProducto(1, { idRestaurante: 2 }))
          .rejects.toMatchObject({ status: 400, message: 'No se permite cambiar el restaurante de un producto.' });
      });
  });

  describe('eliminarProducto', () => {
    const mockProductoInstance = {
        idProducto: 1,
        destroy: jest.fn().mockResolvedValue(true),
        // update: jest.fn() // If you have an explicit 'eliminado' field
      };

    it('should delete a product successfully', async () => {
      db.Producto.findByPk.mockResolvedValue(mockProductoInstance);
      db.IngredienteReceta.count.mockResolvedValue(0); // No dependencies

      const result = await productoService.eliminarProducto(1);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(db.Producto.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(db.IngredienteReceta.count).toHaveBeenCalledWith({ where: { idProducto: 1 }, transaction: mockTransaction });
      expect(mockProductoInstance.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      // expect(mockProductoInstance.update).toHaveBeenCalledWith({ eliminado: true }, { transaction: mockTransaction, paranoid: false }); // If applicable
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw 404 if product to delete is not found', async () => {
      db.Producto.findByPk.mockResolvedValue(null);
      await expect(productoService.eliminarProducto(99))
        .rejects.toMatchObject({ status: 404, message: 'Producto no encontrado para eliminar.' });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw 409 if product is used in recipes', async () => {
      db.Producto.findByPk.mockResolvedValue(mockProductoInstance);
      db.IngredienteReceta.count.mockResolvedValue(1); // Product is in a recipe

      await expect(productoService.eliminarProducto(1))
        .rejects.toMatchObject({ status: 409, message: 'No se puede eliminar el producto porque está siendo utilizado en recetas.' });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('restaurarProducto', () => {
    const mockProductoInstance = {
        idProducto: 1,
        fecha_eliminacion: new Date(), // Mock as soft-deleted
        restore: jest.fn().mockResolvedValue(true),
        // update: jest.fn() // If you have an explicit 'eliminado' field
      };

    const mockNonDeletedProductoInstance = {
        idProducto: 2,
        fecha_eliminacion: null, // Mock as not deleted
        restore: jest.fn(),
      };

    it('should restore a soft-deleted product successfully', async () => {
      db.Producto.findByPk.mockResolvedValueOnce(mockProductoInstance); // For the initial find
      db.Producto.findByPk.mockResolvedValueOnce({ ...mockProductoInstance, fecha_eliminacion: null }); // For the refetch after restore

      const result = await productoService.restaurarProducto(1);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(db.Producto.findByPk).toHaveBeenCalledWith(1, { paranoid: false, transaction: mockTransaction });
      expect(mockProductoInstance.restore).toHaveBeenCalledWith({ transaction: mockTransaction });
      // expect(mockProductoInstance.update).toHaveBeenCalledWith({ eliminado: false }, { transaction: mockTransaction }); // If applicable
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(db.Producto.findByPk).toHaveBeenCalledTimes(2); // Called again to return the restored instance
      expect(result.fecha_eliminacion).toBeNull();
    });

    it('should throw 404 if product to restore is not found', async () => {
      db.Producto.findByPk.mockResolvedValue(null);
      await expect(productoService.restaurarProducto(99))
        .rejects.toMatchObject({ status: 404, message: 'Producto no encontrado.' });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw 400 if product is not actually deleted', async () => {
      db.Producto.findByPk.mockResolvedValue(mockNonDeletedProductoInstance);
      await expect(productoService.restaurarProducto(2))
        .rejects.toMatchObject({ status: 400, message: 'El producto no está eliminado.' });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
