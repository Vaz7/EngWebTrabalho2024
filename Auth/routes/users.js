var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var jwt = require('jsonwebtoken')
var auth = require('../auth/auth')
var User = require('../controllers/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register', function (req, res) {
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
              // Manually authenticate the user after registration
              req.login(user, function(err) {
                  if (err) {
                      return res.status(500).jsonp({ error: err });
                  }
                  // Generate JWT token
                  jwt.sign({
                          _id: user._id,
                          email: user.email,
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

router.get('/:id', auth.verificaAcesso, function (req, res) {
  if(req.params.id === req.idUser){
      User.getUser(req.params.id)
          .then(dados => res.status(200).jsonp({ dados: dados }))
          .catch(e => res.status(500).jsonp({ error: e }))
  }else
      res.status(403).jsonp({error: `[AUTH] The user ${req.user.username} is not authorized to access this information.`})
})

module.exports = router;
