import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend or from postman
    // check for empty fields || validation
    // register user if it is not registered: username and email
    // check for images and avatar
    // upload images on cloudinary
    // check if the images are sucessfully uploaded or not
    // if(sucessfully done) return response
    // else return NULL
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return res


    const {fullname, email, username, password} = req.body;

    //validation
    if ([fullname, email, username, password].some((field)=>
        field?.trim() == "")
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    //check for user is already registered or not
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })


    if(existedUser){
        throw new ApiError(409, "User with username or email is already exist.");
    }

    // console.log("req.files: ", req.files);

    //check for images or avatar
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.files?.coverImage[0]?.path;
    

    if(!avatarLocalpath){
        throw new ApiError(400, "Avatar file is required.");
    }

    if (!coverImageLocalpath) {
        throw new ApiError(400, "Cover Image file is required.");
      }

    //upload avatar and coverimage on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalpath);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required.");
    }
    if(!coverImage){
        throw new ApiError(400, "Cover Image file is required.");
    }





    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered sucessfully.")
    )

    
})

export default registerUser;