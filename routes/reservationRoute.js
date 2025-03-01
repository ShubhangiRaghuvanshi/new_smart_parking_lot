const express = require('express');
const router = express.Router();
const {reservedSpot} = require('../controllers/reservationController');
router.post('/reserve',reservedSpot);
module.exports = router;
