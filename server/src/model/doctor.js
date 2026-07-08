const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  is_available: {
    type: Boolean,
    default: true
  },
  qualification: {
    type: String
  },
  fees: {
    type: Number
  },
  specialized: {
    type: String
  },
  experience: {
    type: Number
  },
  profilePhoto: {
    type: String,
    default: ""
},

}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
