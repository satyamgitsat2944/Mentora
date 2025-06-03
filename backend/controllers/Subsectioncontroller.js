const SubSection=require("../models/SubSection");
const Section =require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/Imageuploader");

// create subsection 
exports.createSubSection =async(req,res)=>{
    try{
        // fetch data from req.body
        const{sectionId,title,timeDuration,description}=req.body;

        // extract file/video
        const video=req.files.videoFile;
        // validation 
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required ",
            });
        }
        // upload video to cloudinary , agar video upload hogyi to secure url milega and url bhi fetch krlo
        const uploaddetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // ab data aur url dono milgya toh sub-section create krdo 
        const updateSection=await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:SubSectionDetails._id,
            }
        },
    {new:true})  

    // homework  : log updated section here ,after adding populate query
        // now ek subsection mil gaya toh uss subsection ki id ko section mein insert krna hoga 
           return res.status(200).json({
            success:true,
            message:"Sub section created successfully ",
            updateSection,
        });
}
    catch(error){
        return res.status(500).json({
            success:false,
            mesage:"internal serevr error",
            error:error.message,
        });
         
    }
}

// homework: updatesection and deletesection

// profile is kept in additional details in userSchema section
 





