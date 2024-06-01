var express = require('express');
var router = express.Router();
const Campos = require('../controllers/campo');
var auth = require('../auth/auth');

router.get('/', auth.verificaAcesso, function(req, res) {
  Campos.list()
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});

router.post('/', auth.verificaAdmin, function(req, res) {
  Campos.insert(req.body)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});


router.put('/:id', auth.verificaAdmin, function(req, res) {
  Campos.edit(req.params.id, req.body)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});


router.delete('/:id', auth.verificaAdmin, function(req, res) {
  Campos.removeById(req.params.id)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});

module.exports = router;
