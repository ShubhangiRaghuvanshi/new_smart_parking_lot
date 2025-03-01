const express = require('express');
const { vehicleEntry } = require('../controllers/vehicleEntryController');
const { vehicleExit } = require('../controllers/vehicleExitController');

const router = express.Router();


router.post('/checkin', vehicleEntry);


router.post('/checkout', vehicleExit);

module.exports = router;
