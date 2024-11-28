class TableManager {
    constructor(calculationEngine) {
        this.table = document.getElementById('dynamicTable');
        this.tbody = this.table.querySelector('tbody');
        this.rowCount = 0;
        this.calculationEngine = calculationEngine;
    }

    addRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="definition" placeholder="Enter definition"></td>
            <td><input type="number" min="0" max="100" class="weight" data-row="${this.rowCount}" value="0"></td>
            <td><input type="number" min="1" max="5" class="score" data-tool="1" data-row="${this.rowCount}" value="1"></td>
            <td class="points" data-tool="1" data-row="${this.rowCount}">0.00</td>
        `;

        // Add cells for additional tools (if any)
        const toolCount = (document.querySelector('thead tr').children.length - 2) / 2;
        for (let i = 2; i <= toolCount; i++) {
            row.innerHTML += `
                <td><input type="number" min="1" max="5" class="score" data-tool="${i}" data-row="${this.rowCount}" value="1"></td>
                <td class="points" data-tool="${i}" data-row="${this.rowCount}">0.00</td>
            `;
        }

        this.tbody.appendChild(row);
        this.rowCount++;
        this.attachInputListeners(row);
    }

    attachInputListeners(row) {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('weight')) {
                    // Ensure weight is between 0 and 100
                    let value = parseFloat(input.value) || 0;
                    value = Math.min(100, Math.max(0, value));
                    input.value = value;
                }
                if (input.classList.contains('score')) {
                    // Ensure score is between 1 and 5
                    let value = parseInt(input.value) || 1;
                    value = Math.min(5, Math.max(1, value));
                    input.value = value;
                }
                this.updateCalculations(row);
            });
        });
    }

    updateCalculations(row) {
        const weight = parseFloat(row.querySelector('.weight').value) || 0;
        const toolCount = (document.querySelector('thead tr').children.length - 2) / 2;

        for (let i = 1; i <= toolCount; i++) {
            const score = parseInt(row.querySelector(`.score[data-tool="${i}"]`).value) || 1;
            const points = (weight / 100) * score * 20;
            row.querySelector(`.points[data-tool="${i}"]`).textContent = points.toFixed(2);
        }
    }
} 