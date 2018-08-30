// ==================
// Puerto
// =================

process.env.PORT = process.env.PORT || 3000;

// ==================
// Entorno
// =================

// Para saber si estoy en desarrollo o rpoducion
// Si la variable "process.env.NODE_ENV " no existe significa que estoy ren desarrollo.
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==================
// Base de datos
// =================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    // Credenciales se creean en el sitio de la base de datos, en este caso, mlab.
    urlDB = 'mongodb://calfaro:Loscar123456@ds237832.mlab.com:37832/cafegt';
}

// Para poder utilizarlo en el archivo server.js
process.env.URLDB = urlDB;