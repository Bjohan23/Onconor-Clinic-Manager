<<<<<<< HEAD
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

module.exports = {
    apiResponse: new ApiResponseHelper()
=======
const sendResponse = (res, status, success, data, message) => {
    res.status(status).json({ success, data, message });
};

const sendSuccess = (res, data, message) => {
    sendResponse(res, 200, true, data, message);
};

const sendError = (res, status, message) => {
    sendResponse(res, status, false, null, message);
};

// API Response helper object with all the methods used in controllers
const apiResponse = {
    success: (res, message, data = null) => {
        res.status(200).json({ success: true, message, data });
    },
    
    error: (res, message, status = 500) => {
        res.status(status).json({ success: false, message, data: null });
    },
    
    notFound: (res, message = 'Recurso no encontrado') => {
        res.status(404).json({ success: false, message, data: null });
    },
    
    conflict: (res, message = 'Conflicto con el recurso') => {
        res.status(409).json({ success: false, message, data: null });
    },
    
    badRequest: (res, message = 'Solicitud incorrecta') => {
        res.status(400).json({ success: false, message, data: null });
    },
    
    unauthorized: (res, message = 'No autorizado') => {
        res.status(401).json({ success: false, message, data: null });
    },
    
    forbidden: (res, message = 'Acceso prohibido') => {
        res.status(403).json({ success: false, message, data: null });
    }
};

module.exports = {
    sendSuccess,
    sendError,
    apiResponse
>>>>>>> cba23b290adc2f74bba367ddda3da6f2434091dd
};