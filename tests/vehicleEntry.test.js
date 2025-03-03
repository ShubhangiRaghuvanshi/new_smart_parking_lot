const { vehicleEntry } = require('../controllers/vehicleEntryController');
const allocateParkingSpot = require('../utils/allocateParkingSpot');
const Transaction = require('../models/TransactionSchema');
const logger = require('../logger');
const { getIo } = require('../socket');

jest.mock('../utils/allocateParkingSpot');
jest.mock('../models/TransactionSchema');
jest.mock('../logger');
jest.mock('../socket');

describe('vehicleEntry', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                vehicleNumber: 'AB123CD',
                vehicleType: 'car'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully create a transaction and return a success response', async () => {
        const spot = { _id: 'spot123', spotID: 'SP001' };
        const price = 100;
        
        // Mock the allocateParkingSpot function
        allocateParkingSpot.mockResolvedValue({
            success: true,
            spot,
            price
        });

        // Mock the Transaction schema save method
        Transaction.prototype.save = jest.fn().mockResolvedValue(true);

        const mockIo = { emit: jest.fn() };
        getIo.mockReturnValue(mockIo);

        await vehicleEntry(req, res);

        // Assert that the response status is 201
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Vehicle entry successful',
            spotID: spot.spotID,
            price,
            transactionID: expect.any(String)
        });

        // Assert that the transaction save method was called
        expect(Transaction.prototype.save).toHaveBeenCalled();

        // Assert that the socket emit method was called
        expect(mockIo.emit).toHaveBeenCalledWith('vehicleEntry', {
            vehicleNumber: req.body.vehicleNumber,
            spotID: spot.spotID,
            price,
            transactionID: expect.any(String)
        });

        // Assert that logger info was called
        expect(logger.info).toHaveBeenCalledWith(
            `Vehicle ${req.body.vehicleNumber} entered. Assigned Spot: ${spot.spotID}`
        );
    });

    it('should return an error response if no parking spot is available', async () => {
        // Mock the allocateParkingSpot function to return failure
        allocateParkingSpot.mockResolvedValue({
            success: false,
            message: 'No available parking spots'
        });

        await vehicleEntry(req, res);

        // Assert that the response status is 400
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No available parking spots'
        });
    });

    it('should return a server error response if an exception occurs', async () => {
        // Simulate an error during parking spot allocation
        allocateParkingSpot.mockRejectedValue(new Error('Database connection error'));

        await vehicleEntry(req, res);

        // Assert that the response status is 500
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Internal server error'
        });

        // Assert that the logger error was called
        expect(logger.error).toHaveBeenCalledWith('Error in vehicle entry: Database connection error');
    });
});

