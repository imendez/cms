module.exports = (function () {
    'use strict';

    var validation = {};

    validation.isValidUsername = function (username) {
        return !!/^[a-z0-9-_]{4,16}$/i.test(username);
    };

    validation.isValidEmail = function (email) {
        return !!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i.test(email);
    };

    validation.isValidPassword = function (password) {
        return password.length >= 6;
    };

    validation.validateUser = function (user) {
        var messages = [];
        if (!validation.isValidUsername(user.username)) {
            messages.push('El nombre de usuario no es válido');
        }
        if (!validation.isValidEmail(user.email)) {
            messages.push('El email no es válido');
        }
        if (!validation.isValidPassword(user.password)) {
            messages.push('La contraseña debe ser mayor a 5 caracteres');
        }
        return messages;
    };

    return validation;
})();