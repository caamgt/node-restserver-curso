const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// =================================
// Mostrar todas las categorias.
// =================================

app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        // Para ordenar por descripcion
        .sort('descripcion')
        // Para mosrar los datos del usuario o popular los campos.
        // Primer argumento, el campo que queremos popular y el segundo, los campos de este.
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        })
});

// =================================
// Mostrar una categoria por ID
// =================================

app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es valido'
                }
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });

});

// =================================
// Crear una categoria
// =================================

app.post('/categoria', verificaToken, (req, res) => {
    // Regresa la nueva categoria.
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Evaluamos si se creo la categoria.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoria no se creo'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// =================================
// Actualizar una categoria
// =================================

app.put('/categoria/:id', verificaToken, (req, res) => {
    // Actualizar una categoria.

    let id = req.params.id;

    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion,
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidator: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });
});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Solo un administrador la puede borrar.

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        // Error de base de datos.
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si no va nada.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
        });
    });

});
module.exports = app;