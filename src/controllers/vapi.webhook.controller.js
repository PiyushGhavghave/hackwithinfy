import SOSRequest from "../models/sosRequest.model.js";

import { ChatGroq } from '@langchain/groq';
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod"

import "dotenv/config"

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const emergencyDetailsSchema = z.object({
    // This is the only line that has been changed
    reportedLocation: z.string().describe("The name of the city, town, or major area the user mentions (e.g., 'Pune', 'Kothrud'). If no specific place name is mentioned, state 'Not specified'."),
    peopleCount: z.number().describe("The total number of people needing help. Default to 1 if not mentioned."),
    hasInjuries: z.boolean().describe("Whether anyone is injured. Set to true if injuries are mentioned, otherwise false."),
});

const parser = StructuredOutputParser.fromZodSchema(emergencyDetailsSchema);

export const handleWebhook = async (req, res) => {
    const { message } = req.body;

    if (message && message.type === 'end-of-call-report') {
        const { call, summary, transcript, phoneNumber } = message;
        const { sosId } = call.metadata;
        const requesterName = phoneNumber.name;
        const conciseIssue = summary;

        try {
            const prompt = PromptTemplate.fromTemplate(
                "You are an expert at extracting specific information from an emergency call transcript.\n{format_instructions}\nTranscript:\n{transcript}"
            );
            const chain = prompt.pipe(llm).pipe(parser);

            const structuredResponse = await chain.invoke({
                transcript: transcript,
                format_instructions: parser.getFormatInstructions(),
            });

            console.log("Structured Data Extracted:", structuredResponse);

            await SOSRequest.findByIdAndUpdate(sosId, {
                status: 'InProgress',
                name: requesterName,
                issue: conciseIssue,
                transcript: transcript,
                reportedLocation: structuredResponse.reportedLocation, // Save the extracted place name
                peopleCount: structuredResponse.peopleCount,
                hasInjuries: structuredResponse.hasInjuries,
            });

            console.log(`SOS record updated for call: ${call.id}`);
            res.status(200).send('Webhook processed successfully.');
        } catch (error) {
            console.error('Failed to process transcript or update SOS record:', error);
            res.status(500).send('Error processing webhook.');
        }
    } else {
        res.status(200).send('Webhook received.');
    }
};