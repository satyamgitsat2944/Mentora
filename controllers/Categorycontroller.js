const Category=require("../models/Categorymodel");


// create tag ka handler function 
exports.createCategory=async(req,res)=>{
    try{
        const {name, description}=req.body;
// validation
        if(!name||!description){
            return   res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        // create entry in db
        const CategoryDetails=await Category.create({
            name:name,
            description:description,
        });
        console.log(CategoryDetails);
        // return response 

        return res.status(200).json({
            success:true,
            message:"Tag created successfully"
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,

        })
    }
}
// get all tags 
exports.showAllCategory =async(req,res)=>{
    try{
        const allCategory=await Category.find({},{name:true,description:true});
       res.status(200).json({
        success:true,
        message:"all tags returned Successfully",
        allCategory,
       })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,

        })

    }
}





