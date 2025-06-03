const course=require("../models/Coursemodel");
const tag=require("../models/tags");
const User=require("../models/Usertemp");

// also we will make image upload function in utility and use it here 
const{uploadImageToCloudinary}=require("../utils/Imageuploader");

//createCourse handler function
exports.createCourse = async(req,res)=>{
    try{
        //   we fetch id from req jo already hmmlogo ne auth.js mein payload mein kr rakha h    
        // fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag}   =req.body;// tag ek id hogi kyuki uske model mein id sein reference kiya gya h
        // get thumbnail
        const thumbnail=req.files.thumbnailImage;
        
        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required ",
            });
        } 

        // check for instructor , why we are going to check if we have already check it with middleware or why make db call for instructor
    //    becz instructor ki object id bhi rakhni padti , kisne course banaya h 
    const userId=req.user.id;// this will give object ki user id 
    const instructorDetails= await User.findById(userId);
    console.log("Instructor details", instructorDetails);

    if(!instructorDetails){
        return res.status(404).json({
            success:false,
            message:"Instructor Details not found ", 
        });
    }
    // check given tag is valid or not 
    const tagDetails=await Tagsmodel.findById(tag);
    if(!tagDetails){
        return res.status(404).json({
            success:false,
            message:"Tag Details not found ", 
        });

    }
    // upload image to cloudinary
    const thumbnailImage =await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

    // create an entry for new course 
    const newCourse=await Coursemodel.create({
        courseName,
        courseDescription,
        instructor:instructorDetails._id,// instructor ki object_id milege yha as instructor ki user id h hmare pass 
        // this why we have taken instructor ki object_id from db , jisne wo course bnaya h 
        whatYouWillLearn:whatYouWillLearn,
        price,
        tag:tagDetails._id,
        thumbnail:thumbnailImage.secure_url,
         
        })

        // user update krna h
        // create entry in user schema :user ke courselist mein entry create krni hogi , agar instructor tein aur agar student h toh buy course list mein 
        // add the new courser to user schema of instructor 

        await User.findByIdAndUpadte(
            {_id:instructorDetails._id},
             {// user ke coursearray ke andar push krenge jo usne new course publish kiya h
                $push:{
                    courses:newCourse>_id,
                }

             },{
                new:true// by this we get the updated response 
             },
        );

        // update tag schema

        // return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });


    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        })

    }
}


// get all courses handler function 
exports.showAllCourses=async(req,res)=>{
    try{
        const allCourses =await course.find({},{courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor")// as hmmlog ko id milega instructor sein as reference use kiye h model mein 
        .exec();
        
        return res.status(200).json({
            success:true,
            message:"data  for all courses fetched successfully",
            details:allCourses,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error:error.message,
        });
    }

}

// full course details 
exports.getFullCourseDetails = async (req, res) => {
    try {
        // get course id 
      const { courseId } = req.body
    //   find course details 
      const userId = req.user.id
      const courseDetails = await course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",// also instructor ke user ka refrence h aur uske andar additional details ka refrence h 
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",// course content mein section h usmein subsection usko bhi populate kro : Nested populate  
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
//   validation 
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      // return response 
      return res.status(200).json({
        success: true,
        message:"course details fetched successfully",
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } 
  

  // Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnroled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }





