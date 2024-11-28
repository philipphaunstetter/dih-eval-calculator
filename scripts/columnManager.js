class ColumnManager {
    constructor(calculationEngine) {
        this.calculationEngine = calculationEngine;
        this.toolCount = 1;
    }

    addTool() {
        this.toolCount++;
        const headerRow = document.querySelector('thead tr');
        
        // Add score column header
        const thScore = document.createElement('th');
        thScore.textContent = `Tool ${this.toolCount}`;
        headerRow.appendChild(thScore);

        // Add points column header
        const thPoints = document.createElement('th');
        thPoints.textContent = 'Points';
        headerRow.appendChild(thPoints);

        // Add cells to existing rows
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row, rowIndex) => {
            // Add score input cell
            const tdScore = document.createElement('td');
            tdScore.innerHTML = `<input type="number" min="1" max="5" class="score" data-tool="${this.toolCount}" data-row="${rowIndex}" value="1">`;
            row.appendChild(tdScore);

            // Add points calculation cell
            const tdPoints = document.createElement('td');
            tdPoints.className = 'points';
            tdPoints.dataset.tool = this.toolCount;
            tdPoints.dataset.row = rowIndex;
            tdPoints.textContent = '0.00';
            row.appendChild(tdPoints);

            // Trigger initial calculation
            const weight = parseFloat(row.querySelector('.weight').value) || 0;
            const score = 1; // Default value
            const points = (weight / 100) * score * 20;
            tdPoints.textContent = points.toFixed(2);
        });
    }
} 