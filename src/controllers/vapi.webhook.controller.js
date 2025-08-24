import SOSRequest from "../models/sosRequest.model.js";
import { ChatGroq } from '@langchain/groq';
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import "dotenv/config";

// Initialize the LLM with the API key
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

// Define the Zod schema for the data to extract from the transcript
const emergencyDetailsSchema = z.object({
    reportedLocation: z.string().describe("The name of the city, town, or major area the user mentions (e.g., 'Pune', 'Kothrud'). If no specific place name is mentioned, state 'Not specified'."),
    peopleCount: z.number().describe("The total number of people needing help. Default to 1 if not mentioned."),
    hasInjuries: z.boolean().describe("Whether anyone is injured. Set to true if injuries are mentioned, otherwise false."),
});

// Create the parser from the Zod schema
const parser = StructuredOutputParser.fromZodSchema(emergencyDetailsSchema);

export const handleWebhook = async (req, res) => {
    const { message } = req.body;

    if (message && message.type === 'end-of-call-report') {
        const { call, summary, transcript, phoneNumber } = message;
        const { sosId } = call.metadata;
        const requesterName = phoneNumber.name;
        const conciseIssue = summary;

        try {
            console.log("transcript", transcript);
            // Create the prompt and chain for data extraction
            const prompt = PromptTemplate.fromTemplate(
                "You are an expert at extracting specific information from an emergency call transcript.\n{format_instructions}\nTranscript:\n{transcript}"
            );
            const chain = prompt.pipe(llm).pipe(parser);

            // Invoke the chain to get the structured data
            const structuredResponse = await chain.invoke({
                transcript: transcript,
                format_instructions: parser.getFormatInstructions(),
            });

            console.log("Structured Data Extracted:", structuredResponse);

            // Find the document, update it, and return the new version
            const updatedSOS = await SOSRequest.findByIdAndUpdate(sosId, {
                status: 'InProgress',
                name: requesterName,
                issue: conciseIssue,
                transcript: transcript,
                reportedLocation: structuredResponse.reportedLocation,
                peopleCount: structuredResponse.peopleCount,
                hasInjuries: structuredResponse.hasInjuries,
            }, { new: true }); // { new: true } returns the updated document

            console.log(`SOS record updated for call: ${call.id}`);

            // Use the io instance from the request to push the final data to all clients
            if (req.io) {
                req.io.emit('sosUpdate', updatedSOS);
                console.log("Pushed 'sosUpdate' event via WebSocket.");
            }

            res.status(200).send('Webhook processed successfully.');
        } catch (error) {
            console.error('Failed to process transcript or update SOS record:', error);
            res.status(500).send('Error processing webhook.');
        }
    } else {
        res.status(200).send('Webhook received.');
    }
};