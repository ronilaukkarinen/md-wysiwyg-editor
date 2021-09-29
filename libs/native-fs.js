// From: https://github.com/GoogleChromeLabs/text-editor

/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/***** app.js *****/

const app = {
  file: {
    handle: null,
    name: null,
  },
  hasNativeFS: 'chooseFileSystemEntries' in window || 'showOpenFilePicker' in window,
};

// Verify the APIs we need are supported, show a polite warning if not.
/*if (app.hasNativeFS) {
  alert("No native file system. Switched to legacy mode.")
  document.getElementById('not-supported').classList.add('hidden');
} else {
  document.getElementById('lblLegacyFS').classList.toggle('hidden', false);
  document.getElementById('butSave').classList.toggle('hidden', true);
}*/

/**
 * Creates an empty notepad with no details in it.
 */
app.newFile = () => {
  app.setFile();
};

/**
 * Opens a file for reading.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.openFile = async (fileHandle) => {

  // If the Native File System API is not supported, use the legacy file apis.
  if (!app.hasNativeFS) {
    const file = await app.getFileLegacy();
    if (file) {
      app.readFile(file);
    }
    return;
  }

  // If a fileHandle is provided, verify we have permission to read/write it,
  // otherwise, show the file open prompt and allow the user to select the file.
  if (fileHandle) {
    if (await verifyPermission(fileHandle, true) === false) {
      console.error(`User did not grant permission to '${fileHandle.name}'`);
      return;
    }
  } else {
    try {
      fileHandle = await getFileHandle();
    } catch (ex) {
      if (ex.name === 'AbortError') {
        return;
      }
      const msg = 'An error occured trying to open the file.';
      console.error(msg, ex);
      alert(msg);
    }
  }

  if (!fileHandle) {
    return;
  }
  const file = await fileHandle.getFile();
  app.readFile(file, fileHandle);
};

/**
 * Handle a file for reading (same as openFile() but for file handling/open with—don't check for permissions).
 *
 * @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
 app.handleFile = async (fileHandle) => {

  // If the Native File System API is not supported, use the legacy file apis.
  if (!app.hasNativeFS) {
    const file = await app.getFileLegacy();
    if (file) {
      app.readFile(file);
    }
    return;
  }

  if (!fileHandle) {
    return;
  }
  const file = await fileHandle.getFile();
  app.readFile(file, fileHandle);
};

/**
 * Read the file from disk.
 *
 *  @param {File} file File to read from.
 *  @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.readFile = async (file, fileHandle) => {
  try {
    app.setFile(fileHandle || file.name);
    openFile(file.name, await readFile(file)); // TinyMCE
    app.fileName = file.name;
  } catch (ex) {
    const msg = `An error occured reading ${app.fileName}`;
    console.error(msg, ex);
    alert(msg);
  }
};

/**
 * Saves a file to disk.
 */
app.saveFile = async () => {
  try {
    if (!app.file.handle) {
      return await app.saveFileAs();
    }
    await writeFile(app.file.handle, saveFile(app.fileName)); // TinyMCE
  } catch (ex) {
    const msg = 'Unable to save file';
    console.error(msg, ex);
    alert(msg);
  }
};

/**
 * Saves a new file to disk.
 */
app.saveFileAs = async () => {
  if (!app.hasNativeFS) {
    app.saveAsLegacy(app.file.name, saveFile(app.fileName)); // TinyMCE
    app.fileName = fileHandle.name;
    return;
  }
  let fileHandle;
  try {
    fileHandle = await getNewFileHandle();
  } catch (ex) {
    if (ex.name === 'AbortError') {
      return;
    }
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
  try {
    await writeFile(fileHandle, saveFile(fileHandle.name)); // TinyMCE
    app.fileName = fileHandle.name;
    app.setFile(fileHandle);
  } catch (ex) {
    const msg = 'Unable to save file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
};

/***** fs-helpers.js *****/

/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
function getFileHandle() {
  // For Chrome 86 and later...
  if ('showOpenFilePicker' in window) {
    return window.showOpenFilePicker({
      // https://web.dev/file-system-access/#specifying-a-suggested-file-name-and-start-directory
      //startIn: directoryHandle,app.file.name,
    }).then((handles) => handles[0]);
  }
  // For Chrome 85 and earlier...
  return window.chooseFileSystemEntries();
}

/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
 */
function getNewFileHandle() {
  // For Chrome 86 and later...
  if ('showSaveFilePicker' in window) {
    const opts = {
      suggestedName: persistFilename,
      types: [{ // Added
        description: 'Markdown file',
        accept: {'text/markdown': ['.md', '.markdown']},
      },{ // Added
        description: 'HTML file',
        accept: {'text/html': ['.html', '.htm']},
      },{
        description: 'Text file',
        accept: {'text/plain': ['.txt']},
      }],
    };
    return window.showSaveFilePicker(opts);
  }
  // For Chrome 85 and earlier...
  const opts = {
    type: 'save-file',
    accepts: [{ // Added
      description: 'Markdown file',
      extensions: ['md', 'markdown'],
      mimeTypes: ['text/markdown'],
    },{ // Added
      description: 'HTML file',
      extensions: ['htm', 'html'],
      mimeTypes: ['text/html'],
    },{
      description: 'Text file',
      extensions: ['txt'],
      mimeTypes: ['text/plain'],
    }],
  };
  return window.chooseFileSystemEntries(opts);
}

/**
 * Reads the raw text from a file.
 *
 * @param {File} file
 * @return {!Promise<string>} A promise that resolves to the parsed string.
 */
function readFile(file) {
  // If the new .text() reader is available, use it.
  if (file.text) {
    return file.text();
  }
  // Otherwise use the traditional file reading technique.
  return _readFileLegacy(file);
}

/**
 * Reads the raw text from a file.
 *
 * @private
 * @param {File} file
 * @return {Promise<string>} A promise that resolves to the parsed string.
 */
function _readFileLegacy(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', (e) => {
      const text = e.srcElement.result;
      resolve(text);
    });
    reader.readAsText(file);
  });
}

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to write to.
 * @param {string} contents Contents to write.
 */
async function writeFile(fileHandle, contents) {
  // Support for Chrome 82 and earlier.
  if (fileHandle.createWriter) {
    // Create a writer (request permission if necessary).
    const writer = await fileHandle.createWriter();
    // Write the full length of the contents
    await writer.write(0, contents);
    // Close the file and write the contents to disk
    await writer.close();
    return;
  }
  // For Chrome 83 and later.
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
}

/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if the user has granted read/write permission.
 */
async function verifyPermission(fileHandle, withWrite) {
  const opts = {};
  if (withWrite) {
    opts.writable = true;
    // For Chrome 86 and later...
    opts.mode = 'readwrite';
  }
  // Check if we already have permission, if so, return true.
  if (await fileHandle.queryPermission(opts) === 'granted') {
    return true;
  }
  // Request permission to the file, if the user grants permission, return true.
  if (await fileHandle.requestPermission(opts) === 'granted') {
    return true;
  }
  // The user didn't grant permission, return false.
  return false;
}

/***** ui.js *****/

/**
 * Updates the UI with the current file name.
 * @param {FileHandle|string} fileHandle Filename to display in header.
 */
app.setFile = (fileHandle) => {
  if (fileHandle && fileHandle.name) {
    app.file.handle = fileHandle;
    app.file.name = fileHandle.name;
    //document.title = `${fileHandle.name} - ${app.appName}`;
  } else {
    app.file.handle = null;
    app.file.name = fileHandle;
    //document.title = app.appName;
  }
};

/***** load-sw.js *****/

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js');
  }
});

/***** fallback.js *****/

(function(app) {
  const filePicker = document.getElementById('filePicker');
  const aDownloadFile = document.getElementById('aDownloadFile');

  /**
   * Uses the <input type="file"> to open a new file
   *
   * @return {!Promise<File>} File selected by the user.
   */
  app.getFileLegacy = () => {
    return new Promise((resolve, reject) => {
      filePicker.onchange = (e) => {
        const file = filePicker.files[0];
        if (file) {
          resolve(file);
          return;
        }
        reject(new Error('AbortError'));
      };
      filePicker.click();
    });
  };

  /**
   * Saves a file by creating a downloadable instance, and clicking on the
   * download link.
   *
   * @param {string} filename Filename to save the file as.
   * @param {string} contents Contents of the file to save.
   */
  // function saveAsLegacy(filename, contents) {
  app.saveAsLegacy = (filename, contents) => {
    filename = filename || 'untitled.txt';
    const opts = {type: 'text/plain'};
    const file = new File([contents], '', opts);
    aDownloadFile.href = window.URL.createObjectURL(file);
    aDownloadFile.setAttribute('download', filename);
    aDownloadFile.click();
  };
})(app);

