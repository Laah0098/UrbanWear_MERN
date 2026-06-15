const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado')

    app.use('/api/products', require('./routes/productRoutes'))
    app.use('/api/orders', require('./routes/orderRoutes'))
    app.use('/api/users', require('./routes/userRoutes'))
    app.use('/api/dashboard', require('./routes/dashboardRoutes'))
    app.use('/api/reviews', require('./routes/reviewRoutes'))

    app.get('/', (req, res) => {
      res.send('API funcionando')
    })

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err)
    process.exit(1)
  })