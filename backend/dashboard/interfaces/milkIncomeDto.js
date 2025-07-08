class MilkIncomeDTO {
    constructor ({id, supplier_route_id: supplier_route_id, lot_code, arrival_date,  total_volume, period, 
        acidity, somatic_cell_count, proteins, milk_fat, colony_forming_units, 
        density, quality_test_step, is_mixed, milk_income_shift_id, flg_deleted ,user_created})
    {
        this.id = id
        this.supplier_route_id = supplier_route_id
        this.lot_code = lot_code
        this.arrival_date = arrival_date
        this.total_volume = total_volume
        this.period = period
        this.acidity = acidity
        this.somatic_cell_count = somatic_cell_count
        this.proteins = proteins
        this.milk_fat = milk_fat
        this.colony_forming_units = colony_forming_units
        this.density = density
        this.quality_test_step = quality_test_step
        this.is_mixed = is_mixed
        this.milk_income_shift_id = milk_income_shift_id
        this.flg_deleted = flg_deleted
        this.user_created = user_created   
    }
}

module.exports = MilkIncomeDTO