const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: false 
    },
    vehicleType: {
        type: String,
        enum: ['motorcycle', 'car', 'bus'],
        required: true
    },
    parkingSpot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSpot',
        required: true
    },
    entryTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    exitTime: {
        type: Date
    },
    fee: {
        type: Number
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);

