var express = require('express');
var router = express.Router();
var fs = require('fs');
var auth = require('../helpers/auth');

fs.readdir('controllers/', parseControllers);

function parseControllers(err, controllers) {
    if (err) throw err;
    for (var i = 0; i < controllers.length; i++) {
        try {
            var controller = require('../controllers/' + controllers[i]);
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
        router[route.method](route.route, auth.isAuthorized, controller[route.action]);
    }
}

module.exports = router;
