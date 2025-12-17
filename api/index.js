import express from 'express';
import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import products from '../product.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import serverless from 'serverless-http';


const app=express();
dotenv.config();
app.use(express.json());

// middleware
// app.use(bodyParser.json());
// "https://ecommerce-three-umber.vercel.app",
// "https://hubcredo-frontend-kappa.vercel.app",
// "http://localhost:3000",
app.use(cors({
  origin:[
    "https://hubcredo-frontend-kappa.vercel.app",
        "http://localhost:5173",
        // "http://localhost:5174"
    ],
    methods:['GET', 'POST', 'OPTIONS'],
     allowedHeaders: ["Content-Type", "Authorization"],
    credentials:true
}))

// app.options("*", cors());
// app.options("*", cors());

// app.use(express.json());

// Mongodb Serverless connection

let isConnected=false;
async function connectDB(){
    if(isConnected) return;
    
    try{
      await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
    console.log("MongoDB connected");

    }catch(error){
        console.error("Error connecting to MongoDB:",error);
        throw error;
    }
  }

  // Ensure DB connection 
  app.use(async(req,res,next)=>{
   try {
    await connectDB();
    next();
  } catch {
    return res.status(500).json({ message: "Database connection failed" });
  }
  })

app.get("/", (req, res) => {
  res.send("HubCredo Backend Running ✅");
});

  // Test Route
// app.get("/test", (req, res) => {
//   res.json({ message: "Backend is live ✅" });
// });

app.get("/api/product", (req, res) => {
  res.json(products);
});
// const port=process.env.PORT || 3000;

// user model
const User = mongoose.models.User ||
  mongoose.model("User", new mongoose.Schema({
    name:String,
    mobile:Number,
    email: { type: String, unique: true },
    password:String,
    gender:String,
}));

// Signup route
app.post("/api/signup",async(req,res)=>{
      const { name, email, password,mobile,gender } = req.body;

      try{
        const existingUser = await User.findOne({ email });
         if (existingUser) return res.status(400).json({ message: "User already exists" });
         const hashedPassword = await bcrypt.hash(password, 10);

          const user = new User({ name, email, password: hashedPassword, mobile, gender});
        await user.save();

        res.status(200).json({ message: "User created successfully" ,user});

      }catch(error){
        return res.status(500).json({ message: "Server error" });
      }
});

// Login route
app.post("/api/login",async(req,res)=>{
      const { email, password } = req.body;
    //   const bcrypt = require("bcryptjs");

      try{
        const user = await User.findOne({ email });
         if (!user) return res.status(400).json({ message: "User Not Found!" });

         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

         const token = jwt.sign({ 
          id: user.id }, 
         process.env.JWT_SECRET, 
          { expiresIn: "1d" });

          res.status(200).json({ message: "Login successful", token, user });

      }catch(error){
        return res.status(500).json({ message: "Server error" });
      }
    });
    // const port=process.env.PORT || 3000;

// if (process.env.NODE_ENV !== "production") {
//   app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
//   });
// }
export default app;
// export const handler = serverless(app);
// export default handler;
