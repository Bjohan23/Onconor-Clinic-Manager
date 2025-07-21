const Payment = require('../models/payment');
const Invoice = require('../../invoice/models/invoice');
const Patient = require('../../patients/models/patient');
const User = require('../../users/models/user');
const Appointment = require('../../appointments/models/appointment');
const Doctor = require('../../doctors/models/doctor');
const Specialty = require('../../specialties/models/specialty');

const getAllPayments = async () => {
  return await Payment().findAll({
    include: [
      {
        model: Invoice(),
        as: 'invoice',
        attributes: ['id', 'amount', 'tax', 'total', 'status', 'issueDate', 'dueDate'],
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
            model: Appointment(),
            as: 'appointment',
            attributes: ['id', 'appointmentDate', 'status', 'reason'],
            include: [
              {
                model: Doctor(),
                as: 'doctor',
                attributes: ['id', 'firstName', 'lastName', 'phone'],
                include: [{
                  model: Specialty(),
                  as: 'specialty',
                  attributes: ['name', 'description']
                }]
              }
            ]
          }
        ]
      }
    ]
  });
};

const getPaymentById = async (id) => {
  return await Payment().findByPk(id, {
    include: [
      {
        model: Invoice(),
        as: 'invoice',
        attributes: ['id', 'amount', 'tax', 'total', 'status', 'issueDate', 'dueDate'],
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
            model: Appointment(),
            as: 'appointment',
            attributes: ['id', 'appointmentDate', 'status', 'reason'],
            include: [
              {
                model: Doctor(),
                as: 'doctor',
                attributes: ['id', 'firstName', 'lastName', 'phone'],
                include: [{
                  model: Specialty(),
                  as: 'specialty',
                  attributes: ['name', 'description']
                }]
              }
            ]
          }
        ]
      }
    ]
  });
};

const createPayment = async (data) => {
  return await Payment().create(data);
};

const updatePayment = async (id, data) => {
  const payment = await Payment().findByPk(id);
  if (!payment) return null;
  await payment.update(data);
  // Retornar el pago actualizado con todas las asociaciones
  return await getPaymentById(id);
};

const deletePayment = async (id) => {
  const payment = await Payment().findByPk(id);
  if (!payment) return null;
  await payment.destroy();
  return true;
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
}; 