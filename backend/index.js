import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.js';
import hubRouter from './routes/hub.js';
import deviceRouter from './routes/device.js';
import cors from 'cors';

const app = express();
const port = 3000;

// Connection string for MongoDB
const uri = 'mongodb://localhost:27017/CS500'

app.use(cors());

// Routes

app.use(express.json());

app.use('/users', userRouter);

app.use('/hubs', hubRouter);

app.use('/devices', deviceRouter);

mongoose.
connect(uri)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
}).catch((error) => {
    console.log(error);
});