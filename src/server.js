import "dotenv/config";
import express from 'express';
import mongoose from "mongoose";

// --- Import your routes using ES Module syntax ---
import sosRoutes from '../src/routes/sos.routes.js';
import vapiWebhookRoutes from '../src/routes/vapi.webhook.routes.js';

const app = express();
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));

// --- Use the imported routes ---
app.use('/api/sos', sosRoutes);
app.use('/api/vapi', vapiWebhookRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to the Disaster Control API");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});