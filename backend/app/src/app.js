const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const loanRoutes = require('./routes/loan.routes');
const reportRoutes = require('./routes/report.routes');
const overload = require('./middlewares/overload');
const app = express();




app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost', 'http://localhost:80'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(overload);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reports', reportRoutes);
app.get("/api/instance", (req, res) => {
  res.json({
    instanceId: process.env.HOSTNAME
  });
});


module.exports = app;