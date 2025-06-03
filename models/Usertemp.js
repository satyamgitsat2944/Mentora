// const mongoose=require("mongoose");
// const userSchema =new mongoose.Schema({
//     firstName:{
//         type:String,
//         required:true,
//         trim:true,
//     },
//     lastName:{
//         type:String,
//         required:true,
//         trim:true,
//     },
//     email:{
//         type:String,
//         required:true,
//         trim:true,

//     },
//     password:{
//         type:String,
//         required:true,
        
//     },
//     accountType:{
//         type:String,
//         // kyuki three types of account is only possible 

//         enum:["Admin","Student","Instructor"],
//         required:true,

//     },
//     additionalDetails:{
//         type:mongoose.Schema.Types.ObjectId,
//         required:true,
//         ref:"Profile",
//     },
//     courses:[
//         {
//             type:mongoose.Schema.Types.ObjectId,
//             ref:"Courses",
//         }

//     ],
//     image:{
//         type:String,// becz url hoga 
//         required:true,
//     },
//     courseProgress:[{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"CourseProgress",// refrence course program name ke model pr lga diya 


//     }],
// });
// module.exports=mongoose.model("User",userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses",
        },
    ],
    image: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    token:{
        type:String,
        
    },
    resetPasswordExpires:{
        type:Date,

    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);




