import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
const port = process.env.PORT || 8000;

dotenv.config()

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

 .then(()=>{
    console.log('MongoDB Connected sucessfully!!')
 })
 .catch((err) =>{
    console.log("Failed to connect MongoDB",err.message)
 })
 

app.listen(port,()=>{
    console.log(`Server is running on ${port}`)
})
