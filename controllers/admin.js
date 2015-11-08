module.exports = (function () {
    'use strict';

    var admin = {};
    var User = require('../models/user');
    var Role = require('../models/role');
    var Resource = require('../models/resource');
    var mongoose = require('mongoose');

    admin.getIndex = function (req, res) {
        res.render('admin/index', {
            title: 'Express'
        });
    };

    admin.getUsers = function (req, res, next) {
        User.getUsers(function (err, users) {
            if (err) {
                return next(err);
            }
            res.render('admin/users/index', {
                users: users
            });
        });
    };

    admin.editUser = function (req, res, next) {
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

    admin.updateUser = function (req, res, next) {
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

    admin.getAddUser = function (req, res, next) {
        Role.getRoles(function (err, roles) {
            if (err) {
                return next(err);
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

    admin.getRoles = function (req, res, next) {
        Role.getRoles(function (err, roles) {
            if (err) {
                return next(err);
            }
            res.render('admin/roles/index', {
                roles: roles
            });
        });
    };

    admin.editRole = function (req, res, next) {
        Role.findById(req.params.roleId)
            .populate({path: 'resources'})
            .exec(function (err, role) {
                if (err) {
                    return next(err);
                }
                Resource.getResources(function (err, resources) {
                    if (err) {
                        return next(err);
                    }

                    for (var i = 0; i < resources.length; i++) {
                        var resource = resources[i];
                        resource.active = isResourceActive(role, resource.path);
                    }
                    res.render('admin/roles/edit', {
                        role: role,
                        resources: resources
                    });
                })
            });
    };


    admin.updateRole = function (req, res, next) {
        Role.findById(req.body.id, function (err, role) {
            if (err) {
                return next(err);
            }
            if (!role || !isValidRoleData(req)) {
                return res.redirect('/admin/roles/edit/' + req.body.id);
            }
            role.name = req.body.name;
            role.description = req.body.description;
            role.resources = [];
            addResourcesToRole(role, req.body.resources);
            role.save(function (err) {
                if (err) {
                    //TODO: handle error
                    return next(err);
                }
                return res.redirect('/admin/roles/edit/' + req.body.id);
            });
        });
    };

    admin.getAddRole = function (req, res, next) {
        Resource.getResources(function (err, resources) {
            if (err) {
                return next(err);
            }
            res.render('admin/roles/add', {
                resources: resources
            });
        });
    };

    admin.postAddRole = function (req, res, next) {
        var role = new Role();
        role.name = req.body.name;
        role.description = req.body.description;
        addResourcesToRole(role, req.body.resources);
        role.save(function (err, role) {
            if (err) {
                //TODO: handle error
                return next(err);
            }
            return res.redirect('/admin/roles/edit/' + role._id);
        });
    };

    admin.getResources = function (req, res, next) {
        Resource.getResources(function (err, resources) {
            if (err) {
                return next(err);
            }
            res.render('admin/resources/index', {
                resources: resources
            });
        });
    };

    admin.editResource = function (req, res, next) {
        Resource.findById(req.params.resourceId)
            .exec(function (err, resource) {
                if (err) {
                    return next(err);
                }
                res.render('admin/resources/edit', {
                    resource: resource
                });
            });
    };


    admin.updateResource = function (req, res, next) {
        Resource.findById(req.body.id, function (err, resource) {
            if (err) {
                return next(err);
            }
            if (!resource || !isValidResourceData(req)) {
                return res.redirect('/admin/resources/edit/' + req.body.id);
            }
            resource.path = req.body.path;
            resource.description = req.body.description;
            resource.save(function (err) {
                if (err) {
                    //TODO: handle error
                    return next(err);
                }
                return res.redirect('/admin/resources/edit/' + req.body.id);
            });
        });
    };

    admin.getAddResource = function (req, res) {
        res.render('admin/resources/add');
    };

    admin.postAddResource = function (req, res, next) {
        var resource = new Resource();
        resource.path = req.body.path;
        resource.description = req.body.description;
        resource.save(function (err, resource) {
            if (err) {
                //TODO: handle error
                return next(err);
            }
            return res.redirect('/admin/resources/edit/' + resource._id);
        });
    };

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

    function addResourcesToRole(role, resources) {
        resources = resources || [];
        if (typeof resources === 'string') {
            resources = [resources];
        }
        for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];
            role.resources.push(mongoose.Types.ObjectId(resource));
        }
    }

    function isValidUserData(req) {
        return !!(req.body.username && req.body.email && req.body.id);
    }

    function isValidRoleData(req) {
        return !!(req.body.name && req.body.id);
    }

    function isValidResourceData(req) {
        return !!(req.body.path && req.body.id);
    }


    function isRoleActive(user, role) {
        return user.roles.map(
                function (x) {
                    return x.name;
                }
            ).indexOf(role) !== -1;
    }

    function isResourceActive(role, resource) {
        return role.resources.map(
                function (x) {
                    return x.path;
                }
            ).indexOf(resource) !== -1;
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
        },
        {
            route: '/admin/roles',
            method: 'get',
            action: 'getRoles'
        },
        {
            route: '/admin/roles/edit/:roleId',
            method: 'get',
            action: 'editRole'
        },
        {
            route: '/admin/roles/edit',
            method: 'post',
            action: 'updateRole'
        },
        {
            route: '/admin/roles/add',
            method: 'get',
            action: 'getAddRole'
        },
        {
            route: '/admin/roles/add',
            method: 'post',
            action: 'postAddRole'
        },
        {
            route: '/admin/resources',
            method: 'get',
            action: 'getResources'
        },
        {
            route: '/admin/resources/edit/:resourceId',
            method: 'get',
            action: 'editResource'
        },
        {
            route: '/admin/resources/edit',
            method: 'post',
            action: 'updateResource'
        },
        {
            route: '/admin/resources/add',
            method: 'get',
            action: 'getAddResource'
        },
        {
            route: '/admin/resources/add',
            method: 'post',
            action: 'postAddResource'
        }
    ];

    return admin;
})();