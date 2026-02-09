require('dotenv').config();
const app = require('./app');
const connectMongo = require('./config/mongo');
const { seedUsers } = require('./scripts/seedUsers');
require('../../worker/loan.worker');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectMongo();
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
})();