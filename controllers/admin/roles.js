module.exports = (function () {
    'use strict';
    var roles = {};
    var Role = require('../../models/role');
    var Resource = require('../../models/resource');
    var mongoose = require('mongoose');

    roles.getRoles = function (req, res, next) {
        Role.getRoles(function (err, roles) {
            if (err) {
                return next(err);
            }
            res.render('admin/roles/index', {
                roles: roles
            });
        });
    };

    roles.editRole = function (req, res, next) {
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


    roles.updateRole = function (req, res, next) {
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

    roles.getAddRole = function (req, res, next) {
        Resource.getResources(function (err, resources) {
            if (err) {
                return next(err);
            }
            res.render('admin/roles/add', {
                resources: resources
            });
        });
    };

    roles.postAddRole = function (req, res, next) {
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


    function isValidRoleData(req) {
        return !!(req.body.name && req.body.id);
    }

    function isResourceActive(role, resource) {
        return role.resources.map(
                function (x) {
                    return x.path;
                }
            ).indexOf(resource) !== -1;
    }

    roles.routes = [
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
        }
    ];

    return roles;
})();