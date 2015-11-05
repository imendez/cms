module.exports = {
    getIndex: function (req, res) {
        req.session.destroy();
        res.clearCookie('connect.sid', null);
        res.redirect('/');
    },
    routes: [
        {
            route: '/logout',
            method: 'get',
            action: 'getIndex',
            noAccessControl: true
        }
    ]
};