var User = require('../models/user')

module.exports.getUser = id => {
    return User.findById(id)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}