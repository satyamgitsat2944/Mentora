const { instance } = require("../config/razorpay")
const Course = require("../models/Coursemodel")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")   
const {
  courseEnrollmentEmail,
} = require("../mailtemplate/courseEnrollment")
const { paymentSuccessEmail } = require("../mailtemplate/paymentsuccessfull ")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;// fetch course_id from request 
  const userId = req.user.id ;// user ki id auth wale middleware ke andar req ke andar payload ko append kiya tha 
  // valid course id h ki nhi 
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID , db call 
      course = await Course.findById(course_id)
       // validation
      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course, Please provide valid course ID ." })
      }
 // Check if the user is already enrolled in the course
      const uid = new mongoose.Schema.Types.ObjectId(userId) //  user id jooki string type mein h usko object id mein convert kr diya h 
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled , no need to buy the same course again" })
      }
 // order create krna start krdo


      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,// yha 100 sein multiply krna mandatory h 
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
    notes:{
        courseId:courses,
        userId, // we have send courseid and userid in notes so that we can use it at verify signature time 
    }
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse);
     let course = await Course.findById(courses)

    return res.json({
      success: true,
      data: paymentResponse,
      courseDescription:course.courseDescription,
      courseName:course.courseName,
      thumbnail:course.thumbnail,
      orderId:paymentResponse.id,
      currency:paymentResponse.currency,
      amount:paymentResponse.amount,
       
    });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}
// verify Signature of Razorpay and server 
// verify the payment 
exports.verifyPayment = async (req, res) => {


//   return res.status(200).json({ success: false, message: "Payment Failed" })
const webhookSecret ="12345678"; // ab yeah encrypted format mein banane ke liye teen steps lagenge  

//SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function commonly used for securely encoding data in fixed length which can't be decrypted , it is used to check authentication of client message come on server  
    // hmac is combination of hashing algorithm and secret key 

const signature =req.headers("x-razorpay-signature");// jo razorpay sein aayega  

// three steps to convert webhook secret to encrypted form 
const shasum=crypto.createHmac("sha256",webhookSecret);
shasum.update(JSON.stringify(req.body)); 
const digest =  shasum.digest("hex");

if(signature===digest){
    console.log("your Payment is authorised ");
    
    const {courseId,userId}=req.body.payload.payment.entity.notes;////  req ki body mein payload hoga usmein payment ki entity mein notes hoga 


try{
    // as jb koi course buy hoga toh student ke profile mein jo paid course h usmein update krna hoga 
    // aur saath mein student ko enrolled krna hoga uss particular course mein bhi
// find the course and enroll the student in it 

 
    const enrolledCourse = await Course.findOneAndUpdate({ _id:courseId},
        {$push :{studentsEnrolled:userId}},
        {new:true},
    );
  if(!enrolledCourse){
    return res.status(500).json({
        success:false,
        message:"course not found",
    });
  }
  console.log(enrolledCourse);

  // find the student and add the course to their list enrolled courses mein 

  const enrolledStudent = await User.findOneAndUpdate({
    _id:userId
  }, {$push :{courses:courseId}},
{new:true},
);
console.log(enrolledStudent);

// mail send krna h confirmation wala 
 
const emailResponse =await mailSender(
    enrolledStudent.email,
    "Congratulations from Teen Patti",
    "Thank you for shopping with us ",
);
console.log(emailResponse);

return res.status(200).json({
    success:true,
    message:"Signature verified and Course Added",
});


} 
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:error.message,
    });
}

}
else{
    // signature match nhi hua 
    return res.status(400).json({
        success:false,
        message:"Invalid request",
    })
}


};






// // Send Payment Success Email
// exports.sendPaymentSuccessEmail = async (req, res) => {
//   const { orderId, paymentId, amount } = req.body

//   const userId = req.user.id

//   if (!orderId || !paymentId || !amount || !userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Please provide all the details" })
//   }

//   try {
//     const enrolledStudent = await User.findById(userId)

//     await mailSender(
//       enrolledStudent.email,
//       `Payment Received`,
//       paymentSuccessEmail(
//         `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
//         amount / 100,
//         orderId,
//         paymentId
//       )
//     )
//   } catch (error) {
//     console.log("error in sending mail", error)
//     return res
//       .status(400)
//       .json({ success: false, message: "Could not send email" })
//   }
// }

// // enroll the student in the courses
// const enrollStudents = async (courses, userId, res) => {
//   if (!courses || !userId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Please Provide Course ID and User ID" })
//   }

//   for (const courseId of courses) {
//     try {
//       // Find the course and enroll the student in it
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnroled: userId } },
//         { new: true }
//       )

//       if (!enrolledCourse) {
//         return res
//           .status(500)
//           .json({ success: false, error: "Course not found" })
//       }
//       console.log("Updated course: ", enrolledCourse)

//       const courseProgress = await CourseProgress.create({
//         courseID: courseId,
//         userId: userId,
//         completedVideos: [],
//       })
//       // Find the student and add the course to their list of enrolled courses
//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             courses: courseId,
//             courseProgress: courseProgress._id,
//           },
//         },
//         { new: true }
//       )

//       console.log("Enrolled student: ", enrolledStudent)
//       // Send an email notification to the enrolled student
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         `Successfully Enrolled into ${enrolledCourse.courseName}`,
//         courseEnrollmentEmail(
//           enrolledCourse.courseName,
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//         )
//       )

//       console.log("Email sent successfully: ", emailResponse.response)
//     } catch (error) {
//       console.log(error)
//       return res.status(400).json({ success: false, error: error.message })
//     }
//   }
// }