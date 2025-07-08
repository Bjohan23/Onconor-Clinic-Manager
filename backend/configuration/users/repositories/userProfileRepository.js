const UserProfile = require('../models/userProfile');
const { getSequelize } = require('../../../shared/config/db');

const UserProfileRepository = {
    getProfileByUserId: async (user_id) => {
        const sequelize = getSequelize();
        console.log(`[UserProfileRepository.getProfileByUserId] Using database: ${sequelize.config.database}`);
        return await UserProfile().findOne({where: {user_id: user_id}});
    },
    create: async (data) => {
        const sequelize = getSequelize();
        console.log(`[UserProfileRepository.create] Using database: ${sequelize.config.database}`);
        return await UserProfile().create(data);
    },
    update: async (id, data) => {
        const sequelize = getSequelize();
        console.log(`[UserProfileRepository.update] Using database: ${sequelize.config.database}`);
        return await UserProfile().update(data, {where: { user_id:id }});
    },
    delete: async (id) => {    const sequelize = getSequelize();
            console.log(`[UserProfileRepository.delete] Using database: ${sequelize.config.database}`);   
             // En lugar de destruir el registro, actualiza el profile_id a null  
      return await UserProfile().update({ profile_id: null }, { where: { user_id: id } });},

};

module.exports = UserProfileRepository;