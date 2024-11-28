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
            GRID_CONFIG.startX = position.x;
            GRID_CONFIG.startY = position.y;
            
            const gridStructure = await createTableStructure(GRID_CONFIG);
            const buttons = await createBoardButtons(gridStructure);
            
            // Set up event listeners for the entire board
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

    // Create header cells
    for (let i = 0; i < headers.length; i++) {
        // Create header shape (rectangle)
        const headerShape = await miro.board.createShape({
            type: 'shape',
            shape: 'rectangle',
            x: position.x + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: position.y,
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
            content: headers[i]
        });
        elements.push(headerShape);
    }

    // Create first data row
    const defaultValues = ['Click to edit', '0', '1', '0.00'];
    const rowY = position.y + GRID_CONFIG.cellHeight + GRID_CONFIG.spacing;

    for (let i = 0; i < defaultValues.length; i++) {
        const dataShape = await miro.board.createShape({
            type: 'shape',
            shape: 'rectangle',
            x: position.x + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
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
            content: defaultValues[i]
        });
        elements.push(dataShape);
    }

    // Create "Add Row" button
    const buttonWidth = 100;
    const buttonY = position.y - GRID_CONFIG.cellHeight;

    const addButton = await miro.board.createShape({
        type: 'shape',
        shape: 'round_rectangle',
        x: position.x,
        y: buttonY,
        width: buttonWidth,
        height: 40,
        style: {
            fillColor: '#4262FF',
            borderColor: 'transparent',
            textAlign: 'center',
            fontSize: GRID_CONFIG.fontSize,
            fontFamily: 'arial',
            textAlignVertical: 'middle',
            color: '#FFFFFF'
        },
        content: '+ Add Row'
    });

    elements.push(addButton);

    // Set up click handler for Add Row button using Miro's events
    miro.board.ui.on('selection:update', async (event) => {
        const selectedItems = event.items;
        if (selectedItems.length === 1 && selectedItems[0].id === addButton.id) {
            const rowCount = (elements.length - 5) / 4; // Exclude header and button
            const newRowY = rowY + (rowCount * (GRID_CONFIG.cellHeight + GRID_CONFIG.spacing));
            
            for (let i = 0; i < defaultValues.length; i++) {
                const newCell = await miro.board.createShape({
                    type: 'shape',
                    shape: 'rectangle',
                    x: position.x + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
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
                    content: defaultValues[i]
                });
                elements.push(newCell);
            }
        }
    });

    // Update viewport to show all elements
    await miro.board.viewport.zoomTo(elements);
    return elements;
}

function calculateInitialPosition(viewport) {
    return {
        x: viewport.x + viewport.width / 2,
        y: viewport.y + viewport.height / 2
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
            content: defaultValues[i]
        });
        gridStructure.elements.push(cell);
    }
    
    GRID_CONFIG.rows++;
} 