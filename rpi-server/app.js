import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import lockingDevice from './devices/locking-device.js'

const PORT = 3000;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello from Raspberry Pi Express Server!');
});

app.use('/locking-device', lockingDevice);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})