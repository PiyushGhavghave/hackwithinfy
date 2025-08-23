import SOSRequest from "../models/sosRequest.model.js";

export const handleWebhook = async (req, res) => {
    const { call, transcript, messages, metadata, status } = req.body;

    // Vapi's webhook is designed to be very simple
    if (status === 'end') {
        const { sosId } = metadata;
        const fullTranscript = messages.map(msg => msg.role + ': ' + msg.message).join('\n');
        console.log(fullTranscript)
        // Simple AI interpretation (can be more advanced with Vapi's `functions` and `webhooks` features)
        let urgency = 'Low';
        if (fullTranscript.includes('help') || fullTranscript.includes('stuck') || fullTranscript.includes('injury')) {
            urgency = 'High';
        } else if (fullTranscript.includes('safe')) {
            urgency = 'Resolved';
        }

        try {
            await SOSRequest.findByIdAndUpdate(sosId, {
                status: 'InProgress',
                transcript: fullTranscript,
                urgency: urgency
            });
            console.log(`SOS record updated for Vapi call: ${call.id}`);
            res.status(200).send('Webhook received and processed.');
        } catch (error) {
            console.error('Failed to update SOS record:', error);
            res.status(500).send('Error processing webhook.');
        }
    } else {
        res.status(200).send('Webhook received.');
    }
};