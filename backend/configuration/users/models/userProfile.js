const { DataTypes } = require("sequelize");
const { getSequelize } = require('../../../shared/config/db');
const User = require('./user');
const Profile = require('../../profiles/models/profile');

const defineUserProfile = (sequelize) => {
    return sequelize.define('users_profiles', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User(),
                key: 'id'
            }
        },
        profile_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Profile(),
                key: 'id'
            }
        }
    },
    {
        timestamps: false
    });
};

// Función que siempre devuelve el modelo con la conexión actual
const UserProfile = () => {
    const sequelize = getSequelize();
    if (!sequelize.models.users_profiles) {
        defineUserProfile(sequelize);
    }
    return sequelize.models.users_profiles;
};

module.exports = UserProfile;