import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import products from './product.js';


dotenv.config();

const app=express();

app.use(cors({
    origin:[
        // "https://ecommerce-three-umber.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    methods:['GET','POST'],
    credentials:true
}))

app.get('/',(req,res)=>{
    res.send("Server is ready to serve");
})

app.get("/api/product", (req, res) => {
  res.json(products);
});

const port=process.env.PORT || 3000;

app.listen(port,(req,res)=>{
    console.log(`Server is running at http://localhost:${port}`);
})