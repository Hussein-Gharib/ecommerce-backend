const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health',(req,res)=>{
    res.json({
        status:'ok',
        message:'Ecommerce API is running 🚀',
    });
});

moodule.exports = app;