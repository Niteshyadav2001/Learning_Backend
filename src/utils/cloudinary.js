import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { fileURLToPath } from "url";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


//UPLOAD FILES ON CLOUDINARY
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File is uploaded on cloudinary ", response.url);
        //unlink the path
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        //unlink the path
        fs.unlinkSync(localFilePath);
        return null;
    }
}


export default uploadOnCloudinary;