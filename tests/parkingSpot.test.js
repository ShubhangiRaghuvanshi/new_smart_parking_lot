const mongoose = require('mongoose');
const ParkingSpot = require('../models/parkingSpot'); 
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('ParkingSpot Model', () => {
  it('should create and save a parking spot successfully', async () => {
    const parkingSpotData = {
      spotID: 'A1',
      size: 'car',
      status: 'available',
      floorNumber: 1,
    };

    const parkingSpot = new ParkingSpot(parkingSpotData);
    const savedParkingSpot = await parkingSpot.save();

    expect(savedParkingSpot._id).toBeDefined();
    expect(savedParkingSpot.spotID).toBe(parkingSpotData.spotID);
    expect(savedParkingSpot.size).toBe(parkingSpotData.size);
    expect(savedParkingSpot.status).toBe(parkingSpotData.status);
    expect(savedParkingSpot.floorNumber).toBe(parkingSpotData.floorNumber);
    expect(savedParkingSpot.reservedUntil).toBeNull();
  });

  it('should throw an error if spotID is missing', async () => {
    const parkingSpotData = {
      size: 'car',
      status: 'available',
      floorNumber: 1,
    };

    try {
      const parkingSpot = new ParkingSpot(parkingSpotData);
      await parkingSpot.save();
    } catch (error) {
      expect(error.errors.spotID).toBeDefined();
    }
  });

  it('should throw an error if size is invalid', async () => {
    const parkingSpotData = {
      spotID: 'B1',
      size: 'truck', // Invalid size
      status: 'available',
      floorNumber: 1,
    };

    try {
      const parkingSpot = new ParkingSpot(parkingSpotData);
      await parkingSpot.save();
    } catch (error) {
      expect(error.errors.size).toBeDefined();
    }
  });

  it('should default status to "available" if no status is provided', async () => {
    const parkingSpotData = {
      spotID: 'C1',
      size: 'bus',
      floorNumber: 2,
    };

    const parkingSpot = new ParkingSpot(parkingSpotData);
    const savedParkingSpot = await parkingSpot.save();

    expect(savedParkingSpot.status).toBe('available');
  });

  it('should allow status to be set to "reserved"', async () => {
    const parkingSpotData = {
      spotID: 'D1',
      size: 'motorcycle',
      status: 'reserved',
      floorNumber: 1,
      reservedUntil: new Date(),
    };

    const parkingSpot = new ParkingSpot(parkingSpotData);
    const savedParkingSpot = await parkingSpot.save();

    expect(savedParkingSpot.status).toBe('reserved');
    expect(savedParkingSpot.reservedUntil).toBeDefined();
  });
});
