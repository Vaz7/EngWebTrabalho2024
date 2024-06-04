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

module.exports.findOneByEmail = email => {
  return User.findOne({ email: email })
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

module.exports.addToFavoritos = async (userId, favorito) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        const existingFavorito = user.favoritos.find(f => f._id === favorito._id);
        if (!existingFavorito) {
          user.favoritos.push(favorito);
          await user.save();
        }
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };
  
  module.exports.removeFromFavoritos = async (userId, favoritoId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        const index = user.favoritos.findIndex(f => f._id === favoritoId);
        if (index > -1) {
          user.favoritos.splice(index, 1);
          await user.save();
        }
        return user;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  module.exports.getFavoritos = async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        return user.favoritos;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };
  module.exports.getAllUsers = () => {
    return User.find()
        .select('-password') // Exclude the password field
        .then(users => {
            return users;
        })
        .catch(error => {
            throw error;
        });
};