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
    fontSize: 14
};

// Check if we're running in Miro or standalone
const isInMiro = window.miro.board && typeof window.miro.board.ui.on === 'function';

if (isInMiro) {
    miro.board.ui.on('icon:click', async () => {
        try {
            const viewport = await miro.board.viewport.get();
            const position = calculateInitialPosition(viewport);
            await createTableStructure(position);
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

    // Set up click handler for Add Row button
    addButton.on('click', async () => {
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