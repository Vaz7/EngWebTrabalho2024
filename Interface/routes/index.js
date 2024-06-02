var express = require('express');
var router = express.Router();
var axios = require('axios')
var Auth = require('../controllers/Auth')
var jwt = require('jsonwebtoken');

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
    
    const decoded = jwt.decode(response.data.token);
    const userId = decoded._id;
    res.cookie('userId', userId);

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



router.get('/acordaos/:id', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const acordaoResponse = await axios.get(`http://localhost:5555/acordaos/${req.params.id}`, {
      params: { token: token }
    });

    const camposResponse = await axios.get('http://localhost:5555/campos', {
      params: { token: token }
    });

    const favouritesResponse = await axios.get(`http://localhost:7777/users/${userId}/favoritos`, {
      params: { token: token }
    });

    const tribunaisResponse = await axios.get('http://localhost:5555/tribunais', {
      params: { token: token }
    });

    const acordao = acordaoResponse.data;
    const campos = camposResponse.data;
    const favourites = favouritesResponse.data;
    const tribunais = tribunaisResponse.data;

    res.render('acordao', {
      acordao,
      campos,
      favourites,
      tribunais,
      userId: userId,
      token
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

router.post('/users/:id/favoritos', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  const favorito = req.body.favorito;
  const comment = req.body.comment;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const response = await axios.post(`http://localhost:7777/users/${req.params.id}/favoritos`, {
      token: token,
      _id: favorito,
      comment: comment
    });
    //res.status(200).send(response.data);
    res.redirect('back');
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching data');
  }
});

router.post('/users/:id/favoritos/:acordaoId/delete', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }
  try {
    const response = await axios.delete(`http://localhost:7777/users/${req.params.id}/favoritos/${req.params.acordaoId}`, {
      params: { token: token }
    });
    res.redirect('back');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }

})




module.exports = router;
