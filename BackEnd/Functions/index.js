const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');


admin.initializeApp();

// 1. Configuración de Nodemailer (REEMPLAZA CON TUS CREDENCIALES)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'tomas86597@gmail.com',
    pass: 'dpge isau zaho ikpb' // O contraseña de aplicación
  },
});

// 2. Función para generar un código de verificación aleatorio
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// 3. Función para enviar el correo electrónico de verificación
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: 'WitechPlay <tomas86597@gmail.com>',
    to: email,
    subject: 'Código de Verificación - WitechPlay',
    html: `<p>Tu código de verificación de WitechPlay es: <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado a:', email);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
}

// 4. Función para generar y enviar el código de verificación (Firebase Function)
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  const email = data.email;

  // Validación básica del correo electrónico
  if (!email || !email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'El correo electrónico no es válido.');
  }

  const verificationCode = generateVerificationCode();

  try {
    // Guardar el código en Firestore (con expiración)
    await admin.firestore().collection('verificationCodes').doc(email).set({
      code: verificationCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Enviar el correo electrónico
    await sendVerificationEmail(email, verificationCode);

    return { result: 'Código de verificación enviado correctamente.' };

  } catch (error) {
    console.error('Error en sendVerificationCode:', error);
    throw new functions.https.HttpsError('internal', error.message, error);
  }
});

// 5. Función para verificar el código ingresado (Firebase Function)
exports.verifyCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  // Validación básica
  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'El correo electrónico y el código son obligatorios.');
  }

  try {
    const doc = await admin.firestore().collection('verificationCodes').doc(email).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', 'Código de verificación no encontrado.');
    }

    const storedCodeData = doc.data();
    const storedCode = storedCodeData.code;
    const createdAt = storedCodeData.createdAt;

    // Verificar si el código coincide y no ha expirado (5 minutos)
    const now = admin.firestore.Timestamp.now();
    const expirationTime = 5 * 60 * 1000; // 5 minutos
    if (code !== storedCode || now.toDate().getTime() - createdAt.toDate().getTime() > expirationTime) {
      throw new functions.https.HttpsError('invalid-argument', 'Código de verificación incorrecto o ha expirado.');
    }

    // Eliminar el código de Firestore
    await admin.firestore().collection('verificationCodes').doc(email).delete();

    return { result: 'Código de verificación verificado correctamente.' };

  } catch (error) {
    console.error('Error en verifyCode:', error);
    throw new functions.https.HttpsError('internal', error.message, error);
  }
});

// 6. Función para crear el perfil del usuario (Firebase Function)
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  const { email, uid } = user;

  try {
    await admin.firestore().collection('users').doc(uid).set({
      email: email,
      // Otros campos (nombre, etc.)
    });
    console.log('Perfil de usuario creado para:', email);
  } catch (error) {
    console.error('Error al crear el perfil de usuario:', error);
  }
});

// 7. Función para completar el registro con datos adicionales
exports.completeRegistration = functions.https.onCall(async (data, context) => {
  const { name, lastName } = data;
  const uid = context.auth.uid;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado.');
  }

  try {
    await admin.firestore().collection('users').doc(uid).update({
      name: name,
      lastName: lastName,
    });
    return { result: 'Información adicional guardada.' };
  } catch (error) {
    console.error('Error completing registration:', error);
    throw new functions.https.HttpsError('internal', 'No se pudo completar el registro.');
  }
});