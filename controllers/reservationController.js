const { getIo } = require('../socket');
const mongoose = require('mongoose');
const ParkingSpot = require('../models/parkingSpot');

const reservedSpot = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { vehicleNumber, vehicleType, duration } = req.body;
        const expiryTime = new Date(Date.now() + duration * 60000);

        const spot = await ParkingSpot.findOneAndUpdate(
            { status: 'available', size: vehicleType },
            { status: 'reserved', reservedUntil: expiryTime },
            { new: true, session }
        );

        if (!spot) {
            throw new Error('No available spots');
        }

        await session.commitTransaction();
        session.endSession(); 

      
        const io = getIo();
        io.emit('spotReserved', { spotID: spot.spotID, reservedUntil: expiryTime });

        res.json({ message: 'Spot reserved successfully', spotID: spot.spotID, reservedUntil: expiryTime });
    } catch (error) {
        await session.abortTransaction();
        session.endSession(); 

        res.status(400).json({ message: error.message });
    }
};

module.exports = { reservedSpot };
