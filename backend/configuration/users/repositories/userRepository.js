const User = require('../models/user');
const { getSequelize } = require('../../../shared/config/db');
const UserDTO = require('../interfaces/userDto');

class UserRepository {
  async findAll() {
    const sequelize = getSequelize();
    console.log(`[UserRepository.findAll] Using database: ${sequelize.config.database}`);
    const users = await sequelize.query("CALL uspget_users(:opcion)", {
      replacements: { opcion: 1 },
      type: sequelize.QueryTypes.RAW
    });
    return users;
  }

  async findById(id) {
    const sequelize = getSequelize();
    console.log(`[UserRepository.findById] Using database: ${sequelize.config.database}`);
    const user = await User().findByPk(id);
    return user ? new UserDTO(user) : null;
  }

  async findByEmail(email) {
    const sequelize = getSequelize();
    console.log(`[UserRepository.findByEmail] Using database: ${sequelize.config.database}`);
    const user = await User().findOne({
      where: { email }
    });
    return user;
  }

  async findPersonByDNI(dni) {
    const sequelize = getSequelize();
    console.log(`[UserRepository.findPersonByDNI] Using database: ${sequelize.config.database}`);
    const [person] = await sequelize.query("SELECT * FROM persons WHERE num_doc = :dni", {
      replacements: { dni },
      type: sequelize.QueryTypes.SELECT
    });
    return person;
  }

  async create(userData) {
    const sequelize = getSequelize();
    console.log(`[UserRepository.create] Using database: ${sequelize.config.database}`);
    const user = await sequelize.query("CALL uspset_create_user(:establishment_id, :person_num_doc, :email, :username, :password, :active, :document_id, :name, :phone, :user_id)", {
      replacements: { ...userData },
      type: sequelize.QueryTypes.RAW
    });
    return user;
  }

  async updatePassword(userId, hashedPassword) {
    const sequelize = getSequelize();
    return await sequelize.query(
      "UPDATE users SET password = :password WHERE id = :userId",
      {
        replacements: { password: hashedPassword, userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );
  }

  async update(userId, updateData) {
      const sequelize = getSequelize();
      console.log(`[UserRepository.update] Using database: ${sequelize.config.database}`);
      
      // Crea una copia de updateData para evitar modificar el original
      const dataToUpdate = { ...updateData };
      
      // Eliminar la contraseña de la actualización si está vacía, es nula o no está definida
      if (dataToUpdate.hasOwnProperty('password') && 
        (dataToUpdate.password === undefined || dataToUpdate.password === null || dataToUpdate.password === '')) {
        delete dataToUpdate.password;
      }
      
      const [updatedRowCount, updatedUsers] = await User().update(dataToUpdate, {
        where: { id: userId },
        returning: true,
      });
  
      return {
        updatedRowCount,
        updatedUser: updatedRowCount ? new UserDTO(updatedUsers[0]) : null,
      };
    }

  async delete(userId, useridsession) {
    const sequelize = getSequelize();
    console.log(`[UserRepository.delete] Using database: ${sequelize.config.database}`);
  
    try {
      // Iniciar una transacción
      const result = await sequelize.transaction(async (t) => {
        // Llamar al procedimiento almacenado
        await sequelize.query('CALL check_and_delete_user(:userId, :useridsession, @can_delete, @message)', {
          replacements: { userId, useridsession },
          transaction: t
        });
  
        // Obtener los resultados
        const [results] = await sequelize.query('SELECT @can_delete as canDelete, @message as message', { transaction: t });
  
        if (results && results.length > 0) {
          const { canDelete, message } = results[0];
  
          if (canDelete === 1) {
            // Si el usuario puede ser eliminado, actualizar la tabla users_profiles
            await sequelize.query('UPDATE users_profiles SET profile_id = NULL WHERE user_id = :userId', {
              replacements: { userId },
              transaction: t
            });
          }
  
          return {
            success: canDelete === 1,
            message: message
          };
        } else {
          throw new Error('No se pudo obtener el resultado del procedimiento almacenado');
        }
      });
  
      return result;
    } catch (error) {
      console.error('Error al intentar eliminar el usuario:', error);
      return {
        success: false,
        message: 'Ocurrió un error al intentar eliminar el usuario: ' + error.message
      };
    }
  }

  async findCustomers(){
    const sequelize = getSequelize();
    const customers = await sequelize.query("CALL uspget_users(:opcion)", {
      replacements: { opcion: 2 },
      type: sequelize.QueryTypes.RAW
    });
    return customers;
  }


  
}

module.exports = new UserRepository();