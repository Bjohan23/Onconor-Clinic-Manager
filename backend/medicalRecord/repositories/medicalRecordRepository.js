const MedicalRecord = require('../models/medicalRecord');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const User = require('../../users/models/user');
const Specialty = require('../../specialties/models/specialty');

const getAllMedicalRecords = async () => {
  return await MedicalRecord().findAll({
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
  });
};

const getMedicalRecordById = async (id) => {
  return await MedicalRecord().findByPk(id, {
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
  });
};

const createMedicalRecord = async (data) => {
  return await MedicalRecord().create(data);
};

const updateMedicalRecord = async (id, data) => {
  const record = await MedicalRecord().findByPk(id);
  if (!record) return null;
  return await record.update(data);
};

const deleteMedicalRecord = async (id) => {
  const record = await MedicalRecord().findByPk(id);
  if (!record) return null;
  await record.destroy();
  return true;
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
}; 