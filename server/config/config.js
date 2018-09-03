// ==================
// Puerto
// ==================

process.env.PORT = process.env.PORT || 3000;

// ==================
// Entorno
// ==================

// Para saber si estoy en desarrollo o rpoducion
// Si la variable "process.env.NODE_ENV " no existe significa que estoy ren desarrollo.
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==================
// Vencimiento del token
// ==================
// 60 segundo
// 60 minutos
// 24 horas
// 30 dias 

process.env.CADUCIDAD_TOKEN = '48h';

// ==================
// SEED de authentoicación
// ==================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ==================
// Base de datos
// ==================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    // Credenciales se creean en el sitio de la base de datos, en este caso, mlab.
    urlDB = process.env.MONGO_URI;
}

// Para poder utilizarlo en el archivo server.js
process.env.URLDB = urlDB;

// ==================
// Google Client ID
// ==================

process.env.CLIENT_ID = process.env.CLIENT_ID || '981969770523-cubu9f2jbqahqk5l1jqa1kprcvold94c.apps.googleusercontent.com';