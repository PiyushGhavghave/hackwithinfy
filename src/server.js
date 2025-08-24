import "dotenv/config";
import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import http from 'http'; // Import the native http module
import { Server } from 'socket.io'; // Import the Server class from socket.io

// --- Import your routes ---
import sosRoutes from './routes/sos.routes.js';
import vapiWebhookRoutes from './routes/vapi.webhook.routes.js';
import getDataRoutes from './routes/getData.routes.js';

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app
const io = new Server(server, { // Attach Socket.IO to the HTTP server
    cors: {
        origin: "*", // Allow connections from any origin
        methods: ["GET", "POST"]
    }
});

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Make the `io` instance available to your controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
    console.log('A client has connected via WebSocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));

// --- API Routes ---
app.use('/api/sos', sosRoutes);
app.use('/api/vapi', vapiWebhookRoutes);
app.use('/api/sos-requests', getDataRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to the Disaster Control API");
});

const PORT = process.env.PORT || 3000;
// Use the `server` to listen, which handles both Express and Socket.IO
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});