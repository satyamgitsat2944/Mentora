// we have use middleware so that db mein entry create hone sein phale midlewares  jaake intercept kree aur otp verification krle 
const jwt =require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/Usertemp");


// auth 
exports.auth= async(req,res,next)=>{
    try{
        // extract token : 3 types 
        const  token=rq.cookies.token||req.body.token||req.header("Authorisation").replace("Bearer","");
// if token missing , then return response 
if(!token){
    return res.status(401).json({
        success:false,
        message:"Token is missing",
    });
}

// verify the token  on the basis secret key 
try{
    const decode =await jwt.verify( token,process.env.JWT_SECRET);
    console.log(decode);
    req.user=decode;// user(payload) ko khud sein add kiye h taaki baad mein email id ko fetch kr sake 
} 
catch(error){
    // verification -issues 
    return res.status(401).json({
        success:false,
        message:"token is invalid",

    });
}
next();// going to next middleware 

    }
    catch(error){ 
        return res.status(401).json({
            success:false,
            message:"something went wrong while validating the token ",

        });

    }

}
// isStudent
exports.isStusdent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for students only ",

            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified , please try again",
        });
    }
}

// is Instructor 
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="isInstructor"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for instructor only ",

            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified , please try again",
        });
    }
}

// isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="isAdmin"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for admin only ",

            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"user role cannot be verified , please try again",
        });
    }
}


 






