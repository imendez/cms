module.exports = (function () {
    'use strict';

    var resources = {};
    var Resource = require('../../models/resource');
    var mongoose = require('mongoose');

    resources.getResources = function (req, res, next) {
        Resource.getResources(function (err, resources) {
            if (err) {
                return next(err);
            }
            res.render('admin/resources/index', {
                resources: resources
            });
        });
    };

    resources.editResource = function (req, res, next) {
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


    resources.updateResource = function (req, res, next) {
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

    resources.getAddResource = function (req, res) {
        res.render('admin/resources/add');
    };

    resources.postAddResource = function (req, res, next) {
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

    function isValidResourceData(req) {
        return !!(req.body.path && req.body.id);
    }

    resources.routes = [
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

    return resources;
})();