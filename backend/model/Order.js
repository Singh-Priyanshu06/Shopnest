const mongoose = require('mongoose');
const Product = require('./Product');


const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required: true
    },
    items:[
        {
            product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product',required:true},
            quantity:{ type:Number,required:true,min:1},
            price:{type: Number,required:true},
        }
    ],
    totalAmount:{type:Number,required:true},
    address:{
        fullName:{type:String,required:true},
        street:{type:String,required:true},
        city:{type:String,required:true},
        postalCode:{type:String,required:true},
        country:{type:String,required:true},
    },
    paymentId:{type:String},
    status:{type: String, enum:['pending','shipped','delivered'],default:"pending"}

}, {timestamps:true}
);


const Order = mongoose.model('Order',orderSchema);
module.exports = Order;