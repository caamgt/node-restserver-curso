require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
// Para crear path, en concreto para la carpeta "public".
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const colors = require('colors');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configracuón global de rutas.
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('Base de datos ONLINE'.green);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando puerto: ${process.env.PORT}`);
});