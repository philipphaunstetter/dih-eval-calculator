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
    spacing: 2,
    fontSize: 14,
    startX: 0,
    startY: 0,
    rows: 1,
    columns: 4
};

// Button configuration
const BUTTON_CONFIG = {
    width: 120,
    height: 40,
    cornerRadius: 8,
    fillColor: '#4262FF',
    hoverColor: '#2D4ADB',
    textColor: '#FFFFFF',
    fontSize: 14
};

// Check if we're running in Miro or standalone
const isInMiro = window.miro.board && typeof window.miro.board.ui.on === 'function';

if (isInMiro) {
    miro.board.ui.on('icon:click', async () => {
        try {
            const viewport = await miro.board.viewport.get();
            const position = calculateInitialPosition(viewport);
            
            // Create table structure with numeric coordinates
            const gridStructure = await createTableStructure({
                x: position.x,
                y: position.y
            });
            
            const buttons = await createBoardButtons(gridStructure);
            await setupBoardEventListeners(gridStructure, buttons);
            
            // Update viewport to show everything
            const allElements = [...gridStructure.elements, ...buttons.elements];
            await miro.board.viewport.zoomTo(allElements);
        } catch (error) {
            console.error('Error creating table structure:', error);
        }
    });
}

async function createTableStructure(position) {
    const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
    const elements = [];
    const cells = {}; // Store cells for calculations

    // Ensure position values are numbers
    const startX = Number(position.x);
    const startY = Number(position.y);

    // Create header cells
    for (let i = 0; i < headers.length; i++) {
        const headerShape = await miro.board.createShape({
            type: 'shape',
            shape: 'rectangle',
            x: startX + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: startY,
            width: GRID_CONFIG.cellWidth,
            height: GRID_CONFIG.cellHeight,
            style: {
                fillColor: '#E6E6E6',
                borderColor: '#D0D0D0',
                textAlign: 'center',
                fontSize: GRID_CONFIG.fontSize,
                fontFamily: 'arial',
                textAlignVertical: 'middle'
            },
            content: headers[i],
            metadata: {
                type: 'header',
                column: i
            }
        });
        elements.push(headerShape);
    }

    // Create first data row
    const defaultValues = ['Click to edit', '0', '1', '0.00'];
    const rowY = startY + GRID_CONFIG.cellHeight + GRID_CONFIG.spacing;

    for (let i = 0; i < defaultValues.length; i++) {
        const dataShape = await miro.board.createShape({
            type: 'shape',
            shape: 'rectangle',
            x: startX + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: rowY,
            width: GRID_CONFIG.cellWidth,
            height: GRID_CONFIG.cellHeight,
            style: {
                fillColor: '#FFFFFF',
                borderColor: '#D0D0D0',
                textAlign: i === 0 ? 'left' : 'right',
                fontSize: GRID_CONFIG.fontSize,
                fontFamily: 'arial',
                textAlignVertical: 'middle'
            },
            content: defaultValues[i],
            metadata: {
                type: 'cell',
                row: 0,
                column: i,
                isCalculated: i === 3 // Points column
            }
        });
        elements.push(dataShape);
        
        // Store cells for calculations
        if (!cells[0]) cells[0] = {};
        cells[0][i] = dataShape;
    }

    // Set up calculation listener
    miro.board.ui.on('text:update', async (event) => {
        const shape = event.items[0];
        if (shape.metadata?.type === 'cell') {
            const row = shape.metadata.row;
            const col = shape.metadata.column;
            
            // If weight or score was updated
            if (col === 1 || col === 2) {
                const weight = parseFloat(cells[row][1].content) || 0;
                const score = parseFloat(cells[row][2].content) || 1;
                const points = (weight / 100) * score * 20;
                
                // Update points cell
                await miro.board.updateShape({
                    id: cells[row][3].id,
                    content: points.toFixed(2)
                });
            }
        }
    });

    return {
        elements,
        startX,
        startY,
        cells
    };
}

function calculateInitialPosition(viewport) {
    return {
        x: Number(viewport.x) + Number(viewport.width) / 2,
        y: Number(viewport.y) + Number(viewport.height) / 2
    };
}

async function createBoardButtons(gridStructure) {
    const elements = [];
    
    // Create "Add Row" button
    const addRowButton = await miro.board.createShape({
        type: 'shape',
        shape: 'rectangle',
        x: GRID_CONFIG.startX,
        y: GRID_CONFIG.startY - BUTTON_CONFIG.height - 10,
        width: BUTTON_CONFIG.width,
        height: BUTTON_CONFIG.height,
        style: {
            fillColor: BUTTON_CONFIG.fillColor,
            borderColor: 'transparent',
            cornerRadius: BUTTON_CONFIG.cornerRadius
        },
        metadata: {
            type: 'button',
            action: 'add-row'
        }
    });

    const addRowText = await miro.board.createText({
        content: '+ Add Row',
        x: addRowButton.x,
        y: addRowButton.y,
        width: BUTTON_CONFIG.width,
        style: {
            textAlign: 'center',
            color: BUTTON_CONFIG.textColor,
            fontSize: BUTTON_CONFIG.fontSize,
            fontFamily: 'arial',
            textAlignVertical: 'middle'
        }
    });

    elements.push(addRowButton, addRowText);

    return {
        addRowButton,
        addRowText,
        elements,
        async updatePositions() {
            const newY = GRID_CONFIG.startY + 
                        (GRID_CONFIG.rows * (GRID_CONFIG.cellHeight + GRID_CONFIG.spacing)) + 
                        BUTTON_CONFIG.height;
            await addRowButton.setPosition({ x: addRowButton.x, y: newY });
            await addRowText.setPosition({ x: addRowText.x, y: newY });
        }
    };
}

async function setupBoardEventListeners(gridStructure, buttons) {
    miro.board.ui.on('selection:update', async (event) => {
        const selectedItems = event.items;
        
        if (selectedItems.length === 1) {
            const item = selectedItems[0];
            
            if (item.metadata?.type === 'button') {
                switch (item.metadata.action) {
                    case 'add-row':
                        // Visual feedback
                        const originalColor = item.style.fillColor;
                        item.style.fillColor = BUTTON_CONFIG.hoverColor;
                        
                        // Add new row
                        await addNewRow(gridStructure);
                        
                        // Update button positions
                        await buttons.updatePositions();
                        
                        // Reset color
                        setTimeout(() => {
                            item.style.fillColor = originalColor;
                        }, 200);
                        break;
                }
            }
        }
    });
}

async function addNewRow(gridStructure) {
    const defaultValues = ['Click to edit', '0', '1', '0.00'];
    const newRowY = GRID_CONFIG.startY + 
                   (GRID_CONFIG.rows * (GRID_CONFIG.cellHeight + GRID_CONFIG.spacing));
    
    const rowCells = {};
    
    for (let i = 0; i < GRID_CONFIG.columns; i++) {
        const cell = await miro.board.createShape({
            type: 'shape',
            shape: 'rectangle',
            x: GRID_CONFIG.startX + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: newRowY,
            width: GRID_CONFIG.cellWidth,
            height: GRID_CONFIG.cellHeight,
            style: {
                fillColor: '#FFFFFF',
                borderColor: '#D0D0D0',
                textAlign: i === 0 ? 'left' : 'right',
                fontSize: GRID_CONFIG.fontSize,
                fontFamily: 'arial',
                textAlignVertical: 'middle'
            },
            content: defaultValues[i],
            metadata: {
                type: 'cell',
                row: GRID_CONFIG.rows,
                column: i,
                isCalculated: i === 3
            }
        });
        gridStructure.elements.push(cell);
        rowCells[i] = cell;
    }
    
    // Store cells for calculations
    gridStructure.cells[GRID_CONFIG.rows] = rowCells;
    
    GRID_CONFIG.rows++;
} 