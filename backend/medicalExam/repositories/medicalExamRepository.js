const MedicalExam = require('../models/medicalExam');
const MedicalRecord = require('../../medicalRecord/models/medicalRecord');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const User = require('../../users/models/user');
const Specialty = require('../../specialties/models/specialty');

class MedicalExamRepository {
    async getAllMedicalExams() {
        return await MedicalExam().findAll({
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
    }

    async getMedicalExamById(id) {
        return await MedicalExam().findByPk(id, {
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
    }

    async createMedicalExam(data) {
        return await MedicalExam().create(data);
    }

    async updateMedicalExam(id, data) {
        const exam = await MedicalExam().findByPk(id);
        if (!exam) return null;
        await exam.update(data);
        // Retornar el examen actualizado con todas las asociaciones
        return await this.getMedicalExamById(id);
    }

    async deleteMedicalExam(id) {
        const exam = await MedicalExam().findByPk(id);
        if (!exam) return null;
        await exam.destroy();
        return true;
    }
}

module.exports = new MedicalExamRepository(); 