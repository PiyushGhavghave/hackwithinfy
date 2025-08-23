import SOSRequest from "../models/sosRequest.model.js";

export const handleWebhook = async (req, res) => {
    const { message } = req.body;

    // Check if the message is the final end-of-call report
    if (message && message.type === 'end-of-call-report') {
        // Extract the required data from the payload
        const { call, summary, transcript, phoneNumber } = message;
        const { sosId } = call.metadata;

        // Get the requester's name from the phoneNumber object
        const requesterName = phoneNumber.name;
        const conciseIssue = summary;

        console.log("Extracted Name:", requesterName);
        console.log("Extracted Summary:", conciseIssue);

        try {
            // Find the correct SOS document using the sosId and update it
            await SOSRequest.findByIdAndUpdate(sosId, {
                status: 'InProgress',
                name: requesterName, // Save the requester's name
                issue: conciseIssue,
                transcript: transcript,
            });

            console.log(`SOS record updated for call: ${call.id}`);

            // Send a success response back to Vapi
            res.status(200).send('Webhook processed successfully.');
        } catch (error) {
            console.error('Failed to update SOS record:', error);
            res.status(500).send('Error processing webhook.');
        }
    } else {
        res.status(200).send('Webhook received.');
    }
};