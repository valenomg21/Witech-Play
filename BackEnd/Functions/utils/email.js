// backend/functions/util/email.js
const nodemailer = require('nodemailer');

// Configuración de Nodemailer (REEMPLAZA CON TUS CREDENCIALES)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'Witech@gmail.com',
    pass: 'dpge isau zaho ikpb', // O contraseña de aplicación
  },
});

