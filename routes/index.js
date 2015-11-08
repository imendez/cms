module.exports = (function(){
    'use strict';

    var express = require('express');
    var router = express.Router();
    var dir = require('node-dir');
    var auth = require('../helpers/auth');

    dir.files('controllers/', parseControllers);

    function parseControllers(err, controllers) {
        if (err) {
            throw err;
        }
        for (var i = 0; i < controllers.length; i++) {
            try {
                var controller = require('../' + controllers[i]);
                createRoutes(controller);
            } catch (err) {
                console.error(err);
            }
        }
    }

    function createRoutes(controller) {
        controller.routes = controller.routes || [];
        for (var i = 0; i < controller.routes.length; i++) {
            var route = controller.routes[i];
            if (route.noAccessControl) {
                router[route.method](route.route, controller[route.action]);
            } else {
                router[route.method](route.route, auth.accessControl, controller[route.action]);
            }
        }
    }

    return router;
})();
