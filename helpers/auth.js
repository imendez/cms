module.exports = new function () {
    this.isAuthenticated = function (req) {
        return !!req.session.user;
    };

    this.requiresLogin = function (req, res, next) {
        if (this.isAuthenticated()) {
            return next();
        }
        return res.redirect('/login?redir=' + req.url);
    };

    this.isAuthorized = function (req, res, next) {
        console.dir(req.route);
        next();
    };
};
