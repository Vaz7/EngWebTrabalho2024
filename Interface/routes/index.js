var express = require('express');
var router = express.Router();
var axios = require('axios')
var Auth = require('../controllers/Auth')

router.get('/',Auth.verificaAutenticacao,function(req,res,next){
  res.render('home',{texto: 'merda'});
})

router.get('/logout', function (req, res, next) {
  res.clearCookie('token')
  res.redirect('/login')
})

router.get('/login', function(req, res, next) {
  var date = new Date().toISOString().substring(0,19);
  res.render('login', {d:date});
});

router.post('/login', function(req, res) {
  axios.post('http://localhost:7777/users/login',req.body)
  .then(response => {
    res.cookie('token',response.data.token)
    res.redirect('/')
  })
  .catch(e=>{
    var date = new Date().toISOString().substring(0,19);
    res.render('login',{error:e,message: "Credenciais inválidas",d:date})
  })
});

router.get('/registar',function(req,res,next){
  var date = new Date().toISOString().substring(0,19);
  res.render('registar',{d:date})
})

router.post('/registar', async function(req, res, next) {
  let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password };

  try {
    const response = await axios.post('http://localhost:7777/users/registar', signupData);
    let error = response.data.error;

    if (error) { // Se a autenticação falhou.
      let warning;
      if (error.name == "UserExistsError") {
        warning = "Já existe um utilizador com este email associado.";
      } else if (error.name == "MissingUsernameError") {
        warning = "Não foi especificado um endereço de email.";
      } else {
        warning = error.message;
      }
      var date = new Date().toISOString().substring(0, 19);
      res.render('registar', { warning: warning, d: date });
    } else { // Se a autenticaçao correu bem, cola o token de auth nas cookies e direciona o user para a home.
      res.cookie('token', response.data.token);
      res.redirect('/');
    }
  } catch (err) {
    var date = new Date().toISOString().substring(0, 19);
    res.render('registar', { warning: "Ocorreu um erro no serviço da criação da conta.", d: date });
  }
});



module.exports = router;
