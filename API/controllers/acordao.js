const Acordao = require('../models/acordao');


module.exports.findById = id => {
  return Acordao
    .findOne({ _id: id })
    .exec();
}

module.exports.search = (query, page, limit) => {
  const { Tribunal, Autor, Magistrado } = query;

  let searchQuery = {};
  if (Tribunal) {
    searchQuery.Tribunal = Tribunal;
  }
  if (Autor) {
    searchQuery.Autor = Autor;
  }
  if (Magistrado) {
    searchQuery.Magistrado = Magistrado;
  }

  const skip = (page - 1) * limit;

  return Acordao
    .find(searchQuery)
    .skip(skip)
    .limit(limit)
    .lean() // para performance do que li
    .exec();
};

module.exports.insert = acordao => {
  return Acordao.create(acordao);
}

module.exports.update = (id, comp) => {
  return Acordao.updateOne({_id : id}, comp)
}

module.exports.removeById = id => {
  return Acordao.findByIdAndDelete({ _id: id });
}

module.exports.count = (query = {}) => {
  const { Tribunal, Autor, Magistrado } = query;

  let searchQuery = {};
  if (Tribunal) {
    searchQuery.Tribunal = Tribunal;
  }
  if (Autor) {
    searchQuery.Autor = Autor;
  }
  if (Magistrado) {
    searchQuery.Magistrado = Magistrado;
  }

  return Acordao.countDocuments(searchQuery).exec();
};