const Tribunal = require('../models/tribunal');



module.exports.list = async (page = 1, limit = 25) => {
    const skip = (page - 1) * limit;
    return await Tribunal.find().skip(skip).limit(limit).exec();
  }
  
module.exports.insert = tribunal => {
  return Tribunal.create(tribunal);
}

module.exports.edit = (id, comp) => {
  return Tribunal.updateOne({_id : id}, comp)
}

module.exports.removeById = id => {
  return Tribunal.findByIdAndDelete({ _id: id });
}