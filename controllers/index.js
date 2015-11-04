module.exports = {
    getIndex: function (req, res, next) {
        res.render('index', {
            title: 'Express'
        });
    },
    routes: [
        {
            route: '/',
            method: 'get',
            action: 'getIndex'
        }
    ]
};