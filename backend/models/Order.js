const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    payment: {
      type: String,
      enum: ['Cartão', 'Pix', 'Boleto'],
      required: true
    }
  },

  items: [
    {
      productId: {
        type: String,
        required: true
      },

      name: {
        type: String,
        required: true,
        trim: true
      },

      image: {
        type: String,
        required: true
      },

      price: {
        type: Number,
        required: true,
        min: 0
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      },

      selectedSize: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],

  total: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: [
      'Pagamento aprovado',
      'Em separação',
      'Enviado',
      'Entregue',
      'Cancelado'
    ],
    default: 'Pagamento aprovado'
  },

  trackingCode: {
    type: String,
    default: null,
    trim: true
  },

  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)