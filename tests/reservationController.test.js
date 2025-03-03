// tests/reservationController.test.js
const { reservedSpot } = require('../controllers/reservationController');
const mongoose = require('mongoose');
const ParkingSpot = require('../models/parkingSpot');
const { getIo } = require('../socket');

jest.mock('../models/parkingSpot'); // Mock ParkingSpot model
jest.mock('../socket'); // Mock the socket IO module

describe('ParkingSpot Controller - reservedSpot', () => {

  let req, res, io, mockSession;

  beforeEach(() => {
    req = {
      body: {
        vehicleNumber: 'AB123CD',
        vehicleType: 'car',
        duration: 120 // 2 hours
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    io = {
      emit: jest.fn(),
    };

    // Mock getIo to return the mock io object
    getIo.mockReturnValue(io);

    // Mock mongoose session methods to ensure they're tracked
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    // Mock mongoose.startSession() to return the mock session object
    mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully reserve a parking spot', async () => {
    const spot = {
      spotID: 'A123',
      status: 'available',
      size: 'car',
    };

    // Mock the findOneAndUpdate method to simulate finding and updating a spot
    ParkingSpot.findOneAndUpdate.mockResolvedValue({
      ...spot,
      status: 'reserved',
      reservedUntil: new Date(Date.now() + 120 * 60000), // 2 hours later
    });

    await reservedSpot(req, res);

    // Ensure that ParkingSpot.findOneAndUpdate was called with the correct parameters
    expect(ParkingSpot.findOneAndUpdate).toHaveBeenCalledWith(
      { status: 'available', size: 'car' },
      expect.objectContaining({
        status: 'reserved',
        reservedUntil: expect.any(Date),
      }),
      { new: true, session: mockSession }
    );

    // Ensure session commit and end session methods were called
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();

    // Ensure socket.io emit method was called
    expect(io.emit).toHaveBeenCalledWith('spotReserved', expect.objectContaining({
      spotID: 'A123',
      reservedUntil: expect.any(Date),
    }));

    // Check the response
    expect(res.json).toHaveBeenCalledWith({
      message: 'Spot reserved successfully',
      spotID: 'A123',
      reservedUntil: expect.any(Date),
    });
  });

  it('should return an error if no available spots are found', async () => {
    // Mock ParkingSpot.findOneAndUpdate to return null (no available spots)
    ParkingSpot.findOneAndUpdate.mockResolvedValue(null);

    await reservedSpot(req, res);

    // Ensure the session is aborted in case of error
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();

    // Check the error response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No available spots' });
  });

  it('should return an error if there is a server issue during the transaction', async () => {
    const error = new Error('Database error');

    // Mock ParkingSpot.findOneAndUpdate to throw an error
    ParkingSpot.findOneAndUpdate.mockRejectedValue(error);

    await reservedSpot(req, res);

    // Ensure the session is aborted in case of error
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();

    // Check the error response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
  });

  it('should emit the spotReserved event', async () => {
    const spot = {
      spotID: 'A123',
      status: 'available',
      size: 'car',
    };

    // Mock the findOneAndUpdate method to simulate finding and updating a spot
    ParkingSpot.findOneAndUpdate.mockResolvedValue({
      ...spot,
      status: 'reserved',
      reservedUntil: new Date(Date.now() + 120 * 60000),
    });

    await reservedSpot(req, res);

    // Ensure socket.io emit was called to emit the event
    expect(io.emit).toHaveBeenCalledWith('spotReserved', {
      spotID: 'A123',
      reservedUntil: expect.any(Date),
    });
  });

});

