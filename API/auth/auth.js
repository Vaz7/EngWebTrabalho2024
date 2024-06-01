var jwt = require('jsonwebtoken')

module.exports.verificaAcesso = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "EngWeb2024", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				req.idUtilizador = payload._id
				req.isAdministrador = payload.level === 'admin'
                req.user = payload; // Attach the payload (user information) to req.user

				next()
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}

module.exports.verificaAdmin = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "EngWeb2024", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.level === 'admin'){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas administradores têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}