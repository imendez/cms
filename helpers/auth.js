module.exports = (function () {
    'use strict';
    var auth = {};

    auth.isAuthenticated = function (req) {
        return !!req.session.user;
    };

    auth.accessControl = function (req, res, next) {
        var user = require('../models/user'),
            role = require('../models/role');
        if (auth.isAuthenticated(req)) {
            user.findUser({username: req.session.user.username}, function (err, user) {
                if (err) {
                    throw err;
                }
                if (user) {
                    for (var i = 0; i < user.roles.length; i++) {
                        var role = user.roles[i];

                        if (auth.isPathAuthorized(req.route.path, role.resources)) {
                            return next();
                        }
                    }
                }
                return auth.unauthorized(res);
            });
        } else {
            role.getResources('guest', function (err, resources) {
                if (err) {
                    throw err;
                }
                if (auth.isPathAuthorized(req.route.path, resources)) {
                    return next();
                }
                return res.redirect('/login?redir=' + req.url);
            });
        }
    };

    auth.isPathAuthorized = function (path, resources) {
        for (var i = 0; i < resources.length; i++) {
            if (resources[i].path === path) {
                return true;
            }
        }
        return false;
    };

    auth.unauthorized = function (res) {
        res.status(401);
        res.render('error', {
            message: 'Unauthorized'
        });
    };

    return auth;
}());

