const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const schema= new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  lists: [],
},
 {
  timestamps: true,
});

schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports.User = mongoose.model('User', schema);