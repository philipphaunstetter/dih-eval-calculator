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

            // Create header cells
            const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
            const cellWidth = 180;
            const cellHeight = 40;
            const startX = center.x - (headers.length * cellWidth) / 2;
            const startY = center.y - cellHeight;

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

                // Add input fields for the first row
                if (i === 0) {
                    await miro.board.createText({
                        content: 'Click to edit',
                        x: startX + (i * cellWidth),
                        y: rowY,
                        width: cellWidth,
                        style: { textAlign: 'left' }
                    });
                } else if (i === 1) {
                    await miro.board.createText({
                        content: '0',
                        x: startX + (i * cellWidth),
                        y: rowY,
                        width: cellWidth,
                        style: { textAlign: 'right' }
                    });
                } else if (i === 2) {
                    await miro.board.createText({
                        content: '1',
                        x: startX + (i * cellWidth),
                        y: rowY,
                        width: cellWidth,
                        style: { textAlign: 'right' }
                    });
                } else {
                    await miro.board.createText({
                        content: '0.00',
                        x: startX + (i * cellWidth),
                        y: rowY,
                        width: cellWidth,
                        style: { textAlign: 'right' }
                    });
                }
            }

            // Select all created elements to show them in viewport
            const allItems = await miro.board.get();
            await miro.board.viewport.zoomTo(allItems);

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