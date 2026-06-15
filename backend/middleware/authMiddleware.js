const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Acesso negado. Faça login.'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Token não informado.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        message: 'Usuário não encontrado.'
      })
    }

    if (user.status === 'bloqueado') {
      return res.status(403).json({
        message: 'Usuário bloqueado. Acesso negado.'
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.'
    })
  }
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Faça login para continuar.'
    })
  }

  if (req.user.status === 'bloqueado') {
    return res.status(403).json({
      message: 'Usuário bloqueado. Acesso negado.'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Acesso permitido apenas para administradores.'
    })
  }

  next()
}

module.exports = { protect, adminOnly }