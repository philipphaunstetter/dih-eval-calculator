class CalculationEngine {
    constructor() {
        this.formulas = new Map();
    }

    addFormula(columnId, formula) {
        this.formulas.set(columnId, formula);
    }

    calculate(values, columnId) {
        const formula = this.formulas.get(columnId);
        if (!formula) return 0;

        try {
            // Convert string values to numbers
            const numericValues = {
                value1: parseFloat(values.value1) || 0,
                value2: parseFloat(values.value2) || 0
            };
            return formula(numericValues);
        } catch (error) {
            console.error('Calculation error:', error);
            return 0;
        }
    }

    getFormula(columnId) {
        return this.formulas.get(columnId);
    }

    cloneFormula(sourceColumnId, targetColumnId) {
        const formula = this.getFormula(sourceColumnId);
        if (formula) {
            this.addFormula(targetColumnId, formula);
        }
    }
} 