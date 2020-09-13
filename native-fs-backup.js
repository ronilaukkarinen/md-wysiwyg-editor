/***** analytics.js *****/

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

/**
 * Google Analytics are disable for the demo.
 * To enable, uncomment the two sections marked "Enable Google Analytics Here.",
 * and update the Google Analytics site ID (UA-XXXXXXX-XX).
 */

/* eslint-disable */
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
/* esline-enable */

/* Enable Google Analytics Here. */
// ga('create', 'UA-XXXXXXX-XX', 'auto');
// ga('set', 'transport', 'beacon');

/**
 * Add Analytics script to page
 */
window.addEventListener('DOMContentLoaded', () => {
  if (location.hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.log('🔕', 'Running on localhost, analytics not loaded.');
    return;
  }

  /* Enable Google Analytics Here. */
  // const gaScript = document.createElement('script');
  // gaScript.src = 'https://www.google-analytics.com/analytics.js';
  // document.head.appendChild(gaScript);
});

/***** idb-keyval-iife.js *****/

/* From https://github.com/jakearchibald/idb-keyval */
/* Retreived 2020-04-10 */

var idbKeyval = (function (exports) {
  'use strict';

  class Store {
      constructor(dbName = 'keyval-store', storeName = 'keyval') {
          this.storeName = storeName;
          this._dbp = new Promise((resolve, reject) => {
              const openreq = indexedDB.open(dbName, 1);
              openreq.onerror = () => reject(openreq.error);
              openreq.onsuccess = () => resolve(openreq.result);
              // First time setup: create an empty object store
              openreq.onupgradeneeded = () => {
                  openreq.result.createObjectStore(storeName);
              };
          });
      }
      _withIDBStore(type, callback) {
          return this._dbp.then(db => new Promise((resolve, reject) => {
              const transaction = db.transaction(this.storeName, type);
              transaction.oncomplete = () => resolve();
              transaction.onabort = transaction.onerror = () => reject(transaction.error);
              callback(transaction.objectStore(this.storeName));
          }));
      }
  }
  let store;
  function getDefaultStore() {
      if (!store)
          store = new Store();
      return store;
  }
  function get(key, store = getDefaultStore()) {
      let req;
      return store._withIDBStore('readonly', store => {
          req = store.get(key);
      }).then(() => req.result);
  }
  function set(key, value, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.put(value, key);
      });
  }
  function del(key, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.delete(key);
      });
  }
  function clear(store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.clear();
      });
  }
  function keys(store = getDefaultStore()) {
      const keys = [];
      return store._withIDBStore('readonly', store => {
          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // And openKeyCursor isn't supported by Safari.
          (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
              if (!this.result)
                  return;
              keys.push(this.result.key);
              this.result.continue();
          };
      }).then(() => keys);
  }

  exports.Store = Store;
  exports.get = get;
  exports.set = set;
  exports.del = del;
  exports.clear = clear;
  exports.keys = keys;

  return exports;

  }({}));

/***** rum.js *****/

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

/* eslint-disable no-redeclare */
/* exported gaEvent, gaTiming, */

/**
 * Logs an event to Google Analytics.
 * @param {string} category - The object that was interacted with.
 * @param {string} action - The type of interaction.
 * @param {string} [label] - Useful for categorizing events.
 * @param {number} [value] - A numeric value associated with the event.
 * @param {boolean} [nonInteraction=false] - Indicates a non-interaction event.
 */
function gaEvent(category, action, label, value, nonInteraction) {
  // eslint-disable-next-line no-console
  // console.log('🔔', category, action, label, value);
  if (location.hostname === 'localhost') {
    return;
  }
  const obj = {
    eventCategory: category,
    eventAction: action,
  };
  if (label) {
    obj.eventLabel = label;
  }
  if (value) {
    obj.eventValue = value;
  }
  if (nonInteraction) {
    obj.nonInteraction = true;
  }
  if (window.ga) {
    window.ga('send', 'event', obj);
  }
}

/**
 * Logs an timing event to Google Analytics.
 * @param {string} category - Category of timer.
 * @param {string} variable - The variable being timed.
 * @param {integer} value - A numeric value associated with the event.
 * @param {string} [label] - Useful for categorizing events.
 */
function gaTiming(category, variable, value, label) {
  value = parseInt(value, 10);
  // eslint-disable-next-line no-console
  // console.log('⏱️', category, variable, value, label);
  if (location.hostname === 'localhost') {
    return;
  }
  if (window.ga) {
    window.ga('send', 'timing', category, variable, value, label);
  }
}

/**
 * Analytics for window type: browser, standalone, standalone-ios
 */
window.addEventListener('load', () => {
  setTimeout(() => {
    let windowStyle = 'browser';
    if (window.navigator.standalone === true) {
      windowStyle = 'standalone-ios';
    } else if (matchMedia('(display-mode: standalone)').matches === true) {
      windowStyle = 'standalone';
    }
    gaEvent('Window Style', windowStyle, null, null, true);
  }, 3100);
});

/**
 * Performance analytics: load & paint
 */
window.addEventListener('load', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'window-load', pNow);
    setTimeout(() => {
      const paintMetrics = performance.getEntriesByType('paint');
      if (paintMetrics && paintMetrics.length > 0) {
        paintMetrics.forEach((entry) => {
          const name = entry.name;
          const time = Math.round(entry.startTime + entry.duration);
          gaTiming('Start', name, time);
        });
      }
    }, 3000);
  }
});

/**
 * Performance analytics: GA PageView, DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', () => {
  if ('performance' in window) {
    const pNow = Math.round(performance.now());
    gaTiming('Start', 'dom-content-loaded', pNow);
  }
  if (window.ga) {
    window.ga('send', 'pageview', '/');
    // eslint-disable-next-line no-console
    // console.log('👀', 'pageview', '/');
  }
});

/**
 * Log the app version.
 */
window.addEventListener('load', () => {
  gaEvent('App Version', '[[VERSION]]', null, null, true);
});

/**
 * Log page visibility.
 */
document.addEventListener('visibilitychange', (e) => {
  const state = document.hidden === true ? 'hidden' : 'visible';
  gaEvent('Page Visibility', state, null, null, true);
});

/***** app.js *****/

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

/* globals getFileHandle, getNewFileHandle, readFile, verifyPermission,
           writeFile */

// eslint-disable-next-line no-redeclare
const app = {
  appName: 'Text Editor',
  file: {
    handle: null,
    name: null,
    isModified: false,
  },
  options: {
    captureTabs: true,
    fontSize: 14,
    monoSpace: false,
    wordWrap: true,
  },
  hasNativeFS: 'chooseFileSystemEntries' in window ||
               'showOpenFilePicker' in window,
  isMac: navigator.userAgent.includes('Mac OS X'),
};

// Verify the APIs we need are supported, show a polite warning if not.
if (app.hasNativeFS) {
  document.getElementById('not-supported').classList.add('hidden');
  // gaEvent('File System APIs', 'Native');
} else {
  document.getElementById('lblLegacyFS').classList.toggle('hidden', false);
  document.getElementById('butSave').classList.toggle('hidden', true);
  // gaEvent('File System APIs', 'Legacy');
}

/**
 * Creates an empty notepad with no details in it.
 */
app.newFile = () => {
  if (!app.confirmDiscard()) {
    return;
  }
  app.setText();
  app.setFile();
  app.setModified(false);
  app.setFocus(true);
  //gaEvent('FileAction', 'New');
};

/**
 * Opens a file for reading.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.openFile = async (fileHandle) => {
  if (!app.confirmDiscard()) {
    return;
  }

  // If the Native File System API is not supported, use the legacy file apis.
  if (!app.hasNativeFS) {
    //gaEvent('FileAction', 'Open', 'Legacy');
    const file = await app.getFileLegacy();
    if (file) {
      app.readFile(file);
    }
    return;
  }

  // If a fileHandle is provided, verify we have permission to read/write it,
  // otherwise, show the file open prompt and allow the user to select the file.
  if (fileHandle) {
    //gaEvent('FileAction', 'OpenRecent', 'Native');
    if (await verifyPermission(fileHandle, true) === false) {
      console.error(`User did not grant permission to '${fileHandle.name}'`);
      return;
    }
  } else {
    //gaEvent('FileAction', 'Open', 'Native');
    try {
      fileHandle = await getFileHandle();
    } catch (ex) {
      if (ex.name === 'AbortError') {
        return;
      }
      //gaEvent('Error', 'FileOpen', ex.name);
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
 * Read the file from disk.
 *
 *  @param {File} file File to read from.
 *  @param {FileSystemFileHandle} fileHandle File handle to read from.
 */
app.readFile = async (file, fileHandle) => {
  try {
    app.setText(await readFile(file));
    app.setFile(fileHandle || file.name);
    app.setModified(false);
    //app.setFocus(true);

    // TinyMCE ->
    openFile(file.name, await readFile(file));
    app.fileName = file.name;
    // <- End TinyMCE
  } catch (ex) {
    //gaEvent('Error', 'FileRead', ex.name);
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
    //gaEvent('FileAction', 'Save');
    // TinyMCE ->
    // await writeFile(app.file.handle, app.getText());
    await writeFile(app.file.handle, saveFile(app.fileName));
    // <- End TinyMCE
    app.setModified(false);
  } catch (ex) {
    //gaEvent('Error', 'FileSave', ex.name);
    const msg = 'Unable to save file';
    console.error(msg, ex);
    alert(msg);
  }
  // app.setFocus();
};

/**
 * Saves a new file to disk.
 */
app.saveFileAs = async () => {
  if (!app.hasNativeFS) {
    //gaEvent('FileAction', 'Save As', 'Legacy');
    // TinyMCE ->
    // app.saveAsLegacy(app.file.name, app.getText());
    app.saveAsLegacy(app.file.name, saveFile(app.fileName));
    app.fileName = fileHandle.name;
    // <- End TinyMCE

    // app.setFocus();
    return;
  }
  //gaEvent('FileAction', 'Save As', 'Native');
  let fileHandle;
  try {
    fileHandle = await getNewFileHandle();
  } catch (ex) {
    if (ex.name === 'AbortError') {
      return;
    }
    //gaEvent('Error', 'FileSaveAs1', ex.name);
    const msg = 'An error occured trying to open the file.';
    console.error(msg, ex);
    alert(msg);
    return;
  }
  try {
    // TinyMCE ->
    // await writeFile(fileHandle, app.getText());
    await writeFile(fileHandle, saveFile(fileHandle.name));
    app.fileName = fileHandle.name;
    // <- End TinyMCE

    app.setFile(fileHandle);
    app.setModified(false);
  } catch (ex) {
    //gaEvent('Error', 'FileSaveAs2', ex.name);
    const msg = 'Unable to save file.';
    console.error(msg, ex);
    alert(msg);
    //gaEvent('Error', 'Unable to write file', 'Native');
    return;
  }
  // app.setFocus();
};

/**
 * Attempts to close the window
 */
app.quitApp = () => {
  if (!app.confirmDiscard()) {
    return;
  }
  //gaEvent('FileAction', 'Quit');
  window.close();
};

/***** menus.js *****/

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

// eslint-disable-next-line no-redeclare
const myMenus = {};

/**
 * Initializes a drop down menu.
 *
 * @param {Element} container Container element with the drop down menu.
 */
myMenus.setup = (container) => {
  const toggleButton = container.querySelector('button.menuTop');
  toggleButton.addEventListener('click', () => {
    myMenus._toggle(toggleButton);
  });
  myMenus.addKeyboardShortcut(toggleButton);
  container.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
      myMenus.hideAll();
      app.setFocus();
      return;
    }
    if (e.keyCode === 40) {
      const next = e.srcElement.nextElementSibling;
      if (next) {
        next.focus();
      }
      return;
    }
    if (e.keyCode === 38) {
      const prev = e.srcElement.previousElementSibling;
      if (prev) {
        prev.focus();
      }
      return;
    }
  });
};

/**
 * Initializes a drop down menu.
 *
 * @param {Element} button Toggle button to show/hide menu.
 */
myMenus.addKeyboardShortcut = (button) => {
  if (app.isMac) {
    // Keyboard shortcuts aren't available on mac.
    return;
  }
  let key;
  try {
    key = button.querySelector('.kbdShortcut').textContent.trim().toLowerCase();
  } catch (ex) {
    // No keyboard shortcut found.
  }
  if (!key) {
    return;
  }
  window.addEventListener('keydown', (e) => {
    if (e.altKey === true && e.key === key) {
      e.preventDefault();
      button.click();
    }
  });
};

/**
 * Hides all visible menus.
 */
myMenus.hideAll = () => {
  const elems = document.querySelectorAll('.menuContainer');
  elems.forEach((elem) => {
    myMenus.hide(elem);
  });
};

/**
 * Hides a menu dropdown.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
 */
myMenus.hide = (menuContainer) => {
  const button = menuContainer.querySelector('.menuTop');
  button.setAttribute('aria-expanded', false);
  const panel = menuContainer.querySelector('.menuItemContainer');
  if (panel) {
    panel.classList.toggle('hidden', true);
  }
};

/**
 * Shows a menu dropdown.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
 */
myMenus.show = (menuContainer) => {
  myMenus.hideAll();
  const button = menuContainer.querySelector('.menuTop');
  button.setAttribute('aria-expanded', true);
  const panel = menuContainer.querySelector('.menuItemContainer');
  panel.classList.toggle('hidden', false);
  const firstButton = panel.querySelector('button');
  if (!firstButton) {
    myMenus.hideAll();
    app.setFocus();
    return;
  }
  firstButton.focus();
};

/**
 * Creates a new menu item button.
 *
 * @param {string} label Label for button
 * @return {Button} Returns an HTML button.
 */
myMenus.createButton = (label) => {
  const butt = document.createElement('button');
  butt.innerText = label;
  butt.setAttribute('type', 'button');
  butt.setAttribute('role', 'menuitem');
  return butt;
};

/**
 * Adds an element to the menu.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
 * @param {Element} elem Element to add to the menu container.
 */
myMenus.addElement = (menuContainer, elem) => {
  const container = menuContainer.querySelector('.menuItemContainer');
  container.appendChild(elem);
};

/**
 * Removes all items from the menu.
 *
 * @param {Element} menuContainer Container element with the drop down menu.
 */
myMenus.clearMenu = (menuContainer) => {
  const container = menuContainer.querySelector('.menuItemContainer');
  container.innerHTML = '';
};

/**
 * Toggles a menu open or closed.
 *
 * @private
 * @param {Element} button Toggle button to show/hide menu.
 */
myMenus._toggle = (button) => {
  const parent = button.parentElement;
  const expanded = button.getAttribute('aria-expanded');
  if (expanded === 'true') {
    myMenus.hide(parent);
  } else {
    myMenus.show(parent);
  }
};

/* Show shortcuts on menu items when ALT key is pressed, non-Mac only */
if (!app.isMac) {
  window.addEventListener('keydown', (e) => {
    if (e.altKey === true && e.key === 'Alt') {
      document.body.classList.toggle('altKey', true);
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      document.body.classList.toggle('altKey', false);
    }
  });
}

/***** text-area.js *****/

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

(function(app) {
  const textArea = document.getElementById('textEditor');

  /* Setup the main textarea */
  textArea.addEventListener('input', () => {
    app.setModified(true);
  });

  /* Hide menus any time we start typing */
  textArea.addEventListener('focusin', () => {
    myMenus.hideAll();
  });

  /* Listen for tab key */
  textArea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && app.options.captureTabs) {
      e.preventDefault();
      app.insertIntoDoc('\t');
    }
  });

  /* Initialize the textarea, set focus & font size */
  window.addEventListener('DOMContentLoaded', () => {
    textArea.style.fontSize = `${app.options.fontSize}px`;
    app.setFocus();
  });


  /**
   * Sets the text of the editor to the specified value
   *
   * @param {string} val
   */
  app.setText = (val) => {
    val = val || '';
    textArea.value = val;
  };

  /**
   * Gets the text from the editor
   *
   * @return {string}
   */
  app.getText = () => {
    return textArea.value;
  };

  /**
   * Inserts a string into the editor.
   *
   * @param {string} contents Contents to insert into the document.
   */
  app.insertIntoDoc = (contents) => {
    // Find the current cursor position
    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    // Get the current contents of the editor
    const before = textArea.value;
    // Get everything to the left of the start of the selection
    const left = before.substring(0, startPos);
    // Get everything to the right of the start of the selection
    const right = before.substring(endPos);
    // Concatenate the new contents.
    textArea.value = left + contents + right;
    // Move the cursor to the end of the inserted content.
    const newPos = startPos + contents.length;
    textArea.selectionStart = newPos;
    textArea.selectionEnd = newPos;
    app.setModified(true);
  };


  /**
   * Adjust the font size of the textarea up or down by the specified amount.
   *
   * @param {Number} val Number of pixels to adjust font size by (eg: +2, -2).
   */
  app.adjustFontSize = (val) => {
    const newFontSize = app.options.fontSize + val;
    if (newFontSize >= 2) {
      textArea.style.fontSize = `${newFontSize}px`;
      app.options.fontSize = newFontSize;
    }
    gaEvent('Options', 'Font Size', null, newFontSize);
  };

  /**
   * Moves focus to the text area, and potentially cursor to position zero.
   *
   * @param {boolean} startAtTop
   */
  app.setFocus = (startAtTop) => {
    if (startAtTop) {
      textArea.selectionStart = 0;
      textArea.selectionEnd = 0;
      textArea.scrollTo(0, 0);
    }
    textArea.focus();
  };
})(app);

/***** fs-helpers.js *****/

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

/* exported getFileHandle, getNewFileHandle, readFile, verifyPermission,
            writeFile */

/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
function getFileHandle() {
  // For Chrome 86 and later...
  if ('showOpenFilePicker' in window) {
    return window.showOpenFilePicker().then((handles) => handles[0]);
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
      types: [{ // Added
        description: 'Markdown file',
        accept: {'text/markdown': ['md', 'markdown']},
      },{ // Added
        description: 'HTML file',
        accept: {'text/html': ['html', 'htm']},
      },{
        description: 'Text file',
        accept: {'text/plain': ['txt']},
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
  // The user did nt grant permission, return false.
  return false;
}

/***** menu-file.js *****/

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

(function(app) {
  const menuFile = document.getElementById('menuFile');
  myMenus.setup(menuFile);

  document.getElementById('butNew').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.newFile();
  });

  document.getElementById('butOpen').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.openFile();
  });

  document.getElementById('butSave').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFile();
  });

  document.getElementById('butSaveAs').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.saveFileAs();
  });

  document.getElementById('butClose').addEventListener('click', () => {
    myMenus.hide(menuFile);
    app.quitApp();
  });
})(app);

/***** menu-edit.js *****/

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

(function(app) {
  const menuEdit = document.getElementById('menuEdit');
  myMenus.setup(menuEdit);

  document.getElementById('butCut').addEventListener('click', () => {
    myMenus.hide(menuEdit);
    document.execCommand('cut');
    gaEvent('Edit', 'Cut');
  });

  document.getElementById('butCopy').addEventListener('click', () => {
    myMenus.hide(menuEdit);
    document.execCommand('copy');
    gaEvent('Edit', 'Copy');
  });

  document.getElementById('butPaste').addEventListener('click', async () => {
    myMenus.hide(menuEdit);
    try {
      const contents = await navigator.clipboard.readText();
      app.insertIntoDoc(contents);
      app.setModified(true);
      app.setFocus();
      gaEvent('Edit', 'Paste');
    } catch (ex) {
      console.error('Unable to paste', ex);
      gaEvent('Error', 'Paste', ex.name);
    }
  });
})(app);

/***** menu-view.js *****/

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

(function(app) {
  const menuView = document.getElementById('menuView');
  myMenus.setup(menuView);

  const butWordWrap = document.getElementById('butWordWrap');
  const butMonospace = document.getElementById('butMonospace');
  const butCaptureTabs = document.getElementById('butCaptureTabs');
  const lblTabMovesFocus = document.getElementById('lblTabMovesFocus');

  butWordWrap.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleWordWrap();
  });

  butMonospace.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleMonospace();
  });

  butCaptureTabs.addEventListener('click', () => {
    myMenus.hide(menuView);
    app.toggleCaptureTabs();
  });

  document.getElementById('butFontBigger').addEventListener('click', () => {
    myMenus.hide(menuView);
    app.adjustFontSize(+2);
  });

  document.getElementById('butFontSmaller').addEventListener('click', () => {
    myMenus.hide(menuView);
    app.adjustFontSize(-2);
  });

  /**
   * Toggle word wrap
   */
  app.toggleWordWrap = () => {
    const newVal = document.body.classList.toggle('wordwrap');
    butWordWrap.setAttribute('aria-checked', newVal);
    app.options.wordWrap = newVal;
    gaEvent('Options', 'Word Wrap', newVal ? 'true' : 'false');
  };

  /**
   * Toggle Monospace
   */
  app.toggleMonospace = () => {
    const newVal = document.body.classList.toggle('monospace');
    butMonospace.setAttribute('aria-checked', newVal);
    app.options.monoSpace = newVal;
    gaEvent('Options', 'Font Face', newVal ? 'monospace' : 'normal');
  };

  /**
   * Toggles the capture tab functionality
   */
  app.toggleCaptureTabs = () => {
    const newVal = !app.options.captureTabs;
    app.options.captureTabs = newVal;
    butCaptureTabs.setAttribute('aria-checked', newVal);
    lblTabMovesFocus.classList.toggle('hidden', newVal);
    gaEvent('Options', 'Capture Tabs', newVal);
  };
})(app);

/***** menu-recent.js *****/

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

/* global idbKeyval */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

(function(app) {
  const menuRecent = document.getElementById('menuRecent');
  myMenus.setup(menuRecent);

  let recentFiles = [];

  /**
   * Adds a new item to the list of recent files.
   *
   * @param {FileSystemFileHandle} fileHandle File handle to add.
   */
  app.addRecent = async function(fileHandle) {
    // If isSameEntry isn't available, we can't store the file handle
    if (!fileHandle.isSameEntry) {
      console.warn('Saving of recents is unavailable.');
      return;
    }

    // Loop through the list of recent files and make sure the file we're
    // adding isn't already there. This is gross.
    const inList = await Promise.all(recentFiles.map((f) => {
      return fileHandle.isSameEntry(f);
    }));
    if (inList.some((val) => val)) {
      return;
    }

    // Add the new file handle to the top of the list, and remove any old ones.
    recentFiles.unshift(fileHandle);
    if (recentFiles.length > 5) {
      recentFiles.pop();
    }

    // Update the list of menu items.
    refreshRecents();

    // Save the list of recent files.
    idbKeyval.set('recentFiles', recentFiles);
  };

  /**
   * Refresh the list of files in the menu.
   */
  async function refreshRecents() {
    // Clear the existing menu.
    myMenus.clearMenu(menuRecent);

    // If there are no recents, don't draw anything.
    if (recentFiles.length === 0) {
      return;
    }

    // Loop through the list of recent files and add a button for each.
    recentFiles.forEach((recent) => {
      const butt = myMenus.createButton(recent.name);
      butt.addEventListener('click', (e) => {
        myMenus.hide(menuRecent);
        app.openFile(recent);
      });
      myMenus.addElement(menuRecent, butt);
    });

    // Add a button to clear the list of recent items.
    addClearButton();
  }

  /**
   * Adds a clear button to the menu that clears the list of most recent items.
   */
  function addClearButton() {
    const clearButt = myMenus.createButton('Clear');
    clearButt.addEventListener('click', () => {
      myMenus.clearMenu(menuRecent);
      recentFiles = [];
      idbKeyval.clear();
      app.setFocus();
    });
    myMenus.addElement(menuRecent, clearButt);
  }

  /**
   * Initializes the recents menu.
   */
  async function init() {
    recentFiles = await idbKeyval.get('recentFiles') || [];
    refreshRecents();
  }

  init();
})(app);

/***** ui.js *****/

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

(function(app) {
  const spanAppName = document.getElementById('headerAppName');
  const spanFileName = document.getElementById('headerFileName');
  const modifiedHeader = document.getElementById('modifiedHeader');
  const modifiedFooter = document.getElementById('modifiedFooter');

  // Setup the before unload listener to prevent accidental loss on navigation.
  window.addEventListener('beforeunload', (e) => {
    const msg = `There are unsaved changes. Are you sure you want to leave?`;
    if (app.file.isModified) {
      e.preventDefault();
      e.returnValue = msg;
    }
  });

  /**
   * Confirms user does not want to save before closing the current doc.
   * @return {boolean} True if it's OK to discard.
   */
  app.confirmDiscard = () => {
    if (!app.file.isModified) {
      return true;
    }
    const confirmMsg = 'Discard changes? All changes will be lost.';
    return confirm(confirmMsg);
  };

  /**
   * Updates the UI with the current file name.
   * @param {FileHandle|string} fileHandle Filename to display in header.
   */
  app.setFile = (fileHandle) => {
    if (fileHandle && fileHandle.name) {
      app.file.handle = fileHandle;
      app.file.name = fileHandle.name;
      document.title = `${fileHandle.name} - ${app.appName}`;
      spanFileName.textContent = fileHandle.name;
      spanAppName.classList.toggle('hidden', false);
      //app.addRecent(fileHandle);
    } else {
      app.file.handle = null;
      app.file.name = fileHandle;
      document.title = app.appName;
      spanFileName.textContent = app.appName;
      spanAppName.classList.toggle('hidden', true);
    }
  };

  /**
   * Updates the UI if the file has been modified.
   * @param {boolean} val True if the file has been modified.
   */
  app.setModified = (val) => {
    if (!app.hasNativeFS) {
      return;
    }
    app.file.isModified = val;
    document.body.classList.toggle('modified', val);
    const hidden = !val;
    modifiedHeader.classList.toggle('hidden', hidden);
    modifiedFooter.classList.toggle('hidden', hidden);
  };
})(app);

/***** keyboard-events.js *****/

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

/**
 * Setup keyboard shortcuts
 */
window.addEventListener('keydown', (e) => {
  // console.log('key', e.code, e.ctrlKey, e.metaKey, e.shiftKey, e.key);

  // Save As
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    app.saveFileAs();
    return;
  }

  // Save
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 's') {
    e.preventDefault();
    app.saveFile();
    return;
  }

  // Open
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 'o') {
    e.preventDefault();
    app.openFile();
    return;
  }

  // Close
  if ((e.ctrlKey === true || e.metaKey === true) && e.key === 'n') {
    e.preventDefault();
    app.newFile();
    return;
  }

  // Quit
  if ((e.ctrlKey === true || e.metaKey === true) &&
      (e.key === 'q' || e.key === 'w')) {
    e.preventDefault();
    app.quitApp();
    return;
  }

  // Capture Tabs
  if (e.ctrlKey === true && e.shiftKey === true && e.key === 'M') {
    e.preventDefault();
    e.stopPropagation();
    app.toggleCaptureTabs();
  }
});

/***** load-sw.js *****/

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

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js');
  }
});

/***** app-install.js *****/

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

(function(app) {
  const butInstall = document.getElementById('butInstall');

  /**
   * Track successful app installs
   */
  window.addEventListener('appinstalled', (e) => {
    gaEvent('Install', 'installed');
  });

  /**
   * Listen for 'beforeinstallprompt' event, and update the UI to indicate
   * text-editor can be installed.
   */
  window.addEventListener('beforeinstallprompt', (e) => {
    // Don't show the mini-info bar
    e.preventDefault();

    // Log that install is available.
    gaEvent('Install', 'available');

    // Save the deferred prompt
    app.installPrompt = e;

    // Show the install button
    butInstall.removeAttribute('disabled');
    butInstall.classList.remove('hidden');
  });

  // Handle the install button click
  butInstall.addEventListener('click', () => {
    butInstall.setAttribute('disabled', true);
    app.installPrompt.prompt();
    gaEvent('Install', 'clicked');
  });

  myMenus.addKeyboardShortcut(butInstall);
})(app);

/***** fallback.js *****/

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
    filename = filename || 'Untitled.txt';
    const opts = {type: 'text/plain'};
    const file = new File([contents], '', opts);
    aDownloadFile.href = window.URL.createObjectURL(file);
    aDownloadFile.setAttribute('download', filename);
    aDownloadFile.click();
  };
})(app);

