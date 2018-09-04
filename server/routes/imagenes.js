const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

// Para mostrar información.
// Necesitamos saver si es tipo usuarios o tipo productos.
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    // Construimos un path.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        // Creamos el path de la nueva imagen.
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }

});

module.exports = app;