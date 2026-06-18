const Order = require('../model/Order');
const User = require('../model/User');
const sendEmail = require("../utils/sendEmail");


const createOrder = async(req,res)=>{
    try{
        console.log("REQ USER IN CREATE ORDER:", req.user);
        const {items,totalAmount,address,paymentId} = req.body;
        if(!items || items.length === 0 || !totalAmount || !address){
           return res.status(400).json({message:'Invalid order data'});
        }
        // If no authenticated user (bypass mode), create or re-use a guest account for order ownership
        let orderUser = req.user;
        if (!orderUser) {
            let guest = await User.findOne({ email: 'guest@local.test' });
            if (!guest) {
                guest = await User.create({ name: 'Guest User', email: 'guest@local.test', password: 'guest_pass_change_me' });
            }
            orderUser = guest;
        }

        const createdOrder = new Order({
            user: orderUser._id,
            items, totalAmount, address, paymentId
        });
        await createdOrder.save();
        console.log("Order User:", orderUser._id);

                const userForEmail = orderUser;
                const message = `
                <h2>Order Confirmation</h2>
                <p>Hello ${userForEmail.name},</p>
                <p>Your order has been successfully placed! Order ID: <strong>${createdOrder._id}</strong></p>
                <p>Total Amount Paid: $${totalAmount.toFixed(2)}</p>
                <p>It will be shipped to: ${address.street}, ${address.city}</p>
                <p>Thank you for shopping with ShopNest!</p>
            `;
                // Send email only if the user has a non-guest email
                if (userForEmail.email && !userForEmail.email.includes('guest@local.test')) {
                        await sendEmail(userForEmail.email,'Order Created',message);
                }
        
        res.status(201).json(createdOrder);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const myOrders = async(req,res)=>{
    try{
       console.log("Logged User:", req.user._id);
        const orders = await Order.find({user:req.user._id})
        res.json(orders);
console.log("Orders Found:", orders.length);
    }catch(error){
        res.status(500).json({message:'Error fetching order',error});
    }
};

const getOrders = async(req,res)=>{
    try{
        const orders = await Order.find({}).populate('user','id name');
        res.json(orders);
    }catch(error){
        res.status(500).json({message:'Error fetching order',error});
    }
};


const updateOrderStatus = async(req,res)=>{
    try{
        const{status} = req.body;
        const order = await Order.findById(req.params.id);
        if(order){
            order.status=status;
            await order.save();
            res.json({message:'Order status update',order});
        }
        else{
            res.status(404).json({message:"Order not found"});
        }
    }catch (error) {
        res.status(500).json({
            message: 'Error fetching order',
            error: error.message
        });
    }
}

module.exports={
    getOrders,createOrder,myOrders,updateOrderStatus
}