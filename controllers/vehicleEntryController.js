
const Transaction = require('../models/TransactionSchema');
const allocateParkingSpot = require('../utils/allocateParkingSpot'); 
const logger = require('../logger');
const { getIo } = require('../socket'); 

const vehicleEntry = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType } = req.body;

 
        const result = await allocateParkingSpot(vehicleType);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        const { spot, price } = result;

       
        const transaction = new Transaction({
            vehicleNumber,
            vehicleType,
            parkingSpot: spot._id,
            entryTime: new Date(),
            price
        });

        await transaction.save();

        logger.info(`Vehicle ${vehicleNumber} entered. Assigned Spot: ${spot.spotID}`);

        // Emit vehicle entry event via Socket.IO
        const io = getIo(); // ≡ƒæê Get the Socket.IO instance
        io.emit('vehicleEntry', { 
            vehicleNumber, 
            spotID: spot.spotID, 
            price, 
            transactionID: transaction._id 
        });

        res.status(201).json({ 
            message: "Vehicle entry successful", 
            spotID: spot.spotID, 
            price, 
            transactionID: transaction._id 
        });

    } catch (error) {
        logger.error("Error in vehicle entry: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { vehicleEntry };
