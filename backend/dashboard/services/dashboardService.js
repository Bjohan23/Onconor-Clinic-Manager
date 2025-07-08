const dashboardRepository = require('../repositories/dashboardRepository')

const getAllMilkIncome = async (option, finicio, ffin) => {
    // Función para obtener el último día del mes
    const getLastDayOfMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    // Función para formatear la fecha
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    let startDate, endDate;

    switch (parseInt(option)) {
        case 1: // Todos
            startDate = null;
            endDate = null;
            break;
        case 2: // Última semana
            endDate = new Date();
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate = formatDate(startDate);
            endDate = formatDate(endDate);
            break;
        case 3: // Por mes
            if (finicio) {
                const [year, month] = finicio.split('-').map(Number);
                startDate = formatDate(new Date(year, month - 1, 1));
                endDate = formatDate(new Date(year, month - 1, getLastDayOfMonth(year, month)));
            } else {
                const now = new Date();
                startDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
                endDate = formatDate(new Date(now.getFullYear(), now.getMonth(), getLastDayOfMonth(now.getFullYear(), now.getMonth() + 1)));
            }
            break;
        case 4: // Entre meses
            if (finicio && ffin) {
                startDate = finicio;
                endDate = ffin;
            } else {
                throw new Error('Se requieren fechas de inicio y fin para la opción entre meses');
            }
            break;
        case 5: // Por fecha específica
            if (finicio) {
                startDate = finicio;
                endDate = finicio;
            } else {
                const now = new Date();
                startDate = formatDate(now);
                endDate = startDate;
            }
            break;
        case 6: // Entre fechas
            if (finicio && ffin) {
                startDate = finicio;
                endDate = ffin;
            } else {
                throw new Error('Se requieren fechas de inicio y fin para la opción entre fechas');
            }
            break;
        default:
            throw new Error('Opción inválida');
    }

    // Llamada al repositorio con las fechas convertidas
    return await dashboardRepository.findAll(option, startDate, endDate);
};

const getAllCountSuppliers = async () => {
    return await dashboardRepository.countAllSuppliers();
};

const getAllTopSuppliers = async (limit) => {
    return await dashboardRepository.topSuppliers(limit);
}

module.exports = {
    getAllMilkIncome,
    getAllCountSuppliers,
    getAllTopSuppliers
}
