
import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const  register = async(req, res) =>{

    try{
        const{name,email,password} = req.body;

        const avatar = req.files.avatar.tempFilePath;

   

        let user = await User.findOne({email});
        if(user){
            return res.status(400)
            .json({success: false,
             message:'email already exists'});
        }


        const otp = Math.floor(Math.random() * 1000000 ); 
        const mycloud = await cloudinary.v2.uploader.upload(avatar,{
            folder:"musicApp",
        });

        fs.rmSync("./tmp",{ recursive: true});

     user = await User.create({
         name,
         email,
         password,
         avatar:{
          public_id:mycloud.public_id,
          url:mycloud.secure_url,
     }, otp,
     otp_expiry:new Date(Date.now() + process.env.OTP_EXPIRE* 60 *1000),
    })  ; 

    await  sendMail(email, "Verify your account", `M -${otp} is your Musicapp verification code`);  

    sendToken(
        res,
        user,
        201,
        "OTP sent to your email,please verify your account"
        );


    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};


export const verify = async (req,res) =>{

    try{

        const otp = Number(req.body.otp);

        const user = await User.findById(req.user._id);

        if(user.otp !== otp || user.otp_expiry < Date.now()){

            return res
            .status(400)
            .json({success: false, message:"invalid OTP or has been expire"});

        }
        user.verified = true;
        user.otp = null;
        user.otp_expiry=null;

        await user.save();
        sendToken(res, user, 200, "Account Verified");

    }catch(error){
        res.status(500).json({success: false, message: error.message});

    }
};


export const login = async(req, res) =>{

    try{
        const{email,password} = req.body;
        if(!email || !password){
            return res
              .status(400)
              .json({success: false,
               message:"please enter all fields"});

        }


        const user = await User.findOne({email}).select("+password");
        
        if(!user){
            return res
               .status(400)
               .json({success: false,
               message:'invalid email or password'});
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res
              .status(400)
              .json({success: false,
              message:'invalid email or password'});
        }
    
        sendToken(res,user,200,"login successfully ");


    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};



export const logout = async(req, res) =>{

    try{

      
      
       res
       .status(200)
       .cookie("token",null,{
       expires:new Date(Date.now()),
       })
       .json({ success: true, message:"logout sucessfully "});
        


    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};

export const Profile = async(req, res) =>{

    try{

        const user = await User.findById(req.user._id);
      
        sendToken(res, user, 201, `welcome back ${user.name}`);

    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};


export const updateProfile = async(req, res) =>{

    try{

        const user = await User.findById(req.user._id);

        const {name}= req.body;
        const avatar = req.files.avatar.tempFilePath;

        if (name) user.name = name;

        if (avatar){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            const mycloud = await cloudinary.v2.uploader.upload(avatar,{
                folder:"musicApp",
            });
    
            fs.rmSync("./tmp",{ recursive: true});
    
            user.avatar = {
                public_id:mycloud.public_id,
                url:mycloud.secure_url,
            };
        }

        await user.save();


        res
        .status(200)
        .json({success: true, message:"profile update successfully"});

      
      

    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};


export const updatePassword = async(req, res) =>{

    try{

        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword }= req.body;
         
        if(!oldPassword || !newPassword){

        return res
              .status(400)
              .json({success: true, message:"please enter all fields"});
        }



        const  isMatch = await user.comparePassword(oldPassword);



        if(!isMatch){
            return res
            .status(400)
            .json({ success: false, message: "invalid old password..!"});


        }

         user.password = newPassword;

         await user.save();

         res
           .status(200)
           .json({ success: true, message:"Password Upadated Successfully"});
      

    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};


export const forgotPassword = async(req, res) =>{

    try{

       

        const {email}= req.body;

        const user = await User.findOne({ email });
        
        if(!user){
            return res
            .status(400)
            .json({ success: false, message: "invalid Email...!"});

        }


        const otp = Math.floor(Math.random() * 1000000 ); 

        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = Date.now() +10 * 60 * 1000;

        await user.save();
        

       await  sendMail(email, "request for reset-password ", `M -${otp} is your Musicapp reset-password verification code . if you did not 
       request for this , please ignore this verification code`);  
   
       res.status(200)
       .json({ success: true, message:`otp sent to ${email}`});
   
      
      

    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};


export const resetPassword = async(req, res) =>{

    try{

        const { otp,newPassword } = req.body;

        const user = await User.findOne({resetPasswordOtp: otp, resetPasswordOtpExpiry: {$gt: Date.now()}}).select("+password");

        if(!user){

            return res
            .status(400)
            .json({success: false, message:"reset-OTP or has been expire"});

        }
        user.password = newPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiry=null;

        await user.save();
        
        res.status(200)
        .json({ success: true, message:`password change successfully`});
      

    }catch (error) {
        res.status(500).json({success: false, message: error.message});

    }
};




  