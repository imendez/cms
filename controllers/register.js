module.exports = (function () {
    'use strict';

    var register = {};
    var User = require('../models/user');
    var auth = require('../helpers/auth');

    register.getIndex = function (req, res) {
        if (auth.isAuthenticated(req)) {
            return res.redirect('/');
        }
        res.render('register/index', {
            message: req.flash('message')
        });
    };

    register.postIndex = function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;


        var validation = require('../helpers/validation');

        var messages = validation.validateUser(user);

        if (user.password != req.body.passwordConfirmation) {
            messages.push('Las contraseñas no coinciden');
        }

        if (messages.length > 0) {
            return res.render('register/index', {
                message: messages,
                user: user
            });
        }


        user.save(function (err) {
            if (err) {
                var message = 'Ocurrio un error al registrar el usuario';
                if (err.code === 11000) {
                    var match = /^[^\$]+\$([a-z0-9\.-_]+)_1[^{]+\{ : "([a-z0-9@\.-_]+)" }$/.exec(err.message);
                    switch (match[1]) {
                        case 'username':
                            message = 'El usuario ' + match[2] + ' ya está registrado';
                            break;
                        case 'email' :
                            message = 'Ya existe un usuario registrado con el email: ' + match[2];
                            break;
                    }
                }
                return res.render('register/index', {
                    message: message,
                    user: user
                });
            }
            req.flash('message', 'El usuario se registró correctamente.');
            return res.redirect('/login');
        });
    };

    register.routes = [
        {
            route: '/register',
            method: 'get',
            action: 'getIndex',
            noAccessControl: true
        },
        {
            route: '/register',
            method: 'post',
            action: 'postIndex',
            noAccessControl: true
        }
    ];

    return register;
})();