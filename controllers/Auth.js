const User=require("../models");
const OTP =require("../models/OTP");
const otpGenerator=require("otp-generator");
const profile = require("../models/Profile");
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");
require("dotenv").config();

// send otp
//  send otp function actually create new otp(true otp) and store it in db so that we can further match with otp send by user 
// aur ek otp user jb signup krega us samay milega email pr 
exports.sendOTP=async(req,res)=>{
    try{
    // fetch email from request ki body
    const {email}=req.body;
    // check if user already exist , db call 
    const checkUserPresent=await User.findOne({email});
    // if user already exists 
    if(checkUserPresent){
        return res.status(401).json({
            success:true,
            message:"user already registered",
        })
    }
    // also you can add email validation 
    
    // generate otp : 6 length otp 
    var otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("OTP generated :", otp);

    // check unique otp or not 
    const result =await OTP.findOne({otp:otp});

    //if we get otp from the data base we continue generating new unique otps 
    while(result){
        otp=otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        });
        result=await OTP.findOne({otp:otp});
    }
// on creating unique otp create entry in db
    const otpPayload={email,otp};// here we didn't used the createdat , but it takes default value 

    // create an entry in db 
    const otpBody=await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successfully 
    res.status(200).json({
        success:true,
        message:"OTP Sent Successfully",
        otp,
    })
}
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }   
}

// signup
exports.signUp=async(req,res)=>{
    try{
        //data fetch from request ki body 
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp

    }=req.body;

    // validate krlo
    if(!firstName || !lastName || !email || !password|| !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are not filled correctly , kindly check it ! ",
        })
    }
    // 2 password match krlo(password and confirm password )
    if(password!=confirmPassword){
        return res.ststus(400).josn({
            success:false,
            message:"Password and confirmPassword value doesn't match , please try it again",
        });
}
    // check user already exist or not 
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:"user is already registerd",
         });
    }


    // find most recent OTP stored for the user 
    const recentOtp =await OTP.find({email}).sort({createdAt:-1}.limit(1));
//     Descending Order (-1): Sorting by createdAt: -1 means that the most recent OTP (the one with the latest createdAt timestamp) will appear first. This is because -1 sorts from highest to lowest.
// Fetching the Latest OTP: Since the OTPs are sorted in descending order, calling .limit(1) will retrieve only the latest OTP entry for the given email.
  console.log(recentOtp);

// validate OTP
if(recentOtp.length==0){
    // otp not found 
    return res.status(400).json({
        success:false,
        message:"OTP FOUND",
    })
}
else if(otp!=recentOtp.otp){
    // invalid otp
    return res.status(400).json({
        success:false,
        message:"Invalid OTP",
    })
}
// hash password
    const hashedPassword=await bcrypt.hash(password,10);
 // entry create in DB which contain null so that we can use save function to create entry in db
    const profileDetails =await profile.create({
        gender:null,
        dateofbirth:null,
        about:null,
        contactNumber:null,
    });

    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        additionalDetails:profileDetails._id,
        image:'https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}',

        // https://www.dicebear.com/how-to-use/http-api/   site for image generation
    })

    // return response
    return res.status(200).json({
        success:true,
        message:"User is registered successfully ",
        user,
    });

}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"uaer cannot registered , please try again",
    })

}}
// login 
exports.login=async(req,res)=>{
    try{
        //  get data from req body 
        const {email,password}=req.body;
        // validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required , please try again"

            })

        }
        
        // user not registered or sign up kiya h ki nhi 
        const user=await User.findOne({email}.populate("additionalDetails"));// check why we have used populate here , we use it here taki additionalDetails{yha pr reference ki tarah use hua h} wale model sein bhi data ko fetch kr paye 
        // for example when we comment in blog website in userroute we can only see id of comments but in case of if we want comments also then we have to use populate also 
        //  yha pr hmmlog user wala model pr populate lga rahe 
        if(!user){
            return res.status(401).json({
                success:false,
                message:"You have not registered , please Signup first",
            });

        }

        // generate JWT token , after password  matching 
        if(await bcrypt.compare(password,user.password) ){
            const payload={
                email:user.email,
                id:user._id,
                role:user.role,
            }

            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token=token;
            user.password=undefined;
            // create cookies  and send response
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,

            } 
            res.cookie("token",token,options).status(240).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else{
            // if password is not matching
            return  res.status(401).json({
                success:false,
                message:"Password is incorrect"
            });
        }

        // create cookie and send response 


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure ,please try again",

        })
    }

};


// change password 
exports.changePassword=async(req,res)=>{
    // get data from req body 
    const {newpassword,confirmnewpassword,oldpassword}=req.body;
    // validation data
    if(!confirmnewpassword || !newpassword || !oldpassword){
        return res.status(403).json({
            success:false,
            message:"All fields are required , please try again"
        })

    }
    // get oldpassword , newpassword , confirm new password 
    // validation 


    // update pwd in db 
    // send mail -password updated 
    // return response 
}







