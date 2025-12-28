import { User } from "../models/User.model.js";

import { Doubt } from "../models/Doubt.model.js";


import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";








const submitDoubt = asyncHandler(async (req, res )=>{
  const { teacher_id, subject, description } = req.body
  try {
    const doubt = new Doubt({
      student_id: req.user._id,
      teacher_id,
      subject,
      description
    })

    // AI Suggestion using OpenAI

    const aiResponse = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user',
         content: `Provide a short suggestion for this doubt: ${description}` }],
    });
    doubt.ai_suggestion = aiResponse.choices[0].message.content
    await doubt.save()

    return res.status(201).json(
      new ApiResponse(
        201,
        {doubt},
        "Doubt submitted succesfully"
      )
    )


  } catch (error) {
    throw new ApiResponse(500, error?.message || "SErver error in submitting Doubt")
  }
})

const getDoubtSolution = asyncHandler(async(req, res)=>{
  try {
    const doubts = await Doubt.find({ 
      student_id: req.user._id, 
      status: 'resolved' })
      .sort({ updatedAt: -1 });

  return res.status(201).json(
    new ApiResponse(
      200,
      {doubts},
      "Solution recieved Successfully"
    )
  )
    
  } catch (error) {
   throw new ApiError(501, error?.message || "Solution not get successfully due to server error")
  }
})

const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    .select('-password -refreshtoken');

    if (!user)
      { throw new ApiError(404, 'User not found')}

   return res.status(200).json(
    new ApiResponse(
      200,
       user, 
      'Profile fetched'
    ));
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new ApiError(500, 'Failed to fetch profile');
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { fullname, email, phonenumber, profilephoto } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phonenumber = phonenumber || user.phonenumber;
    user.profilephoto = profilephoto || user.profilephoto;
    await user.save();

   return res.status(200).json(
    new ApiResponse(
      200,
       user, 
    'Profile updated'
  ));
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new ApiError(500, 'Failed to update profile');
  }
});







export {
 
  submitDoubt,
  getDoubtSolution,
  getProfile,
  updateProfile
  

}