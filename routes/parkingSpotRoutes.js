
const {addParkingSpot,updateParkingSpot,getParkingSpots}=require('../controllers/parkingSpotController');
const express=require('express');
const router=express.Router();
router.post('/addParkingSpot',addParkingSpot);
router.put('/updateParkingSpot/:spotID',updateParkingSpot);
router.get('/getParkingSpots',getParkingSpots);
module.exports=router;
