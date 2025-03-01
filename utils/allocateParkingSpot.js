const mongoose = require('mongoose');
const ParkingSpot = require('../models/parkingSpot');
const logger = require('../logger');

const allocateParkingSpot = async (vehicleType) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let preferredSizes = [];
        if (vehicleType === "motorcycle") {
            preferredSizes = ["motorcycle", "car", "bus"];
        } else if (vehicleType === "car") {
            preferredSizes = ["car", "bus"];
        } else if (vehicleType === "bus") {
            preferredSizes = ["bus"];
        }

        const now = new Date();


        const spot = await ParkingSpot.findOneAndUpdate(
            {
                status: "available",
                size: { $in: preferredSizes },
                $or: [
                    { reservedUntil: null },
                    { reservedUntil: { $lte: now } }
                ]
            },
            { status: "occupied" },
            { new: true, session }
        );

        if (!spot) {
            logger.warn("No available spots for vehicle type: " + vehicleType);
            throw new Error("No available spots.");
        }


        let baseRate = 0;
        if (spot.size === "motorcycle") {
            baseRate = 10;
        } else if (spot.size === "car") {
            baseRate = 20;
        } else if (spot.size === "bus") {
            baseRate = 50;
        }

        let demandFactor = Math.random() < 0.5 ? 1 : 1.5;
        let price = baseRate * demandFactor;

        await session.commitTransaction();
        session.endSession();

        logger.info("Allocated spot: " + spot.spotID + " to vehicle type: " + vehicleType);

        return { success: true, spot: spot, price: price };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error("Error in spot allocation: " + error.message);
        return { success: false, message: error.message };
    }
};
module.exports = allocateParkingSpot;

