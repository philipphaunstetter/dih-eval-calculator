window.miro = window.miro || {
    board: {
        ui: {
            on: () => {},
        },
    },
};

// Configuration
const CONFIG = {
    grid: {
        cellWidth: 180,
        cellHeight: 60,
        spacing: 2,
        fontSize: 14
    },
    colors: {
        header: '#E6E6E6',
        cell: '#FFFFFF',
        border: '#D0D0D0',
        button: '#4262FF',
        buttonHover: '#2D4ADB'
    }
};

// Initialize the app
miro.board.ui.on('icon:click', async () => {
    try {
        const viewport = await miro.board.viewport.get();
        const position = {
            x: viewport.x + viewport.width / 2,
            y: viewport.y + viewport.height / 2
        };
        
        await createInitialGrid(position);
    } catch (error) {
        console.error('Error:', error);
    }
});

async function createInitialGrid(position) {
    // We'll implement this next
} 