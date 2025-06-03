const Section =require("../models/Section");
const Course=require("../models/Coursemodel");

exports.createSection=async(req,res)=>{
    try{
        // data fetching 
        const{sectionName,courseId} =req.body;// course id is used for validation and sectionName is taken so that db mein entry create kr sake
//  data validation
if(!sectionName || !courseId){
    return res.status(400).json({
        success:false,
        message:"missing properties",
    });
}
// create section
        const newSection =await Section.create({sectionName});
// update course with section ObjectId
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent:newSection._id,

                }
            },
            {new:true},// updated response milta h 
        );
        // home work use populate in such a way that we can populate section and subsection at the same time 
        //  return response
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCourseDetails,
        }) 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section , please try again",
            error:error.message,
        });

    }
}
exports.updateSection=async(req,res)=>{
    try{
        //  data input
const {sectionName,sectionId}=req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }

        // update data 
        const section =await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        // return response 
        return res.status(200).json({
            success:true,
            message:"Section Updated Successfully",
        });  


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section , please try again",
            error:error.message,
        });
    }
}

exports.deleteSection =async(req,res)=>{
    try{
        //  get id - assuming that we are sending Id in params
        const {sectionId}=req.params

        // use find by id and delete 
         await Section.findByIdAndDelete(sectionId);
        //  do we need to delete entry from course schema  
        // return response 
        return response.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section , please try again",
            error:error.message,
        });
    }
}



