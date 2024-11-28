document.addEventListener('DOMContentLoaded', () => {
    init();
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

miro.onReady(() => {
  // Add button to toolbar
  miro.initialize({
    extensionPoints: {
      toolbar: {
        title: "Dynamic Table Calculator",
        toolbarSvgIcon: '<svg>...</svg>',
        librarySvgIcon: '<svg>...</svg>',
        onClick: async () => {
          // Create a new frame for the table
          const frame = await miro.board.createFrame({
            title: 'Dynamic Table Calculator',
            width: 800,
            height: 600
          });
          
          // Initialize your table inside the frame
          init();
        }
      }
    }
  });
}); 