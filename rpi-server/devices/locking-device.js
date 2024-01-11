import express from 'express';
import mqtt from 'mqtt';

const router = express.Router();
const mqttBroker = 'mqtt://10.42.0.1'; // Replace with MQTT broker address

let deviceState = false;

router.get('/device-state', (req, res) => {
    res.send({ deviceState });
})

router.post('/send-command', (req, res) => {
    const {
        topic,
        command
    } = req.body;

    console.log('Received request: ', req.body);

    if (!topic || command === undefined) {
        res.status(400).send({ error: 'Bad Request: Missing topic or command' });
        return;
    }

    if (command === 'toggle') {
        deviceState = !deviceState;
    } else {
        res.status(400).send({ error: 'Bad Request: Invalid command' });
        return;
    }

    const client = mqtt.connect(mqttBroker);

    client.on('connect', () => {
        client.publish(topic, deviceState.toString(), (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to publish command to MQTT broker' });
            } else {
                res.send({ message: 'Command sent to MQTT broker' });
            }
            client.end(); // Close the MQTT connection.
        });
    });

    client.on('error', (err) => {
        console.error('MQTT error: ', err);
        res.status(500).send({ error: 'MQTT connection error' });
    });

});

export default router;