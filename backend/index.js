require('dotenv').config();
const { webcrypto } = require('crypto');
const express = require("express");
const cors = require("cors");
const path = require("path");
// ensure Node runtime exposes Web Crypto and builtin modules for MongoDB/bson compatibility
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
if (!process.getBuiltinModule) {
  process.getBuiltinModule = (id) => require(id);
}
const connectDB = require("./config/db")

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL],
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({extended:true}));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticRoutes'));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('ShopNest API is running in Development mode...');
  });
}

const PORT = process.env.PORT || 5000 ;
app.listen(PORT,()=>{
    console.log(`Server are running on port ${PORT}`)
});