class ApiResponseHelper {
    
    // Respuesta exitosa
    success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    // Error genérico
    error(res, message, statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: null
        });
    }

    // Bad Request (400)
    badRequest(res, message, errors = null) {
        return res.status(400).json({
            success: false,
            message,
            data: null,
            errors
        });
    }

    // Unauthorized (401)
    unauthorized(res, message = 'No autorizado') {
        return res.status(401).json({
            success: false,
            message,
            data: null
        });
    }

    // Forbidden (403)
    forbidden(res, message = 'Acceso prohibido') {
        return res.status(403).json({
            success: false,
            message,
            data: null
        });
    }

    // Not Found (404)
    notFound(res, message = 'Recurso no encontrado') {
        return res.status(404).json({
            success: false,
            message,
            data: null
        });
    }

    // Conflict (409)
    conflict(res, message) {
        return res.status(409).json({
            success: false,
            message,
            data: null
        });
    }

    // Validation Error (422)
    validationError(res, message, errors) {
        return res.status(422).json({
            success: false,
            message,
            data: null,
            errors
        });
    }

    // Created (201)
    created(res, message, data = null) {
        return res.status(201).json({
            success: true,
            message,
            data
        });
    }

    // No Content (204)
    noContent(res) {
        return res.status(204).send();
    }
}

// Helper functions para crear respuestas
const createSuccessResponse = (data, message = 'Operación exitosa') => ({
    success: true,
    message,
    data
});

const createErrorResponse = (message, details = null) => ({
    success: false,
    message,
    data: null,
    ...(details && { details })
});

module.exports = {
    apiResponse: new ApiResponseHelper(),
    createSuccessResponse,
    createErrorResponse
};