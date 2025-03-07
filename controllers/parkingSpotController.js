const ParkingSpot = require('../models/parkingSpot');

// Add a new parking spot
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

// Get all parking spots
const getParkingSpots = async (req, res) => {
    try {
        const spots = await ParkingSpot.find();
        res.json(spots);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Update parking spot status
const updateParkingSpot = async (req, res) => {
    try {
        const { spotID, status } = req.body;

        if (!spotID || !status) {
            return res.status(400).json({ message: "spotID and status are required" });
        }

        const updatedSpot = await ParkingSpot.findOneAndUpdate(
            { spotID },
            { status },
            { new: true }
        );

        if (!updatedSpot) {
            return res.status(404).json({ message: "Parking spot not found" });
        }

        res.json({ message: "Parking spot updated", updatedSpot });
    } catch (error) {
        console.error("❌ Error updating parking spot:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { addParkingSpot, getParkingSpots, updateParkingSpot };

