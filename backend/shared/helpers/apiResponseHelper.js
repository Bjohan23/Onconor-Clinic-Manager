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
};