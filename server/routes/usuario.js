const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
// Importamos el modelo o esquema. Este la utilizare para crear objetos.
const Usuario = require('../models/usuario');
const app = express();

// Peticiones basicas.
app.get('/usuario', function(req, res) {

    // Asumimos que vendra la variable "desde" si no, quieres desde la pagina 0.
    let desde = req.query.desde || 0;
    // 'desde' siempre tiene que ser un numero. Lo transformamos.
    desde = Number(desde);
    // Limite por pagina.
    let limite = req.query.limite || 5;
    limite = Number(limite);
    // Para hacer un get a la bd hacemos uso del esquema.
    // find para que regrese todos.
    // Si queremos solo los usuarios creados con google quedaria asi: Usuario.find({ google: true })
    // Indicamos que campos queremos mostrar.
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        // Se salta los primeros 5 registros.
        .skip(desde)
        // Ponemos un limite.
        .limit(limite)
        // Funcion de mongooes execute ".exec()".
        .exec((err, usuarios) => {
            // Vemos si tenemos error.
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // Para contar registros. Este tiene la misma condicion que arriba "Usuario.find({})".
            //
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    // Si todo salio bien, regresamos los usuarios. usuarios = usuario, pero en EcmaScript solo se pone usuarios si hace referencia a el mismo.
                    usuarios,
                    cuantos: conteo
                });
            });
        });
});
app.post('/usuario', function(req, res) {

    let body = req.body;
    // Creamos el objeto
    // "new Usuario" Este crea una nueva instancia de ese esquema, con todas la spropiedades y metodos que trae mongoose.
    // Le pasamos todos los parametros que queremos.
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        // Vamos a encriptar la contrase;a con bcrypt
        // El primer argumento es la data a encriptar y el segundo la cantidad de vueltas al hast.
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // "save" es una palabra reservada de mongoose.
    usuario.save((err, usuarioDB) => {
        // Verificamos si hay error.
        if (err) {
            // return para que , si hay error que se salga.
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Para no retornar el mensaje de la contraseña al usuario final.
        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    // Utilizamos el underscore
    // propiedad pick que recibe el objeto que tiene todas las propiedades, en este caso "req.body".
    // Segundo argumento, son todas las propiedades validas, es un arreglo.
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // Realizamos la actualiacion.
    // El tercer argumento el cual es eun objeto es para que retorne el nuevo documento, el que tiene los cambios, que corra los validadores de roles en este caso.
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        // Si hay error
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

// Para no brorrar se cambia el estado a desabilitado.
app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioDesabilitado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDesabilitado
        });
    });
});

/*
// Obtenes el id por el url.
app.delete('/usuario/:id', function(req, res) {
    // Obtenemos el id.
    let id = req.params.id;

    // Hacemos la eliminacion.
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        // Evaliamos si enviamos un usuario ya borrado.
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuarioBorrado
        });
    });

}); */


module.exports = app;