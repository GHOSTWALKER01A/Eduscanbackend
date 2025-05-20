import { asyncHandler } from "../utils/asynchandler"; 


const registerStudent= asyncHandler (async (req,res)=>{
    res.status(200).json({
        message: 'ok'
    })
})



export {registerStudent}