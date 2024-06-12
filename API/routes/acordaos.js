var express = require('express');
var router = express.Router();
const Acordao = require('../controllers/acordao');
var auth = require('../auth/auth');

router.get('/descritores', auth.verificaAcesso, async function(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const search = req.query.search || '';

  try {
    const descritores = await Acordao.getUniqueDescritoresPaginated(page, limit, search);
    res.json(descritores);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.get('/search', auth.verificaAcesso, function(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  Acordao.search(req.query, page, limit)
    .then(data => res.jsonp(data))
    .catch(erro => res.jsonp(erro));
});

router.get('/count', auth.verificaAcesso, async function(req, res, next) {
  const query = {
    Tribunal: req.query.Tribunal,
    Autor: req.query.Autor,
    Magistrado: req.query.Magistrado,
    Descritor: req.query.Descritor 
  };

  try {
    const total = await Acordao.count(query);
    res.json({ total });
  } catch (error) {
    res.status(500).jsonp(error.message);
  }
});


router.get('/:id', auth.verificaAcesso, function(req, res) {
  Acordao.findById(req.params.id)
      .then(data => res.jsonp(data))
      .catch(erro => res.jsonp(erro))
});

router.post('/', auth.verificaAdmin, function(req, res) {
  Acordao.insert(req.body)
      .then(data => res.jsonp(data))
      .catch(erro => res.jsonp(erro))
});

router.put('/:id', auth.verificaAdmin, function(req, res) {
  Acordao.update(req.params.id, req.body)
      .then(data => res.jsonp(data))
      .catch(erro => res.jsonp(erro))
});

router.delete('/:id', auth.verificaAdmin, function(req, res) {
  Acordao.removeById(req.params.id)
      .then(data => res.jsonp(data))
      .catch(erro => res.jsonp(erro))
});




module.exports = router;
