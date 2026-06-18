const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const sendEmail = require("../utils/sendEmail");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn:'7d'});
};





const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const message = `Hello ${name},

Thank you for registering with our platform.

Your One-Time Password (OTP) for email verification is: ${otp}

This OTP is valid for 5 minutes. Please do not share it with anyone.

If you did not create an account, please ignore this email.

Regards,
Team Shopping Web`;

      await sendEmail(
        email,
        "Welcome to ShopNest - Your OTP for Registration",
        message
      );

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};


const loginUser = async(req,res)=>{
    const {email,password}= req.body;
    try{
        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }else{
            res.status(400).json({message: 'Invalid email or password'})
        }
    }catch(error){
        res.status(500).json({message:"Server error"})
    }
};


const getUsers = async(req,res)=>{
    try{
        const users = await User.find({}).select('-password');
        res.json(users);
    }catch (error){
        res.status(500).json({message:'Server error'});
    }
}


module.exports = { registerUser, loginUser, getUsers};