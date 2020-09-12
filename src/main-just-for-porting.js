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

ipcMain.on('call-open', (event, arg) => open());
ipcMain.on('call-save', (event, arg) => save(arg));
ipcMain.on('call-saveAs', (event, arg) => saveas(arg));

ipcMain.on('call-fullscreen', (event, arg) => fullscreentoggle());

function open() {
  dialog.showOpenDialog({ properties: ["openFile"], defaultPath: working_directory }, function (file) {
    // Prevent error message if click cancel
    if(!file[0]) {
      return;
    }
    fs.readFile(file[0], 'utf8', (err, data) => {
      if (err) throw err;
      change_working_directory(path.dirname(file[0]));
      filename = path.basename(file[0]);
      mainWindow.webContents.send('opened-file', filename, path.extname(filename), data);
    });
  });
}

function save(output) {
  if (filename == null) {
    saveas(output);
  } else {
    var fullpath = path.join(working_directory, filename);
    // Save as text
    if(path.extname(filename) == ".txt" || path.extname(filename) == ".text") {
      output = output.text;
    // Save as markdown
    } else if(path.extname(filename) == ".md" || path.extname(filename) == ".markdown") {
      output = output.markdown;
    // Save as HTML (HTML or other extension)
    } else {
      output = output.html;
    }
    fs.writeFile(fullpath, beautify(output, { indent_size: 2 }), (err) => {
      if (err) {
        throw err;
      }
      mainWindow.webContents.send('saved-file', filename);
    });
  }
}

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

function fullscreentoggle() {
  if(mainWindow.isFullScreen() == false) {
    mainWindow.setFullScreen(true);
  } else {
    mainWindow.setFullScreen(false);
    mainWindow.setMenuBarVisibility(false);
  }
  mainWindow.webContents.send('fullscreen-change');
}

