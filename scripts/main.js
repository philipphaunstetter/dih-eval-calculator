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
    // Running in Miro - wait for icon click
    miro.board.ui.on('icon:click', async () => {
        try {
            // Get current viewport center
            const viewport = await miro.board.viewport.get();
            const center = {
                x: viewport.x + viewport.width / 2,
                y: viewport.y + viewport.height / 2
            };

            // Create the table directly as a shape
            const table = await miro.board.createShape({
                type: 'table',
                content: document.getElementById('dynamicTable').outerHTML,
                width: 800,
                height: 400,
                x: center.x,
                y: center.y,
                style: {
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#ddd'
                }
            });

            // Initialize your table
            init();

            // Update the viewport to focus on the table
            await miro.board.viewport.zoomTo(table);
        } catch (error) {
            console.error('Error creating table:', error);
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