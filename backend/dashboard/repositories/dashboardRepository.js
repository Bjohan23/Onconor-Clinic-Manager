const { getSequelize } = require('../../shared/config/db');

class MilkIncomeRepository {
    async findAll(option = 3, finicio, ffin) {
        const sequelize = getSequelize();
        console.log(`[MilkIncomeRepository.findAll] Using database: ${sequelize.config.database}`);
        
        const dashboard = await sequelize.query(
            "CALL uspget_dashboard_milk_income(:p_opcion, :p_filtroFecha1, :p_filtroFecha2);",
            {
                replacements: {
                    p_opcion: option, 
                    p_filtroFecha1: finicio,
                    p_filtroFecha2: ffin                
                },
                type: sequelize.QueryTypes.RAW
            }
        );
        const suppliers = await this.countAllSuppliers();
        return dashboard
    }

    async countAllSuppliers() {
        const sequelize = getSequelize();
        console.log(`[MilkIncomeRepository.countAllSuppliers] Using database: ${sequelize.config.database}`);
        
        const suppliers = await sequelize.query(
            "SELECT COUNT(*) as total FROM suppliers WHERE flg_deleted = 1 AND ACTIVE = 1;",
            {
                type: sequelize.QueryTypes.RAW
            }
        );
        return suppliers[0][0].total;
    }

    async topSuppliers(limit = 5) {
        const sequelize = getSequelize();
        console.log(`[MilkIncomeRepository.topSuppliers] Using database: ${sequelize.config.database}`);
        
        const suppliers = await sequelize.query(
            "CALL uspget_top_suppliers(:limit);",
            {
                replacements: { limit },
                type: sequelize.QueryTypes.RAW
            }
        );
        return suppliers;
    }
}

module.exports = new MilkIncomeRepository();