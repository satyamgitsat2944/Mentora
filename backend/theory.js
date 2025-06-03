// user model
// it contains firstname,lastname,email,pwd,confirm password ,account type 
// also for future editing profile we will stote refrence profile for additional details 
// courses : we will make array of refrence courses 
// course progress ka refernce   
// image of user 

// course refrence 
// name , description ,instructor (refrence user) , what you will learn ,course content (it contains multiple sections in form of array and hence its refrence )
// rating and reviews array refrence 
// price and thumbnail 
// tags refrences {for future use jisse hmmlog filtering kr ske }
// students enrolled (user type refrence )

// for profile.js
// date of birth ,phone number ,gender ,about yeah saari cheeze user signup ke samay nhi deta h yeah baad mein agar user add krna chahe toh kre 

// course progress
// course id ke corresponding completed videos toh yeah array of videos refrence hoga 
// hr ek course ke inside content h jismein multiple sections h aur hr ek section ke corresponding ek video h 
 
// subsection is basically video :description , title ,videourl ,tags ,time duration

//otp model :for verification 
// email
//utils mein mailsender name ka function hoga jo send krega mail ko  
// created at which time : so that we can add its expiry time 
// otp 

// as when a user come for sign up we send an otp to his email i.e. before db entry of user otp ka kheela ho rha h "pre hook" use krenge 
// matlab db mein entry create hone sein phale saamne wale ko mail bhejna h 
//  pre and post hook must me written schema ke niche model ke upar 
// user->data entry->mail mein otp aayega ->otp entry hogi->submit
// ***pre-save hook waala middleware use krke mail send krdo*** and transporter and nodemailer otp wale model ke andar likhna h 


// *** for controller ***
// for sending otp 
// request ke body mein sein email le liye 
// if user already exist , return some response 
// if user not exist then we generate otp , otp should be unique and store it in db(stored in db taaki jb user wo otp ko enter kre toh match kr paye hmmlog ) 
//  and then send response 


// for forget password or reset password 
// link will genertaed and wo mail pr send hoga  
// when we open it a new UI will opened , new update password  

    //  generally backend 4000 port pr chalate h and frontend 3000 port pr chalate h 

// create course and create section and create subsection jisse course ke barre mein pta chalega 
// course creation sein phale tag bna pda hoga  
// 
// 

// FOR create course controller
// fetch data from req ki body
// file fetching req ki file
// validation for instructor as course toh instructor hi create kr skata h 
// tag level validation
// image upload cloudinary
// create course entry in db
// create entry in user schema :user ke courselist mein entry create krni hogi , agar instructor tein aur agar student h toh buy course list mein 
// 
// for creating course section and subsection :two steps 
// for creating section : first create section and then usko course ke section wale array mein store kro , becz course ke model schema  ke andar section ka reference and section ke schema ke andar subsection ka refrence pda h
// 
// 

//  homework : how to schedule the request that if we get request to delete profile it will get deleted after some time or scheduled time 

// razorpay integration 
//  step 1: create an order using Orders API , for that razorpay ka instance liya aur uspein .orders.create function ka use kiya  
// we have three states of order placing : created(like buy now pr click) , attempted(payment krne jaa rahe wo success or failure ho skta h, i.e jb payment is first attempted on it ) and paid 
// step 2 : jo bhi  amount ko 100 sein multiply krdo 
//  pay now -> pr click krne ke baad ->scan kro qr code -> and after scanning 
// step 3: payment ko authorised kiya h means ek secret key or token razorpay bhejega aur ek secret key backend mein save hoga agar dono match krta h toh ussi ko authorised khte h 

//  step 4:   
// jb payment ho jayega toh uss samay bank aur razorpay interact krenge , uss samay user ka koi role nhi hoga 
// note , after successfull payment hi webhook activate hoga , webhook ek tarah ka notification h jo successfull payment hone pr generate hota h 
// but how our website know that user had made payment : WITH THE HELP OF WEBHOOK ,  whenever we have a successfull transaction webhook ke help sein ek particular api route (verify signature api route ko hit krdenge ) ko hit kr denge 
// inside webhook we pass secret key inside it, razorpay will give that key in authorised form  and we will verify signature with the help of key already present in backend code , 
// aur jb dono verify ho jayenge toh uss state ko AUTHORISED STATE khte h  
// webhook means kis particular  event pr api route (here it is verify signature api route ) ko hit krdo 
   

// for payment controller  : 
// sabse phale payment ko intiate kro , then order create kro , on successfull transactions razorpay activate webhook , after payment authorization , actions should be performed 
// get course by its id 
// validation 
// valid courseID
//  valid courseDetail
//  user already pay for the same course 
// notes ke barre mein padhlo use to pass key value pairs  
// order create 
//  return response 



