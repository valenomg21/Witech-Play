require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors({origin: 'http://127.0.0.1:5500'}));
app.use(express.json()); // Para analizar el cuerpo de las solicitudes JSON
// Rutas
app.use('/api/auth', authRoutes);
app.listen(port, () => {
    console.log('Servidor corriendo en el puerto ${port}');
});