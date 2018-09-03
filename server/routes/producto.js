const express = require('express');
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion')
const app = express();


// =============================
// Obtener todos los productos
// =============================

app.get('/producto', verificaToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario categoria
    // Paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);



    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no existe'
                });
            }

            res.json({
                ok: true,
                productos
            });
        })

});

// =============================
// Obtener producto por ID
// =============================

app.get('/producto/:id', verificaToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario categoria

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no existe'
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// =============================
// Buscar productos
// =============================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    // Para hacer la busqueda mas flexible, enviamos una expresion regular.
    // Esta es una funcion de javascript.
    // esta basada en la varibale "termino", le enviamos "i" para que sea incensible a mayusculas y minusculas.
    let regex = new RegExp(termino, 'i');

    // Le enviamos la expresion regular.
    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'El producto no existe'
                });
            }

            res.json({
                ok: true,
                productos
            });
        })
});

// =============================
// Crear un nuevo producto
// =============================

app.post('/producto', verificaToken, (req, res) => {
    // Grabar el usuario
    // Grabar una categoria del listado de categorias
    let body = req.body;


    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no fue creado'
            });
        }

        res.status(201).json({
            ok: true,
            productoDB,
        });
    });
});

// =============================
// Actualizar un nuevo producto
// =============================

app.put('/producto/:id', verificaToken, (req, res) => {
    // Actualizar un producto

    let id = req.params.id;

    let body = req.body;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return status(500).json({
                ok: false,
                err,
            });
        }

        if (!productoDB) {
            return status(400).json({
                ok: false,
                message: 'Producto no existe'
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoGuardado
            });

        });
    });

});

// =============================
// Borrar un producto
// =============================
app.delete('/producto/:id', verificaToken, (req, res) => {
    // Disponible pase a false.

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'Producto no existe'
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no existe'
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });
        });
    });
});

module.exports = app;