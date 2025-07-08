const userRepository = require('../repositories/userRepository');
const userProfileRepository = require('../repositories/userProfileRepository')
const bcrypt = require('bcrypt');

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const getUserById = async (id) => {
  return await userRepository.findById(id);
};

const getUserByDocumento = async (dni) => {
  return await userRepository.findPersonByDNI(dni);
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await hashPassword(newPassword);
  return await userRepository.updatePassword(userId, hashedPassword);
};

const validExistePersona= async (userData) => {
  try{
    // Verificar si la persona ya existe
    const existingPerson = await userRepository.findPersonByDNI(userData.person_num_doc);
    return existingPerson;
  }catch(error){
    throw new Error(error.message);
  }

}
const createUser = async (userData) => {
  if (!userData.establishment_id) {
    throw new Error("El establecimiento es necesario.");
  }
  
  try {
    // Verificar si la persona ya existe
    const existingPerson = await userRepository.findPersonByDNI(userData.person_num_doc);
    
    if (existingPerson) {
      // Si la persona existe, usar esos datos
      userData.name = existingPerson.name;
      userData.email = existingPerson.email;
      userData.phone = existingPerson.phone;
      userData.document_id = existingPerson.document_id;
    }
    
    // Hashear la contraseña
    userData.password = await hashPassword(userData.password);
    
    // Crear el usuario
    const user = await userRepository.create(userData);
    // retornamos el mensaje que nos devuelve la funcion
    if (user[0].message) {
      return user[0].message;
    }
    // Crear la relación usuario-perfil
    const newUserProfile = {user_id : user[0].id, profile_id : userData.profile_id}
    const userProfile = await userProfileRepository.create(newUserProfile)
    
    return {
      user, 
      userProfile
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


const validExists = async (userData) => {
  return await userRepository.findByEmail(userData.email);
};

const updateUser = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  return await userRepository.update(userId, updateData);
};

const deleteUser = async (id, useridsession) => {
  return await userRepository.delete(id, useridsession);
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validExists,
  updateUserPassword,
  validExistePersona,
  getUserByDocumento
};
