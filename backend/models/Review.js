const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  userName: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 300
  }
}, {
  timestamps: true
})

reviewSchema.index({
  productId: 1,
  userId: 1
}, {
  unique: true
})

module.exports = mongoose.model('Review', reviewSchema)