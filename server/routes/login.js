const express = require('express');
const bcrypt = require('bcrypt');
// Manejo de tokens
const jwt = require('jsonwebtoken');
// Tojens de google API
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        // Evaluamos la contraseña
        // Este regresa un true o false.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
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

// Configuraciones de Google.
// La promesa verify, regresa todo el objeto de Google.
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }


}
// Utilizamos async, ya que utilizaremos await en la variable googleUser.
app.post('/google', async(req, res) => {
    // Otenemos el token

    let token = req.body.idtoken;
    let googleUser = await verify(token)
        // Para manejar el error, en el caso que el token este vencido o el usuario lo manipule.
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    // Verificamos en base de datos que no tengamos ese correo.
    // Mandamos la condicion, si el email = a google user si existe damanmos el callback
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        // Si existe el usuario de base de datos
        if (usuarioDB) {
            // Verificamos si se authentoico por google
            // Si no se authentico con google n dejamos que ingrese por google.
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
                // Sea autenticado por google. Solo renovamos su token.
            } else {
                // Generamos el token personalizado.
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                // Regresamos el token.
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
            // Si el usuario no existe en nuestra base de datos. Seria un nuevo usuario.
        } else {
            let usuario = new Usuario();

            // Podemos enviar propiedades directamente.
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // Guardamos en la base de datos.
            usuario.save((err, usuarioDB) => {
                // Si nos da error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                // Generamos el token
                let token = jwt.sign({
                    usuario: usuarioDB,

                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });
        }
    });

});

module.exports = app;