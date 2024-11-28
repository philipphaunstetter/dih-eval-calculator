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

                // Position the new grid to the right or below existing content
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

            const calculationEngine = new CalculationEngine();
            const gridManager = new GridManager(calculationEngine);
            const toolManager = new ToolManager(calculationEngine);

            // Create header cells
            const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
            const cellWidth = 180;
            const cellHeight = 40;

            // Create header row
            const headerRow = await createHeaderRow(headers, position.x, position.y, cellWidth, cellHeight);
            
            // Add initial data row
            await gridManager.addRow(position.x, position.y + cellHeight, cellWidth, cellHeight);

            // Add controls as separate shapes
            await createControls(position.x, position.y - cellHeight, gridManager, toolManager);

            // Update viewport to show the created content
            const allNewItems = await miro.board.get();
            await miro.board.viewport.zoomTo(allNewItems);

        } catch (error) {
            console.error('Error creating grid:', error);
        }
    });
}

async function createHeaderRow(headers, x, y, cellWidth, cellHeight) {
    const headerShapes = [];
    for (let i = 0; i < headers.length; i++) {
        const shape = await miro.board.createShape({
            type: 'rectangle',
            x: x + (i * cellWidth),
            y: y,
            width: cellWidth,
            height: cellHeight,
            style: {
                fillColor: '#f5f5f5',
                borderColor: '#ddd'
            }
        });
        
        const text = await miro.board.createText({
            content: headers[i],
            x: x + (i * cellWidth),
            y: y,
            width: cellWidth,
            style: {
                textAlign: 'center',
                fontWeight: 'bold'
            }
        });
        
        headerShapes.push({ shape, text });
    }
    return headerShapes;
}

async function createControls(x, y, gridManager, toolManager) {
    const addRowButton = await miro.board.createShape({
        type: 'rectangle',
        x: x,
        y: y,
        width: 100,
        height: 30,
        style: {
            fillColor: '#4262ff',
            borderColor: '#2d4bc7'
        }
    });

    await miro.board.createText({
        content: 'Add Row',
        x: x,
        y: y,
        width: 100,
        style: {
            textAlign: 'center',
            color: '#ffffff'
        }
    });

    addRowButton.onClick = () => gridManager.addRow(x, y + 40, 180, 40);
} 