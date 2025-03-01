const express=require('express');
const {registerUser,loginUser, getUserProfile}=require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router=express.Router();

console.log("user routes");
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile',authMiddleware,getUserProfile)

module.exports=router;
