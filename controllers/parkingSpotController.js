const ParkingSpot = require('../models/parkingSpot');

const addParkingSpot = async (req, res) => {
    try {
        const { spotID, status, size, floorNumber } = req.body;
        const existingSpot = await ParkingSpot.findOne({ spotID });
        if (existingSpot) {
            return res.status(400).json({ message: "Spot already exists" });
        }
        const newSpot = new ParkingSpot({ spotID, status, size, floorNumber });
        await newSpot.save();
        res.status(201).json({ message: "Spot added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const updateParkingSpot = async (req, res) => {
    try {
        const spotID = req.params.spotID;
        const { status } = req.body;
        const spot = await ParkingSpot.findOne({ spotID }); 
        if (!spot) {
            return res.status(400).json({ message: "Spot not found" });
        }
        if (status && status !== 'available' && status !== 'occupied') {
            return res.status(400).json({ message: "Invalid status. It must be either 'available' or 'occupied'." });
        }
        spot.status = status || spot.status;
        await spot.save();
        res.json({ message: "Spot updated successfully", spot });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const getParkingSpots = async (req, res) => {
    try {
        const spots = await ParkingSpot.find();
        res.json(spots);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { addParkingSpot, updateParkingSpot, getParkingSpots };
