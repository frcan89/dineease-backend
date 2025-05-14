const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Ajusta la ruta
// const authMiddleware = require('../middlewares/authMiddleware'); // Descomentar cuando lo creemos

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro e inicio de sesión de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - idRol
 *               - idRestaurante
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Perez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               idRol:
 *                 type: integer
 *                 example: 1
 *               idRestaurante:
 *                 type: integer
 *                 example: 1
 *               dataAdicional:
 *                 type: object
 *                 properties:
 *                   telefono:
 *                     type: string
 *                     example: "1234567890"
 *                   direccion:
 *                     type: string
 *                     example: "Calle Falsa 123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       $ref: '#/components/schemas/Usuario' # Asume que tienes esta definición en Swagger
 *                     token:
 *                       type: string
 *       400:
 *         description: Faltan campos obligatorios o datos inválidos
 *       409:
 *         description: El correo electrónico ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', authController.handleRegistrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario existente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       $ref: '#/components/schemas/Usuario'
 *                     token:
 *                       type: string
 *       400:
 *         description: Email y contraseña son requeridos
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Cuenta de usuario inactiva
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', authController.handleLogin);

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Verifica la validez del token actual (ruta protegida)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       type: object # Payload del token
 *       401:
 *         description: No autorizado (token inválido o expirado)
 *       500:
 *         description: Error interno del servidor
 **/
// router.get('/verify-token', authMiddleware.verificarToken, authController.handleVerificarToken); // Ruta protegida
module.exports = router;