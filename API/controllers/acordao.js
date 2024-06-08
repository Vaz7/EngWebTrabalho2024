const Acordao = require('../models/acordao');

module.exports.findById = id => {
  return Acordao.findOne({ _id: id }).exec();
}

module.exports.search = (query, page, limit) => {
  const { Tribunal, Autor, Magistrado, Descritor } = query;

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
  if (Descritor) {
    searchQuery.Descritores = { $elemMatch: { $regex: new RegExp(Descritor, 'i') } }; // Handle array field
  }

  const skip = (page - 1) * limit;

  return Acordao
    .find(searchQuery)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

module.exports.insert = acordao => {
  return Acordao.create(acordao);
}

module.exports.update = (id, comp) => {
  return Acordao.updateOne({ _id: id }, comp);
}

module.exports.removeById = id => {
  return Acordao.findByIdAndDelete({ _id: id });
}

module.exports.count = (query = {}) => {
  const { Tribunal, Autor, Magistrado, Descritor } = query;

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
  if (Descritor) {
    searchQuery.Descritores = { $elemMatch: { $regex: new RegExp(Descritor, 'i') } }; // Handle array field
  }

  return Acordao.countDocuments(searchQuery).exec();
};

module.exports.getUniqueDescritores = async () => {
  const descritores = await Acordao.distinct('Descritores');
  return descritores;
};
