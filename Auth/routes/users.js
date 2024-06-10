var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var jwt = require('jsonwebtoken')
var auth = require('../auth/auth')
var User = require('../controllers/user')
var passport = require('passport')

router.get('/', auth.verificaAdmin, async function(req, res) {
  try {
      const users = await User.getAllUsers();
      res.status(200).jsonp(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).jsonp({ error: 'Error fetching users' });
  }
});

module.exports = router;



router.post('/registar', function (req, res) {
  var d = new Date().toISOString();
  userModel.register(new userModel({
          username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          level: "normal",
          dateCreated: d.substring(0, 10),
          lastAccess: d.substring(0, 19)
      }),
      req.body.password,
      function (err, user) {
          if (err) {
              res.jsonp({ error: err });
          } else {
              req.login(user, function(err) {
                  if (err) {
                      return res.status(500).jsonp({ error: err });
                  }
                  // Generate JWT token
                  jwt.sign({
                          _id: user._id,
                          email: user.email,
                          username: user.username,
                          level: user.level
                      },
                      "EngWeb2024",
                      { expiresIn: 3600 },
                      function (e, token) {
                          if (e) {
                              res.status(500).jsonp({ error: "Erro na geração do token: " + e });
                          } else {
                              res.status(201).jsonp({ token: token });
                          }
                      }
                  );
              });
          }
      }
  );
});

router.get("/login/facebook", function (req, res) {
    const returnUrl = req.query.returnUrl;
    req.session.returnUrl = returnUrl;

    passport.authenticate("facebook")(req, res);
});


router.get("/login/facebook/callback", function (req, res, next) {
    passport.authenticate("facebook", function (err, user, info, status) {
      if (err) {
        return res.status(500).jsonp({ error: "Erro na autenticação: " + err });
      }
      if (!user) {
        return res.status(401).jsonp({ error: "Autenticação falhou. Usuário não encontrado." });
      }
  
      // Log the user object to verify its structure
      console.log('Authenticated user:', user);
  
      jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          level: user.level
        },
        "EngWeb2024",
        { expiresIn: 3600 },
        function (erro, token) {
          if (erro) {
            return res.status(500).jsonp({ error: "Erro na geração do token: " + erro });
          }
  
          User.atualizaUltimoAcesso(user._id)
            .then(() => {
              res.status(201).jsonp({ token: token });
            })
            .catch(error => {
              res.status(500).jsonp({ error: "Erro ao atualizar o último acesso: " + error });
            });
        }
      );
    })(req, res, next);
  });

  router.get('/login/google', function(req, res) {
    const returnUrl = req.query.returnUrl;
    req.session.returnUrl = returnUrl;
  
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
  });
  
  router.get('/login/google/callback', function(req, res, next) {
    passport.authenticate('google', function(err, user, info, status) {
      if (err) {
        return res.status(500).jsonp({ error: 'Erro na autenticação: ' + err });
      }
      if (!user) {
        return res.status(401).jsonp({ error: 'Autenticação falhou. Usuário não encontrado.' });
      }
  
      jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          level: user.level
        },
        'EngWeb2024',
        { expiresIn: 3600 },
        function(erro, token) {
          if (erro) {
            return res.status(500).jsonp({ error: 'Erro na geração do token: ' + erro });
          }
  
          User.atualizaUltimoAcesso(user._id)
            .then(() => {
              res.status(201).jsonp({ token: token });
            })
            .catch(error => {
              res.status(500).jsonp({ error: 'Erro ao atualizar o último acesso: ' + error });
            });
        }
      );
    })(req, res, next);
  });

  router.get('/:id/favoritos', auth.verificaAcesso, async function(req, res) {
    const userId = req.params.id;
    console.log("123123")
    
    try {
      const favoritos = await User.getFavoritos(userId);
      console.log(favoritos)
      res.jsonp(favoritos);
    } catch (erro) {
      res.status(500).jsonp(erro.message);
    }
  });

router.get('/:id', auth.verificaAcesso, function (req, res) {
  if(req.params.id === req.idUtilizador){
      User.getUser(req.params.id)
          .then(dados => res.status(200).jsonp({ dados: dados }))
          .catch(e => res.status(500).jsonp({ error: e }))
  }else
      res.status(403).jsonp({error: `O utilizador ${req.user.username} não têm autorização para ver este perfil.`})
})





router.post('/login', passport.authenticate('local'), function (req, res) {
    jwt.sign({
            _id: req.user._id, username: req.user.username, email: req.user.email, level: req.user.level
        },
        "EngWeb2024",
        { expiresIn: 3600 }, // 1 hora
        function (erro, token) {
            if (erro) res.status(500).jsonp({ error: "Erro na geração do token: " + e })
            else {
                User.atualizaUltimoAcesso(req.user._id)
                res.status(201).jsonp({ token: token })
            }
        }
    );
})


router.put('/:id', auth.verificaAcesso, async function (req, res) {
  if (req.idUtilizador === req.params.id) {
      try {
          const updateData = { ...req.body };
          const user = await User.getUser(req.params.id);
          if (!user) {
              return res.status(404).jsonp({ error: "User not found" });
          }

          // Check if email is being updated and if it already exists
          if (updateData.email && updateData.email !== user.email) {
              const existingUser = await User.findOneByEmail(updateData.email);
              if (existingUser) {
                  return res.status(409).jsonp({ error: "Email already in use!" });
              }
          }

          // Check if password is being updated
          if (updateData.password) {
              await user.setPassword(updateData.password);
              delete updateData.password; // Remove password from updateData to prevent plain text password saving
              await user.save(); // Save the user to persist the new password hash
          }

          // Update other fields
          for (let key in updateData) {
              if (updateData.hasOwnProperty(key)) {
                  user[key] = updateData[key];
              }
          }

          const updatedUser = await user.save(); // Save the user to persist other updates

          // Prepare response with only the desired fields
          const responseUser = {
              username: updatedUser.username,
              email: updatedUser.email,
              name: updatedUser.name,
              dateCreated: updatedUser.dateCreated,
              lastAccess: updatedUser.lastAccess
          };

          res.jsonp(responseUser);
      } catch (error) {
          console.error("Error updating user:", error);
          res.status(409).jsonp({ error: error.message });
      }
  } else {
      res.status(403).jsonp({ error: `O user ${req.user.username} não têm permissões para alterar os dados do perfil.` });
  }
});




router.delete('/:id', auth.verificaAcesso, function (req, res) {
    if (req.params.id === req.idUtilizador || req.isAdministrador) {
        User.deleteUser(req.params.id)
            .then(dados => {
                res.jsonp(dados);
            })
            .catch(erro => {
                res.status(500).jsonp({ error: erro });
            });
    } else {
        res.status(403).jsonp({ error: 'Apenas administradores ou o próprio utilizador podem eliminar este perfil.' });
    }
});

//apenas um admin pode criar admins
router.post('/registaradmin', auth.verificaAdmin,  function (req, res) {
    var d = new Date().toISOString()
    userModel.register(new userModel({
            username: req.body.username, name: req.body.name, email: req.body.email,
            level: "admin", dateCreated: d.substring(0, 10), lastAccess: d.substring(0, 19)
        }),
        req.body.password,
        function (err, user) {
            if (err)
                res.jsonp({ error: err})
            else {
                res.sendStatus(200)
            }
        }
    )
})


router.post('/:id/favoritos', auth.verificaAcesso, async function(req, res) {
  const userId = req.params.id;
  const favorito = req.body

  try {
    const user = await User.addToFavoritos(userId, favorito);
    res.jsonp(user);
  } catch (erro) {
    res.status(500).jsonp(erro.message);
  }
});


router.delete('/:id/favoritos/:favoritoId', auth.verificaAcesso, async function(req, res) {
  const userId = req.params.id;
  const favoritoId = req.params.favoritoId;

  try {
    const user = await User.removeFromFavoritos(userId, favoritoId);
    res.jsonp(user);
  } catch (erro) {
    res.status(500).jsonp(erro.message);
  }
});





module.exports = router;
