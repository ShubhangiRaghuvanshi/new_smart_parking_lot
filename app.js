require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { initSocket } = require('./socket');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); 

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const parkingSpotRoutes = require("./routes/parkingSpotRoutes");
const reservationRoutes = require("./routes/reservationRoute");

app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking-spots', parkingSpotRoutes);
app.use('/api/reservations', reservationRoutes);


app.get('/api/data', (req, res) => {
    const data = [
        { name: 'Jan', Occupancy: 40, Revenue: 2400 },
        { name: 'Feb', Occupancy: 30, Revenue: 2210 },
        { name: 'Mar', Occupancy: 20, Revenue: 2290 },
        { name: 'Apr', Occupancy: 27, Revenue: 2000 },
        { name: 'May', Occupancy: 18, Revenue: 2181 },
        { name: 'Jun', Occupancy: 23, Revenue: 2500 },
    ];
    res.json(data);
});

app.get('/', (req, res) => {
    res.send('≡ƒÜù Smart Parking Lot API is running...');
});


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(' MongoDB connected...');
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1); 
    }
};


const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server); 

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(` Server running on http://localhost:${PORT}`);
    });
};

startServer();

module.exports = app;
