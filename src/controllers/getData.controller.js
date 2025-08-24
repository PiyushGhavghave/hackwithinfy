import sosRequestModel from "../models/sosRequest.model.js";

export const getSOSRequests = async (req, res) => {
    let { requesterId } = req.query;
    requesterId = "+" + requesterId.trim()
    console.log("Fetching SOS requests for requesterId:", requesterId);
    try {
        const requests = await sosRequestModel.find({ requesterId : requesterId });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching SOS requests:", error);
        res.status(500).json({ error: "Failed to fetch SOS requests." });
    }
};