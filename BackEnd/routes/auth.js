const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pass_Email = process.env.EMAIL_CODE;

// Configuración de Nodemailer (reemplaza con tus credenciales)
const transporter = nodemailer.createTransport({
  service: "Gmail", // o 'Mailgun', 'SendGrid', etc.
  auth: {
    user: "tomas86597@gmail.com",
    pass: pass_Email, // 🚨 Utiliza una contraseña de aplicación si usas Gmail
  },
});
let CodigoVerificado;
// Ruta de registro
router.post("/register", async (req, res) => {
  const { email, username } = req.body; // <<-- No recibimos la contraseña aquí
  console.log("Recibido solicitud de registro:", { email, username });
  try {
    //Validamos que el usuario no exista
    console.log("Validando que el usuario no exista en 'users'...");
    let { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("email", email);
    if (data!=null) {
      return res.status(400).json({ msg: "El correo ya está en uso" });
    }
    //Validamos que el usuario temporal no exista
    let { data: dataTemporal, error: errorTemporal } = await supabase
      .from("temporal_users")
      .select("*")
      .eq("email", email);

      if (errorTemporal) {
        console.error("Error al validar correo en 'temporal_users':", errorTemporal);
        return res.status(500).json({ msg: `Error al validar correo en 'temporal_users': ${errorTemporal.message}` });
    }

    if (dataTemporal && dataTemporal.length > 0) {
        console.log("El correo ya está en uso en 'temporal_users'");
        return res.status(400).json({ msg: "Ya hay un registro en proceso con este correo" });
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    CodigoVerificado = verificationCode;
    // Enviar correo electrónico con Nodemailer
    const mailOptions = {
      from: "tomas86597@gmail.com",
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar correo:", error);
        return res
          .status(500)
          .json({ msg: "Error al enviar correo electrónico" });
      } else {
        console.log("Correo electrónico enviado:", info.response);
      }
    });
    const { error: errorInsert } = await supabase
      .from("temporal_users")
      .insert({
        email: email,
        username: username,
        verification_code: verificationCode,
      });
    if (errorInsert) {
      console.error("Error al insertar usuario temporal:", errorInsert); // <<-- Imprime el error de Supabase
      return res.status(400).json({ msg: errorInsert.message });
    }
    res.json({
      msg: "Código de verificación enviado a su correo electrónico.",
    });
  } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ msg: "Error del servidor" });
  }
});

// Ruta para verificar el código de registro y FINALIZAR el registro
router.post("/verify", async (req, res) => {
  const { code, email, password, username } = req.body; // <<-- Recibimos code, email, password y username
  console.log("Recibido del frontend:", { code, email, password, username });
  try {
    
    if (code != CodigoVerificado) {
      return res.status(400).json({ msg: "El código es incorrecto" });
    }
    // Registramos el usuario en Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        },
      },
    });
    if (authError) {
      console.error("Error de Supabase Auth:", authError);
      return res.status(400).json({ msg: authError.message });
    }

    //Insertamos el nuevo usuario
    const { data: user, error: insertError } = await supabase
      .from("Usuarios")
      .insert({
        Correo: email,
        Nombre: username,
        Contraseña: password
      })
      .select();

    if (insertError) {
      console.error("Error al insertar usuario:", insertError);
      return res.status(500).json({ msg: "Error al insertar usuario" });
    }
    await supabase.from("temporal_users").delete().eq("email", email);

    res.json({ msg: "Usuario registrado y verificado con éxito", data: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

// Ruta de inicio de sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      return res.status(400).json({ msg: error.message });
    }
    // Crear y devolver un token JWT
    if (process.env.SUPABASE_JWT_SECRET) {
      const payload = {
        user: {
          id: data.user.id,
        },
      };
      jwt.sign(
        payload,
        process.env.SUPABASE_JWT_SECRET,
        {
          expiresIn: "1h",
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      res.json({ data });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});
module.exports = router;
