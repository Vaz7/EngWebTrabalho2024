var express = require('express');
var router = express.Router();
var axios = require('axios')
var Auth = require('../controllers/Auth')
var jwt = require('jsonwebtoken');
var multer = require('multer');
var fs = require('fs');

// Set up multer for file uploads
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ dest: 'uploads/' });


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
  axios.post('http://acordaosauth:7777/users/login',req.body)
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
    const response = await axios.post('http://acordaosauth:7777/users/registar', signupData);
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
    const response = await axios.post('http://acordaosauth:7777/users/registaradmin', {
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
    const response = await axios.get(`http://acordaosapi:5555/acordaos/search`, {
      params: { 
        ...req.query, 
        page: page, 
        limit: limit, 
        token: token 
      }
    });

    const totalResponse = await axios.get(`http://acordaosapi:5555/acordaos/count`, {
      params: { 
        token: token,
        query: query 
      }
    });

    const tribunaisResponse = await axios.get('http://acordaosapi:5555/tribunais', {
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
    const camposResponse = await axios.get('http://acordaosapi:5555/campos', {
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

  // Handle descritores conversion to array
  if (formData.Descritores) {
    formData.Descritores = formData.Descritores.split(',').map(item => item.trim());
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

    const response = await axios.post('http://acordaosapi:5555/acordaos', payload);
    res.redirect('/home');
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching data');
  }
});

router.post('/acordaos/adicionar/from-file', Auth.verificaAdmin, upload.single('acordaoFile'), async function (req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  const filePath = req.file.path;

  try {
    const camposResponse = await axios.get('http://acordaosapi:5555/campos', {
      params: { token: token }
    });

    const campos = camposResponse.data;
    const mandatoryFields = campos.filter(campo => campo.Prioridade).map(campo => campo.NomeFixed);

    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Ensure all mandatory fields are present
    for (const field of mandatoryFields) {
      if (!fileData[field]) {
        return res.status(400).json({ error: `Missing mandatory field: ${field}` });
      }
    }

    // Format the DataAcordao field to MM/DD/YYYY if it exists
    if (fileData.DataAcordao) {
      const dateValue = new Date(fileData.DataAcordao);
      const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
      fileData.DataAcordao = formattedDate;
    }

    // Format the Data field to MM/DD/YYYY if it exists
    if (fileData.Data) {
      const dateValue = new Date(fileData.Data);
      const formattedDate = `${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getDate().toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
      fileData.Data = formattedDate;
    }

    const payload = {
      token: token,
      ...fileData
    };

    const response = await axios.post('http://acordaosapi:5555/acordaos', payload);
    res.redirect('/home');
  } catch (error) {
    console.error('Error processing file data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error processing file data');
  }
});


router.get('/acordaos/remover/:id', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const delResponse = await axios.delete(`http://acordaosapi:5555/acordaos/${req.params.id}`, {
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
    const acordaoResponse = await axios.get(`http://acordaosapi:5555/acordaos/${req.params.id}`, {
      params: { token: token }
    });

    const camposResponse = await axios.get('http://acordaosapi:5555/campos', {
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

    const response = await axios.put(`http://acordaosapi:5555/acordaos/${req.params.id}`, payload);
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
    const acordaoResponse = await axios.get(`http://acordaosapi:5555/acordaos/${req.params.id}`, {
      params: { token: token }
    });

    const camposResponse = await axios.get('http://acordaosapi:5555/campos', {
      params: { token: token }
    });

    const favouritesResponse = await axios.get(`http://acordaosauth:7777/users/${userId}/favoritos`, {
      params: { token: token }
    });

    const tribunaisResponse = await axios.get('http://acordaosapi:5555/tribunais', {
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


router.get('/acordaos/download/:id', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const acordaoResponse = await axios.get(`http://acordaosapi:5555/acordaos/${req.params.id}`, {
      params: { token: token },
      headers: { 'Cache-Control': 'no-cache' }
    });

    const acordao = acordaoResponse.data;

    res.json(acordao);
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
    const response = await axios.post(`http://acordaosauth:7777/users/${req.params.id}/favoritos`, {
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
    const response = await axios.delete(`http://acordaosauth:7777/users/${req.params.id}/favoritos/${req.params.acordaoId}`, {
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

  const { Autor, Tribunal, Magistrado,Descritor } = req.body;

  const params = {};
  if (Autor && Autor.trim()) params.Autor = Autor.trim();
  if (Tribunal && Tribunal.trim()) params.Tribunal = Tribunal.trim();
  if (Magistrado && Magistrado.trim()) params.Magistrado = Magistrado.trim();
  if (Descritor && Descritor.trim()) params.Descritor = Descritor.trim();

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  try {
    const response = await axios.get('http://acordaosapi:5555/acordaos/search', {
      params: {
        ...params,
        token,
        page,
        limit
      }
    });

    const totalResponse = await axios.get('http://acordaosapi:5555/acordaos/count', {
      params: {
        ...params,
        token
      }
    });
    const isAdmin = req.isAdmin;
    res.render('search', {
      results: response.data,
      page,
      limit,
      isAdmin,
      total: totalResponse.data.total,
      query: { Autor, Tribunal, Magistrado,Descritor}
      
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

  const { Autor, Tribunal, Magistrado, Descritor, page, limit } = req.query;

  const params = {};
  if (Autor && Autor.trim()) params.Autor = Autor.trim();
  if (Tribunal && Tribunal.trim()) params.Tribunal = Tribunal.trim();
  if (Magistrado && Magistrado.trim()) params.Magistrado = Magistrado.trim();
  if (Descritor && Descritor.trim()) params.Descritor = Descritor.trim();

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 25;
  const isAdmin = req.isAdmin;
  if (!Autor && !Tribunal && !Magistrado && !Descritor) {
    // Fetch tribunais to populate the dropdown
    try {
      const tribunaisResponse = await axios.get('http://acordaosapi:5555/tribunais', {
        params: { token: token }
      });
      const tribunais = tribunaisResponse.data;

      // Render the form with empty search results when no search parameters are provided
      res.render('search', {
        results: [],
        page: pageNumber,
        isAdmin,
        limit: limitNumber,
        total: 0,
        query: {},
        tribunais: tribunais
      });
      return;
    } catch (error) {
      console.error('Error fetching tribunais:', error.response ? error.response.data : error.message);
      res.status(500).send('Error fetching tribunais');
      return;
    }
  }

  try {
    const response = await axios.get('http://acordaosapi:5555/acordaos/search', {
      params: {
        ...params,
        token,
        page: pageNumber,
        limit: limitNumber
      }
    });

    const totalResponse = await axios.get('http://acordaosapi:5555/acordaos/count', {
      params: {
        ...params,
        token
      }
    });

    const tribunaisResponse = await axios.get('http://acordaosapi:5555/tribunais', {
      params: { token: token }
    });
    const tribunais = tribunaisResponse.data;

    const canAddAcordao = req.isAdmin; 
    res.render('search', {
      results: response.data,
      page: pageNumber,
      limit: limitNumber,
      total: totalResponse.data.total,
      query: { Autor, Tribunal, Magistrado, Descritor },
      canAddAcordao,
      tribunais
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
    const response = await axios.get(`http://acordaosauth:7777/users/${userId}`, {
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

    const response = await axios.put(`http://acordaosauth:7777/users/${userId}`, payload);

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

router.get('/perfil/delete', Auth.verificaAutenticacao, async function(req, res, next) {
  const token = req.cookies.token;
  const userId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const response = await axios.delete(`http://acordaosauth:7777/users/${userId}`, {
      params: { token: token }
    });

    res.clearCookie('token');
    res.clearCookie('userId');
    res.redirect('/login');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});


router.get('/users', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  
  try {
    const response = await axios.get('http://acordaosauth:7777/users', {
      params: { token: token }
    });

    const users = response.data;

    res.render('users', { users: users });
  } catch (error) {
    console.error('Error fetching users:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching users');
  }
});

router.get('/users/remover/:id', Auth.verificaAdmin, async function(req, res, next) {
  const token = req.cookies.token;
  const userIdToDelete = req.params.id;
  const loggedInUserId = req.cookies.userId;

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const response = await axios.delete(`http://acordaosauth:7777/users/${userIdToDelete}`, {
      params: { token: token }
    });

    if (userIdToDelete === loggedInUserId) {
      res.clearCookie('token');
      res.clearCookie('userId');
      res.redirect('/login');
    } else {
      res.redirect('/users');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});

router.get('/taxonomia', Auth.verificaAutenticacao, async function(req, res, next) {
  const isAdmin = req.isAdmin;
  const token = req.cookies.token;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const searchQuery = req.query.search || '';

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Authentication token is missing.');
  }

  try {
    const response = await axios.get('http://acordaosapi:5555/acordaos/descritores', {
      params: { 
        token: token,
        page: page,
        limit: limit,
        search: searchQuery // Pass the search query to the backend
      }
    });

    const { results, total } = response.data;

    res.render('taxonomia', { 
      isAdmin, 
      descritores: results,
      total: total,
      page: page,
      limit: limit,
      searchQuery: searchQuery // Pass the search query to the template
    });
  } catch (error) {
    console.error('Error fetching descritores:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching descritores');
  }
});


router.get('/login/google', function(req, res) {
  const returnUrl = `${req.protocol}://${req.get('host')}/login/google/callback`;
  const authUrl = `http://localhost:7777/users/login/google?returnUrl=${encodeURIComponent(returnUrl)}`;

  res.redirect(authUrl);
});


router.get('/login/google/callback', function(req, res) {
  axios.get('http://acordaosauth:7777/users/login/google/callback', {
    params: req.query
  })
  .then(response => {
    const token = response.data.token;
    res.cookie('token', token);

    const decoded = jwt.decode(token);
    const userId = decoded._id;
    res.cookie('userId', userId);

    res.redirect('/home');
  })
  .catch(error => {
    console.error(error);
    res.status(500).send({ error: 'Google login callback failed' });
  });
});

router.get('/login/facebook', function(req, res) {
  const returnUrl = `${req.protocol}://${req.get('host')}/login/facebook/callback`;
  const authUrl = `http://localhost:7777/users/login/facebook?returnUrl=${encodeURIComponent(returnUrl)}`;

  res.redirect(authUrl);
});


router.get('/login/facebook/callback', function(req, res) {
  axios.get('http://acordaosauth:7777/users/login/facebook/callback', {
    params: req.query
  })
  .then(response => {
    const token = response.data.token;
    res.cookie('token', token);

    const decoded = jwt.decode(token);
    const userId = decoded._id;
    res.cookie('userId', userId);

    res.redirect('/home');
  })
  .catch(error => {
    console.error(error);
    res.status(500).send({ error: 'Facebook login callback failed' });
  });
});


router.get('/favoritos', Auth.verificaAutenticacao, async function(req, res) {
  const userId = req.cookies.userId;
  const token = req.cookies.token;

  try {
    const favouritesResponse = await axios.get(`http://acordaosauth:7777/users/${userId}/favoritos`, {
      params: { token: token }
    });
    const favoritos = favouritesResponse.data;

    const acordaoDetails = await Promise.all(
      favoritos.map(favorito => axios.get(`http://acordaosapi:5555/acordaos/${favorito._id}`, {
        params: { token: token }
      }))
    );

    const detailedFavoritos = acordaoDetails.map(response => response.data);

    const combinedFavoritos = favoritos.map(favorito => {
      const details = detailedFavoritos.find(detail => detail._id === favorito._id);
      return { ...favorito, ...details };
    }).filter(favorito => favorito._id); 

    const canAddAcordao = req.isAdmin;

    res.render('favoritos', { favoritos: combinedFavoritos, canAddAcordao: canAddAcordao, activePage: 'favoritos', userId: userId});
  } catch (error) {
    console.error('Failed to fetch favoritos:', error);
    res.status(500).send({ error: 'Failed to fetch favoritos' });
  }
});

router.get('/tribunais', Auth.verificaAutenticacao, async function(req, res) {
  const token = req.cookies.token;

  try {
    const response = await axios.get('http://acordaosapi:5555/tribunais', {
      params: { token: token }
    });

    const tribunais = response.data;
    const canAddAcordao = req.isAdmin;

    res.render('tribunais', { tribunais: tribunais, canAddAcordao: canAddAcordao, activePage: 'tribunais' });
  } catch (error) {
    console.error('Failed to fetch tribunais:', error);
    res.status(500).send({ error: 'Failed to fetch tribunais' });
  }
});

router.get('/tribunais/adicionar', Auth.verificaAdmin, function(req, res) {
  const date = new Date().toISOString().substring(0, 19);
  res.render('adicionarTribunal', { d: date });
});

router.post('/tribunais/adicionar', Auth.verificaAdmin, async function(req, res) {
  const token = req.cookies.token;
  const tribunalData = {
    _id: req.body.id,
    name: req.body.name
  };

  try {
    await axios.post('http://acordaosapi:5555/tribunais', tribunalData, {
      params: { token: token }
    });
    res.redirect('/tribunais');
  } catch (error) {
    console.error('Failed to add tribunal:', error);
    const date = new Date().toISOString().substring(0, 19);
    res.render('adicionarTribunal', { warning: "Erro ao adicionar o tribunal.", d: date });
  }
});

router.get('/tribunais/remover/:id', Auth.verificaAdmin, async function(req, res) {
  const token = req.cookies.token;
  const tribunalId = req.params.id;

  try {
    await axios.delete(`http://acordaosapi:5555/tribunais/${tribunalId}`, {
      params: { token: token }
    });
    res.redirect('/tribunais');
  } catch (error) {
    console.error('Failed to remove tribunal:', error);
    res.status(500).send({ error: 'Failed to remove tribunal' });
  }
});


module.exports = router;
