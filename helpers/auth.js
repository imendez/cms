module.exports = (function () {
    'use strict';
    var Auth = {};

    Auth.isAuthenticated = function (req) {
        return !!req.session.user;
    };

    Auth.accessControl = function (req, res, next) {
        var user = require('../models/user'),
            role = require('../models/role'),
            resource = require('../models/resource');
        if (!Auth.isAuthenticated(req)) {
            role.getResources('guest', function (err, resources) {
                if (err) {
                    throw err;
                }
                if (Auth.isPathAuthorized(req.route.path, resources)) {
                    return next();
                }
                return res.redirect('/login?redir=' + req.url);
            });
        } else {
            user.findUser(req.session.user.username, function (err, user) {
                if (err) {
                    throw err;
                }
                if (user) {
                    for (var i = 0; i < user.roles.length; i++) {
                        var role = user.roles[i];

                        if (Auth.isPathAuthorized(req.route.path, role.resources)) {
                            return next();
                        }
                    }
                }
                Auth.unauthorized(res);
            });
        }
    };

    Auth.isPathAuthorized = function (path, resources) {
        for (var i = 0; i < resources.length; i++) {
            if (resources[i].path === path) {
                return true;
            }
        }
        return false;
    };

    Auth.unauthorized = function (res) {
        res.status(401);
        res.render('error', {
            message: 'Unauthorized'
        });
    };

    return Auth;
}());

