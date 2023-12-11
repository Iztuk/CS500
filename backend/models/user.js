import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        userEmail: {
            type: String,
            required: true,
            unique: true
        },
        userName: {
            type: String,
            required: true
        },
        userPassword: {
            type: String,
            required: true
        },
        hubMacs: {
            type: [String],
            default: []
        }
    }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;