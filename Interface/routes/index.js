var express = require('express');
var router = express.Router();
var axios = require('axios')
var Auth = require('../controllers/Auth')
var jwt = require('jsonwebtoken');

router.get('/',Auth.verificaAutenticacao,function(req,res,next){
  res.redirect('login');
})

router.get('/logout', function (req, res, next) {
  res.clearCookie('token')
  res.redirect('/login')
})

router.get('/login', function(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, 'EngWeb2024', function(err, decoded) {
      if (err) {
        // Token is not valid, render the login page
        var date = new Date().toISOString().substring(0, 19);
        res.render('login', { d: date });
      } else {
        // Token is valid, redirect to home
        res.redirect('/home');
      }
    });
  } else {
    // No token, render the login page
    var date = new Date().toISOString().substring(0, 19);
    res.render('login', { d: date });
  }
});

router.post('/login', function(req, res) {
  axios.post('http://localhost:7777/users/login',req.body)
  .then(response => {
    res.cookie('token',response.data.token)
    
    const decoded = jwt.decode(response.data.token);
    const userId = decoded._id;
    res.cookie('userId', userId);

    res.redirect('/home')
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



router.get('/registar/admin',Auth.verificaAdmin,function(req,res,next){
  var date = new Date().toISOString().substring(0,19);
  const canAddAcordao = req.isAdmin;
  res.render('registarAdmin',{d:date,canAddAcordao})
})

router.post('/registar/admin', async function(req, res, next) {
  const token = req.cookies.token;


  try {
    const response = await axios.post('http://localhost:7777/users/registaradmin', {
      token: token,
      username: req.body.username, 
      name: req.body.name, 
      email: req.body.email, 
      password: req.body.password 
    });
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
      res.render('registarAdmin', { warning: warning, d: date });
    } else {
      res.redirect('/');
    }
  } catch (err) {
    var date = new Date().toISOString().substring(0, 19);
    console.log(err);
    res.render('registarAdmin', { warning: "Ocorreu um erro no serviço da criação da conta.", d: date });
  }
});


router.get('/home', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const query = req.query.query || '';

  try {
    const response = await axios.get(`http://localhost:5555/acordaos/search`, {
      params: { 
        ...req.query, 
        page: page, 
        limit: limit, 
        token: token 
      }
    });

    const totalResponse = await axios.get(`http://localhost:5555/acordaos/count`, {
      params: { 
        token: token,
        query: query 
      }
    });

    const tribunaisResponse = await axios.get('http://localhost:5555/tribunais', {
      params: { token: token }
    });

    const canAddAcordao = req.isAdmin;

    res.render('acordaos', {
      acordaos: response.data,
      total: totalResponse.data.total,
      page: page,
      limit: limit,
      tribunais: tribunaisResponse.data,
      userId: req.cookies.userId,
      token: token,
      query: query,
      canAddAcordao: canAddAcordao
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});


router.get('/acordaos/adicionar', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const camposResponse = await axios.get('http://localhost:5555/campos', {
      params: { token: token }
    });
    const campos = camposResponse.data;

    // Filter campos based on Prioridade
    const camposPrioridadeTrue = campos.filter(campo => campo.Prioridade);
    const camposPrioridadeFalse = campos.filter(campo => !campo.Prioridade);

    res.render('addAcordao', { camposPrioridadeTrue, camposPrioridadeFalse });
  } catch (error) {
    console.error('Error fetching campos:', error);
    res.status(500).send('Error fetching campos');
  }
});

router.post('/acordaos/adicionar', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  let formData = req.body; // This contains the form data

  // Format the DataAcordao field to MM/DD/YYYY
  if (formData.DataAcordao) {
    const dateValue = new Date(formData.DataAcordao);
    const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
    formData.DataAcordao = formattedDate;
  }

  if(formData.Data){
    const dateValue = new Date(formData.Data);
    const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
    formData.Data = formattedDate;
  }

  try {
    const payload = {
      token: token,
      ...formData
    };


    const response = await axios.post('http://localhost:5555/acordaos', payload);
    res.redirect('/home');
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching data');
  }
});

router.get('/acordaos/remover/:id', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const delResponse = await axios.delete(`http://localhost:5555/acordaos/${req.params.id}`, {
      params: { token: token }
    });

    // Redirect to the previous page
    res.redirect('/home');
  } catch (error) {
    console.error('Error deleting data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error deleting data');
  }
});


router.get('/acordaos/editar/:id', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
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

    const acordao = acordaoResponse.data;
    const campos = camposResponse.data;

    // Convert date fields to YYYY-MM-DD format for HTML input
    if (acordao.DataAcordao) {
      const date = new Date(acordao.DataAcordao);
      acordao.DataAcordao = date.toISOString().split('T')[0];
    }
    if (acordao.Data) {
      const date = new Date(acordao.Data);
      acordao.Data = date.toISOString().split('T')[0];
    }

    const isAdmin = req.isAdmin;
    res.render('editarAcordao', {
      acordao,
      campos,
      isAdmin,
      token
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});



router.post('/acordaos/editar/:id', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  let formData = req.body; // This contains the form data

  // Handle descritores conversion back to an array
  if (formData.descritores) {
    formData.descritores = formData.descritores.split(',').map(item => item.trim());
  }

  // Format the DataAcordao field to MM/DD/YYYY
  if (formData.DataAcordao) {
    const dateValue = new Date(formData.DataAcordao);
    const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
    formData.DataAcordao = formattedDate;
  }

  if (formData.Data) {
    const dateValue = new Date(formData.Data);
    const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
    formData.Data = formattedDate;
  }

  try {
    const payload = {
      token: token,
      ...formData
    };

    const response = await axios.put(`http://localhost:5555/acordaos/${req.params.id}`, payload);
    res.redirect('/home');
  } catch (error) {
    console.error('Error updating data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error updating data');
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
    const isAdmin = req.isAdmin;
    res.render('acordao', {
      acordao,
      campos,
      favourites,
      tribunais,
      userId: userId,
      isAdmin,
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


router.post('/search', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  const { Autor, Tribunal, Magistrado } = req.body;

  const params = {};
  if (Autor && Autor.trim()) params.Autor = Autor.trim();
  if (Tribunal && Tribunal.trim()) params.Tribunal = Tribunal.trim();
  if (Magistrado && Magistrado.trim()) params.Magistrado = Magistrado.trim();

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  try {
    const response = await axios.get('http://localhost:5555/acordaos/search', {
      params: {
        ...params,
        token,
        page,
        limit
      }
    });

    const totalResponse = await axios.get('http://localhost:5555/acordaos/count', {
      params: {
        ...params,
        token
      }
    });
    const canAddAcordao = req.isAdmin;
    res.render('search', {
      results: response.data,
      page,
      limit,
      total: totalResponse.data.total,
      query: { Autor, Tribunal, Magistrado },
      canAddAcordao
    });
  } catch (error) {
    console.error('Error fetching search results:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching search results');
  }
});

router.get('/search', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  const { Autor, Tribunal, Magistrado, page, limit } = req.query;

  const params = {};
  if (Autor && Autor.trim()) params.Autor = Autor.trim();
  if (Tribunal && Tribunal.trim()) params.Tribunal = Tribunal.trim();
  if (Magistrado && Magistrado.trim()) params.Magistrado = Magistrado.trim();

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 25;

  if (!Autor && !Tribunal && !Magistrado) {
    // Render the form with empty search results when no search parameters are provided
    res.render('search', {
      results: [],
      page: pageNumber,
      limit: limitNumber,
      total: 0,
      query: {}
    });
    return;
  }

  try {
    const response = await axios.get('http://localhost:5555/acordaos/search', {
      params: {
        ...params,
        token,
        page: pageNumber,
        limit: limitNumber
      }
    });

    const totalResponse = await axios.get('http://localhost:5555/acordaos/count', {
      params: {
        ...params,
        token
      }
    });

    const canAddAcordao = req.isAdmin; 
    res.render('search', {
      results: response.data,
      page: pageNumber,
      limit: limitNumber,
      total: totalResponse.data.total,
      query: { Autor, Tribunal, Magistrado },
      canAddAcordao
    });
  } catch (error) {
    console.error('Error fetching search results:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching search results');
  }
});


router.get('/perfil', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const response = await axios.get(`http://localhost:7777/users/${userId}`, {
      params: { token: token }
    });

    const user = response.data;
    const isAdmin = req.isAdmin;
    res.render('profile', {
      user: user,
      isAdmin,
      token: token
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
});

router.post('/perfil', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  let formData = req.body; // This contains the form data

  try {
    const payload = {
      token: token,
      ...formData
    };

    const response = await axios.put(`http://localhost:7777/users/${userId}`, payload);

    res.redirect('/home');
  } catch (error) {
    console.error('Error updating user data:', error.response ? error.response.data : error.message);
    const errorMessage = error.response && error.response.data && error.response.data.error ? error.response.data.error : 'Error updating user data';
    const user = {
      dados: {
        _id: userId,
        username: formData.username,
        email: formData.email,
        name: formData.name,
        dateCreated: formData.dateCreated,
        lastAccess: formData.lastAccess
      }
    };
    res.status(500).render('profile', { user, isAdmin: req.isAdmin, error: errorMessage });
  }
});




module.exports = router;
