const jwt = require('jsonwebtoken');

// ===================
// Verificar token
// ===================

// Esta tendra 2 argumento:
// la solicitud, la respuesta que deceo retornar y el next para continuar con la ejecuacion del programa.
let verificaToken = (req, res, next) => {
    // Para leer el header.
    // Se utiliza el get para obtener los headers
    // token o authorization, el que estemos utilizando. En este caso token.
    let token = req.get('token');

    // Verificamos el token.
    // El primero es el token que estamos recibiendo.
    // El segundo es el SEED
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        // Si algo sale mal, el token ya expiro u otra cosa.
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido',
                }
            });
        }

        req.usuario = decoded.usuario;

        // Llamamos al next para que continue.
        next();
    });
};

// =====================
// Verifica AdminRole
// =====================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

// ==========================
// Verifica token para imagen
// ==========================
let verificaTokenImg = (req, res, next) => {
    // Para recibir el token por el url.
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido',
                }
            });
        }

        req.usuario = decoded.usuario;

        // Llamamos al next para que continue.
        next();
    });

}
module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
};