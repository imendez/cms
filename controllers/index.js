module.exports = (function() {
    'use strict';

    var index = {};

    index.getIndex = function (req, res) {
        res.render('index', {
            title: 'Express'
        });
    };

    index.routes = [
        {
            route: '/',
            method: 'get',
            action: 'getIndex',
            noAccessControl: true
        }
    ];

    return index;
})();