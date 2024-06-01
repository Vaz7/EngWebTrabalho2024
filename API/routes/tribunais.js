var express = require('express');
var router = express.Router();
const Tribunal = require('../controllers/tribunal');
var auth = require('../auth/auth');

router.get('/', auth.verificaAcesso, function(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  Tribunal.list(page, limit)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});


router.post('/', auth.verificaAdmin, function(req, res) {
  Tribunal.insert(req.body)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});


router.put('/:id', auth.verificaAdmin, function(req, res) {
  Tribunal.edit(req.params.id, req.body)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});


router.delete('/:id', auth.verificaAdmin, function(req, res) {
  Tribunal.removeById(req.params.id)
    .then(data => res.jsonp(data))
    .catch(erro => res.status(500).jsonp(erro));
});

module.exports = router;
