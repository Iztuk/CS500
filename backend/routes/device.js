import express from 'express';
import DeviceModel from '../models/device.js';
import HubModel from '../models/hub.js';

const router = express.Router();

router.post('/add-device', async (req, res) => {
    try {
        const {
            deviceMac,
            deviceType,
            hubMac
        } = req.body;

        // Check if the device already exists.
        const existingDevice = await DeviceModel.findOne({ deviceMac });

        if (existingDevice) {
            return res.status(400).json({ message: 'Device already exists' });
        }

        // Create a new device instance.
        const newDevice  = new DeviceModel({
            deviceMac,
            deviceType
        });

        // Find the hub using its Mac address.
        const hub = await HubModel.findOne({ hubMac });

        if (!hub) {
            return res.status(404).json({ message: 'Hub not found' });
        }

        // Save the new device to the database.
        const savedDevice = await newDevice.save();

        // Add the deviceMac to the hub's devices array.
        hub.devices.push(deviceMac);
        await hub.save();

        res.status(201).json(savedDevice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.delete('/remove-device', async (req, res) => {
    try {
        const {
            deviceMac,
            hubMac
        } = req.body;

        // Find the hub using it's Mac address.
        const hub = await HubModel.findOne({ hubMac });

        if (!hub) {
            return res.status(404).json({ message: 'Hub not found' });
        }

        // Remove the deviceMac from the hub's devices array.
        hub.devices = hub.devices.filter((mac) => mac !== deviceMac);
        await hub.save();

        // Remove the device from the device collection.
        const deletedDevice = await DeviceModel.findOneAndDelete({ deviceMac });

        if (!deletedDevice) {
            return res.status(404).json({ message: 'Device not found' });
        }
        
        res.status(200).json({ message: 'Device removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.get('/user-devices', async (req, res) => {
    try {
        const {
            _id
        } = req.body;

        // Find all hubs associated with the user.
        const userHubs = await HubModel.find({ users: _id });

        // Extract the deviceMac/s from the user hubs.
        const deviceMacs = userHubs.reduce((acc, hub) => {
            acc.push(...hub.devices);
            return acc;
        }, []);

        // Find all devices associated with the extracted deviceMacs.
        const userDevices = await DeviceModel.find({ deviceMac: { $in: deviceMacs } });

        res.status(200).json(userDevices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;