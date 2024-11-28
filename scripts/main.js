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

            // Create a frame to contain our table
            const frame = await miro.board.createFrame({
                title: 'Dynamic Table Calculator',
                x: center.x,
                y: center.y,
                width: 800,
                height: 400
            });

            // Create header cells
            const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
            const cellWidth = 180;
            const cellHeight = 40;
            const startX = frame.x - 350;
            const startY = frame.y - 150;

            // Create header row
            for (let i = 0; i < headers.length; i++) {
                await miro.board.createShape({
                    type: 'rectangle',
                    x: startX + (i * cellWidth),
                    y: startY,
                    width: cellWidth,
                    height: cellHeight,
                    style: {
                        fillColor: '#f5f5f5',
                        borderColor: '#ddd'
                    }
                });

                await miro.board.createText({
                    content: headers[i],
                    x: startX + (i * cellWidth),
                    y: startY,
                    width: cellWidth,
                    style: {
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }
                });
            }

            // Create first data row
            const rowY = startY + cellHeight;
            for (let i = 0; i < headers.length; i++) {
                await miro.board.createShape({
                    type: 'rectangle',
                    x: startX + (i * cellWidth),
                    y: rowY,
                    width: cellWidth,
                    height: cellHeight,
                    style: {
                        fillColor: '#ffffff',
                        borderColor: '#ddd'
                    }
                });
            }

            // Update the viewport to focus on the frame
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