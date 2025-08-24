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
    reportedLocation: {
        type: String,
        default: 'Not specified'
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
    peopleCount: {
        type: Number,
        default: 1
    },
    hasInjuries: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

sosRequestSchema.index({ location: '2dsphere' });
export default mongoose.model('SOSRequest', sosRequestSchema);