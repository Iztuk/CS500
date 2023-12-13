import mongoose from "mongoose";

const deviceSchema = mongoose.Schema(
    {
        deviceMac: {
            type: String,
            unique: true,
            required: true
        },
        deviceType: {
            type: String,
            required: true
        }
    }
)

const DeviceModel = mongoose.model('Device', deviceSchema);

export default DeviceModel;