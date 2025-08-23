import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema({
    requesterId: { 
        type: String, 
        required: true 
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
    vapiCallId: String, // Vapi's unique call ID
    transcript: String,
    urgency: {
        type: String,
        enum: ['High', 'Medium', 'Low', 'Unclassified'],
        default: 'Unclassified'
    },
    details: {
        peopleCount: Number,
        hasInjuries: Boolean,
    }
}, { timestamps: true });

sosRequestSchema.index({ location: '2dsphere' });
export default mongoose.model('SOSRequest', sosRequestSchema);