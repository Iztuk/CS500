import mongoose from 'mongoose';

const hubSchema = mongoose.Schema(
    {
        hubNickname: {
            type: String
        },
        hubMac: {
            type: String,
            unique: true,
            required: true
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        devices: [String]
    }
)

const HubModel = mongoose.model('Hub', hubSchema);

export default HubModel;