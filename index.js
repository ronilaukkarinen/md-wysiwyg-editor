let persistFilename = "untitled.md";
let markdownSidebarToggleState = false;
let markdownFullpageToggleState = false;
let fullscreenTracker = false;

let disableRightClick = false;

let reverseShiftEnterBehavior;
let updateMarkdownLessOften;
let customCSS;
let markdownToHTMLEngine;
let HTMLtoMarkdownEngine;
let EasyMDEMarkdownArea;

// Save front matter here while editing
var frontMatter = '';

// Core editor variables
var editorHandle; // // Topmost editor div handle (in body tag)
var editingArea; // Full editing area (WYSIWYG and markdown) handle

var editorPaneTop; // WYSIWYG editing area highest div handle
var iframe; // WYSIWYG editing area iframe handle
var iframeDocument;
var iframeHTML; // WYSIWYG editing area iframe HTML tag handle
var editorPane; // WYSIWYG editing area main div handle (body tag of iframe)

var markdownEditorTop; // Markdown editing area highest div handle
var markdownSidebar; // class = tox-sidebar__pane
var markdownEditor; // Markdown textarea element handle; id = markdown-editor or CodeMirror-scroll
var markdownTextarea; // id = markdown-editor (same as above?)

var WYSIWYGEditorDefinedWidth;
var scrolledPane; // Which editing pane the mouse cursor is currently in (WYSIWYG or markdown)

// Get important editor element handles
function setupCoreEditorHandles() {

  // Full editor area (both panes)
  editorHandle = document.getElementsByClassName('tox')[0];
  editingArea = document.getElementsByClassName('tox-sidebar-wrap')[0];

  // WYSIWYG editor area (left pane)
  editorPaneTop = document.getElementsByClassName('tox-edit-area')[0];
  iframe = document.getElementById('textEditor_ifr');
  iframeDocument = document.getElementById('textEditor_ifr').contentWindow.document;
  iframeHTML = iframe.contentWindow.document.getElementsByTagName('html')[0];
  editorPane = iframe.contentWindow.document.getElementById('tinymce');

  // Markdown editor area (right pane)
  markdownEditorTop = document.getElementsByClassName('tox-sidebar')[0];
  markdownSidebar = document.getElementsByClassName('tox-sidebar__pane')[0];
  if (EasyMDEMarkdownArea == true) {
    markdownEditor = document.getElementsByClassName('CodeMirror-scroll')[0];
  } else {
    markdownEditor = document.getElementById('markdown-editor');
  }

  return;
}

// Create new file
function newFile() {

  // Is there any change/undo history?
  if (tinymce.editors[0].isDirty()) {
    if (confirm("Unsaved changes. Continue without saving?") == false) {
      return;
    }
  // Are we sure we want to exit out of the current file?
  } else {
    if (confirm("Close the current file and create a new one?") == false) {
      return;
    }
  }

  // ipcRenderer.send('call-new');
  app.newFile(); // Unnecessary but keeping for consistency for now

  tinymce.activeEditor.resetContent();
  updateFilename("untitled.md", false);

  tinyMCE.execCommand('UpdateMarkdown', false, undefined, true);
  setTimeout(tinyMCE.execCommand('UpdateMarkdown'), 100); // Do it again if didn't work the first time... (temporary hack)

  return;
}

// Open file
function openFile(filename, data) {

  // Is there any change/undo history?
  if (tinymce.editors[0].isDirty()) {
    if (confirm("Unsaved changes. Continue without saving?") == false) {
      return;
    }
  }

  // Get file extension/type from filename
  var extension = filename.split('.').pop();
  // Open as HTML
  if (extension == "html" || extension == "htm") {
    tinymce.editors[0].setContent(data, {format: 'html'});
  // Open as markdown
  } else if (extension == "md" || extension == "markdown") {
    tinymce.editors[0].setContent(data, {format: 'markdown'});
  // Open as plain text (TXT or other extension)
  } else {
    // Replace newlines with HTML so read correctly by TinyMCE
    //data = data.replace(/(\n)/g, '<br />');
    data = data.replace(/\n.*\n/g, function(match) {
      return '<p>' + match + '</p>';
    });
    // Replace tabs with em spaces (otherwise will be dropped)
    data = data.replace(/\t/g, function(match) {
      return '&emsp;';
    });
    tinymce.editors[0].setContent(data, {format: 'text'});
  }

  updateFilename(filename, false);
  tinymce.activeEditor.undoManager.clear();
  tinymce.editors[0].setDirty(false);

  tinyMCE.execCommand('UpdateMarkdown', false, undefined, true);
  setTimeout(tinyMCE.execCommand('UpdateMarkdown', false, undefined, true), 100); // Do it again if didn't work the first time... (temporary hack)

  // cacheFileHandle();

  return;
}

// Save file
function saveFile(filename) {

  // Get file extension/type from filename
  var extension = filename.split('.').pop();
  // Save as text
  if (extension == "txt" || extension == "text") {
    var content = tinymce.editors[0].getContent({format: 'text'});
  // Save as markdown
  } else if (extension == "md" || extension == "markdown") {
    var content = tinymce.editors[0].getContent({format: 'markdown'});
  // Save as HTML (HTML or other extension)
  } else {
    var content = tinymce.editors[0].getContent({format: 'html'});
  }

  updateFilename(filename, false);
  tinymce.editors[0].setDirty(false);

  // cacheFileHandle();

  return content;
}

// Save file handle in local storage
/*function cacheFileHandle() {

  if (app.file.handle) {
    localStorage.setItem('fileHandle', JSON.stringify(app.file.handle));
  }

  return;
}*/

// Quit
function quit() {

  // Note/To-do: This doesn't actually work right now
  // Skip/prevent unsaved work warning if editor is dirty but no file and text is empty
  // To-do: Change this so more foolproof (i.e., "untitled.md" check)
  if (persistFilename == 'untitled.md' && tinymce.activeEditor.isDirty()) {
    var content = tinymce.activeEditor.getContent({format: 'text'}).trim();
    if (!content) {
      tinymce.activeEditor.undoManager.clear();
      tinymce.activeEditor.setDirty(false);
    }
  // Disable this for now as will double in the case of Ctrl + W
  }/* else if (confirm("Unsaved changes. Continue without saving?") == false) {
    return;
  }*/

  // Close the window
  window.close();

  return;
}

// Toggle full screen
function toggleFullscreen() {

  // Is fullscreen supported for this browser?
  if (document.fullscreenEnabled == false) {
    alert("Fullscreen not supported for this browser.");
    return;
  }

  // If not fullscreen, try to enter fullscreen
  if (isFullScreen() == true) {
    // Request fullscreen for different platforms
    if (editorHandle.requestFullscreen) {
      editorHandle.requestFullscreen();
    } else if (editorHandle.mozRequestFullScreen) { // Firefox
      editorHandle.mozRequestFullScreen();
    } else if (editorHandle.webkitRequestFullscreen) { // Chrome, Safari and Opera
      editorHandle.webkitRequestFullscreen();
    } else if (editorHandle.msRequestFullscreen) { // IE/Edge
      editorHandle.msRequestFullscreen();
    }
  // If already fullscreen, then exit fullscreen
  } else {
    document.exitFullscreen();
  }

  return;
}

// Check if fullscreen
function isFullScreen() {
  return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

// Update filename
function updateFilename(filename, dirty) {

  var filenameElement = document.getElementById('filename');

  if (filename != null) {
    persistFilename = filename;
    document.title = persistFilename + " - Markdown WYSIWYG Editor";
    if (persistFilename.length <= 20) {
      filenameElement.innerHTML = persistFilename;
    } else {
      filenameElement.innerHTML = filename.slice(0, 19) + '…';
    }
  }

  if (dirty == false) {
    filenameElement.style.fontStyle = "";
  } else {
    filenameElement.style.fontStyle = "italic";
  }

  return;
}

// Check user preferences for Enter vs. Shift+Enter behavior
reverseShiftEnterBehavior = localStorage.getItem('reverseShiftEnterBehavior');
if (reverseShiftEnterBehavior == 'true') {
  reverseShiftEnterBehavior = true;
} else {
  reverseShiftEnterBehavior = false;
}

// Check user preferences for EasyMDE markdown editing area or plain-text text area
EasyMDEMarkdownArea = localStorage.getItem('EasyMDEMarkdownArea');
if (EasyMDEMarkdownArea == 'false') {
  EasyMDEMarkdownArea = false;
  let EasyMDEMarkdownEditor;
} else {
  EasyMDEMarkdownArea = true;
}

tinymce.baseURL = "libs/tinymce";

tinymce.IconManager.add('custom', {

  icons: {
    newdoc: `<svg width="24" height="24"><path fill-rule="nonzero" d="M7 4a1 1 0 00-1 1v14c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V9l-5-5H7zm6 5V5l4 4h-4z"></path></svg>`,
    undo: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M12.5 8c-2.7 0-5 1-6.9 2.6L2 7v9h9l-3.6-3.6A8 8 0 0120 16l2.4-.8a10.5 10.5 0 00-10-7.2z"></path></svg>`,
    redo: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M18.4 10.6a10.5 10.5 0 00-16.9 4.6L4 16a8 8 0 0112.7-3.6L13 16h9V7l-3.6 3.6z"></path></svg>`,
    heading: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="20"><polygon points="6.57 3 6.57 5.57 10.73 5.57 10.73 17 13.82 17 13.82 5.57 18 5.57 18 3 6.57 3"></polygon><polygon points="2 9.65 4.68 9.65 4.68 17 6.66 17 6.66 9.65 9.35 9.65 9.35 8 2 8 2 9.65"></polygon></svg>`,
    bold: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M14.6 11.8c.9-.6 1.4-1.4 1.4-2.3 0-2-1.6-3.5-3.5-3.5H7v12h6.3c1.7 0 3.2-1.5 3.2-3.3 0-1.3-.8-2.4-1.9-2.9zM9.5 8h2.8a1.5 1.5 0 110 3H9.4V8zm3.3 8H9.4v-3h3.3a1.5 1.5 0 110 3z"></path></svg>`,
    italic: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M10 6v2h2.6l-3.7 8H6v2h8v-2h-2.6l3.7-8H18V6z"></path></svg>`,
    underline: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M12 16a5 5 0 005-5V4h-2.5v7a2.5 2.5 0 01-5 0V4H7v7a5 5 0 005 5zm-6 2v2h12v-2H6z"></path></svg>`,
    link: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M4.9 12c0-1.2 1-2.1 2.1-2.1h4V8H7a4 4 0 100 8h4v-1.9H7c-1.2 0-2.1-1-2.1-2.1zM17 8h-4v1.9h4a2.1 2.1 0 110 4.2h-4V16h4a4 4 0 100-8zm-8 5h6v-2H9v2z"></path></svg>`,
    image: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M19 4H5a1 1 0 00-1 1v14c0 .6.5 1 1 1h14c.6 0 1-.4 1-1V5c0-.5-.4-1-1-1zM6.5 16l2.8-3.5 2 2.3 2.7-3.5 3.5 4.7h-11z"></path></svg>`,
    "code-sample": `<svg width="18" height="18" viewBox="0 0 1000 1000"><path fill-rule="nonzero" d="M10,599.7l307.5,197.7V654.7L134.4,541.7l183.1-113.1V284.9L10,483.6V599.7L10,599.7z M382.6,867.5h105.8l155.1-735H537L382.6,867.5z M682.5,284.9v143.7l183,113.1l-183,113v142.7L990,599.7V483.6L682.5,284.9z"></path></svg>`,
    bullist: `<?xml version="1.0" encoding="UTF-8"?><path fill-rule="nonzero" d="M10 13h9v-2h-9v2zm0-7v2h9V6h-9zm0 12h9v-2h-9v2zm-4-5h2v-2H6v2zm0-7v2h2V6H6zm0 12h2v-2H6v2z"></path>`,
    numlist: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M5 16h2v.5H6v1h1v.5H5v1h3v-4H5v1zm0-5h1.8L5 13.1v.9h3v-1H6.2L8 10.9V10H5v1zm1-2h1V5H5v1h1v3zm4-3v2h9V6h-9zm0 12h9v-2h-9v2zm0-5h9v-2h-9v2z"></path></svg>`,
    table: `<svg width="24" height="24"><path fill-rule="nonzero" d="M5 5v14h14V5H5zm6 12H7v-4h4v4zm0-6H7V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"></path></svg>`,
    hr: `<svg width="24" height="24"><path d="M4 11h16v2H4z" fill-rule="evenodd"></path></svg>`,
    blockquote: `<svg width="24" height="24"><path fill-rule="nonzero" d="M13 8v5h2.8L14 16h2.3l1.7-3V8h-5zm-7 5h2.8L7 16h2.3l1.7-3V8H6v5z"></path></svg>`,
    superscript: `<svg width="24" height="24"><path fill-rule="nonzero" d="M15 9.4L10.4 14l4.6 4.6-1.4 1.4L9 15.4 4.4 20 3 18.6 7.6 14 3 9.4 4.4 8 9 12.6 13.6 8 15 9.4zm5.9 1.6h-5v-1l1-.8 1.7-1.6c.3-.5.5-.9.5-1.3 0-.3 0-.5-.2-.7-.2-.2-.5-.3-.9-.3l-.8.2-.7.4-.4-1.2c.2-.2.5-.4 1-.5.3-.2.8-.2 1.2-.2.8 0 1.4.2 1.8.6.4.4.6 1 .6 1.6 0 .5-.2 1-.5 1.5l-1.3 1.4-.6.5h2.6V11z"></path></svg>`,
    subscript: `<svg width="24" height="24"><path fill-rule="nonzero" d="M10.4 10l4.6 4.6-1.4 1.4L9 11.4 4.4 16 3 14.6 7.6 10 3 5.4 4.4 4 9 8.6 13.6 4 15 5.4 10.4 10zM21 19h-5v-1l1-.8 1.7-1.6c.3-.4.5-.8.5-1.2 0-.3 0-.6-.2-.7-.2-.2-.5-.3-.9-.3a2 2 0 00-.8.2l-.7.3-.4-1.1 1-.6 1.2-.2c.8 0 1.4.3 1.8.7.4.4.6.9.6 1.5s-.2 1.1-.5 1.6a8 8 0 01-1.3 1.3l-.6.6h2.6V19z"></path></svg>`,
    sourcecode: `<svg width="38" height="40" viewBox="-6 0 38 24"><path transform="scale (-1, -1)" transform-origin="center" d="M0.3 12.14L17.22 12.14L17.22 7.2L20.16 7.2L20.16 12.14L23.1 12.14L18.69 16.8L14.27 12.14Z"></path><path d="M9.01 7.2L12.01 7.2L12.01 16.8L9.01 16.8L9.01 7.2Z"></path><path d="M2.8 7.2L5.8 7.2L5.8 16.8L2.8 16.8L2.8 7.2Z"></path><path d="M12.01 10.5L12.01 13.5L2.8 13.5L2.8 10.5L12.01 10.5Z"></path></svg>`,
    markdown: `<svg width="24" height="24" viewBox="0 -4 40 24"><path d="M0.5,16 L0.5,0 L5.40322581,0 L10.3064516,5.88235294 L15.2096774,0 L20.1129032,0 L20.1129032,16 L15.2096774,16 L15.2096774,6.82352941 L10.3064516,12.7058824 L5.40322581,6.82352941 L5.40322581,16 L0.5,16 Z M31.1451613,16 L23.7903226,8.23529412 L28.6935484,8.23529412 L28.6935484,0 L33.5967742,0 L33.5967742,8.23529412 L38.5,8.23529412 L31.1451613,16 Z"></path></svg>`,
    darkmode: `<svg version="1.0" width="18" height="18" viewBox="0 0 981.000000 988.000000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <defs> <pattern x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse" viewBox="0 0 100 100" id="pattern-0"> <rect x="0" y="0" width="50" height="100""></rect> </pattern> <pattern id="pattern-0-0" patternTransform="matrix(1, 0, 0, 1, 2974.191772, 8030.287354)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-1" patternTransform="matrix(1, 0, 0, 1, 4889.624394, 4889.736084)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-2" patternTransform="matrix(1, 0, 0, 1, 4388.941284, 5335.855957)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-3" patternTransform="matrix(1, 0, 0, 1, 1833.005493, 4627.5)" xlink:href="#pattern-0"></pattern> </defs> <g transform="matrix(-0.1, 0, 0, -0.1, 980.424866, 988)" stroke="none"> <path d="M2641 9188 c-68 -370 -127 -676 -130 -680 -3 -3 -303 -61 -666 -127 -363 -67 -668 -125 -678 -129 -12 -5 146 -96 580 -331 329 -178 603 -328 609 -335 9 -8 -11 -181 -77 -676 -49 -366 -88 -673 -86 -683 1 -14 100 74 352 314 193 182 418 397 502 476 l151 144 622 -297 c341 -163 623 -294 626 -292 2 3 -129 283 -291 623 -163 340 -294 622 -293 626 2 3 216 231 476 504 260 274 471 500 469 501 -2 2 -311 -37 -687 -87 -547 -72 -685 -87 -692 -77 -4 7 -152 280 -329 606 -177 325 -324 592 -328 592 -3 0 -62 -303 -130 -672z" style=""></path> <path d="M6796 9763 c149 -347 265 -714 333 -1058 62 -313 89 -559 98 -895 17 -691 -101 -1357 -354 -2005 -77 -197 -285 -612 -397 -793 -755 -1218 -1958 -2059 -3341 -2337 -363 -73 -631 -99 -1020 -99 -368 0 -641 25 -980 90 -307 59 -719 183 -992 298 -73 31 -135 56 -138 56 -3 0 35 -80 84 -177 255 -511 537 -906 925 -1301 546 -555 1157 -952 1881 -1222 805 -299 1714 -389 2575 -255 1264 198 2412 867 3213 1872 1077 1352 1399 3147 860 4798 -103 317 -301 751 -470 1030 -504 832 -1197 1479 -2054 1920 -91 46 -182 91 -202 100 l-37 15 16 -37z" style=""></path> <path d="M4190 5893 c0 -12 7 -105 16 -208 8 -103 12 -191 7 -196 -4 -4 -87 -44 -183 -89 -96 -45 -178 -85 -183 -89 -4 -4 85 -29 197 -56 196 -47 205 -50 210 -74 3 -14 14 -102 26 -196 12 -93 23 -176 26 -184 2 -7 53 65 112 160 75 121 115 175 129 177 11 2 107 -13 214 -32 106 -19 194 -34 195 -33 1 1 -60 74 -137 161 l-138 160 49 92 c28 50 72 131 99 180 28 49 48 90 46 93 -3 2 -91 -31 -197 -75 l-192 -78 -148 154 c-107 111 -148 148 -148 133z" style=""></path> <path d="M1540 5443 c0 -21 9 -144 19 -273 11 -129 21 -255 23 -278 l2 -44 -289 -135 c-160 -74 -291 -136 -292 -137 -2 -2 139 -36 311 -76 277 -65 315 -77 320 -95 2 -11 22 -152 43 -312 21 -161 40 -293 43 -293 3 0 67 100 143 223 75 122 150 243 166 268 l29 46 314 -58 c172 -32 314 -56 316 -54 2 1 -90 109 -203 238 -113 130 -205 240 -205 245 0 5 67 130 149 278 82 148 146 270 143 272 -4 1 -138 -51 -297 -117 l-290 -119 -65 66 c-35 37 -136 140 -222 230 l-158 162 0 -37z" style=""></path> </g> </svg>`,
    github: `<svg width="18" height="18" viewBox="0 0 16 16" version="1.1"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>`
  }

});

tinymce.init({

  selector: '#textEditor',
  language: 'tooltips', // Use translations to make custom tooltips for buttons
  language_url: 'tooltips.js',
  height: "100%",
  theme: 'silver',
  content_css: ['css/editor-area-styles.css'],
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; }',
  toolbar: 'file undo redo styleselect bold italic extraformat bullist numlist link blockquote codesample hr table image quickimage markdownButton code fullscreen darkmode preferences github filename', // More: heading, searchreplace
  toolbar_mode: 'floating',
  plugins: 'code codesample, link image table lists paste autolink hr quickbars', // More: searchreplace, textpattern
  external_plugins: {
    'textpattern_mod': '../../libs/tinymce-custom-plugins/textpattern_mod.js',
  },
  contextmenu_never_use_native: true,
  contextmenu: 'undo redo | cut copy copyasmarkdown paste pasteastext selectall',
  icons: 'custom',
  elementpath: false, // Disable e.g. "table > tbody > tr > td > p" in status bar when status bar enabled
  branding: false, // Disable TinyMCE branding in status bar
  menubar: false, // Hide menu bar
  forced_root_block: !reverseShiftEnterBehavior, // Reverse Shift+Enter behavior (<br /> for Enter and <p> for Shift+Enter)
  paste_block_drop: true,
  paste_data_images: true,
  paste_remove_styles_if_webkit: true,
  smart_paste: false,
  link_context_toolbar: true,
  link_title: false,
  link_quicklink: true,
  target_list: false,
  convert_urls: false,
  codesample_global_prismjs: true,
  codesample_languages: [
    { text: 'Markdown', value: 'markdown' },
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'PHP', value: 'php' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C#', value: 'csharp' },
    { text: 'C++', value: 'cpp' },
  ],
  table_toolbar: 'tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tabledelete',
  table_appearance_options: false,
  table_tab_navigation: true,
  table_advtab: false,
  table_cell_advtab: false,
  table_row_advtab: false,
  table_resize_bars: false,
  table_default_attributes: {},
  table_default_styles: {},
  visual: false,
  image_caption: false,
  image_dimensions: false,
  object_resizing: false,
  resize_img_proportional: true, // Disabled due to resizing off
  // remove_trailing_brs: false, // Doesn't do what I want (don't remove end of document lines)
  toolbar_sticky: true,
  resize: false,
  statusbar: false,
  // Protect certain kinds of text
  protect: [
    /* /^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/gm, */ // YAML front matter
    /* /^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/gm, */ // TOML front matter
    /* /\{%\-? .+ \-?%\}/, */ // Liquid (works but hides text and probably not advisable) */
    /* /\{\{ .+ \}\}/, */ // Liquid (works but hides text and probably not advisable) */
  ],
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar: false,
  quickbars_image_toolbar: false,
  fullpage_hide_in_source_view: false,
  // All HTML elements (attributes) except for these will be filtered:
  valid_elements:
    'html,head,title,body,meta[name|content|charset],' +
    'p,a[href],br,strong,b,i,em,u,ins,strike,s,del,sup,sub,small,' +
    'h1,h2,h3,h4,h5,h6,' +
    'ul,ol,li,dl,dt,dd,' +
    'figure,figcaption,img[src|alt|width|height],video[*],source[*],audio[*],' +
    'blockquote,code,pre[class],samp,var,tt,kbd,dfn,cite,mark,q,' +
    'table[colspan|rowspan],thead[colspan|rowspan],tbody[colspan|rowspan],tfoot[colspan|rowspan],th[colspan|rowspan],tr[colspan|rowspan],td[colspan|rowspan],colgroup[span],col[span],caption,' +
    'hr,math[*],',
  // ^ More: https://stackoverflow.com/questions/21281161/tinymce-4-valid-elements-default-rule-set
  /*valid_styles: {
    'p': 'text-decoration,text-decoration-line',
    'span': 'text-decoration,text-decoration-line',
  },*/
  custom_elements: 'htmlprotect',

  style_formats_merge: false,
  style_formats_autohide: true,
  // For style formats toolbar
  style_formats: [
    {title: 'Paragraph',  block: 'p'},
    {title: 'H1', block: 'h1'},
    {title: 'H2', block: 'h2'},
    {title: 'H3', block: 'h3'},
    {title: 'H4', block: 'h4'},
    {title: 'H5', block: 'h5'},
    {title: 'H6', block: 'h6'},
  ],

  // Modify TinyMCE's default internal formats
  // https://www.tiny.cloud/docs/configure/content-formatting/
  // https://www.tiny.cloud/docs/demo/format-custom/
  formats: {
    bold: {
      inline: 'b',
    },
    italic: {
      inline: 'i',
    },
    underline: {
      inline: 'ins',
    },
    strikethrough: {
      inline: 'del',
    },
    // For "remove formatting" keyboard shortcut (I think)
    removeformat: [
      {
        selector: 'b,strong,em,i,font,ins,u,s,strike,del,sub,sup,dfn,blockquote,code,samp,kbd,var,cite,mark,q',
        remove: 'all',
        split: true,
        block_expand: true,
        expand: false,
        deep: true
      },
      { selector: 'span', attributes: ['style', 'class'], remove: 'empty', split: true, expand: false, deep: true },
      { selector: '*', attributes: ['style', 'class'], split: false, expand: false, deep: true }
    ]
  },

  textpattern_patterns: [
    {start: '#', format: 'h1'},
    {start: '##', format: 'h2'},
    {start: '###', format: 'h3'},
    {start: '####', format: 'h4'},
    {start: '#####', format: 'h5'},
    {start: '######', format: 'h6'},
    {start: '*', end: '*', format: 'italic'},
    {start: '_', end: '_', format: 'italic'},
    {start: '**', end: '**', format: 'bold'},
    {start: '__', end: '__', format: 'bold'},
    {start: '***', end: '***', format: 'bold+italic'}, // Non-standard
    {start: '___', end: '___', format: 'bold+italic'}, // Non-standard
    {start: '~~', end: '~~', format: 'strikethrough'},
    {start: '^', end: '^', format: 'superscript'}, // Non-standard
    {start: '1. ', cmd: 'InsertOrderedList'},
    {start: '* ', cmd: 'InsertUnorderedList'},
    {start: '+ ', cmd: 'InsertUnorderedList'},
    {start: '- ', cmd: 'InsertUnorderedList'},
    {start: '> ', cmd: 'mceBlockQuote'},
    {start: '`', end: '`', format: 'code'},
    {start: '```', end: '```', format: 'pre'}, // Different from intended behavior...
    {start: '---', replacement: '—'}, // Non-standard
    {start: '--', replacement: '–'}, // Non-standard
    {start: '===', replacement: '<hr />'}, // Non-standard
    //{start: '***', replacement: '<hr />'}, // Conflicts with bold + italic above
  ],

  mobile: {
    menubar: false,
    toolbar_mode: 'floating',
  },

  // https://www.tiny.cloud/docs/demo/custom-toolbar-button/
  setup: function (editor) {

    // Change how often we update markdown pane based on settings
    updateMarkdownLessOften = localStorage.getItem('updateMarkdownLessOften');
    if (updateMarkdownLessOften == 'true') {
      var characterData = false; // Update on every change
      updateMarkdownLessOften = true;
    } else {
      var characterData = true; // Update on some changes
      updateMarkdownLessOften = false;
    }

    // Retrieve custom styles if any
    customCSS = localStorage.getItem('customCSS');
    if (customCSS == null) {
      customCSS = '';
    }

    // Set up files menu button
    editor.ui.registry.addMenuButton('file', {
      tooltip: 'File',
      icon: 'edit-block',
      fetch: function (callback) {
        var items = [
          {
            type: 'menuitem',
            icon: 'new-document',
            text: 'New (Ctrl+N)',
            onAction: function () {
              newFile();
            }
          },
          {
            type: 'menuitem',
            icon: 'browse',
            text: 'Open (Ctrl+O)',
            onAction: function () {
              // openFile();
              app.openFile();
            }
          },
          {
            type: 'menuitem',
            icon: 'save',
            text: 'Save (Ctrl+S)',
            onAction: function () {
              // saveFile();
              app.saveFile();
            }
          },
          {
            type: 'menuitem',
            icon: 'save',
            text: 'Save as (Shift+Ctrl+S)',
            onAction: function () {
              // saveFileAs();
              app.saveFileAs();
            }
          },
          {
            type: 'menuitem',
            icon: 'close',
            text: 'Quit (Ctrl+W)',
            onAction: function () {
              quit();
            }
          },
        ];
        callback(items);
      }
    });

    // Set up headings formatting button
    /*editor.ui.registry.addMenuButton('heading', {
      tooltip: 'Heading',
      icon: 'heading',
      fetch: function (callback) {
        var items = [
          {
            type: 'menuitem',
            text: 'H1',
            tooltip: 'H1 (Ctrl+Alt+1)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h1');
            }
          },
          {
            type: 'menuitem',
            text: 'H2',
            tooltip: 'H2 (Ctrl+Alt+2)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h2');
            }
          },
          {
            type: 'menuitem',
            text: 'H3',
            tooltip: 'H3 (Ctrl+Alt+3)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h3');
            }
          },
          {
            type: 'menuitem',
            text: 'H4',
            tooltip: 'H4 (Ctrl+Alt+4)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h4');
            }
          },
          {
            type: 'menuitem',
            text: 'H5',
            tooltip: 'H5 (Ctrl+Alt+5)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h5');
            }
          },
          {
            type: 'menuitem',
            text: 'H6',
            tooltip: 'H6 (Ctrl+Alt+6)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h6');
            }
          }
        ];
        callback(items);
      }
    });*/

    editor.ui.registry.addToggleButton('H1', {
      text: 'H1',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h1');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h1', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H2', {
      text: 'H2',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h2');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h2', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H3', {
      text: 'H3',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h3');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h3', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H4', {
      text: 'H4',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h4');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h4', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H5', {
      text: 'H5',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h5');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h5', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H6', {
      text: 'H6',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h6');
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h6', function (state) {
          api.setActive(state);
        });
      }
    });

    // Add heading group toolbar button
    editor.ui.registry.addGroupToolbarButton('heading', {
      icon: 'heading',
      tooltip: 'Heading',
      items: 'h1 h2 h3 h4 h5 h6'
    });

    // Add additional formatting group toolbar button
    editor.ui.registry.addGroupToolbarButton('extraformat', {
      icon: 'more-drawer',
      tooltip: 'Additional formatting options',
      items: 'underline strikethrough superscript subscript'
    });

    editor.ui.registry.addSplitButton('markdownButton', {
      icon: "markdown",
      tooltip: "Markdown (Ctrl+M)",

      // Main button on click
      onAction: function() {
        if (markdownFullpageToggleState == false && markdownSidebarToggleState == true) {
          toggleMarkdownSidebar();
        } else {
          toggleMarkdownFullpage();
        }
      },
      // Items on click
      onItemAction: function(api, value) {
        if (value == 'splitscreen') {
          if (markdownFullpageToggleState == false) {
            toggleMarkdownSidebar();
          }
        } else if (value == 'fullpage') {
          toggleMarkdownFullpage();
        }
      },

      fetch: function(callback) {
        var items = [
          {
            type: 'choiceitem',
            text: 'Full view (Ctrl+M)',
            value: 'fullpage',
          },          {
            type: 'choiceitem',
            text: 'Split screen (Shift+Ctrl+M)',
            value: 'splitscreen',
          },
        ];
        callback(items);
      }
    });

    // Set up markdown pane and toolbar button
    editor.ui.registry.addSidebar('markdown', {
      onSetup: function (api) {
        setupMarkdown(api);
      },
      onShow: function (api) {
        // Update the markdown editor via conversion of the main editor HTML to markdown
        updateMarkdownWithEditorHTML(undefined, true);
        return;
      },
      onHide: function (api) {
        // Not really necessary to update editor HTML with markdown here
        return;
      },
    });

    // Adjust padding if applicable + hack to fix width of the markdown pane
    editor.on('ResizeWindow', function(event) {

      adjustMarkdownEditorWidth();
      adjustEditorSpacing();
      setTimeout(adjustEditorSpacing, 100); // Do it again if didn't work the first time... (temporary hack)

      return;
    });

    editor.addCommand('UpdateMarkdown', function() { return; });

    // Set up fullscreen toolbar button
    editor.ui.registry.addButton('fullscreen', {
      tooltip: 'Fullscreen (Ctr+Shift+F or F11)',
      icon: 'fullscreen',
      onAction: function () {
        toggleFullscreen();
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    // Set up dark mode toolar button
    editor.ui.registry.addButton('darkmode', {
      tooltip: 'Dark mode on/off',
      icon: 'darkmode',
      onAction: function () {
        // Look into this in the future:
        // https://web.dev/prefers-color-scheme/
        switchTheme();
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    // Set up filename display in toolbar (fake button)
    editor.ui.registry.addButton('filename', {
      text: '<span id="filename">' + persistFilename + '</span>',
      tooltip: 'Filename',
      onAction: function () {
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    // Set up preferences dialog menu
    var prefsConfig = {
      title: 'Preferences',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            type: 'checkbox',
            name: 'reverseShiftEnterBehavior',
            label: 'Swap Enter and Shift+Enter behavior (new line (&lt;br /&gt;) on Enter, new paragraph (&lt;p&gt;) on Shift+Enter) (may cause problems)',
          },

          {
            type: 'checkbox',
            name: 'EasyMDEMarkdownArea',
            label: 'Syntax highlighting and styling in the markdown editor? (note: slow in split-screen mode with larger files)',
          },
          {
            type: 'selectbox',
            name: 'markdownToHTMLEngine',
            label: 'Change markdown-to-HTML engine (<a href="https://github.com/markdown-it/markdown-it" target="_blank">markdown-it</a> is default):',
            size: 1,
            items: [
              { value: 'markdown-it', text: 'markdown-it' },
              { value: 'Showdown', text: 'Showdown' },
            ]
          },
          {
            type: 'selectbox',
            name: 'HTMLtoMarkdownEngine',
            label: 'Change HTML-to-markdown engine (<a href="https://github.com/domchristie/turndown" target="_blank">Turndown</a> is default and seems to give better output than <a href="https://github.com/showdownjs/showdown" target="_blank">Showdown</a>):',
            size: 1,
            items: [
              { value: 'Turndown', text: 'Turndown' },
              { value: 'Showdown', text: 'Showdown' },
            ]
          },
          {
            type: 'checkbox',
            name: 'updateMarkdownLessOften',
            label: 'Update the markdown panel less often when open—only when new elements are created (uses less CPU)',
          },
          {
            type: 'textarea',
            name: 'customCSS',
            label: 'Custom CSS stylesheet for editing area (default/template <a href="https://raw.githubusercontent.com/Alyw234237/md-wysiwyg-editor/main/css/editor-area-styles.css">here</a>—copy here and modify as desired</span>):',
            maximized: true,
          },
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'submitButton',
          text: 'Save and reload',
          primary: true
        },
        {
          type: 'cancel',
          name: 'closeButton',
          text: 'Cancel'
        }
      ],
      initialData: {
        customCSS: customCSS,
        updateMarkdownLessOften: updateMarkdownLessOften,
        markdownToHTMLEngine: markdownToHTMLEngine,
        HTMLtoMarkdownEngine: HTMLtoMarkdownEngine,
        reverseShiftEnterBehavior: reverseShiftEnterBehavior,
        EasyMDEMarkdownArea: EasyMDEMarkdownArea,
      },
      onSubmit: function (api) {

        var data = api.getData();

        // Switch between default and custom CSS depending on preferences
        if (data.customCSS != null && data.customCSS != '') {
          customEditorAreaCSS(true, data.customCSS);
          localStorage.setItem('customCSS', data.customCSS);
          customCSS = data.customCSS;
        } else {
          customEditorAreaCSS(false);
          localStorage.removeItem('customCSS');
          customCSS = data.customCSS;
        }

        // Switch markdown update frequency depending on preferences
        if (data.updateMarkdownLessOften == true) {
          localStorage.setItem('updateMarkdownLessOften', 'true');
          updateMarkdownLessOften = true;
        } else {
          localStorage.setItem('updateMarkdownLessOften', 'false');
          updateMarkdownLessOften = false;
        }

        // Change markdown-to-HTML engine depending on preferences
        if (data.markdownToHTMLEngine == 'markdown-it') {
          localStorage.setItem('markdownToHTMLEngine', 'markdown-it');
          markdownToHTMLEngine = 'markdown-it';
        } else if (data.markdownToHTMLEngine == 'Showdown') {
          localStorage.setItem('markdownToHTMLEngine', 'Showdown');
          markdownToHTMLEngine = 'Showdown';
        }

        // Change HTML-to-markdown engine depending on preferences
        if (data.HTMLtoMarkdownEngine == 'Turndown') {
          localStorage.setItem('HTMLtoMarkdownEngine', 'Turndown');
          HTMLtoMarkdownEngine = 'Turndown';
        } else if (data.HTMLtoMarkdownEngine == 'Showdown') {
          localStorage.setItem('HTMLtoMarkdownEngine', 'Showdown');
          HTMLtoMarkdownEngine = 'Showdown';
        }

        // Change Shift+Enter behavior depending on preferences
        if (data.reverseShiftEnterBehavior == true) {
          localStorage.setItem('reverseShiftEnterBehavior', 'true');
          reverseShiftEnterBehavior = true;
        } else {
          localStorage.setItem('reverseShiftEnterBehavior', 'false');
          reverseShiftEnterBehavior = false;
        }

        // Change EasyMDE vs. plain-text text area markdown pane depending on preferences
        if (data.EasyMDEMarkdownArea == true) {
          localStorage.setItem('EasyMDEMarkdownArea', 'true');
          EasyMDEMarkdownArea = true;
        } else {
          localStorage.setItem('EasyMDEMarkdownArea', 'false');
          EasyMDEMarkdownArea = false;
        }

        // Needed as preferences menu otherwise won't have updated initial values for settings if reopened
        location.reload();

        api.close();
      }
    };

    // Add preferences toolbar button and dialogue menu
    editor.ui.registry.addButton('preferences', {
      name: 'Preferences',
      tooltip: 'Preferences',
      icon: 'preferences',
      onAction: function () {
        editor.windowManager.open(prefsConfig)
      }
    });

    // Set up GitHub home page/repository toolbar button
    editor.ui.registry.addButton('github', {
      name: 'GitHub',
      tooltip: 'GitHub',
      icon: 'github',
      onAction: function () {
        if (confirm("This will open the GitHub home page/repository in a new tab. Continue?") == false) {
          return;
        } else {
          window.open('https://github.com/Alyw234237/md-wysiwyg-editor/', '_blank');
        }
      }
    });

    // ADD CUSTOM CONTEXT MENU ITEMS ->

    editor.ui.registry.addMenuItem('pasteastext', {
      icon: 'paste-text',
      text: 'Paste as text',
      onAction: function () {
        navigator.clipboard.readText().then(text => {
          tinyMCE.execCommand('mceInsertClipboardContent', false, { content: text});
        });
      }
    });

    editor.ui.registry.addContextMenu('pasteastext', {
      update: function (element) {
        return 'pasteastext';
      }
    });

    /* Broken... (and not used) */
    /*editor.ui.registry.addMenuItem('copy', {
      icon: 'copy',
      text: 'Copy',
      onAction: function () {
        var html = tinymce.editors[0].selection.getContent({format: 'html'});
        var text = tinymce.editors[0].selection.getContent({format: 'text'});
        copyToClipboard(html, text);
      }
    });*/

    editor.ui.registry.addMenuItem('copyasmarkdown', {
      icon: 'copy',
      text: 'Copy as markdown',
      onAction: function () {
        var markdown = tinymce.editors[0].selection.getContent({format: 'markdown'});
        navigator.clipboard.writeText(markdown);
      }
    });

    editor.ui.registry.addContextMenu('copyasmarkdown', {
      update: function (element) {
        return 'copyasmarkdown';
      }
    });

    // ADD CUSTOM SHORCUTS -> https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/
    // OVERRIDE SHORTCUTS -> https://stackoverflow.com/questions/19791696/overriding-shortcut-assignments-in-tinymce

    editor.addShortcut('Meta+N', 'New', function () {
      newFile();
    });

    editor.addShortcut('Meta+O', 'Open', function () {
      // openFile();
      app.openFile();
    });

    editor.addShortcut('Meta+S', 'Save', function () {
      // saveFile();
      app.saveFile();
    });

    editor.addShortcut('Shift+Meta+S', 'Save as', function () {
      // saveFileAs();
      app.saveFileAs();
    });

    // DISABLED FOR NOW...
    // Ctrl+F also triggers find and replace
    /*editor.addShortcut('Meta+H', 'Find and replace', function () {
      tinymce.activeEditor.execCommand('SearchReplace');
    });*/

    editor.addShortcut('Meta+M', 'Markdown editor (full-page)', function () {
      toggleMarkdownFullpage();
    });

    editor.addShortcut('Meta+Shift+M', 'Markdown editor (split-screen)', function () {
      if (markdownFullpageToggleState == false) {
        toggleMarkdownSidebar();
      }
    });

    editor.addShortcut('Meta+W', 'Quit', function () {
      quit();
    });

    editor.addShortcut('Meta+Q', 'Quit', function () {
      quit();
    });

    editor.addShortcut('Shift+Meta+Z', 'Redo', function () {
      tinyMCE.execCommand('Redo');
    });

    /* Broken... */
    /*function copyToClipboard(html, text) {
      function listener(event) {
        event.clipboardData.setData("text/html", html);
        event.clipboardData.setData("text/plain", text);
        // event.preventDefault();
      }
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    };

    editor.addShortcut('Meta+C', 'Copy', function () {
      var html = tinymce.editors[0].selection.getContent({format: 'html'});
      var text = tinymce.editors[0].selection.getContent({format: 'text'});
      copyToClipboard(html, text);
    });*/

    editor.addShortcut('Shift+Meta+C', 'Copy as markdown', function () {
      var markdown = tinymce.editors[0].selection.getContent({format: 'markdown'});
      navigator.clipboard.writeText(markdown);
    });

    editor.addShortcut('Shift+Meta+V', 'Paste as text', function () {
      navigator.clipboard.readText().then(text => {
        tinyMCE.execCommand('mceInsertClipboardContent', false, { content: text});
      });
    });

    editor.addShortcut('Meta+1', 'Heading 1', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h1');
    });

    editor.addShortcut('Meta+2', 'Heading 2', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h2');
    });

    editor.addShortcut('Meta+3', 'Heading 3', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h3');
    });

    editor.addShortcut('Meta+4', 'Heading 4', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h4');
    });

    editor.addShortcut('Meta+5', 'Heading 5', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h5');
    });

    editor.addShortcut('Meta+6', 'Heading 6', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h6');
    });

    editor.addShortcut('Meta+Alt+1', 'Heading 1', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h1');
    });

    editor.addShortcut('Meta+Alt+2', 'Heading 2', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h2');
    });

    editor.addShortcut('Meta+Alt+3', 'Heading 3', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h3');
    });

    editor.addShortcut('Meta+Alt+4', 'Heading 4', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h4');
    });

    editor.addShortcut('Meta+Alt+5', 'Heading 5', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h5');
    });

    editor.addShortcut('Meta+Alt+6', 'Heading 6', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h6');
    });

    editor.addShortcut('Meta+D', 'Strikethrough', function () {
      tinyMCE.execCommand('Strikethrough');
    });

    editor.addShortcut('Alt+Shift+5', 'Strikethrough', function () {
      tinyMCE.execCommand('Strikethrough');
    });

    editor.addShortcut('Ctrl+L', 'Link', function () {
      tinyMCE.execCommand('mceLink');
    });

    editor.addShortcut('Meta+Shift+7', 'Numbered list', function () {
      tinyMCE.execCommand('InsertOrderedList');
    });

    editor.addShortcut('Meta+Shift+8', 'Bullet list', function () {
      tinyMCE.execCommand('InsertUnorderedList');
    });

    editor.addShortcut('Ctrl+Shift+T', 'Table', function () {
      tinyMCE.execCommand('mceInsertTable');
    });

    editor.addShortcut('Ctrl+Shift+I', 'Image', function () {
      tinyMCE.execCommand('mceImage');
    });

    editor.addShortcut('Ctrl+Shift+L', 'Horizontal line', function () {
      tinyMCE.execCommand('InsertHorizontalRule');
    });

    editor.addShortcut('Meta+Shift+F', 'Fullscreen', function () {
      toggleFullscreen();
    });

    // Handle individual keyboard keys
    editor.on('KeyDown', function(event) {

      // F11 key: toggle fullscreen (need to test)
      if (event.key == 'F11') {
        toggleFullscreen();
      }

      // Escape key: exit fullscreen or hide markdown sidebar if it's open
      if (event.key == 'Escape' && fullscreenTracker == true) {
        toggleFullscreen();
      }

      // Tab key: insert an em dash-sized space and disable normal tab key handling
      // Make sure no modifier keys (Ctrl, Shift, Meta)
      // https://www.tiny.cloud/docs/plugins/nonbreaking/#nonbreaking_force_tab
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        // Are we currently in a table or list? If so, don't continue
        if (tinymce.activeEditor.queryCommandValue('mceTableRowType') || 
            tinymce.activeEditor.queryCommandState('InsertDefinitionList') || 
            tinymce.activeEditor.queryCommandState('InsertOrderedList') || 
            tinymce.activeEditor.queryCommandState('InsertUnorderedList')) {
          return;
        }

        editor.insertContent('&emsp;');
        // On to something with this but not working right...
        //tinyMCE.execCommand('mceInsertRawHTML', false, '<pre>&#09;TABS&#09;</pre>'); // Or \t instead of &#09;
        event.preventDefault();
        return;
      }

      // TinyMCE doesn't like to handle these for some reason
      if ((event.ctrlKey || event.metaKey) && event.key === '.') {
        tinyMCE.execCommand('Superscript');
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        tinyMCE.execCommand('Subscript');
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ']') {
        tinyMCE.execCommand('mceBlockQuote');
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        tinyMCE.execCommand('RemoveFormat');
        event.preventDefault();
      }

      return;
    });

    // Track fullscreen (fullscreenchange event is not reliable as doesn't fire in Chrome if 
    // fullscreen was entered with fullscreen key or via Chrome hamburger menu so need this instead)
    // From: https://stackoverflow.com/questions/34422052/how-to-detect-browser-has-gone-to-full-screen/52160506#52160506
    // May not work properly if dev console is open in window...
    window.addEventListener("resize", () => {
      setTimeout(() => {
        const windowWidth = window.innerWidth * window.devicePixelRatio;
        const windowHeight = window.innerHeight * window.devicePixelRatio;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        // If fullscreen
        if (((windowWidth / screenWidth) >= 0.95) && ((windowHeight / screenHeight) >= 0.95)) {
          fullscreenTracker = true;
        // If not fullscreen
        } else {
          fullscreenTracker = false;
        }
      }, 100);
    });

    // Update to unsaved changes filename if editor becomes dirty
    editor.on('Dirty', function(event) {
      updateFilename(null, true);
    });

    // If there are unsaved changes, ask before closing window
    window.addEventListener('beforeunload', function (event) {
      if (tinymce.editors[0].isDirty()) {
        event.preventDefault();
        event.returnValue = "Unsaved changes. Continue without saving?";
        return;
      }
      delete event['returnValue'];
    });

    editor.on('Init', function(event) {

      // Get core editor handles
      setupCoreEditorHandles();

      // Apply the theme
      applyTheme();

      // Apply custom CSS styles if applicable
      if (customCSS != null && customCSS != '') {
        customEditorAreaCSS(true, customCSS);
      }

      // Get WYSIWYG editor width
      WYSIWYGEditorDefinedWidth = parseInt(getComputedStyle(editorPane).maxWidth);

      // Adjust editor spacing if narrow window width
      adjustEditorSpacing();

      // Check if native file system is enabled and alert if not
      if (!"chooseFileSystemEntries" in window) {
        if (localStorage.getItem('showedEnableNFSPrompt') === null) {
          editor.notificationManager.open({
            text: 'Please enable the <a href="https://web.dev/native-file-system/" target="_blank">Native File System</a> for full functionality. On Google Chrome, this can be found at: <a href="chrome://flags/#native-file-system-api" target="_blank">chrome://flags/#native-file-system-api</a>',
            icon: 'notice',
          });
          localStorage.setItem('showedEnableNFSPrompt', 'true');
        }
      }

      // Handle "open with" / file association
      var openWith = false;
      if ("launchQueue" in window && "LaunchParams" in window) {
        window.launchQueue.setConsumer(async (launchParams) => {

          // If no files passed
          if (!launchParams.files.length) {
            return;
          }

          // New way of opening files
          var fileHandle = launchParams.files[0];
          app.handleFile(fileHandle);
          openWith = true;

          // Old way of opening files
          /*var fileHandle = launchParams.files[0];
          var getFileName = launchParams.files[0].name;
          var getFileBlob = await fileHandle.getFile();
          getFileBlob.text().then(getFileText => {
            openFile(getFileName, getFileText);
            openWith = true;
          });*/
        });
      // Alert if native file handling API isn't enabled
      } else {
        if (localStorage.getItem('showedEnableFileHandlingAPI') === null) {
          editor.notificationManager.open({
            text: 'Please enable the <a href="https://web.dev/native-file-system/" target="_blank">Native File System</a> <a href="https://github.com/WICG/file-handling/blob/master/explainer.md" target="_blank">file handling API</a> for full functionality. On Google Chrome, this can be found at: <a href="chrome://flags/#file-handling-api" target="_blank">chrome://flags/#file-handling-api</a>',
            icon: 'notice',
          });
          localStorage.setItem('showedEnableFileHandlingAPI', 'true');
        }
      }

      // Retrieve relevant URL parameters if any
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const startFileURL = urlParams.get('file');
      const startMarkdownView = urlParams.get('view');

      // Open a starting markdown file if the relevant URL parameter is set
      if (openWith == false && startFileURL) {
        var startFilename = startFileURL.split('/').pop();
        // Fetch the file and open it
        async function request() {
          const response = await fetch(startFileURL);
          const content = await response.text();
          // setTimeout() -> Temporary hack fix
          setTimeout(function() {
            openFile(startFilename, content);
          }, 100);
        };
        request();
      }

      // Retrieve last worked-on file if file handle saved in local storage
      /*if (openWith == false && !startFilename) {
        app.openFile(JSON.parse(localStorage.getItem('fileHandle')));
      }*/

      // Show markdown editor if it was open last time or if the relevant URL parameter is set
      if (startMarkdownView == 'full') {
        toggleMarkdownFullpage();
      } else if (startMarkdownView == 'split') {
        toggleMarkdownSidebar();
      } else if (localStorage.getItem('markdownFullpageToggleState') == 'true') {
        toggleMarkdownFullpage();        
      } else if (localStorage.getItem('markdownSidebarToggleState') == 'true') {
        toggleMarkdownSidebar();
      }

      // Update markdown pane when the editor area changes
      // Set up configuration for watching changes to the editor area
      const mutationConfig = {
        /*attributes: true,*/
        characterData: characterData,
        childList: true,
        subtree: true
      };

      // Function to execute when changes in the editor area are observed
      const mutationCallback = function(mutationsList, observer) {
        // Don't update markdown if we're editing in the markdown pane
        if (tinymce.activeEditor.hasFocus() == true) {
          tinyMCE.execCommand('UpdateMarkdown');
        }
      };
      
      // Watch editor area for changes
      const observer = new MutationObserver(mutationCallback);
      observer.observe(editorPane, mutationConfig);

      // Set up scroll synchronization
      setupScrollSync();

      // Give edit area focus at start up
      tinyMCE.get('textEditor').getBody().focus();

      return;
    });

  },

});

// Find out what the theme should be
var theme = 'light';
if (localStorage.getItem('theme')) {
  if (localStorage.getItem('theme') === 'dark') {
    theme = 'dark';
  }
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  theme = 'dark';
}

// Apply the theme
function applyTheme() {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    iframeHTML.setAttribute('data-theme', 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#FFFFFF');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    iframeHTML.setAttribute('data-theme', 'dark');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#262626');
  }
}

// Switch the theme
function switchTheme() {
  if (theme === 'light') {
    theme = 'dark';
  } else {
    theme = 'light';
  }
  applyTheme();
}

// Adjust markdown editor width for split-screen and full page views
function adjustMarkdownEditorWidth() {

  // If markdown editor is open as a split-screen sidebar
  if (markdownSidebarToggleState == true && markdownFullpageToggleState == false) {
    var markdownEditorWidth = (window.innerWidth * 0.50).toString() + 'px';
    markdownSidebar.style.width = markdownEditorWidth;
  // If markdown editor is open full page
  } else if (markdownFullpageToggleState == true) {
    // If wide window width
    var markdownEditorWidth = WYSIWYGEditorDefinedWidth;
    if (markdownEditorWidth < window.innerWidth) {
      // Add 80px of extra width to match the WYSIWYG mode width more closely
      markdownSidebar.style.width = (markdownEditorWidth + 80).toString() + 'px';
    // If narrow window width (e.g., mobile)
    } else {
      markdownSidebar.style.width = window.innerWidth.toString() + 'px';
    }
  }

  return;
}

// Loosen padding/margins if editor pane width is small (e.g., when editor isn't maximized and markdown pane is open)
function adjustEditorSpacing() {

  // If narrow window width (e.g., split-screen or mobile)
  if (editorPane.offsetWidth < WYSIWYGEditorDefinedWidth) {
    editorPane.style.paddingTop = "10px";
    editorPane.style.paddingBottom = "10px";
    editorPane.style.paddingLeft = "10px";
    editorPane.style.paddingRight = "10px";
  } else {
    editorPane.style.paddingTop = "30px";
    editorPane.style.paddingBottom = "30px";
    editorPane.style.paddingLeft = "30px";
    editorPane.style.paddingRight = "30px";
  }

  // Temporary fix for markdown editor padding... make dependent on actual screen size rather than split-screen vs. full-view
  if (markdownSidebarToggleState == true && markdownFullpageToggleState == false) {
    if (EasyMDEMarkdownArea == true) {
      var CodeMirrorContainer = document.getElementsByClassName('CodeMirror')[0];
      var CodeMirrorCodeContainer = document.getElementsByClassName('CodeMirror-code')[0];
      CodeMirrorCodeContainer.style.marginTop = "10px";
      CodeMirrorCodeContainer.style.marginBottom = "10px";
      CodeMirrorContainer.style.paddingLeft = "10px";
      CodeMirrorContainer.style.paddingRight = "10px";
    } else {
      // ...
    }
  } else {
    if (EasyMDEMarkdownArea == true) {
      var CodeMirrorContainer = document.getElementsByClassName('CodeMirror')[0];
      var CodeMirrorCodeContainer = document.getElementsByClassName('CodeMirror-code')[0];
      CodeMirrorCodeContainer.style.marginTop = "30px";
      CodeMirrorCodeContainer.style.marginBottom = "30px";
      CodeMirrorContainer.style.paddingLeft = "30px";
      CodeMirrorContainer.style.paddingRight = "30px";
    } else {
      // ...
    }
  }

  return;
}

// Apply or remove custom styles
function customEditorAreaCSS(apply, customCSS) {

  var iframeDocument = document.getElementById('textEditor_ifr').contentWindow.document;
  if (apply == true) {
    var style = iframeDocument.getElementById('customCSS');
    if (!style) {
      style = iframeDocument.createElement('style');
      style.setAttribute("id", 'customCSS');
    }
    style.textContent = customCSS;
    if (!iframeDocument.getElementById('customCSS')) {
      iframeDocument.head.append(style);
    } else {
      iframeDocument.getElementById('customCSS').disabled = false;
    }
    iframeDocument.getElementById('u1').disabled = true;
  } else {
    if (iframeDocument.getElementById('customCSS')) {
      iframeDocument.getElementById('customCSS').disabled = true;
    }
    iframeDocument.getElementById('u1').disabled = false;
  }

  return;
}

/* Markdown */

var lastMarkdownToHTMLUpdate = Date.now();
var markdownToHTMLPending = false;
var lastHTMLToMarkdownUpdate = Date.now();
var HTMLtoMarkdownPending = false;

function updateEditorHTMLWithMarkdown(markdownToConvert, force) {

  // Don't update if markdown editor isn't open (unless opening or saving a file)
  if (markdownSidebarToggleState == false && markdownFullpageToggleState == false && force != true) {
    return;
  }

  // Don't update the editor if we're currently editing within it (unless opening or saving a file)
  if (tinymce.activeEditor.hasFocus() == true && force != true) {
    return;
  }

  // Throttle updating to limit CPU usage—no more than once every 100 ms
  if (force != true) {
    var currentTime = new Date().getTime();
    var timeDifference = currentTime - lastMarkdownToHTMLUpdate;
    if (timeDifference < 100) {
      if (markdownToHTMLPending == false) {
        markdownToHTMLPending = true;
        setTimeout(function(markdownToConvert) {
          updateEditorHTMLWithMarkdown(markdownToConvert);
        }, 100 - timeDifference + 1);
        return;
      } else {
        return;
      }
    }
  }

  // Get markdown editor contents if no markdown to convert was passed
  if (!markdownToConvert) {
    if (EasyMDEMarkdownArea == true) {
      markdownToConvert = EasyMDEMarkdownEditor.value();
    } else {
      markdownToConvert = markdownTextarea.value;
    }
  }

  // console.log("markdownToConvert: " + markdownToConvert);

  // Remove front matter

  // Get and save front matter
  frontMatter = getFrontMatter(markdownToConvert, 'markdown');

  // Remove front matter from markdown while editing so that it doesn't get parsed and altered
  markdownToConvert = removeFrontMatter(markdownToConvert, 'markdown');

  // Put front matter into a markdown code block so that it isn't parsed (old method of handling front matter)
  // markdownToConvert = putFrontMatterInCodeBlock(markdownToConvert);

  // Convert markdown to HTML
  if (markdownToHTMLEngine == 'markdown-it') {
    var HTMLfromMarkdown = markdownitConverter.render(markdownToConvert);
  } else if (markdownToHTMLEngine == 'Showdown') {
    var HTMLfromMarkdown = ShowdownConverter.makeHtml(markdownToConvert);
  }

  // console.log("HTMLfromMarkdown: " + HTMLfromMarkdown);

  // Update WYSIWYG editor HTML with the new HTML from markdown
  tinymce.activeEditor.setContent(HTMLfromMarkdown);

  // Fix spacing after update
  adjustEditorSpacing();
  setTimeout(adjustEditorSpacing, 100); // Do it again if didn't work the first time... (temporary hack)

  // For update throttling
  lastMarkdownToHTMLUpdate = currentTime;
  markdownToHTMLPending = false;

  return HTMLfromMarkdown;
}

function updateMarkdownWithEditorHTML(HTMLtoConvert, force) {

  // Don't update if markdown editor isn't open (unless opening or saving a file)
  if (markdownSidebarToggleState == false && markdownFullpageToggleState == false && force != true) {
    return;
  }

  // Don't update the editor if we're currently editing within it (unless opening or saving a file)
  if (tinymce.activeEditor.hasFocus() == false && force != true) {
    return;
  }

  // Throttle updating to limit CPU usage—no more than once every 100 ms
  if (force != true) {
    var currentTime = new Date().getTime();
    var timeDifference = currentTime - lastHTMLToMarkdownUpdate;
    if (timeDifference < 100) {
      if (HTMLtoMarkdownPending == true) {
        return;
      } else {
        HTMLtoMarkdownPending = true;
        setTimeout(function(HTMLtoConvert) {
          updateMarkdownWithEditorHTML(HTMLtoConvert);
        }, 100 - timeDifference + 1);
        return;
      }
    }
  }

  // Get WYSIWYG editor HTML contents if no HTML to convert was passed
  if (!HTMLtoConvert) {
    HTMLtoConvert = tinymce.activeEditor.getContent({format: 'html'});
  }

  // Convert HTML to markdown
  if (HTMLtoMarkdownEngine == 'Turndown') {
    var MarkdownFromHTML = TurndownConverter.turndown(HTMLtoConvert);
  } else if (HTMLtoMarkdownEngine == 'Showdown') {
    var MarkdownFromHTML = ShowdownConverter.makeMarkdown(HTMLtoConvert);
  }

  // Add/restore front matter to file
  MarkdownFromHTML = addFrontMatter(MarkdownFromHTML, frontMatter, 'markdown');

  // Update markdown editor text with the new markdown from HTML
  if (EasyMDEMarkdownArea == true) {
    EasyMDEMarkdownEditor.value(MarkdownFromHTML);
  } else {
    markdownTextarea.value = MarkdownFromHTML;
  }

  // For update throttling
  lastHTMLToMarkdownUpdate = currentTime;
  HTMLtoMarkdownPending = false;

  return MarkdownFromHTML;
}

// Define Showdown options
var ShowdownOptions = {
  omitExtraWLInCodeBlocks: true,
  simplifiedAutoLink: false, // GH: true
  ghCompatibleHeaderId: true,
  parseImgDimensions: true, // Implement
  excludeTrailingPunctuationFromURLs: false, // GH: true
  literalMidWordUnderscores: true,
  strikethrough: true,
  tables: true,
  tablesHeaderId: true,
  ghCodeBlocks: true,
  tasklists: true,
  smoothLivePreview: true, // Maybe?
  disableForced4SpacesIndentedSublists: true,
  simpleLineBreaks: true,
  requireSpaceBeforeHeadingText: true,
  ghCompatibleHeaderId: true,
  ghMentions: false, // GH: true
  openLinksInNewWindow: true,
  backslashEscapesHTMLTags: true,
  emoji: true,
  underline: true, // MAYBE? TEST... (UNDERSCORES NO LONGER -> EM AND STRONG)
  splitAdjacentBlockquotes: true,
  completeHTMLDocument: false,
  metadata: false,
  encodeEmails: true,
}

// Create Showdown converter instance with options
var ShowdownConverter = new showdown.Converter(ShowdownOptions);

// Define markdown-it options
var markdownitOptions = {
  html: true,
  xhtmlOut: true,
  breaks: false,
  linkify: false,
  typographer: false,
}

// Create markdown-it converter instance with options
// markdown-it plugins are loaded automatically (with <script> include)
var markdownitConverter = window.markdownit(markdownitOptions);

// Configure markdown-it plugins
// Disabled because it breaks consecutive tables
// https://github.com/redbug312/markdown-it-multimd-table/issues/34
/*var markdownitMultimdTableOptions = {
  multiline: true,
  rowspan: true,
  headerless: true,
}
markdownitConverter.use(window.markdownitMultimdTable, markdownitMultimdTableOptions);*/

// Use this plugin instead of markdownitMultimdTable as it doesn't break consecutive tables
markdownitConverter.use(window.MarkdownItHeaderlessTable);

// Which markdown-to-HTML engine to use?
markdownToHTMLEngine = localStorage.getItem('markdownToHTMLEngine');
if (markdownToHTMLEngine == null) {
  markdownToHTMLEngine = 'markdown-it';
}

// Which HTML-to-markdown engine to use?
HTMLtoMarkdownEngine = localStorage.getItem('HTMLtoMarkdownEngine');
if (HTMLtoMarkdownEngine == null) {
  HTMLtoMarkdownEngine = 'Turndown';
}

// Define Turndown settings
var TurndownOptions = {
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  br: '<br />',
}

// Define Turndown HTML tags to not be removed
var TurndownKeepList = [
  'html','head','title','body','meta',
  'ins','strike','s','del','sup','sub',
  'figure','figcaption','video','source','audio','math',
  'htmlprotect', // htmlprotect is custom tag
];

// Create Turndown converter instance with options and plugins
var TurndownConverter = new TurndownService(TurndownOptions);
var TurndownGFM = turndownPluginGfm.gfm;
TurndownConverter.use(TurndownGFM);
// https://github.com/domchristie/turndown-plugin-gfm ^
// https://github.com/laurent22/joplin-turndown-plugin-gfm ^
// ^ Adds strikethrough, tables, headerless tables, table col spans, task lists, and bug fixes
TurndownConverter.keep(TurndownKeepList);

// Make strikethrough double tilde rather than single
TurndownConverter.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~~' + content + '~~';
  },
});

// Hack to convert HTML into markdown within <small></small> tags
TurndownConverter.addRule('small', {
  filter: ['small'],
  replacement: function (content) {
    return '<small>' + content + '</small>';
  },
});

// Don't convert img tags (preserves attributes—width, height, etc.)
// https://github.com/domchristie/turndown/issues/179
/*TurndownConverter.addRule('img', {
  filter: ['img'],
  replacement: (content, node) => node.outerHTML,
});*/

// Set up the markdown editor
function setupMarkdown(api) {

  // Set the sidebar HTML code
  markdownSidebar = api.element();

  // The oninput won't apply if using EasyMDE mode
  var sidebarSetupCode = `<textarea id="markdown-editor" class="markdown-editor" oninput="updateEditorHTMLWithMarkdown();" spellcheck="false"></textarea>`;
  markdownSidebar.innerHTML = sidebarSetupCode;

  markdownTextarea = document.getElementById('markdown-editor');

  if (EasyMDEMarkdownArea == false) {
    markdownTextarea.style.flexGrow = '1';
    markdownTextarea.style.padding = '50px !important';
    markdownTextarea.style.fontSize = '14px';
    markdownTextarea.style.fontFamily = 'monospace';
    markdownTextarea.style.whiteSpace = 'pre-wrap';
    markdownTextarea.style.boxSizing = 'border-box';
    markdownTextarea.style.width = '800px'; // Temp fix
  }

  if (EasyMDEMarkdownArea == true) {
    var EasyMDEOptions = {
      element: markdownTextarea,
      initialValue: markdownTextarea.value,
      nativeSpellcheck: false,
      // Not needed so block any possibility of it being used
      previewRender: function() {
        return;
      },
      shortcuts: {
        "toggleBlockquote": "Ctrl-]",
        "cleanBlock": null,
        "toggleHeadingSmaller": null,
        "togglePreview": null,
        "toggleCodeBlock": null,
        "toggleOrderedList": "Ctrl-Shift-7",
        "toggleUnorderedList": "Ctrl-Shift-8",
        "drawImage": null,
        "toggleHeadingBigger": null,
        "toggleSideBySide": null,
        "toggleFullScreen": null,
      },
      spellChecker: false,
      status: false,
      toolbar: false,
      toolbarTips: false,
    };

    //setTimeout(function() {
      EasyMDEMarkdownEditor = new EasyMDE(EasyMDEOptions);
    //}, 200);

    // Update HTM editor with markdown if changed
    EasyMDEMarkdownEditor.codemirror.on("change", function() {
      updateEditorHTMLWithMarkdown();
    });

  }

  // For updating more regularly
  tinymce.activeEditor.on('ExecCommand', function(event) {
    if (event.command == 'UpdateMarkdown') {
      updateMarkdownWithEditorHTML();
    }
  });

  tinymce.activeEditor.on("Change", function() {

    if (updateMarkdownLessOften == true) {
      updateMarkdownWithEditorHTML(event.content);
    }

    return;
  });

  // tinymce.getContent() format handler for 'markdown'
  tinymce.activeEditor.on("GetContent", function(event) {
    if (event.format === "markdown") {
      event.content = updateMarkdownWithEditorHTML(event.content, true);
    }
    return event.content;
  });
  
  // tinymce.setContent() format handler for 'markdown'
  tinymce.activeEditor.on("BeforeSetContent", function(event) {
    if (event.format === "markdown") {
      event.content = updateEditorHTMLWithMarkdown(event.content, true);
    }
    return event.content;
  });

  return;
}

// Disable right-click
if (disableRightClick == true) {
  window.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  }, false);
}

// Keyboard shortcuts for when focus is not in main TinyMCE editor
window.addEventListener('keydown', function(event) {

  // Ctrl/Cmd + N -> New file
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyN') {
    event.preventDefault();
    newFile();
  }

  // Ctrl/Cmd + O -> Open file
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyO') {
    event.preventDefault();
    // openFile();
    app.openFile();
  }

  // Ctrl/Cmd + S -> Save file
  if (!event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    // saveFile();
    app.saveFile();
  }

  // Shift + Ctrl/Cmd + S -> Save file as
  if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    // saveFileAs();
    app.saveFileAs();
  }

  // Ctrl/Cmd + Shift + M -> Markdown editor full-page toggle
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyM') {
    event.preventDefault();
    toggleMarkdownFullpage();
  }

  // Ctrl/Cmd + Shift + M -> Markdown editor split-screen toggle
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyM') {
    event.preventDefault();
    if (markdownFullpageToggleState == false) {
      toggleMarkdownSidebar();
    }
  }

  // Ctrl/Cmd + W -> Quit
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyW') {
    event.preventDefault();
    quit();
  }

  // Ctrl/Cmd + Q -> Quit
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyQ') {
    event.preventDefault();
    quit();
  }

  // Shift + Ctrl/Cmd + F -> Fullscreen toggle
  if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyF') {
    event.preventDefault();
    toggleFullscreen();
  }

  // F11 -> Fullscreen toggle
  if (event.key == 'F11') {
    event.preventDefault();
    toggleFullscreen();
  }

  // Esc -> Exit fullscreen if it's open and if not close markdown sidebar if it's open
  if (event.key == 'Escape' && !event.shiftKey && fullscreenTracker == true) {
    event.preventDefault();
    toggleFullscreen();
  }

  return;
});

// Set up scrolling synchronization between editing panes
function setupScrollSync() {

  // Set up listeners for tracking which editing pane the cursor is in
  editorPane.addEventListener("mouseover", function(event) {
    scrolledPane = 'editorPane';
  });
  markdownEditor.addEventListener("mouseover", function(event) {
    scrolledPane = 'markdownPane';
  });

  // Set up listener for scroll event in markdown editor
  // Might need setTimeout() on this as temp hack...
  markdownEditor.addEventListener("scroll", function(event) {
    updateWYSIWYGScroll();
  });

  // Set up listener for scroll event in WYSIWYG editor
  // Might need setTimeout() on this as temp hack...
  iframe.contentWindow.document.addEventListener("scroll", function(event) {
    updateMarkdownScroll();
  });

  // Also set up listener for whenever markdown area is changed (maybe this isn't needed?)
  // Temporary hack fix (double hack... setTimeout() too)
  /*if (EasyMDEMarkdownArea == true) {
    tinymce.activeEditor.on('ExecCommand', function(event) {
      if (event.command == 'UpdateMarkdown') {
        setTimeout(function() {
          var scrollRatio = iframeHTML.scrollTop / iframeHTML.scrollHeight;
          markdownEditor.scrollTop = markdownEditor.scrollHeight * scrollRatio;
        }, 100);
      }
    });
  }*/

}

// Update markdown pane scroll to match WYSIWYG pane scroll
function updateMarkdownScroll() {

  if (scrolledPane == 'editorPane') {
    var scrollRatio = iframeHTML.scrollTop / iframeHTML.scrollHeight;
    markdownEditor.scrollTop = markdownEditor.scrollHeight * scrollRatio;
  }

  return;
}

// Update WYSIWYG pane scroll to match markdown pane scroll
function updateWYSIWYGScroll() {

  if (scrolledPane == 'markdownPane') {
    var scrollRatio = markdownEditor.scrollTop / markdownEditor.scrollHeight;
    iframeHTML.scrollTop = iframeHTML.scrollHeight * scrollRatio;
  }

  return;
}

// Open/close sidebar markdown editor
function toggleMarkdownSidebar() {

  tinymce.activeEditor.execCommand('ToggleSidebar', false, 'markdown');
  markdownSidebarToggleState = !markdownSidebarToggleState;
  localStorage.setItem('markdownSidebarToggleState', markdownSidebarToggleState);

  adjustMarkdownEditorWidth();
  adjustEditorSpacing();
  setTimeout(adjustEditorSpacing, 100); // Do it again if didn't work the first time... (temporary hack)

  return;
}

// Open/close full-page markdown editor
function toggleMarkdownFullpage() {

  // Hide everything to get rid of transition artifacts
  editingArea.style.visibility = 'hidden';

  if (markdownFullpageToggleState == false) {
    markdownFullpageToggleState = true;

    // Markdown editor sidebar must be open for full page to work
    if (markdownSidebarToggleState == false) {
      toggleMarkdownSidebar();
    // If false, this still needs to be called regardless
    } else {
      adjustMarkdownEditorWidth();
    }

    markdownEditorTop.classList.add("markdownEditorFull");
    editorPaneTop.classList.add("editorPaneHide");

    if (EasyMDEMarkdownArea == true) {
      EasyMDEMarkdownEditor.codemirror.focus();

      // Do it again if it didn't work the first time (temp hack)
      setTimeout(function() {
        EasyMDEMarkdownEditor.codemirror.focus();
      }, 200);
    } else {
      markdownEditor.focus();
      markdownEditor.setSelectionRange(0,0); // Put caret at start (defaults to end)

      // Do it again if it didn't work the first time (temp hack)
      setTimeout(function() {
        markdownEditor.focus();
        markdownEditor.setSelectionRange(0,0); // Put caret at start (defaults to end)
      }, 200);
    }

  } else {
    markdownFullpageToggleState = false;

    markdownEditorTop.classList.remove("markdownEditorFull");
    editorPaneTop.classList.remove("editorPaneHide");

    toggleMarkdownSidebar();

    tinyMCE.get('textEditor').getBody().focus();

    // Do it again if it didn't work the first time (temp hack)
    setTimeout(function() {
      tinyMCE.get('textEditor').getBody().focus();
    }, 200);

  }

  adjustEditorSpacing();

  localStorage.setItem('markdownFullpageToggleState', markdownFullpageToggleState);

  // Unhide everything once transitions are done
  setTimeout(function() {
    editingArea.style.visibility = 'visible';
  }, 100);

  return;
}

