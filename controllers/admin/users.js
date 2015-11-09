module.exports = (function () {
    'use strict';
    var users = {};
    var User = require('../../models/user');
    var Role = require('../../models/role');
    var mongoose = require('mongoose');

    users.getUsers = function (req, res, next) {
        User.getUsers(function (err, users) {
            if (err) {
                return next(err);
            }
            res.render('admin/users/index', {
                users: users
            });
        });
    };

    users.editUser = function (req, res, next) {
        User.findUser({_id: req.params.userId}, function (err, user) {
            if (err) {
                return next(err);
            }
            Role.getRoles(function (err, roles) {
                if (err) {
                    return next(err);
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

    users.updateUser = function (req, res, next) {
        User.findUser({_id: req.body.id}, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user || !isValidUserData(req)) {
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

    users.getAddUser = function (req, res, next) {
        Role.getRoles(function (err, roles) {
            if (err) {
                return next(err);
            }
            res.render('admin/users/add', {
                roles: roles
            });
        });

    };

    users.postAddUser = function (req, res, next) {
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        var validation = require('../helpers/validation');
        var messages = validation.validateUser(user);
        if (messages.length > 0) {
            Role.getRoles(function (err, roles) {
                if (err) {
                    return next(err);
                }
                res.render('admin/users/add', {
                    roles: roles,
                    user: user,
                    message: messages
                });
            });
        }
        addRolesToUser(user, req.body.roles);
        user.save(function (err, user) {
            if (err) {
                //TODO: handle error
                return next(err);
            }
            return res.redirect('/admin/users/edit/' + user._id);
        });
    };

    function isRoleActive(user, role) {
        return user.roles.map(
                function (x) {
                    return x.name;
                }
            ).indexOf(role) !== -1;
    }

    function isValidUserData(req) {
        return !!(req.body.username && req.body.email && req.body.id);
    }


    function addRolesToUser(user, roles) {
        roles = roles || [];
        if (typeof roles === 'string') {
            roles = [roles];
        }
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            user.roles.push(mongoose.Types.ObjectId(role));
        }
    }

    users.routes = [
        {
            route: '/admin/users',
            method: 'get',
            action: 'getUsers'
        },
        {
            route: '/admin/users/edit/:userId',
            method: 'get',
            action: 'editUser'
        },
        {
            route: '/admin/users/edit',
            method: 'post',
            action: 'updateUser'
        },
        {
            route: '/admin/users/add',
            method: 'get',
            action: 'getAddUser'
        },
        {
            route: '/admin/users/add',
            method: 'post',
            action: 'postAddUser'
        }
    ];

    return users;
})();