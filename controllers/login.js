module.exports = (function(){
    'use strict';

    var auth = require('../helpers/auth');
    var login = {};

    login.getIndex =  function (req, res) {
        if (auth.isAuthenticated(req)) {
            return res.redirect('/');
        }
        res.render('login/index', {
            redir: req.query.redir || '',
            message: req.flash('message')
        });
    };

    login.postIndex = function (req, res, next) {
        var User = require('../models/user');

        User.authenticate(req.body.username, req.body.password, function (err, user, reason) {
            if (err) {
                return next(err);
            }
            // login was successful if we have a user
            if (user) {
                req.session.user = {
                    username: user.username
                };
                req.session.save();
                return res.redirect(req.body.redir || '/');
            }

            // otherwise we can determine why we failed
            var reasons = User.failedLogin;
            var message = '';
            switch (reason) {
                case reasons.NOT_FOUND:
                case reasons.PASSWORD_INCORRECT:
                    message = ['Usuario o contraseña incorrecto'];
                    break;
                case reasons.MAX_ATTEMPTS:
                    message = ['Tu cuenta ha sido bloqueada temporalmente'];
                    break;
            }
            req.flash('message', message);
            return res.redirect('/login');
        });

    };

    login.routes = [
        {
            route: '/login',
            method: 'get',
            action: 'getIndex',
            noAccessControl: true
        },
        {
            route: '/login',
            method: 'post',
            action: 'postIndex',
            noAccessControl: true
        }
    ];

    return login;
})();