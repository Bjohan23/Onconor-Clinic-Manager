const Prescription = require('../models/prescription');
const Treatment = require('../../treatment/models/treatment');
const MedicalRecord = require('../../medicalRecord/models/medicalRecord');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const User = require('../../users/models/user');
const Specialty = require('../../specialties/models/specialty');

const getAllPrescriptions = async () => {
  return await Prescription().findAll({
    include: [
      {
        model: Treatment(),
        as: 'treatment',
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
      }
    ]
  });
};

const getPrescriptionById = async (id) => {
  return await Prescription().findByPk(id, {
    include: [
      {
        model: Treatment(),
        as: 'treatment',
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
      }
    ]
  });
};

const createPrescription = async (data) => {
  return await Prescription().create(data);
};

const updatePrescription = async (id, data) => {
  const prescription = await Prescription().findByPk(id);
  if (!prescription) return null;
  return await prescription.update(data);
};

const deletePrescription = async (id) => {
  const prescription = await Prescription().findByPk(id);
  if (!prescription) return null;
  await prescription.destroy();
  return true;
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
}; 