module.exports = (function () {
    'use strict';

    var admin = {};

    admin.getIndex = function(req, res) {
        res.render('admin', {
            title: 'Express'
        });
    };

    admin.routes = [
        {
            route: '/admin',
            method: 'get',
            action: 'getIndex'
        }
    ];

    return admin;
})();