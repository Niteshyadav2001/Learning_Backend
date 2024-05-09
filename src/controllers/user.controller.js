import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

// method for generating access and refresh token
const generateAccessAndRefreshTokens = async(userID)=>{
    try {
        const user = await User.findById(userID)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        })

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens.");
    }
}



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

const loginUser = asyncHandler(async (req,res) =>{
    // req.body -> data leke ayenge
    // username or email
    // find the user
    // check for password
    // generate access and refresh token
    // send cookie

    const {username, email, password} = req.body;

    // we can also apply a second approach here, which is by using findOne method of js
    if(!username || !email){
        throw new ApiError(400, "username or email is required.");
    }

    // check for the registered user
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist.");
    }

    // check for password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid user credentials.");
    }
    
    // get access token and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    //loggedIn User
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Sucessfully."
        )
    )

})

const logoutUser = asyncHandler(async (req, res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out Sucessfully."
        )
    )
})


export { registerUser,
     loginUser,
     logoutUser
    };