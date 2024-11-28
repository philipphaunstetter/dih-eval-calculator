// Modern Miro SDK initialization
window.miro = window.miro || {
    board: {
        ui: {
            on: () => {},
        },
    },
};

// Grid configuration
const GRID_CONFIG = {
    cellWidth: 180,
    cellHeight: 60,
    headerColor: 'gray',
    dataColor: 'light_yellow',
    buttonColor: 'blue',
    spacing: 5
};

// Check if we're running in Miro or standalone
const isInMiro = window.miro.board && typeof window.miro.board.ui.on === 'function';

if (isInMiro) {
    miro.board.ui.on('icon:click', async () => {
        try {
            const viewport = await miro.board.viewport.get();
            const position = calculateInitialPosition(viewport);
            const grid = await createInitialGrid(position);
            await setupGridInteractivity(grid);
            await miro.board.viewport.zoomTo(grid.getAllElements());
        } catch (error) {
            console.error('Error creating grid:', error);
        }
    });
}

async function createInitialGrid(position) {
    const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
    const grid = new GridStructure(position, GRID_CONFIG);

    // Create header row
    const headerRow = await grid.addRow(headers, true);

    // Create first data row with default values
    const defaultValues = ['Click to edit', '0', '1', '0.00'];
    const dataRow = await grid.addRow(defaultValues, false);

    // Create control buttons
    await grid.addControlButton('+ Add Row', position.x, position.y - GRID_CONFIG.cellHeight);

    return grid;
}

class GridStructure {
    constructor(position, config) {
        this.position = position;
        this.config = config;
        this.elements = [];
        this.rows = [];
    }

    async addRow(values, isHeader) {
        const rowY = this.position.y + (this.rows.length * (this.config.cellHeight + this.config.spacing));
        const row = [];

        for (let i = 0; i < values.length; i++) {
            // Create background shape
            const shape = await miro.board.createShape({
                type: 'rectangle',
                x: this.position.x + (i * (this.config.cellWidth + this.config.spacing)),
                y: rowY,
                width: this.config.cellWidth,
                height: this.config.cellHeight,
                style: {
                    fillColor: isHeader ? this.config.headerColor : this.config.dataColor,
                    borderColor: 'transparent'
                }
            });

            // Create text widget
            const text = await miro.board.createText({
                content: values[i],
                x: shape.x,
                y: shape.y,
                width: this.config.cellWidth,
                style: {
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontSize: isHeader ? 14 : 12,
                    bold: isHeader
                }
            });

            row.push({ shape, text });
            this.elements.push(shape, text);
        }

        this.rows.push(row);
        return row;
    }

    async addControlButton(label, x, y) {
        const button = await miro.board.createShape({
            type: 'rectangle',
            x: x,
            y: y,
            width: 100,
            height: 40,
            style: {
                fillColor: this.config.buttonColor,
                borderColor: 'transparent'
            }
        });

        const text = await miro.board.createText({
            content: label,
            x: x,
            y: y,
            width: 100,
            style: {
                textAlign: 'center',
                verticalAlign: 'middle',
                color: 'white',
                fontSize: 12,
                bold: true
            }
        });

        this.elements.push(button, text);
        return { button, text };
    }

    getAllElements() {
        return this.elements;
    }
}

function calculateInitialPosition(viewport) {
    return {
        x: viewport.x + viewport.width / 2,
        y: viewport.y + viewport.height / 2
    };
}

async function setupGridInteractivity(grid) {
    // Add click handlers for buttons and cells
    grid.getAllElements().forEach(element => {
        if (element.type === 'shape') {
            element.on('click', async () => {
                // Handle click events
                if (element.style.fillColor === GRID_CONFIG.buttonColor) {
                    // It's a button - add new row
                    await grid.addRow(['New Item', '0', '1', '0.00'], false);
                }
            });
        }
    });
} 