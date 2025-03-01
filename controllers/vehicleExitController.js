const Transaction = require('../models/TransactionSchema');
const ParkingSpot = require('../models/parkingSpot');
const logger = require('../logger');

const vehicleExit = async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        const transaction = await Transaction.findOne({ 
            vehicleNumber: vehicleNumber.trim(),  
            exitTime: { $exists: false }  
        }).sort({ entryTime: -1 });
        console.log(transaction);

        if (!transaction) {
            logger.warn(`Exit attempt failed: No active parking record found for ${vehicleNumber}`);
            return res.status(400).json({ message: "No active parking record found" });
        }

        const exitTime = new Date();
        const entryTime = transaction.entryTime;
        const duration = exitTime - entryTime;
        const durationInHours = Math.ceil(duration / (1000 * 60 * 60));

        const rates = {
            motorcycle: 10,
            car: 20,
            bus: 30
        };
        const vehicleType = transaction.vehicleType;
        const ratePerHour = rates[vehicleType] || 20;

        const fee = ratePerHour * durationInHours;

        const spot = await ParkingSpot.findById(transaction.parkingSpot);
        if (spot) {
            spot.status = 'available';
            await spot.save();
        }

        transaction.exitTime = exitTime;
        transaction.fee = fee;
        await transaction.save();

        logger.info(`Vehicle ${vehicleNumber} exited. Duration: ${durationInHours} hrs, Fee: Γé╣${fee}`);

        res.status(200).json({
            message: "Vehicle exit successful",
            durationInHours,
            totalFee: fee
        });

    } catch (error) {
        logger.error(`Error in vehicle exit: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { vehicleExit };
