const mongoose = require('mongoose');
const ParkingSpotSchema = new mongoose.Schema({
    spotID: {
        type: String,
        required: true,
        unique: true
    },
    size: {
        type: String,
        enum: ['motorcycle', 'car', 'bus'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied','reserved'],
        default: 'available'
    },
  
    floorNumber: {
        type: Number,
        required: true
    },
    reservedUntil: { type: Date, default: null }
});

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
