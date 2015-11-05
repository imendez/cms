module.exports = (function(){
    'use strict';

    var logout = {};

    logout.getIndex = function (req, res) {
        req.session.destroy();
        res.clearCookie('connect.sid', null);
        res.redirect('/');
    };

    logout.routes = [
        {
            route: '/logout',
            method: 'get',
            action: 'getIndex',
            noAccessControl: true
        }
    ];

    return logout;
})();