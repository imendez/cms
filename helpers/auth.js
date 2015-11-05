module.exports = new function () {
    var self = this;
    this.isAuthenticated = function (req) {
        return !!req.session.user;
    };

    this.requiresLogin = function (req, res, next) {
        if (this.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login?redir=' + req.url);
    };

    this.accessControl = function (req, res, next) {
        var user = require('../models/user');
        var role = require('../models/role');
        var resource = require('../models/resource');
        if (!self.isAuthenticated(req)) {
            role.getResources('guest', function (err, resources) {
                if (self.isPathAuthorized(req.route.path, resources)) {
                    return next();
                }
                else {
                    return res.redirect('/login?redir=' + req.url);
                }
            });
        } else {
            user.findUser(req.session.user.username, function (err, user) {
                if (err) throw err;

                for (var i = 0; i < user.roles.length; i++) {
                    var role = user.roles[i];

                    if (self.isPathAuthorized(req.route.path, role.resources)) {
                        return next();
                    }
                }
                self.unauthorized(res);
            });
        }
    };

    this.isPathAuthorized = function (path, resources) {
        for (var i = 0; i < resources.length; i++) {
            if (resources[i].path === path) {
                return true;
            }
        }
        return false;
    };

    this.unauthorized = function(res) {
        res.status(401);
        res.render('error', {
            message: 'Unauthorized'
        });
    }
};
