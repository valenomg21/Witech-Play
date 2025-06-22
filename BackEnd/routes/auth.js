const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.EMAIL_CODE);

const hashPassword = async (password) => {
    const saltRounds = 10; // Puedes ajustar el número de rondas de sal
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

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
      .eq("Correo", email);
    if (error){
      console.error("Error al buscar usuario:", temporalError);
      return res.status(500).json({ msg: "Error al buscar usuario" });
    }
    if (data.length > 0) {
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
   // Enviar correo electrónico con SendGrid
    const msg = {
      to: email,
      from: "tomas86597@gmail.com", // Usar la variable de entorno
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${verificationCode}`,
    };

    sgMail
      .send(msg)
      .then(async () => {
        console.log("Correo electrónico enviado");
        // Actualizar código de verificación en 'temporal_users'
        const { error: errorInsert } = await supabase
          .from("temporal_users")
          .insert({
            email: email,
            username: username,
            verification_code: verificationCode,
          });

        if (errorInsert) {
          console.error("Error al insertar usuario temporal:", errorInsert);
          return res.status(400).json({ msg: errorInsert.message });
        }

        return res.json({
          msg: "Código de verificación enviado a su correo electrónico.",
          showCodeForm: false,
        });
      })
      .catch((error) => {
        console.error("Error al enviar correo con SendGrid:", error);
        return res
          .status(500)
          .json({ msg: "Error al enviar correo electrónico con SendGrid" });
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
    
    let { data: dataTemporal, error: temporalError } = await supabase
      .from("temporal_users")
      .select("*")
      .eq("verification_code", code)
      .eq("email", email);
    if (temporalError) {
      console.error("Error al buscar usuario temporal:", temporalError);
      return res.status(500).json({ msg: "Error al buscar usuario temporal" });
    }
    if (dataTemporal.length>0) {
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

    const { data: user, error: insertError } = await supabase.rpc('insertar_usuario',
      {
        nombre: username,
        contraseña:  await hashPassword(password),
        email: email
      }
    );

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
    const { nick, password } = req.body;
    try {
        // 1. Buscar el usuario en la tabla "Usuarios"
        const { data: users, error: usersError } = await supabase
            .from("Usuarios")
            .select("*")
            .eq("Nombre", nick);
        if (usersError) {
            console.error("Error al buscar usuario:", usersError);
            return res.status(500).json({ msg: "Error al buscar usuario" });
        }
        if (!users || users.length === 0) {
            return res.status(400).json({ msg: "Credenciales inválidas" });
        }

        const user = users[0]; // Obtener el primer usuario (debería haber solo uno)

        // 2. Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.Contraseña);
        if (!isMatch) {
            return res.status(400).json({ msg: "Credenciales inválidas" });
        }

        // 3. Crear y devolver un token JWT (si SUPABASE_JWT_SECRET está definido)
        if (process.env.SUPABASE_JWT_SECRET) {
            const payload = {
                user: {
                    id: user.id, // << Usar el ID de tu tabla "Usuarios"
                },
            };

            jwt.sign(payload, process.env.SUPABASE_JWT_SECRET, {
                expiresIn: "1h",
            }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } else {
            // 4. Devolver información del usuario (sin token JWT)
            res.json({ 
                user: {
                    id: user.id,
                    email: user.Correo,
                    username: user.Nombre,
                    // ... (otros datos que quieras devolver) ...
                }
            });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error del servidor");
    }
});

module.exports = router;