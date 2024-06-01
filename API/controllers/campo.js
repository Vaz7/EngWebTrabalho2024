const Campo = require('../models/campo');



module.exports.list = async () => {
  return await Campo
    .find()
    .sort({_id: 1})
    .exec();
}
  
module.exports.insert = campo => {
  return Campo.create(campo);
}

module.exports.edit = (id, comp) => {
  return Campo.updateOne({_id : id}, comp)
}

module.exports.removeById = id => {
  return Campo.findByIdAndDelete({ _id: id });
}