/**
 * Seed de usuarios con contraseñas encriptadas (bcrypt).
 * Ejecuta al arrancar el backend: migra usuarios con contraseña en texto plano
 * o crea usuarios por defecto si no existen.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const DEFAULT_USERS = [
  { name: 'Luis', email: 'luis@mail.com', password: '123', role: 'ADMIN' },
  { name: 'Ana', email: 'ana@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Carlos', email: 'carlos@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Maria', email: 'maria@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Jose', email: 'jose@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Pedro', email: 'pedro@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Lucia', email: 'lucia@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Sofia', email: 'sofia@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Diego', email: 'diego@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Elena', email: 'elena@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Jorge', email: 'jorge@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Paula', email: 'paula@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Raul', email: 'raul@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Carmen', email: 'carmen@mail.com', password: '123', role: 'STUDENT' },
  { name: 'Miguel', email: 'miguel@mail.com', password: '123', role: 'STUDENT' }
];

async function seedUsers() {
  const User = mongoose.connection.collection('users');
  const hashedPassword = await bcrypt.hash('123', SALT_ROUNDS);

  try {
    const count = await User.countDocuments();
    
    if (count === 0) {
      console.log('📦 Seed: Creando usuarios por defecto con contraseñas encriptadas...');
      const docs = DEFAULT_USERS.map(u => ({
        ...u,
        password: hashedPassword,
        active: true,
        createdAt: new Date()
      }));
      await User.insertMany(docs);
      console.log(`✅ ${docs.length} usuarios creados`);
      return;
    }

    const plainTextUsers = await User.find({ 
      $or: [
        { password: { $exists: false } },
        { password: '123' },
        { password: { $not: { $regex: /^\$2[aby]\$/ } } }
      ]
    }).toArray();

    if (plainTextUsers.length > 0) {
      console.log(`🔐 Migrando ${plainTextUsers.length} usuarios a contraseñas encriptadas...`);
      for (const u of plainTextUsers) {
        await User.updateOne(
          { _id: u._id },
          { $set: { password: hashedPassword } }
        );
      }
      console.log('✅ Migración completada');
    }
  } catch (err) {
    console.error('❌ Error en seed de usuarios:', err.message);
  }
}

module.exports = { seedUsers };
