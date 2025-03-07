const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    
    phoneno:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','attendant','customer'],
        required:true
    }
},{timestamps:true});
UserSchema.pre('save',async function(next){
   if(!this.isModified('password')){
     return  next();
   }
   this.password=await bcrypt.hash(this.password,10);   
    next();
});
const user = mongoose.model('User', UserSchema);
module.exports=user;
