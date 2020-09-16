let persistFilename = "untitled.md";
let markdownSideBarToggleState = false;
let fullscreenTracker = false;
let updateMarkdownLessOften;
let customCSS;

// Create new file
function newFile() {

  // Is there any change/undo history?
  if (tinymce.editors[0].isDirty()) {
    if(confirm("Unsaved changes. Continue without saving?") == false) {
      return;
    }
  // Are we sure we want to exit out of the current file?
  } else {
    if(confirm("Close the current file and create a new one?") == false) {
      return;
    }
  }

  // ipcRenderer.send('call-new');
  app.newFile(); // Unnecessary but keeping for consistency for now

  tinymce.activeEditor.resetContent();
  updateFilename("untitled.md", false);

  tinyMCE.execCommand("UpdateMarkdown");
  setTimeout(tinyMCE.execCommand("UpdateMarkdown"), 100); // Do it again if didn't work the first time... (temporary hack)

  return;
}

// Open file
function openFile(filename, data) {

  // Is there any change/undo history?
  if (tinymce.editors[0].isDirty()) {
    if(confirm("Unsaved changes. Continue without saving?") == false) {
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
    tinymce.editors[0].setContent(data, {format: 'text'});
  }

  updateFilename(filename, false);
  tinymce.activeEditor.undoManager.clear();
  tinymce.editors[0].setDirty(false);

  tinyMCE.execCommand("UpdateMarkdown");
  setTimeout(tinyMCE.execCommand("UpdateMarkdown"), 100); // Do it again if didn't work the first time... (temporary hack)

  return;
}

// Save file
function saveFile(filename) {

  // Get file extension/type from filename
  var extension = filename.split('.').pop();
  // Save as text
  if(extension == "txt" || extension == "text") {
    var content = tinymce.editors[0].getContent({format: 'text'});
  // Save as markdown
  } else if(extension == "md" || extension == "markdown") {
    var content = tinymce.editors[0].getContent({format: 'markdown'});
  // Save as HTML (HTML or other extension)
  } else {
    var content = tinymce.editors[0].getContent({format: 'html'});
  }

  updateFilename(filename, false);
  tinymce.editors[0].setDirty(false);

  return content;
}

// Quit
function quit() {

  // ipcRenderer.send('call-quit');
  window.close();

  return;
}

// Toggle full screen
function toggleFullscreen() {

  // Is fullscreen supported for this browser?
  if(document.fullscreenEnabled == false) {
    alert("Fullscreen not supported for this browser.");
    return;
  }

  // If not fullscreen, try to enter fullscreen
  if(document.fullscreenElement == null) {
    // Get the element that we want to fullscreen
    var editorHandle = document.getElementsByClassName("tox")[0];
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

// Update filename
function updateFilename(filename, dirty) {

  var filenameElement = document.getElementById('filename');

  if (filename != null) {
    persistFilename = filename;
    document.title = persistFilename + " - Text Editor";
    filenameElement.innerHTML = "&emsp;" + persistFilename + "&emsp;";
  }

  // Doesn't work the first time on save for some reason... fix [to-do]
  if (dirty == false) {
    filenameElement.style.fontStyle = "";
  } else {
    filenameElement.style.fontStyle = "italic";
  }

  return;
}

// Change current working directory (not currently used)
function changeWorkingDirectory(event, newPath) {

  if (tinymce.activeEditor) {
    var doc = tinymce.activeEditor.getDoc(),
      head = doc.head, base;
    if (head.getElementsByTagName("base").length == 0) {
      base = document.createElement("base");
      head.appendChild(base);
    } else {
      base = head.getElementsByTagName("base")[0]
    }
    base.setAttribute("href", "file://" + newPath + "/");
    tinymce.activeEditor.documentBaseURI.setPath(newPath + "/");
  }

  return;
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
    code: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>`,
    bullist: `<?xml version="1.0" encoding="UTF-8"?><path fill-rule="nonzero" d="M10 13h9v-2h-9v2zm0-7v2h9V6h-9zm0 12h9v-2h-9v2zm-4-5h2v-2H6v2zm0-7v2h2V6H6zm0 12h2v-2H6v2z"></path>`,
    numlist: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M5 16h2v.5H6v1h1v.5H5v1h3v-4H5v1zm0-5h1.8L5 13.1v.9h3v-1H6.2L8 10.9V10H5v1zm1-2h1V5H5v1h1v3zm4-3v2h9V6h-9zm0 12h9v-2h-9v2zm0-5h9v-2h-9v2z"></path></svg>`,
    table: `<svg width="24" height="24"><path fill-rule="nonzero" d="M5 5v14h14V5H5zm6 12H7v-4h4v4zm0-6H7V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"></path></svg>`,
    // Ugly
    //strikethrough: `<svg width="24" height="24"><path fill-rule="nonzero" d="M11 18h2v-4h-2v4zM7 5v2h4v3h2V7h4V5H7zm-1 8h12v-2H6v2z"></path></svg>`,
    hr: `<svg width="24" height="24"><path d="M4 11h16v2H4z" fill-rule="evenodd"></path></svg>`,
    blockquote: `<svg width="24" height="24"><path fill-rule="nonzero" d="M13 8v5h2.8L14 16h2.3l1.7-3V8h-5zm-7 5h2.8L7 16h2.3l1.7-3V8H6v5z"></path></svg>`,
    superscript: `<svg width="24" height="24"><path fill-rule="nonzero" d="M15 9.4L10.4 14l4.6 4.6-1.4 1.4L9 15.4 4.4 20 3 18.6 7.6 14 3 9.4 4.4 8 9 12.6 13.6 8 15 9.4zm5.9 1.6h-5v-1l1-.8 1.7-1.6c.3-.5.5-.9.5-1.3 0-.3 0-.5-.2-.7-.2-.2-.5-.3-.9-.3l-.8.2-.7.4-.4-1.2c.2-.2.5-.4 1-.5.3-.2.8-.2 1.2-.2.8 0 1.4.2 1.8.6.4.4.6 1 .6 1.6 0 .5-.2 1-.5 1.5l-1.3 1.4-.6.5h2.6V11z"></path></svg>`,
    subscript: `<svg width="24" height="24"><path fill-rule="nonzero" d="M10.4 10l4.6 4.6-1.4 1.4L9 11.4 4.4 16 3 14.6 7.6 10 3 5.4 4.4 4 9 8.6 13.6 4 15 5.4 10.4 10zM21 19h-5v-1l1-.8 1.7-1.6c.3-.4.5-.8.5-1.2 0-.3 0-.6-.2-.7-.2-.2-.5-.3-.9-.3a2 2 0 00-.8.2l-.7.3-.4-1.1 1-.6 1.2-.2c.8 0 1.4.3 1.8.7.4.4.6.9.6 1.5s-.2 1.1-.5 1.6a8 8 0 01-1.3 1.3l-.6.6h2.6V19z"></path></svg>`,
    markdown: `<svg width="24" height="24" viewBox="0 -4 40 24"><path d="M0.5,16 L0.5,0 L5.40322581,0 L10.3064516,5.88235294 L15.2096774,0 L20.1129032,0 L20.1129032,16 L15.2096774,16 L15.2096774,6.82352941 L10.3064516,12.7058824 L5.40322581,6.82352941 L5.40322581,16 L0.5,16 Z M31.1451613,16 L23.7903226,8.23529412 L28.6935484,8.23529412 L28.6935484,0 L33.5967742,0 L33.5967742,8.23529412 L38.5,8.23529412 L31.1451613,16 Z"></path></svg>`,
    darkmode: `<svg version="1.0" width="18" height="18" viewBox="0 0 981.000000 988.000000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <defs> <pattern x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse" viewBox="0 0 100 100" id="pattern-0"> <rect x="0" y="0" width="50" height="100""></rect> </pattern> <pattern id="pattern-0-0" patternTransform="matrix(1, 0, 0, 1, 2974.191772, 8030.287354)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-1" patternTransform="matrix(1, 0, 0, 1, 4889.624394, 4889.736084)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-2" patternTransform="matrix(1, 0, 0, 1, 4388.941284, 5335.855957)" xlink:href="#pattern-0"></pattern> <pattern id="pattern-0-3" patternTransform="matrix(1, 0, 0, 1, 1833.005493, 4627.5)" xlink:href="#pattern-0"></pattern> </defs> <g transform="matrix(-0.1, 0, 0, -0.1, 980.424866, 988)" stroke="none"> <path d="M2641 9188 c-68 -370 -127 -676 -130 -680 -3 -3 -303 -61 -666 -127 -363 -67 -668 -125 -678 -129 -12 -5 146 -96 580 -331 329 -178 603 -328 609 -335 9 -8 -11 -181 -77 -676 -49 -366 -88 -673 -86 -683 1 -14 100 74 352 314 193 182 418 397 502 476 l151 144 622 -297 c341 -163 623 -294 626 -292 2 3 -129 283 -291 623 -163 340 -294 622 -293 626 2 3 216 231 476 504 260 274 471 500 469 501 -2 2 -311 -37 -687 -87 -547 -72 -685 -87 -692 -77 -4 7 -152 280 -329 606 -177 325 -324 592 -328 592 -3 0 -62 -303 -130 -672z" style=""></path> <path d="M6796 9763 c149 -347 265 -714 333 -1058 62 -313 89 -559 98 -895 17 -691 -101 -1357 -354 -2005 -77 -197 -285 -612 -397 -793 -755 -1218 -1958 -2059 -3341 -2337 -363 -73 -631 -99 -1020 -99 -368 0 -641 25 -980 90 -307 59 -719 183 -992 298 -73 31 -135 56 -138 56 -3 0 35 -80 84 -177 255 -511 537 -906 925 -1301 546 -555 1157 -952 1881 -1222 805 -299 1714 -389 2575 -255 1264 198 2412 867 3213 1872 1077 1352 1399 3147 860 4798 -103 317 -301 751 -470 1030 -504 832 -1197 1479 -2054 1920 -91 46 -182 91 -202 100 l-37 15 16 -37z" style=""></path> <path d="M4190 5893 c0 -12 7 -105 16 -208 8 -103 12 -191 7 -196 -4 -4 -87 -44 -183 -89 -96 -45 -178 -85 -183 -89 -4 -4 85 -29 197 -56 196 -47 205 -50 210 -74 3 -14 14 -102 26 -196 12 -93 23 -176 26 -184 2 -7 53 65 112 160 75 121 115 175 129 177 11 2 107 -13 214 -32 106 -19 194 -34 195 -33 1 1 -60 74 -137 161 l-138 160 49 92 c28 50 72 131 99 180 28 49 48 90 46 93 -3 2 -91 -31 -197 -75 l-192 -78 -148 154 c-107 111 -148 148 -148 133z" style=""></path> <path d="M1540 5443 c0 -21 9 -144 19 -273 11 -129 21 -255 23 -278 l2 -44 -289 -135 c-160 -74 -291 -136 -292 -137 -2 -2 139 -36 311 -76 277 -65 315 -77 320 -95 2 -11 22 -152 43 -312 21 -161 40 -293 43 -293 3 0 67 100 143 223 75 122 150 243 166 268 l29 46 314 -58 c172 -32 314 -56 316 -54 2 1 -90 109 -203 238 -113 130 -205 240 -205 245 0 5 67 130 149 278 82 148 146 270 143 272 -4 1 -138 -51 -297 -117 l-290 -119 -65 66 c-35 37 -136 140 -222 230 l-158 162 0 -37z" style=""></path> </g> </svg>`,
    github: `<svg class="octicon octicon-mark-github v-align-middle" width=18" height="18" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>`
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
  toolbar: 'file undo redo heading bold italic underline strikethrough superscript subscript bullist numlist link blockquote codeformat codesample table image hr searchreplace markdown code fullscreen darkmode preferences github filename', // quickimage
  toolbar_mode: 'scrolling',
  plugins: 'code codesample, link image table markdown lists paste save searchreplace autolink hr textpattern print quickbars',
  // ^ Note: Print seems to break the editor (buttons/menus and shortcuts) by giving focus to the OS somehow
  contextmenu_never_use_native: true,
  contextmenu: 'undo redo | cut copy copyasmarkdown paste pasteastext selectall',
  icons: 'custom',
  elementpath: false, // Disable e.g. "table > tbody > tr > td > p" in status bar when status bar enabled
  branding: false, // Disable TinyMCE branding in status bar
  menubar: false, // Hide menu bar
  paste_block_drop: true,
  paste_data_images: true,
  paste_remove_styles_if_webkit: true,
  //paste_word_valid_elements: "p,br,b,strong,i,em,u,strike,s,del,h1,h2,h3,h4,h5,h6,ul,ol,li,dl,dt,dd,a,img,blockquote,code,pre,samp,table,tr,td,th,thread,tbody,hr",
  smart_paste: false,
  link_context_toolbar: true,
  link_title: false,
  link_quicklink: true,
  target_list: false,
  convert_urls: false,
  table_toolbar: 'tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tabledelete',
  table_appearance_options: false,
  table_tab_navigation: false,
  table_advtab: false,
  table_cell_advtab: false,
  table_row_advtab: false,
  table_resize_bars: false,
  table_default_attributes: {},
  table_default_styles: {},
  visual: false,
  image_dimensions: false,
  object_resizing: false,
  resize_img_proportional: true, // Disabled due to resizing off
  // remove_trailing_brs: false, // Doesn't do what I want (don't remove end of document lines)
  toolbar_sticky: true,
  resize: false,
  statusbar: false,
  // protect: "/^---[.\r\n]*---/", // Protect markdown front matter/metadata (doesn't work right)
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar: 'cut copy paste | heading bold italic underline strikethrough superscript subscript link blockquote codeformat',
  quickbars_image_toolbar: false,

  formats: {
    removeformat: [
      {
        selector: 'b,strong,em,i,font,u,strike,sub,sup,dfn,code,samp,kbd,var,cite,mark,q,del,ins',
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
    {start: '+ ', cmd: 'InsertUnorderedList' },
    {start: '- ', cmd: 'InsertUnorderedList' },
    {start: '> ', cmd: 'mceBlockQuote'},
    {start: '`', end: '`', format: 'code'},
    {start: '```', cmd: 'CodeSample'},
    {start: '---', replacement: '—'}, // Non-standard
    {start: '--', replacement: '–'}, // Non-standard
    {start: '===', replacement: '<hr />'}, // Non-standard
    //{start: '***', replacement: '<hr />'}, // Conflicts with bold + italic above
  ],

  // Save button callback function (necessary or will cause problems)
  save_onsavecallback: function () {
    app.saveFile();
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

    editor.ui.registry.addMenuButton('heading', {
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
    });

    editor.ui.registry.addButton('fullscreen', {
      tooltip: 'Fullscreen (Ctr+Shift+F or F11)',
      icon: 'fullscreen',
      onAction: function () {
        toggleFullscreen();
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    editor.ui.registry.addButton('darkmode', {
      tooltip: 'Dark mode on/off',
      icon: 'darkmode',
      onAction: function () {
        // Look into this in the future:
        // https://web.dev/prefers-color-scheme/
        theme_switch();
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    editor.ui.registry.addButton('filename', {
      text: "<span id='filename'>" + persistFilename + "</span>",
      onAction: function () {
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
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

    editor.ui.registry.addMenuItem('copy', {
      icon: 'copy',
      text: 'Copy',
      onAction: function () {
        var html = tinymce.editors[0].selection.getContent({format: 'html'});
        var text = tinymce.editors[0].selection.getContent({format: 'text'});
        copyToClipboard(html, text);
      }
    });

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

    var prefsConfig = {
      title: 'Preferences',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            type: 'checkbox',
            name: 'updateMarkdownLessOften',
            label: 'Update markdown panel less often—only when new elements are created (uses less CPU)',
          },
          {
            type: 'textarea',
            name: 'customCSS',
            label: '<br /><span style="font-size: 16px !important;">Custom CSS stylesheet for editing area (default/template <a href="https://github.com/Alyw234237/text-editor/blob/main/css/editor-area-styles.css">here</a>—copy here and modify</span>):',
            maximized: true,
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'submitButton',
          text: 'Save',
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
        updateMarkdownLessOften: updateMarkdownLessOften
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
          localStorage.setItem('updateMarkdownLessOften', true);
          updateMarkdownLessOften = true;
        } else {
          localStorage.setItem('updateMarkdownLessOften', false);
          updateMarkdownLessOften = false;
        }

        api.close();
      }
    };

    editor.ui.registry.addButton('preferences', {
      name: 'Preferences',
      tooltip: 'Preferences',
      icon: 'preferences',
      onAction: function () {
        editor.windowManager.open(prefsConfig)
      }
    });

    editor.ui.registry.addButton('github', {
      name: 'GitHub',
      tooltip: 'GitHub',
      icon: 'github',
      onAction: function () {
        if(confirm("This will open GitHub in a new tab. Continue?") == false) {
          return;
        } else {
          window.open('https://github.com/Alyw234237/text-editor/', '_blank');
        }
      }
    });

    // ADD CUSTOM SHORCUTS -> https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/
    // OVERRIDE SHORTCUTS -> https://stackoverflow.com/questions/19791696/overriding-shortcut-assignments-in-tinymce

    editor.addShortcut('Ctrl+N', 'New', function () {
      newFile();
    });

    editor.addShortcut('Ctrl+O', 'Open', function () {
      // openFile();
      app.openFile();
    });

    editor.addShortcut('Ctrl+S', 'Save', function () {
      // saveFile();
      app.saveFile();
    });

    editor.addShortcut('Shift+Ctrl+S', 'Save as', function () {
      // saveFileAs();
      app.saveFileAs();
    });

    // Ctrl+F also triggers find and replace
    editor.addShortcut('Ctrl+H', 'Find and replace', function () {
      tinymce.activeEditor.execCommand('SearchReplace');
    });

    editor.addShortcut('Ctrl+M', 'Markdown', function () {
      tinymce.activeEditor.execCommand('ToggleSidebar', false, 'markdown');
      // ^ -> https://stackoverflow.com/questions/46825012/how-to-open-close-sidebar-in-tinymce
    });

    editor.addShortcut('Ctrl+W', 'Quit', function () {
      quit();
    });

    editor.addShortcut('Shift+Ctrl+Z', 'Redo', function () {
      tinyMCE.execCommand('Redo');
    });

    function copyToClipboard(html, text) {
      function listener(event) {
        event.clipboardData.setData("text/html", html);
        event.clipboardData.setData("text/plain", text);
        // event.preventDefault();
      }
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    };

    editor.addShortcut('Ctrl+C', 'Copy', function () {
      var html = tinymce.editors[0].selection.getContent({format: 'html'});
      var text = tinymce.editors[0].selection.getContent({format: 'text'});
      copyToClipboard(html, text);
    });

    editor.addShortcut('Shift+Ctrl+C', 'Copy as markdown', function () {
      var markdown = tinymce.editors[0].selection.getContent({format: 'markdown'});
      navigator.clipboard.writeText(markdown);
    });

    editor.addShortcut('Shift+Ctrl+V', 'Paste as text', function () {
      navigator.clipboard.readText().then(text => {
        tinyMCE.execCommand('mceInsertClipboardContent', false, { content: text});
      });
    });

    editor.addShortcut('Ctrl+Alt+1', 'Heading 1', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h1');
    });

    editor.addShortcut('Ctrl+Alt+2', 'Heading 2', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h2');
    });

    editor.addShortcut('Ctrl+Alt+3', 'Heading 3', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h3');
    });

    editor.addShortcut('Ctrl+Alt+4', 'Heading 4', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h4');
    });

    editor.addShortcut('Ctrl+Alt+5', 'Heading 5', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h5');
    });

    editor.addShortcut('Ctrl+Alt+6', 'Heading 6', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h6');
    });

    editor.addShortcut('Alt+Shift+5', 'Strikethrough', function () {
      tinyMCE.execCommand('Strikethrough');
    });

    editor.addShortcut('Ctrl+Shift+7', 'Numbered list', function () {
      tinyMCE.execCommand('InsertOrderedList');
    });

    editor.addShortcut('Ctrl+Shift+8', 'Bullet list', function () {
      tinyMCE.execCommand('InsertUnorderedList');
    });

    editor.addShortcut('Ctrl+Shift+F', 'Fullscreen', function () {
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
      } else if (event.key == 'Escape' && markdownSideBarToggleState == true) {
        tinymce.activeEditor.execCommand('ToggleSidebar', false, 'markdown');
      }

      // Tab key: insert an em dash-sized space and disable normal tab key handling
      // https://www.tiny.cloud/docs/plugins/nonbreaking/#nonbreaking_force_tab
      if (event.key === 'Tab') {
        editor.insertContent('&emsp;');
        // On to something with this but not working right...
        //tinyMCE.execCommand('mceInsertRawHTML', false, '<pre>&#09;TABS&#09;</pre>'); // Or \t instead of &#09;
        event.preventDefault();
        return;
      }

      // TinyMCE doesn't like to handle these for some reason
      if (event.ctrlKey && event.key === '.') {
        tinyMCE.execCommand('Superscript');
      }
      if (event.ctrlKey && event.key === ',') {
        tinyMCE.execCommand('Subscript');
      }
      if (event.ctrlKey && event.key === ']') {
        tinyMCE.execCommand('mceBlockQuote');
      }
      if (event.ctrlKey && event.key === '\\') {
        tinyMCE.execCommand('RemoveFormat');
        event.preventDefault();
      }

      return;
    });

    // Adjust padding if applicable + hack to fix width of the markdown pane
    editor.on('ResizeWindow', function(event) {

      var markdownSidebarWidth = (window.innerWidth * 0.50).toString() + "px";
      document.getElementsByClassName("markdown-preview")[0].style.width = markdownSidebarWidth;

      adjustEditorSpacing();
      setTimeout(adjustEditorSpacing, 100); // Do it again if didn't work the first time... (temporary hack)

      return;
    });

    // Track fullscreen
    // Doesn't fire in Chrome if fullscreen was entered with fullscreen key or via Chrome hamburger menu...
    // This would work though: https://stackoverflow.com/questions/34422052/how-to-detect-browser-has-gone-to-full-screen
    document.addEventListener("fullscreenchange", function () {
      fullscreenTracker = !fullscreenTracker;
    }, false);

    // When markdown pane is opened/closed
    // https://stackoverflow.com/questions/46825012/how-to-open-close-sidebar-in-tinymce
    editor.on('ToggleSidebar', function(event) {

      markdownSideBarToggleState = !markdownSideBarToggleState;

      // Hack to fix width of the markdown pane
      var width = (window.innerWidth * 0.50).toString() + "px";
      document.getElementsByClassName("markdown-preview")[0].style.width = width;

      adjustEditorSpacing();
      setTimeout(adjustEditorSpacing, 100); // Do it again if didn't work the first time... (temporary hack)

      return;
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

    editor.addCommand('UpdateMarkdown', function() {
      return;
    });

    editor.on('Init', function(event) {

      // Apply the theme
      theme_apply();

      // Apply custom CSS styles if applicable
      if (customCSS != null && customCSS != '') {
        customEditorAreaCSS(true, customCSS);
      }

      adjustEditorSpacing();

      // Retrieve relevant URL parameters if any
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const startFilename = urlParams.get('mdf');
      const startMarkdownView = urlParams.get('mdv');

      // Open a starting markdown file if the relevant URL parameter is set
      if(startFilename) {
        var startFileURL = 'https://raw.githubusercontent.com/Alyw234237/text-editor/main/' + startFilename;
        // Fetch the file and open it
        async function request() {
          const response = await fetch(startFileURL);
          const content = await response.text();
          setTimeout(function() {
            openFile(startFilename, content);
          }, 100);
        };
        request();
      }

      // Check if native file system is enabled and alert if not
      if (!"chooseFileSystemEntries" in window) {
        // document.getElementById("enable-native-file-system").hidden = false;
        alert("Please enable chrome://flags/#native-file-system-api");
      }

      // Handle "open with" (doesn't work yet)
      if ("launchQueue" in window) {
        if ("LaunchParams" in window) {
          window.launchQueue.setConsumer(async (launchParams) => {
            if (!launchParams.files.length) {
              return;
            }
            const fileHandle = launchParams.files[0];
            // const blob = await fileHandle.getFile();
            // loadFromBlob(blob);
            app.openFile(fileHandle);
          });
        }
      // Alert if native file handling API isn't enabled
      } else {
        alert("Please enable chrome://flags/#file-handling-api");
      }

      // Open markdown pane if the relevant URL parameter is set
      if(startMarkdownView) {
        tinymce.activeEditor.execCommand('ToggleSidebar', false, 'markdown');
      }

      // Update markdown pane when the editor area changes
      var iframe = document.getElementById('textEditor_ifr');
      var editorPane = iframe.contentWindow.document.getElementById('tinymce'); // body tag of iframe

      // Set up configuration for watching changes to the editor area
      const mutationConfig = {
        /*attributes: true,*/
        characterData: characterData,
        childList: true,
        subtree: true
      };

      // Function to execute when changes in the editor area are observed
      const mutationCallback = function(mutationsList, observer) {
        // Stop it from updating markdown pane if we're editing in the markdown pane
        if (tinymce.activeEditor.hasFocus() == true) {
          tinyMCE.execCommand("UpdateMarkdown");
        }
      };
      
      // Watch editor area for changes
      const observer = new MutationObserver(mutationCallback);
      observer.observe(editorPane, mutationConfig);

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
function theme_apply() {
  'use strict';
  var iframe = document.getElementById('textEditor_ifr');
  var iframeHTML = iframe.contentWindow.document.getElementsByTagName('html')[0];
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    iframeHTML.setAttribute('data-theme', 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#FFFFFF');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    iframeHTML.setAttribute('data-theme', 'dark');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#212121');
  }
}

// Switch the theme
function theme_switch() {
  'use strict';
  if (theme === 'light') {
    theme = 'dark';
  } else {
    theme = 'light';
  }
  theme_apply();
}

// Loosen padding/margins if editor pane width is small (e.g., when editor isn't maximized and markdown pane is open)
function adjustEditorSpacing() {

  var iframe = document.getElementById('textEditor_ifr');
  var editorPane = iframe.contentWindow.document.getElementById('tinymce'); // body tag of iframe

  // Hardcoded... un-hardcode this in the future
  if(editorPane.offsetWidth < 750) {
    editorPane.style.paddingTop = "5px";
    editorPane.style.paddingBottom = "5px";
    editorPane.style.paddingLeft = "5px";
    editorPane.style.paddingRight = "5px";
  } else {
    editorPane.style.paddingTop = "30px";
    editorPane.style.paddingBottom = "30px";
    editorPane.style.paddingLeft = "30px";
    editorPane.style.paddingRight = "30px";
  }

  return;
}

// Apply or remove custom styles
function customEditorAreaCSS(apply, customCSS) {
  
  if (apply == true) {
    var iframeDocument = document.getElementById('textEditor_ifr').contentWindow.document;
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
    var iframeDocument = document.getElementById('textEditor_ifr').contentWindow.document;
    if (iframeDocument.getElementById('customCSS')) {
      iframeDocument.getElementById('customCSS').disabled = true;
    }
    iframeDocument.getElementById('u1').disabled = false;
  }

  return;
}

