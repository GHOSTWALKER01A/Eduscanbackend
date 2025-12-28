
import find from "local-devices"

import { User } from "../models/User.model.js"
import { asyncHandler } from "./asynchandler.js"
import { ApiError } from "./ApiError.js"



let activeClassSession = null



const getConnectedMacs =asyncHandler (async()=>{    
    try {
        const devices = await find()

        return devices.map(device => device.mac.toLowerCase())
    } catch (error) {
        throw new ApiError(error?.message || " Error in connecting devices")

      return []   
    }
    
})

const checkPresence =asyncHandler (async()=>{
    if (!activeClassSession) 
        return;
    
 const macs = await getConnectedMacs();
 const macset = new Set(macs)
 
 try {
    const students = await User.find({
        macAddress: {
            $in: Array.from(macset)
        },
    }
)
    for (let student of students ) {
    const studentid = student._id.toString()
      if (!activeClassSession.presence.has(studentid)) {
        activeClassSession.presence.set(studentid, 0)
      }  
      
      activeClassSession.presence.set(studentid,activeClassSession.presence.get(studentid)+ 1)
    } 
    
    activeClassSession.checkCount++
    
 } catch (error) {
    throw new ApiError(400, error?.message || "Session not done yet")
 }

})


const getClientMac = asyncHandler(async(ip)=>{
    try {
        find(ip).then(device  => device ? device.mac.toLowerCase() : null)
        
    } catch (error) {
        console.log("Getting Mac address:",ip,error);
        throw new ApiError(401, "Error getting Mac For IP")
        return null
    }
        
})


const getActiveClass = asyncHandler(async()=>{
    return activeClassSession ;
})

const setActiveClass = asyncHandler(async()=>{
    activeClassSession = session
})



export {
    getConnectedMacs,
    checkPresence,
    getClientMac,
    getActiveClass,
    setActiveClass
}




