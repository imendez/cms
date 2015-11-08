module.exports = (function () {
    'use strict';
    return {
        getIndex: function (req, res) {
            res.render('admin/index', {
                title: 'Express'
            });
        },
        routes: [
            {
                route: '/admin',
                method: 'get',
                action: 'getIndex'
            }
        ]
    }
})();