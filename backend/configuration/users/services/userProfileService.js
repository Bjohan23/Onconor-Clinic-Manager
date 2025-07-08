const userProfileRepository = require('../repositories/userProfileRepository')

const createUserProfile = async (data) =>{
    try {
        return await userProfileRepository.createUserProfile(data)
    } catch (error) {
        throw error
    }
}

const updateUserProfile = async (id, data) =>{
    try {
        return await userProfileRepository.update( data ,id)
    } catch (error) {
        throw error
    }
}


module.exports = {
    createUserProfile,
    updateUserProfile
}