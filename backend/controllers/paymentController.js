const Razorpay = require("razorpay");
const crypto = require("crypto");
dotenv = require("dotenv").config();


const createdOrder = async(req,res)=>{
    try{
        // Check if Razorpay keys are configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(400).json({message: "Razorpay keys not configured. Use bypass mode."});
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const option ={
            amount: req.body.amount * 100,
            currency:"INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        const order = await instance.orders.create(option);
        res.status(200).json(order);
    }catch (error){
        res.status(500).json({message:"Server error"});
    }
};


const verifyPayment = async(req,res)=>{
    try{
        const {rezorpay_order_id, rezorpay_payment_id, razorpay_signature}= req.body;
        const generated_signature = crypto


createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + " " + razorpay_payment_id)
            .digest("hex");
        if (generated_signature === razorpay_signature){
            res.status(200).json({message:"Payment verified successfull"});
    } else{
         res.status(400).json({message:"Payment verification failed"});
    }
}catch(error){
    res.status(500).json({message:"Server error"})
}};

module.exports = {createdOrder,verifyPayment}