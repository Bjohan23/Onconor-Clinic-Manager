const userService = require("../services/userService");
const userProfileService = require("../services/userProfileService");
const personService = require("../../../shared/genericDomains/services/personService");
const { sendSuccess, sendError } = require("../../../shared/helpers/apiResponseHelper");
const UserDTO = require("../interfaces/userDto");
const axios = require('axios');
// llamamos a las variable de entorno para el token


// Controlador para obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return sendSuccess(res, users);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Controlador para obtener un usuario por su ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return sendError(res, 404, "El Usuario no existe.");
    }

    return sendSuccess(res, user);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Controlador para obtener un usuario por su DNI
exports.getUserByDni = async (req, res) => {
  try {
    const documento = req.params.documento;
    // Verificar si la persona ya existe
    const existingPerson = await userService.getUserByDocumento(documento);
    if (!existingPerson) {
      // Si la persona no existe llamamos a la api de reniec
      const apiUrl = `http://apiconsultas.lyracorp.pro/api/dni/${documento}`;
      const token = process.env.TOKEN_CONSULTAS;
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const  personData = response.data.data;
        const data = {
          name : personData.nombre_completo,
          ...personData
        }
        return sendSuccess(res, data);
      } catch (apiError) {
        return sendError(res, 500, `Error al consultar la API externa: ${apiError.message}`);
      }
    }
    return sendSuccess(res, existingPerson);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

exports.getUserByRuc = async (req, res) => {
  try {
    const documento = req.params.documento;
    // Verificar si la persona ya existe
    const existingPerson = await userService.getUserByDocumento(documento);
    if (!existingPerson) {
      // Si la persona no existe llamamos a la api de reniec
      const apiUrl = `http://apiconsultas.lyracorp.pro/api/ruc/${documento}`;
      const token = process.env.TOKEN_CONSULTAS;
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const personData = response.data.data;
        const data = {
          name : personData.nombre_o_razon_social,
          ...personData
        }
        return sendSuccess(res, data);
      } catch (apiError) {
        return sendError(res, 500, `Error al consultar la API externa: ${apiError.message}`);
      }
    }
    return sendSuccess(res, existingPerson);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
}
// Controlador para crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    const userExists = await userService.validExists(userData);
    if (userExists) {
      return sendError(res, 409, "Ya existe un usuario activo registrado con ese DNI o correo electrónico.");
    }
    const user = await userService.createUser(userData);  
    if(user==='Actualmente hay un usuario activo con ese mismo DNI.')return sendError(res, 409, user);  
    return sendSuccess(res, user, "Usuario Creado Correctamente.");
    // return sendSuccess(res, user, user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    await userService.updateUserPassword(userId, newPassword);
    return sendSuccess(res, null, "Contraseña actualizada correctamente.");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// Controlador para actualizar un usuario existente
exports.updateUser = async (req, res) => {
  try {
    const userId = req.body.id;
    const {person_num_doc, document_id, email, phone, name} = req.body; 
    const {profile_id } = req.body;
    

    const response = await userService.getUserById(userId);
    if (!response) return sendError(res, 404, "Usuario no encontrado.");
    if(response.email !== req.body.email) {
      const userExists = await userService.validExists({...req.body})
      if(userExists) return sendError(res, 404, "Ya existe un usuario registrado con esa dirección de correo.");
    }

    const personResponse = await personService.updatePerson( person_num_doc,{person_num_doc, document_id, email, phone, name});
    if(!personResponse) return sendError(res, 404, "La persona no existe.");

    const result = await userService.updateUser(userId, new UserDTO({...req.body}));
    if (result.updatedRowCount === 0) {
      return sendError(res, 404, "Usuario no encontrado");
    }
    const userProfile = await userProfileService.updateUserProfile( {profile_id , userId}, userId);
    if(userProfile.updatedRowCount === 0) return sendError(res, 404, "Perfil no encontrado.");

    return sendSuccess(res, result.updatedUser, "Usuario Actualizado Correctamente.");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Controlador para eliminar un usuario por su ID
exports.deleteUser = async (req, res) => {
  try {
    const { id, useridsession } = req.params;    
    const { success, message } = await userService.deleteUser(id, useridsession);

    if (!success) {
      // Envía el mensaje del procedimiento almacenado si la operación no fue exitosa
      return sendError(res, 400, message); 
    }

    // Si todo sale bien, envía el mensaje de éxito
    sendSuccess(res, null, "Usuario eliminado correctamente.");
  } catch (error) {
    // Captura cualquier error inesperado y envía el mensaje de error
    sendError(res, 500, error.message);
  }
};


