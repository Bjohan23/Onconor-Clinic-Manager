const medicalExamService = require('../services/medicalExamService');
const { apiResponse } = require('../../shared/helpers/apiResponseHelper');

class MedicalExamController {
    async getAll(req, res) {
        try {
            const exams = await medicalExamService.getAllMedicalExams();
            return apiResponse.success(res, 'Exámenes médicos obtenidos exitosamente', { exams });
        } catch (error) {
            console.error('Error al obtener exámenes médicos:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async getById(req, res) {
        try {
            const exam = await medicalExamService.getMedicalExamById(req.params.id);
            if (!exam) return apiResponse.notFound(res, 'Examen médico no encontrado');
            return apiResponse.success(res, 'Examen médico obtenido exitosamente', { exam });
        } catch (error) {
            console.error('Error al obtener examen médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async create(req, res) {
        try {
            const exam = await medicalExamService.createMedicalExam(req.body);
            return apiResponse.success(res, 'Examen médico creado exitosamente', { exam });
        } catch (error) {
            console.error('Error al crear examen médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async update(req, res) {
        try {
            const exam = await medicalExamService.updateMedicalExam(req.params.id, req.body);
            if (!exam) return apiResponse.notFound(res, 'Examen médico no encontrado');
            return apiResponse.success(res, 'Examen médico actualizado exitosamente', { exam });
        } catch (error) {
            console.error('Error al actualizar examen médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }

    async remove(req, res) {
        try {
            const deleted = await medicalExamService.deleteMedicalExam(req.params.id);
            if (!deleted) return apiResponse.notFound(res, 'Examen médico no encontrado');
            return apiResponse.success(res, 'Examen médico eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar examen médico:', error);
            return apiResponse.error(res, 'Error interno del servidor');
        }
    }
}

module.exports = new MedicalExamController(); 