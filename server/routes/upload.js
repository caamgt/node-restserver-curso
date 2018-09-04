const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Para poder grabar en la b de usuarios, importamos del esquema.
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
// Para poder llegar a las carpetas: usuarios y productos del uploads.
const path = require('path');

// default options
app.use(fileUpload());

// "tipo" para manejar tipo usuario o tipo producto.
// El "id" para saber que tengo que actualizar.
app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha selecionado ningun archivo'
            }
        });
    }

    // Validar tipo
    // productos y usuarios escrito igual que el nombre de las capetas productos y usuarios del uploads.
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
            }
        });
    }
    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;

    // Extenciones permitidas.
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    // Obtener la extencion del archivo.
    let nombreCortado = archivo.name.split('.');
    // [nombreCortado.length -1] para obtener la ultima posición.
    let extencion = nombreCortado[nombreCortado.length - 1];

    // indexOf es para buscar en un arreglo.
    // Si es meno a "0", quiere decir que no lo encontro.
    if (extensionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extencion,
            }
        });
    }

    // Cambiar el nombre al archivo.
    // El id tiene que se runico para productos o usuarios.
    // ${new Date().getMilliseconds()} para agregarle al nombre del archivo, y asi sea unico.
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`

    // Use the mv() method to place the file somewhere on your server
    // El nombre puede ser cualquiera, archivo, data, el queramos.
    // la variable "tipo" es para identificar usuarios o productos.
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aqui, la imagen ya se cargo.
        // Validamos el tipo
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // Si el usuario no exite, tengo que borrar la imagen.
            // Esto es para evitar que nos llenen el servidor de archivos basuras.
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            // Si el usuario no exite, tengo que borrar la imagen.
            // Esto es para evitar que nos llenen el servidor de archivos basuras.
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo) {
    // Creamos el path.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    // Verificamos si existe.
    // fs.existsSync(pathImagen) regresa un true si existe o un false si no.
    if (fs.existsSync(pathImagen)) {
        // Si exite la borramos.
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;