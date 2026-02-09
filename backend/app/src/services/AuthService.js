const bcrypt = require('bcrypt');
const MongoFactory = require('../factories/MongoFactory');
const UserDTO = require('../dto/UserDTO');

/** Coste del hash (10 = ~100ms, mayor = más seguro pero más lento) */
const SALT_ROUNDS = 10;

class AuthService {
  constructor() {
    const factory = new MongoFactory();
    this.userDAO = factory.createUserDAO();
  }

  async login(email, password) {
    const userDoc = await this.userDAO.findByEmail(email);
    
    if (!userDoc || !userDoc.active) {
      throw new Error('Usuario no válido');
    }
  
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  
    const passwordValid = await this._verifyPassword(password, user.password);
    if (!passwordValid) {
      throw new Error('Credenciales incorrectas');
    }
  
    return new UserDTO({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, 
      active: user.active,
      createdAt: user.createdAt
    });
  }

  /**
   * Verifica la contraseña: soporta bcrypt hash o texto plano (migración).
   * Nunca almacenar contraseñas en texto plano en producción.
   */
  async _verifyPassword(plainPassword, storedHash) {
    if (!storedHash) return false;
    if (storedHash.startsWith('$2') && storedHash.length > 50) {
      return await bcrypt.compare(plainPassword, storedHash);
    }
    return plainPassword === storedHash;
  }

  /** Encripta una contraseña con bcrypt */
  static async hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }
}

module.exports = AuthService;