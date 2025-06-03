// frontend ka link aayega email pr for reseting password 
const user=require("../models/Usertemp");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");

// resetPasswordTOken 
exports.resetPasswordToken= async(req,res)=>{
    try{
        // password reset krne aaye ho
    // get email from req ki body
    const email= req.body.email;
    // check user for this email, email validation 
    const user=await UserActivation.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"Your Email is not registered with us "
        });
    }
    //  generally backend 4000 port pr chalate h and frontend 3000 port pr chalate h  

   

// generate token and add token generated and expiresTime for each user jiske adhar pr wo ui pr jaake apne password ko update krskta h
     const token =crypto.randomUUID();

// update user by adding token and expiration time 
const updatedDetails=await user.findOneAndUpdate({email:email},
    {
        token:token,
        resetPasswordToken:Date.now()+5*60*1000,
    },
    {
        new:true // updated document will return in response 
    }
);

 // how to generate link for frontend 
 const url='http://localhost:3000/update-password/${token}'// here ${token} is the differentiating token jisse alag alag link banenge 

// send mail containing the url of the ui jaha jaake password reset krna h  
await mailSender(email,"Password Reset Link",
    "Password Reset Link :${url}",
); 
// return response 
return res.json({
    success:true,
    message:"Email sent successfully , please check email and change password ",
});

    }
    catch(error){
        console.log(error);
        return   res.status(500).json({
            success:false,
            message:"Something went wrong while reset password mail",
        })

    }
}
//reset password jo db mein create hoga 
// new password will come in reset password mein
exports.resetPassword=async(req,res)=>{
    try{
        // data fetch 
    const {password,confirmPassword,token}=req.body;  // here this token is given in request ki body by frontend part not by us , matlab hmmloge ne req.body me token nhi daala but we take as argument in order to get details 
    // validation 
    if(password!==confirmPassword){
      return res.json({
          success:false,
          message:"password not matching",
      });
}
// we have given token in user so that we can fetch user ki entry or user details from db so that password ko update kr sake 
const userDetails=await user.findOne({token:token});
  // if no entry-invalid token
  if(!userDetails){
      return res.json({
          success:false,
          message:"Token is Invalid ",
      });
  } 
  // also invalid token hone ka dusra reason is time expired hogya 
if(userDetails.resetPasswordExpires<Date.now()){
  return res.json({
      success:false,
      message:"Token is expired, please regenerate your token",

  });
}

  // hashed password 
  const hashedPassword=await bcrypt.hash(password,10);
  // password update 
  await user.findOneAndUpdate({token:token},
      {password:hashedPassword},
      {new:true},

  );
  // return response
  return res.status(200).json({
      success:true,
      message:"Password reset successfully",
  });
   
    }
    catch(error){

    }


}  








