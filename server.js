import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
const port = process.env.PORT || 8000;

dotenv.config()

app.listen(port,()=>{
    console.log(`Server is running on ${port}`)
})
