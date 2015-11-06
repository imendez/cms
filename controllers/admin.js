module.exports = (function () {
    'use strict';

    var admin = {};
    var users = require('../models/user');
    var mongoose = require('mongoose')

    admin.getIndex = function (req, res) {
        res.render('admin/index', {
            title: 'Express'
        });
    };

    admin.getUsers = function (req, res) {
        users.getUsers(function (err, users) {
            if (err) {
                throw err;
            }
            res.render('admin/users/index', {
                users: users
            });
        });
    };

    admin.editUser = function (req, res) {
        users.findUser({_id: req.params.userId}, function (err, user) {
            if (err) {
                throw err;
            }
            var roles = require('../models/role');
            roles.getRoles(function (err, roles) {
                if (err) {
                    throw err;
                }
                for (var i = 0; i < roles.length; i++) {
                    var role = roles[i];
                    role.active = isRoleActive(user, role.name);
                }

                res.render('admin/users/edit', {
                    user: user,
                    roles: roles
                });
            });
        });
    };

    admin.updateUser = function (req, res, next) {
        users.findUser({_id: req.body.id}, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user || !isValidUserData) {
                return res.redirect('/admin/users/edit/' + req.body.id);
            }
            user.username = req.body.username;
            user.email = req.body.email;
            user.roles = [];
            req.body.roles = req.body.roles || [];
            if (typeof req.body.roles === 'string') {
                req.body.roles = [req.body.roles];
            }
            for (var i = 0; i < req.body.roles.length; i++) {
                var role = req.body.roles[i];
                user.roles.push(mongoose.Types.ObjectId(role));
            }
            user.save(function (err) {
                if (err) {
                    //TODO: handle error
                    return next(err);
                }
                return res.redirect('/admin/users/edit/' + req.body.id);
            });
        });
    };

    function isValidUserData(req) {
        return !!(req.body.username && req.body.email);
    }

    function isRoleActive(user, role) {
        return user.roles.map(
                function (x) {
                    return x.name;
                }
            ).indexOf(role) !== -1;
    }

    admin.routes = [
        {
            route: '/admin',
            method: 'get',
            action: 'getIndex'
        },
        {
            route: '/admin/users',
            method: 'get',
            action: 'getUsers',
            noAccessControl: true
        },
        {
            route: '/admin/users/edit/:userId',
            method: 'get',
            action: 'editUser',
            noAccessControl: true
        },
        {
            route: '/admin/users/edit',
            method: 'post',
            action: 'updateUser',
            noAccessControl: true
        }
    ];

    return admin;
})();