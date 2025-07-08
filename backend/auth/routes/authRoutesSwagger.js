const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login de usuarios
 */

/**
 * @swagger
 * /v1/api/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token JWT
 *     tags: [Auth]
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
 *                 description: Email del usuario para iniciar sesión.
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario para iniciar sesión.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, devuelve un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT generado para el usuario.
 *       401:
 *         description: Autenticación fallida.
 */
router.post("/login", authController.login);

module.exports = router;
