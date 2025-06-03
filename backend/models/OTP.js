const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPSchema =new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,

    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
});

// we have make function for sending otp 
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"verification Email from AKASH SINGH ",otp);
        console.log("email sent successfully", mailResponse);

    }
    catch(error){
        console.log("error occured while sending mails : ",error);
        throw error;

    }
}
// pre-save middleware 
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next(); 

} )

// this pre-save(mail sned krne ka kaam) middleware is called before otp.create method 

module.exports=mongoose.model("OTP",OTPSchema);
