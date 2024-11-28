// Modern Miro SDK initialization
window.miro = window.miro || {
    board: {
        ui: {
            on: () => {},
        },
    },
};

miro.board.ui.on('icon:click', async () => {
    try {
        // Create a new frame for the table
        const frame = await miro.board.createFrame({
            title: 'Dynamic Table Calculator',
            width: 800,
            height: 600
        });

        // Initialize your table
        init();
    } catch (error) {
        console.error('Error creating table:', error);
    }
});

function init() {
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
} 