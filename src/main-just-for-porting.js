let mainWindow;
let filename;
let working_directory;

function createWindow() {
  // Find screen height so we can resize to 88% of screen height-wise
  let {width, height} = require('electron').screen.getPrimaryDisplay().size
  height = Math.round(height * 0.88);

  // Create window with specified options
  // width=x, height=y, spellcheck=false, devtools on/off, menubar on/off, keyboard shortcuts on/off, etc.
}

ipcMain.on('call-saveAs', (event, arg) => saveas(arg));

function saveas(output) {
  var fullPath = '';
  // If save as with an existing saved file, put file name as current one
  if(filename) {
    fullPath = path.join(working_directory, filename);
  } else {
    fullpath = working_directory;
  }
  var options = {
    //title: 'Select the file path to save',
    defaultPath: fullPath,
    //buttonLabel: 'Save',
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'md', extensions: ['md'] },
      { name: 'html', extensions: ['htm', 'html'] },
      { name: 'txt', extensions: ['txt'] }
    ],
    properties: []
  };
  dialog.showSaveDialog(options, function (file) {
    if (file.canceled || !file) {
      return;
    }
    change_working_directory(path.dirname(file));
    filename = path.basename(file);
    save(output);
  });
}

function change_working_directory(new_path) {
  working_directory = new_path;
  mainWindow.webContents.send('change-cwd', working_directory);
}

