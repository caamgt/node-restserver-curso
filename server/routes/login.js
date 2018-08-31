const express = require('express');
const bcrypt = require('bcrypt');
// Manejo de tokens
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();


app.post('/login', (req, res) => {

    // Primero obtenemos el body, lo que es iguala email y password.
    let body = req.body;

    // Hacemos uso del esquema completo, esto para ver si el correo existe.
    // Utilizamos el findOne, para encontrar solo uno
    // la condicion:  email: body.email }
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Verificamos si el usuario existe.
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        // Evaluamos la contraseña
        // Este regresa un true o false.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        };

        // Generamos el token
        let token = jwt.sign({
            usuario: usuarioDB,
            // 60*60 = 1 hora.
            // Para que expire en 30 dia = 60 * 60 * 24 * 30, la variable process.env.CADUCIDAD_TOKEN esta en config.js
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

module.exports = app;