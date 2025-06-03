//   as here we have already some profile we just want to update it 
// 
const profile =require("../models/Profile");
const User=require("../models/Usertemp");

exports.updateProfile = async(req,res)=>{
    try{

        //  get data 
        const { dateofbirth="" , about="",contactNumber="", gender}=req.body;

        // get userId
        const id=req.user.id;
        //  validation 
if(!contactNumber || !gender || !id){
    return res.status(400).json({
        success:false,
        message:"All fiels are required ",
    });
}
        //  find profile
   const userdetails=await User.findById(id);
//    we have : user id -> user details -> we get additional details from user details -> now we get profile id from additional details -> profile details from profile id 
   const profileId =userdetails.additionalDetails;

   const profileDetails= await Profile.findById(profileId); 
        // update profile
      profileDetails.dateofbirth =dateofbirth;
      profileDetails.about = about ;
      profileDetails.gender = gender ;
      profileDetails.contactNumber= contactNumber;
       //    as db mein entry create krne ke two ways : first is by using create function directly and second with the help of save method (second method is used when object already created ho)
  await profileDetails.save();
 // here we use  have used  save method kyuki profileDetails name ka object bna pda hua h 

 // return response 
 return res.status({
    success:true,
    message:"Profile updated Successfully ",
    profileDetails,
 });


}catch(error){
    return res.status(500).json({
        success:false,
        error:err.message,
    })

    }
}

// delete account 

exports.deleteAccount =async (req,res) =>{
    try{
//  get id 
const id =req.user.id;
//  validation 
const userdetails =await User.findById(id);
if(!userdetails){
    return res.status(404).json({
    success:false ,
    message:"user not found",
    });
}
//  delete user profile (additional details ko delete kro)
await profile.findByIdAndDelete({_id:userdetails.additionalDetails});// here additional details ke andar hi profile id pda hoga
  
// homework: how we can schedule a deletion job or task and unenrolled user form all enrolled courses 
// crone job padho
//  now delete user 
await User.findByIdAndDelete({_id:id});
//  return response 
 }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"user cannot be deleted successfully",
        });

    }
};

exports.getAllUserDetails =async(req,res)=>{
    try{
 const id = req.user.id;
//  validatio and get user details(by making db call)
const userDetails= await User.findById(id).populate("additionalDetails").exec(); 
//Why we use populate here : as here  we also want to get user ka gender , date of birth which is additional details , SO WE USE POPULATE METHOD
//  return response 
return res.status(200).json({
     success:true,
     message:" User data fetched Successfully",
});
    }
    catch(error){
        return res.status().json({
            success:false,
            message:error.message, 
             
        })

    }
}






