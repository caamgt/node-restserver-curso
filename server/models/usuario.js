const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

// PObtener el cascaron de mongoose para crear esquemas.
let Schema = mongoose.Schema;

// Definimos un nuevo esquema.
let usuarioSchema = new Schema({
    // Definimos los campos del esquema.
    nombre: {
        type: String,
        // Lo pongo en llaves para poder enviar un mensaje personalizado.
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        // Para que sea unica la dirección de correo por usuario.
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Para no enviar la contraseña nunca.
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

// Este esquema utilizara un plugin en particular.
// Tambien podes enviar una mensaje adicional.
// Mongoose inyectara el mesnaje de error en {PATH}
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

// Le damos un nombre a este modelo, en este caso "Usuario". Este contiene toda la configuracion de "usuarioSchema".
module.exports = mongoose.model('Usuario', usuarioSchema);