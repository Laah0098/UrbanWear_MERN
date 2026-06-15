const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  sizes: {
    type: [String],
    default: ['P', 'M', 'G']
  },
  stock: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)