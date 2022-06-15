import mongoose from "mongoose";

export const connectDatabase =async () =>{
  try{
    const {connection}= await  mongoose.connect(process.env.MONGO_URI);
    console.log (`MongoDb connected: ${connection.host}`);

  } catch(error){
      process.exit(1);

  }
};