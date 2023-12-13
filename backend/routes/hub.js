import express from 'express';
import HubModel from '../models/hub.js';
import UserModel from '../models/user.js';

const router = express.Router();

router.post('/add-hub', async (req, res) => {
    try {

        let { 
            hubMac, 
            user 
        } = req.body;

        hubMac = hubMac.toUpperCase();

        // Check if the hub with the specified hubMac already exists.
        const existingHub = await HubModel.findOne({ hubMac });

        if (existingHub) {
            // If the hub exists, check if the user already exists in the users array.
            if (!existingHub.users.includes(user)) {
                existingHub.users.push(user);
                const updatedHub = await existingHub.save();
                // Find the user and update their hubMacs array
                const existingUser = await UserModel.findOne({ _id: user });
                console.log(existingUser);
                if (existingUser) {
                    if (!existingUser.hubMacs.includes(hubMac)) {
                        existingUser.hubMacs.push(hubMac);
                        await existingUser.save();
                    }
                }
                return res.status(200).json(updatedHub);
            } else {
                return res.status(400).json({ message: 'User already exists in the hub' });
            }
        } else {
            // If hub doesn't exist, create a new hub and add the user.
            const hub = new HubModel({
                hubMac,
                users: [user],
                devices: []
            });

            // Save the hub with the update or new user reference.
            const savedHub = await hub.save();

            // Find the user and update their hubMacs array
            const existingUser = await UserModel.findOne({ _id: user });
            if (existingUser) {
                if (!existingUser.hubMacs.includes(hubMac)) {
                    existingUser.hubMacs.push(hubMac);
                    await existingUser.save();
                }
            }

            return res.status(201).json(savedHub);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/remove-hub', async (req, res) => {
    try {
        // Remove user from hub. If there is only one user, remove the hub entirely.
        const {
            hubMac,
            user
        } = req.body;

        // Find the hub by hubMac.
        const hub = await HubModel.findOne({ hubMac });

        // This is for testing purposes, remove once frontend is created.
        if (!hub) {
            return res.status(404).json({ message: 'Hub  not found' });
        }

        // Find the user and update their hubMacs array.
        const existingUser = await UserModel.findOne({ _id: user });
        if (existingUser) {
            // Removes the hubMac from the user's hubMacs array.
            existingUser.hubMacs.pull(hubMac);
            await existingUser.save();
        }

        // Remove the specified user from the hub's users array.
        hub.users.pull(user);

        // If the hub has no users left, remove the hub entirely.
        if (hub.users.length === 0) {
            await HubModel.deleteOne({ hubMac });
            return res.status(200).json({ message: 'Hub deleted successfully' });
        }

        // Save the modified hub.
        const updatedHub = await hub.save();
        
        res.status(200).json(updatedHub);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/user-hubs', async (req, res) => {
    // Get all the hub's associated with the user.
    try {
        const _id = req.body;

        // Find all hubs where the user is included in the users array.
        const userHubs = await HubModel.find({ users: _id });

        res.status(200).json(userHubs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;