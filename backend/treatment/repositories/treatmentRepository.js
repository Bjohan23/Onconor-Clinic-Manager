const Treatment = require('../models/treatment');
const MedicalRecord = require('../../medicalRecord/models/medicalRecord');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const User = require('../../users/models/user');
const Specialty = require('../../specialties/models/specialty');

const getAllTreatments = async () => {
  return await Treatment().findAll({
    include: [
      {
        model: MedicalRecord(),
        as: 'medicalRecord',
        include: [
          {
            model: Patient(),
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'dni'],
            include: [{
              model: User(),
              as: 'user',
              attributes: ['email', 'username']
            }]
          },
          {
            model: Doctor(),
            as: 'doctor',
            attributes: ['id', 'firstName', 'lastName', 'phone'],
            include: [
              {
                model: User(),
                as: 'user',
                attributes: ['email', 'username']
              },
              {
                model: Specialty(),
                as: 'specialty',
                attributes: ['name', 'description']
              }
            ]
          }
        ]
      }
    ]
  });
};

const getTreatmentById = async (id) => {
  return await Treatment().findByPk(id, {
    include: [
      {
        model: MedicalRecord(),
        as: 'medicalRecord',
        include: [
          {
            model: Patient(),
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'dni'],
            include: [{
              model: User(),
              as: 'user',
              attributes: ['email', 'username']
            }]
          },
          {
            model: Doctor(),
            as: 'doctor',
            attributes: ['id', 'firstName', 'lastName', 'phone'],
            include: [
              {
                model: User(),
                as: 'user',
                attributes: ['email', 'username']
              },
              {
                model: Specialty(),
                as: 'specialty',
                attributes: ['name', 'description']
              }
            ]
          }
        ]
      }
    ]
  });
};

const createTreatment = async (data) => {
  return await Treatment().create(data);
};

const updateTreatment = async (id, data) => {
  const treatment = await Treatment().findByPk(id);
  if (!treatment) return null;
  return await treatment.update(data);
};

const deleteTreatment = async (id) => {
  const treatment = await Treatment().findByPk(id);
  if (!treatment) return null;
  await treatment.destroy();
  return true;
};

module.exports = {
  getAllTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
}; 