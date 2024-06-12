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

module.exports.getUniqueDescritoresPaginated = async (page, limit, search = '') => {
  const descritores = await Acordao.distinct('Descritores');

  // Normalize and lowercase search term
  const normalizedSearch = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Normalize descriptors by removing punctuation and trimming spaces for deduplication
  const normalizedDescritores = descritores.map(descritor => 
    descritor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim().toLowerCase()
  );

  // Create a map to keep track of the original descriptors using normalized ones as keys
  const uniqueDescritoresMap = new Map();
  descritores.forEach(descritor => {
    const normalized = descritor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!uniqueDescritoresMap.has(normalized)) {
      uniqueDescritoresMap.set(normalized, descritor);
    }
  });

  // Extract the unique descriptors maintaining their original formatting
  const uniqueDescritores = Array.from(uniqueDescritoresMap.values());

  // Filter descriptors based on the normalized search query
  const filteredDescritores = uniqueDescritores.filter(descritor => 
    descritor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedSearch)
  );

  // Paginate the results
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedDescritores = filteredDescritores.slice(startIndex, endIndex);

  return {
    total: filteredDescritores.length,
    page: page,
    limit: limit,
    results: paginatedDescritores
  };
};

