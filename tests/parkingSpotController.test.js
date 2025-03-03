const { addParkingSpot, getParkingSpots } = require('../controllers/parkingSpotController');
const ParkingSpot = require('../models/parkingSpot');

jest.mock('../models/parkingSpot'); // Mock ParkingSpot model

describe('ParkingSpot Controller', () => {
  
  // Test cases for addParkingSpot
  describe('addParkingSpot', () => {
    it('should add a new parking spot successfully', async () => {
      const newSpot = {
        spotID: 'A123',
        status: 'available',
        size: 'car',
        floorNumber: 1
      };

      // Mock the findOne method to return null (no spot exists)
      ParkingSpot.findOne.mockResolvedValue(null);

      // Mock the save method to return the new spot
      const saveMock = jest.fn().mockResolvedValue(newSpot);
      ParkingSpot.prototype.save = saveMock;

      const req = { body: newSpot };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addParkingSpot(req, res);

      // Check that findOne was called with the correct spotID
      expect(ParkingSpot.findOne).toHaveBeenCalledWith({ spotID: 'A123' });
      // Check that save was called to save the new spot
      expect(saveMock).toHaveBeenCalled();
      // Ensure the correct status code and message are returned
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Spot added successfully' });
    });

    it('should return an error if the spot already exists', async () => {
      const existingSpot = {
        spotID: 'A123',
        status: 'available',
        size: 'car',
        floorNumber: 1
      };

      // Mock findOne to return an existing spot
      ParkingSpot.findOne.mockResolvedValue(existingSpot);

      const req = { body: { spotID: 'A123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addParkingSpot(req, res);

      // Ensure findOne was called
      expect(ParkingSpot.findOne).toHaveBeenCalledWith({ spotID: 'A123' });
      // Ensure the correct error response is sent
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Spot already exists' });
    });

    it('should return server error if something goes wrong', async () => {
      // Mock findOne to throw an error
      const error = new Error('Server error');
      ParkingSpot.findOne.mockRejectedValue(error);

      const req = { body: { spotID: 'A123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addParkingSpot(req, res);

      // Ensure the correct error response is sent
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error });
    });
  });

  // Test cases for getParkingSpots
  describe('getParkingSpots', () => {
    it('should return a list of parking spots', async () => {
      const spots = [
        { spotID: 'A123', status: 'available', size: 'car', floorNumber: 1 },
        { spotID: 'A124', status: 'occupied', size: 'bike', floorNumber: 2 }
      ];

      // Mock find to return a list of spots
      ParkingSpot.find.mockResolvedValue(spots);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getParkingSpots(req, res);

      // Ensure find was called to get all parking spots
      expect(ParkingSpot.find).toHaveBeenCalled();
      // Check if the response contains the spots
      expect(res.json).toHaveBeenCalledWith(spots);
    });

    it('should return server error if something goes wrong', async () => {
      const error = new Error('Server error');
      ParkingSpot.find.mockRejectedValue(error);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getParkingSpots(req, res);

      // Ensure the correct error response is sent
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error });
    });
  });

});
