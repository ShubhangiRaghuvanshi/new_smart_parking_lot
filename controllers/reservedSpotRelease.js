const ParkingSpot = require('../../models/parkingSpot');
const logger = require('../../logger');
const reservedSpotRelease = async () => {
    const now = new Date();
        await ParkingSpot.updateMany(
            { status: 'reserved', reservedUntil: { $lte: now } },
            { status: 'available', reservedUntil: null }
        );
        setInterval(reservedSpotRelease, 5 * 60 * 1000);
    }


