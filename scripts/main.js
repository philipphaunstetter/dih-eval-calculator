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
            // Get current viewport
            const viewport = await miro.board.viewport.get();
            
            // Default position (viewport center)
            let position = {
                x: viewport.x + viewport.width / 2,
                y: viewport.y + viewport.height / 2
            };

            // Create header cells using sticky notes
            const headers = ['Definition', 'Weight (%)', 'Tool 1', 'Points'];
            const cellWidth = 180;
            const cellHeight = 40;
            const startX = position.x - (headers.length * cellWidth) / 2;
            const startY = position.y;

            // Create header row using sticky notes
            for (let i = 0; i < headers.length; i++) {
                await miro.board.createStickyNote({
                    content: headers[i],
                    x: startX + (i * cellWidth),
                    y: startY,
                    width: cellWidth,
                    style: {
                        fillColor: '#f5f5f5',
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    }
                });
            }

            // Create first data row
            const rowY = startY + cellHeight;
            await miro.board.createStickyNote({
                content: 'Click to edit',
                x: startX,
                y: rowY,
                width: cellWidth
            });

            await miro.board.createStickyNote({
                content: '0',
                x: startX + cellWidth,
                y: rowY,
                width: cellWidth
            });

            await miro.board.createStickyNote({
                content: '1',
                x: startX + (2 * cellWidth),
                y: rowY,
                width: cellWidth
            });

            await miro.board.createStickyNote({
                content: '0.00',
                x: startX + (3 * cellWidth),
                y: rowY,
                width: cellWidth
            });

            // Create "Add Row" button as a sticky note
            await miro.board.createStickyNote({
                content: '+ Add Row',
                x: startX,
                y: startY - cellHeight,
                width: 100,
                style: {
                    fillColor: '#4262ff',
                    textColor: '#ffffff'
                }
            });

            // Update viewport to show all created items
            const allItems = await miro.board.get();
            await miro.board.viewport.zoomTo(allItems);

        } catch (error) {
            console.error('Error creating grid:', error);
        }
    });
} 