var User = require('../models/user')


module.exports.getUser = id => {
    return User.findById(id)
        .select('-password') // Exclude the password field
        .then(resposta => {
            return resposta;
        })
        .catch(erro => {
            throw erro;
        });
};

module.exports.atualizaUltimoAcesso = id => {
    let agora = new Date().toISOString().substring(0, 19)
    return User.updateOne({ _id: id }, { lastAccess: agora })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateUser = (id, info) => {
    return User.updateOne({ _id: id }, info)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}
module.exports.deleteUser = id => {
    return User.deleteOne({ _id: id })
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}