// Modern Miro SDK initialization
window.miro = window.miro || {
    board: {
        ui: {
            on: () => {},
        },
    },
};

// Check if we're running in Miro or standalone
const isInMiro = window.miro.board && typeof window.miro.board.ui.on === 'function';

if (isInMiro) {
    miro.board.ui.on('icon:click', async () => {
        try {
            // Get all items on the board
            const allItems = await miro.board.get();
            
            // Get current viewport
            const viewport = await miro.board.viewport.get();
            
            // Default position (viewport center)
            let position = {
                x: viewport.x + viewport.width / 2,
                y: viewport.y + viewport.height / 2
            };

            // Find empty space
            if (allItems.length > 0) {
                // Get the rightmost item
                const rightmostItem = allItems.reduce((max, item) => {
                    const itemRight = item.x + (item.width || 0) / 2;
                    return itemRight > max ? itemRight : max;
                }, viewport.x);

                // Get the bottommost item
                const bottommostItem = allItems.reduce((max, item) => {
                    const itemBottom = item.y + (item.height || 0) / 2;
                    return itemBottom > max ? itemBottom : max;
                }, viewport.y);

                // Position the new table to the right or below existing content
                if (rightmostItem + 900 < viewport.x + viewport.width) {
                    // Space available on the right
                    position = {
                        x: rightmostItem + 450,
                        y: viewport.y + viewport.height / 2
                    };
                } else {
                    // Position below
                    position = {
                        x: viewport.x + viewport.width / 2,
                        y: bottommostItem + 250
                    };
                }
            }

            // Create a frame at the found position
            const frame = await miro.board.createFrame({
                title: 'Dynamic Table Calculator',
                x: position.x,
                y: position.y,
                width: 800,
                height: 400,
                style: {
                    fillColor: '#ffffff'
                }
            });

            // Create grid header
            const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
            const cellWidth = 180;
            const cellHeight = 40;

            const gridManager = new GridManager(calculationEngine);
            const toolManager = new ToolManager(calculationEngine);

            // Create header cells
            const headerRow = await createHeaderRow(headers, position.x, position.y, cellWidth, cellHeight);
            
            // Add initial data row
            await gridManager.addRow(position.x, position.y + cellHeight, cellWidth, cellHeight);

            // Add controls as separate shapes
            await createControls(position.x, position.y - cellHeight, gridManager, toolManager);

        } catch (error) {
            console.error('Error creating grid:', error);
        }
    });
} else {
    // Running standalone - initialize immediately
    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
}

async function init() {
    const calculationEngine = new CalculationEngine();
    const tableManager = new TableManager(calculationEngine);
    const columnManager = new ColumnManager(calculationEngine);

    document.getElementById('addRow').addEventListener('click', () => {
        tableManager.addRow();
    });

    document.getElementById('addTool').addEventListener('click', () => {
        columnManager.addTool();
    });

    // Add initial row
    tableManager.addRow();

    if (isInMiro) {
        // If in Miro, we need to sync the table content
        await miro.board.sync();
    }
}

async function createHeaderRow(headers, x, y, cellWidth, cellHeight) {
    // Create header cells using shapes and text
}

async function createControls(x, y, gridManager, toolManager) {
    // Create control buttons as interactive shapes
} 