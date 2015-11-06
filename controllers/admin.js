module.exports = (function () {
    'use strict';

    var admin = {};
    var User = require('../models/user');

    admin.getIndex = function (req, res) {
        res.render('admin/index', {
            title: 'Express'
        });
    };

    admin.getUsers = function (req, res, next) {
        User.getUsers(function (err, users) {
            if (err) {
                next(err);
            }
            res.render('admin/users/index', {
                users: users
            });
        });
    };

    admin.editUser = function (req, res, next) {
        User.findUser({_id: req.params.userId}, function (err, user) {
            if (err) {
                next(err);
            }
            var roles = require('../models/role');
            roles.getRoles(function (err, roles) {
                if (err) {
                    next(err);
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
        User.findUser({_id: req.body.id}, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user || !isValidUserData) {
                return res.redirect('/admin/user/edit/' + req.body.id);
            }
            user.username = req.body.username;
            user.email = req.body.email;
            user.roles = [];
            addRolesToUser(user, req.body.roles);
            user.save(function (err) {
                if (err) {
                    //TODO: handle error
                    return next(err);
                }
                return res.redirect('/admin/users/edit/' + req.body.id);
            });
        });
    };

    admin.getAddUser = function (req, res, next) {
        var roles = require('../models/role');
        roles.getRoles(function (err, roles) {
            if (err) {
                next(err);
            }
            res.render('admin/users/add', {
                roles: roles
            });
        });

    };

    admin.postAddUser = function (req, res, next) {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        addRolesToUser(user, req.body.roles);
        user.save(function (err, user) {
            if (err) {
                //TODO: handle error
                return next(err);
            }
            return res.redirect('/admin/users/edit/' + user._id);
        });
    };

    function addRolesToUser(user, roles) {
        var mongoose = require('mongoose');
        roles = roles || [];
        if (typeof roles === 'string') {
            roles = [roles];
        }
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            user.roles.push(mongoose.Types.ObjectId(role));
        }
    }

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
        },
        {
            route: '/admin/users/add',
            method: 'get',
            action: 'getAddUser',
            noAccessControl: true
        },
        {
            route: '/admin/users/add',
            method: 'post',
            action: 'postAddUser',
            noAccessControl: true
        }
    ];

    return admin;
})();