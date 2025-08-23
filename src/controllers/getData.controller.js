import sosRequestModel from "../models/sosRequest.model.js";

export const getSOSRequests = async (req, res) => {
    try {
        const requests = await sosRequestModel.find();
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching SOS requests:", error);
        res.status(500).json({ error: "Failed to fetch SOS requests." });
    }
};