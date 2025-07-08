const dashboardService = require('../services/dashboardService')
const { sendSuccess, sendError } = require("../../shared/helpers/apiResponseHelper");

exports.getAllDashboard = async (req, res) => {
    try {
        const option = req.params.option
        const { filtroFecha1 = '', filtroFecha2 = '' } = req.query;
        const result = await dashboardService.getAllMilkIncome(option, filtroFecha1, filtroFecha2);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 500, error.message);
    }
}

exports.getAllCountSuppliers = async (req, res) => {
    try {
        const resultCount = await dashboardService.getAllCountSuppliers();
        const resultTopSuppliers = await dashboardService.getAllTopSuppliers(5);

        const result = {
            totalSuppliers: resultCount,
            topSuppliers: resultTopSuppliers
        };

        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 500, error.message);
    } 
}



