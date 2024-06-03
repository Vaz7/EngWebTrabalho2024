const jwt = require('jsonwebtoken');

module.exports.verificaAutenticacao = (req, res, next) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "EngWeb2024", function (erro, payload) {
            if (erro) {
                res.redirect('/login');
            } else {
                req.idUser = payload._id;
                req.isAdmin = (payload.level === 'admin');
                next();
            }
        });
    } else {
        if (!req.session) {
            console.error('Session is not initialized');
            return next(new Error('Session middleware not properly configured'));
        }
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login');
    }
};

module.exports.verificaAdmin = (req, res, next) => {
    let token = req.cookies.token;

    if (token) {
        jwt.verify(token, "EngWeb2024", function (e, payload) {
            if (e) {
                res.redirect('/login');
            } else {
                req.idUser = payload._id;
                req.isAdmin = (payload.level === 'admin');
                if (req.isAdmin) {
                    next();
                } else {
                    res.redirect('/login');
                }
            }
        });
    } else {
        if (!req.session) {
            console.error('Session is not initialized');
            return next(new Error('Session middleware not properly configured'));
        }
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login');
    }
};
