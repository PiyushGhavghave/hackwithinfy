import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema({
    requesterId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'Unknown'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['New', 'Calling', 'InProgress', 'Resolved'],
        default: 'New'
    },
    vapiCallId: String,
    issue: {
        type: String
    },
    transcript: {
        type: String
    },
    // The urgency field has been removed
}, { timestamps: true });

sosRequestSchema.index({ location: '2dsphere' });
export default mongoose.model('SOSRequest', sosRequestSchema);