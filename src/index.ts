import express from 'express';
import DBconnect from './db';
import bodyParser from 'body-parser';
import dotenv from "dotenv";


const PORT = 3000;
const app = express();

// Connect to the database first
DBconnect();

// dotnev config 
dotenv.config();

// Middleware
app.use(bodyParser.json()); // Parse application/json

// Routes
import {
    routerUser,
    customerUser,
    leadRoute,
    taskRoute
} from './routes/userRoute';

app.use('/api/v1/users', routerUser); // Better RESTful route prefix
app.use('/api/v1/customer', customerUser);
app.use('/api/v1/lead', leadRoute);
app.use('/api/v1/task', taskRoute);



// Default Route (keep this last to avoid route conflict)
app.get('/', (req, res) => {
    res.send("<h1>This is the express app</h1>");
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
