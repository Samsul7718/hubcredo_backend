import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import products from './product.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


dotenv.config();

const app=express();
app.use(express.json());

// middleware
app.use(bodyParser.json());
// "https://ecommerce-three-umber.vercel.app",
// "http://localhost:3000",
app.use(cors({
    origin:[
        "https://hubcredo-frontend-kappa.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS '],
    credentials:true
}))

app.options("*", cors());

app.get('/',(req,res)=>{
    res.send("Server is ready to serve");
})

app.get("/api/product", (req, res) => {
  res.json(products);
});

// connect to mongodb
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

// user model
const User=mongoose.model('User',new mongoose.Schema({
    name:String,
    mobile:Number,
    email: { type: String, unique: true },
    password:String,
    gender:String,
}));

// Signup route
app.post('/signup',async(req,res)=>{
      const { name, email, password,mobile,gender } = req.body;

      try{
        const existingUser = await User.findOne({ email });
         if (existingUser) return res.status(400).json({ message: "User already exists" });
         const hashedPassword = await bcrypt.hash(password, 10);

          const user = new User({ name, email, password: hashedPassword, mobile, gender});
        await user.save();

        res.status(201).json({ message: "User created successfully" ,user});

      }catch(error){
        return res.status(500).json({ message: "Server error" });
      }
});

// Login route
app.post('/login',async(req,res)=>{
      const { email, password } = req.body;
    //   const bcrypt = require("bcryptjs");

      try{
        const user = await User.findOne({ email });
         if (!user) return res.status(400).json({ message: "User Not Found!" });

         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

         const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1d" });

          res.status(200).json({ message: "Login successful", token, user });

      }catch(error){
        return res.status(500).json({ message: "Server error" });
      }
});

const port=process.env.PORT || 3000;

app.listen(port,(req,res)=>{
    console.log(`Server is running at http://localhost:${port}`);
})