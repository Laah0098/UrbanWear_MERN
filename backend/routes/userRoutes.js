const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return password.length >= 6 && hasLetter && hasNumber
}

function formatFullName(name) {
  if (!name) return ''

  const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e']

  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index !== 0 && smallWords.includes(word)) {
        return word
      }

      return word
        .split('-')
        .map(part =>
          part
            .split("'")
            .map(piece => {
              if (!piece) return piece
              return piece.charAt(0).toUpperCase() + piece.slice(1)
            })
            .join("'")
        )
        .join('-')
    })
    .join(' ')
}

router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Preencha todos os campos.'
      })
    }

    name = formatFullName(name)
    email = email.toLowerCase().trim()

    const nameParts = name.split(' ').filter(Boolean)

    if (nameParts.length < 2) {
      return res.status(400).json({
        message: 'Digite nome e sobrenome.'
      })
    }

    if (name.length < 6) {
      return res.status(400).json({
        message: 'O nome completo deve ter pelo menos 6 caracteres.'
      })
    }

    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message: 'O nome deve conter apenas letras.'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Digite um e-mail válido.'
      })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'A senha deve ter no mínimo 6 caracteres, uma letra e um número.'
      })
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        message: 'Este e-mail já está cadastrado.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      status: 'ativo'
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao cadastrar usuário.'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Informe e-mail e senha.'
      })
    }

    email = email.toLowerCase().trim()

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos.'
      })
    }

    if (user.status === 'bloqueado') {
      return res.status(403).json({
        message: 'Este usuário está bloqueado. Entre em contato com a administração.'
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos.'
      })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao fazer login.'
    })
  }
})

router.get('/profile', protect, async (req, res) => {
  res.json(req.user)
})

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao carregar usuários.'
    })
  }
})

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatus = ['ativo', 'bloqueado']

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: 'Status inválido.'
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado.'
      })
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Não é permitido bloquear administradores.'
      })
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(403).json({
        message: 'Você não pode alterar o próprio status.'
      })
    }

    user.status = status
    await user.save()

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao alterar status do usuário.'
    })
  }
})

module.exports = router