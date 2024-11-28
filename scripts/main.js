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
    headerColor: '#E6E6E6',
    dataColor: '#FFFFFF',
    buttonColor: '#4262FF',
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
        // Create header background
        const headerCell = await miro.board.createShape({
            type: 'rectangle',
            x: position.x + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: position.y,
            width: GRID_CONFIG.cellWidth,
            height: GRID_CONFIG.cellHeight,
            style: {
                fillColor: GRID_CONFIG.headerColor,
                borderColor: '#D0D0D0'
            }
        });

        // Create header text
        const headerText = await miro.board.createText({
            content: headers[i],
            x: headerCell.x,
            y: headerCell.y,
            width: GRID_CONFIG.cellWidth,
            style: {
                textAlign: 'center',
                fontSize: GRID_CONFIG.fontSize,
                bold: true
            }
        });

        elements.push(headerCell, headerText);
    }

    // Create first data row
    const defaultValues = ['Click to edit', '0', '1', '0.00'];
    const rowY = position.y + GRID_CONFIG.cellHeight + GRID_CONFIG.spacing;

    for (let i = 0; i < defaultValues.length; i++) {
        // Create cell background
        const dataCell = await miro.board.createShape({
            type: 'rectangle',
            x: position.x + (i * (GRID_CONFIG.cellWidth + GRID_CONFIG.spacing)),
            y: rowY,
            width: GRID_CONFIG.cellWidth,
            height: GRID_CONFIG.cellHeight,
            style: {
                fillColor: GRID_CONFIG.dataColor,
                borderColor: '#D0D0D0'
            }
        });

        // Create cell text
        const dataText = await miro.board.createText({
            content: defaultValues[i],
            x: dataCell.x,
            y: dataCell.y,
            width: GRID_CONFIG.cellWidth,
            style: {
                textAlign: i === 0 ? 'left' : 'right',
                fontSize: GRID_CONFIG.fontSize
            }
        });

        elements.push(dataCell, dataText);
    }

    // Create "Add Row" button
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonY = position.y - GRID_CONFIG.cellHeight;

    const addButton = await miro.board.createShape({
        type: 'rectangle',
        x: position.x,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        style: {
            fillColor: GRID_CONFIG.buttonColor,
            borderColor: 'transparent'
        }
    });

    const buttonText = await miro.board.createText({
        content: '+ Add Row',
        x: position.x,
        y: buttonY,
        width: buttonWidth,
        style: {
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: GRID_CONFIG.fontSize
        }
    });

    elements.push(addButton, buttonText);

    // Group all elements
    await miro.board.group(elements);

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