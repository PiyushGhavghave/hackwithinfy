import axios from 'axios';

const VAPI_BASE_URL = "https://api.vapi.ai";
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

const vapi = axios.create({
    baseURL: VAPI_BASE_URL,
    headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

export const startCall = async (phoneNumber, sosId) => {
    try {
        const payload = {
            assistantId: VAPI_ASSISTANT_ID,
            phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
            customer: {
                number: phoneNumber,
            },
            // This metadata is still important for tracking the call
            metadata: { sosId },
        };

        const response = await vapi.post('/call/phone', payload);
        return response.data;
    } catch (error) {
        console.error("Error starting Vapi call:", error.response?.data || error.message);
        throw new Error("Failed to start Vapi call.");
    }
};