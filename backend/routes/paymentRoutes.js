const express = require("express");
const { createOrder } = require("../controllers/orderController");
const { verify } = require("jsonwebtoken");
const router = express.Router();
const {verifyPayment} = require('../controllers/paymentController')




router.post("/order", createOrder);
router.post("/verify",verifyPayment);



module.exports= router;