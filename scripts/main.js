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
            // Create a new frame for the table
            const frame = await miro.board.createFrame({
                title: 'Dynamic Table Calculator',
                width: 800,
                height: 600
            });

            // Create the table as a shape inside the frame
            const table = await miro.board.createShape({
                content: '<div id="dynamicTable"></div>',
                width: 750,
                height: 550,
                x: frame.x,
                y: frame.y,
                style: {
                    backgroundColor: '#ffffff',
                }
            });

            // Initialize your table
            init();

            // Update the frame viewport
            await miro.board.viewport.zoomTo(frame);
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