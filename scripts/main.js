miro.onReady(() => {
  // Initialize the Miro toolbar
  miro.initialize({
    extensionPoints: {
      toolbar: {
        title: "Dynamic Table Calculator",
        toolbarSvgIcon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M8,18H4v-4h4V18z M8,13H4V9h4V13z M14,18h-4v-4h4V18z M14,13h-4V9h4V13z M20,18h-4v-4h4V18z M20,13h-4V9h4V13z"/></svg>',
        librarySvgIcon: '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M8,18H4v-4h4V18z M8,13H4V9h4V13z M14,18h-4v-4h4V18z M14,13h-4V9h4V13z M20,18h-4v-4h4V18z M20,13h-4V9h4V13z"/></svg>',
        onClick: async () => {
          // Create a new frame for the table
          const frame = await miro.board.createFrame({
            title: 'Dynamic Table Calculator',
            width: 800,
            height: 600
          });

          // Initialize your table
          init();
        }
      }
    }
  });
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