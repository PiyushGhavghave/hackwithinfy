import sosRequestModel from "../models/sosRequest.model.js";
import { startCall } from "../services/vapi.services.js";

export const createSOSRequest = async (req, res) => {
    try {
        const { requesterId, longitude, latitude } = req.body;

        if (!requesterId || !longitude || !latitude) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const newSOS = new sosRequestModel({
            requesterId,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            status: 'New'
        });
        await newSOS.save();

        // Directly call the imported function
        const vapiResponse = await startCall(
            requesterId,
            newSOS._id.toString()
        );

        newSOS.vapiCallId = vapiResponse.id;
        newSOS.status = 'Calling';
        await newSOS.save();

        res.status(201).json({ 
            message: "SOS received. You will receive a call shortly.",
            sosId: newSOS._id 
        });

    } catch (error) {
        console.error("Error creating SOS request:", error);
        res.status(500).json({ message: "Server error." });
    }
};