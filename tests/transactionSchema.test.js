const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Transaction = require('../models/TransactionSchema'); 
const ParkingSpot = require('../models/parkingSpot');

let mongoServer;

beforeAll(async () => {

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
 
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Transaction Model', () => {
  
  let parkingSpotId;

  beforeAll(async () => {
 
    const parkingSpot = new ParkingSpot({
      spotID: 'A1',
      size: 'car',
      floorNumber: 1,
    });
    await parkingSpot.save();
    parkingSpotId = parkingSpot._id;
  });

  it('should create a new transaction', async () => {
    const transaction = new Transaction({
      vehicleNumber: 'ABC123',
      vehicleType: 'car',
      parkingSpot: parkingSpotId,
      entryTime: new Date(),
      fee: 10,
    });

    const savedTransaction = await transaction.save();
    
    expect(savedTransaction.vehicleNumber).toBe('ABC123');
    expect(savedTransaction.vehicleType).toBe('car');
    expect(savedTransaction.parkingSpot.toString()).toBe(parkingSpotId.toString());
    expect(savedTransaction.entryTime).toBeTruthy();
    expect(savedTransaction.fee).toBe(10);
  });

  it('should not create a transaction without vehicleNumber', async () => {
    const transaction = new Transaction({
      vehicleType: 'car',
      parkingSpot: parkingSpotId,
      entryTime: new Date(),
      fee: 10,
    });

    await expect(transaction.save()).rejects.toThrow('vehicleNumber: Path `vehicleNumber` is required.');
  });

  it('should not create a transaction with an invalid vehicleType', async () => {
    const transaction = new Transaction({
      vehicleNumber: 'XYZ456',
      vehicleType: 'truck', 
      parkingSpot: parkingSpotId,
      entryTime: new Date(),
      fee: 15,
    });

    await expect(transaction.save()).rejects.toThrow('vehicleType: `truck` is not a valid enum value for path `vehicleType`.');
  });

  it('should update exitTime when transaction is completed', async () => {
    const transaction = new Transaction({
      vehicleNumber: 'XYZ789',
      vehicleType: 'motorcycle',
      parkingSpot: parkingSpotId,
      entryTime: new Date(),
    });

    const savedTransaction = await transaction.save();

  
    savedTransaction.exitTime = new Date();
    const updatedTransaction = await savedTransaction.save();

    expect(updatedTransaction.exitTime).toBeTruthy();
  });

  it('should have a default fee value of undefined', async () => {
    const transaction = new Transaction({
      vehicleNumber: 'LMN123',
      vehicleType: 'bus',
      parkingSpot: parkingSpotId,
      entryTime: new Date(),
    });

    const savedTransaction = await transaction.save();
    expect(savedTransaction.fee).toBeUndefined();
  });

});

