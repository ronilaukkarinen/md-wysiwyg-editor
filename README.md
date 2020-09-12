# Text Editor

Text Editor is a simple constrained-rich-text and markdown editor. It is a [Progressive Web App](https://web.dev/progressive-web-apps/) (PWA) made with [TinyMCE 5](https://github.com/tinymce/tinymce), [Showdown](https://github.com/showdownjs/showdown) (via a modified [TinyMCE labs plugin](https://www.tiny.cloud/labs/markdown/)), and the emerging [Native File System](https://web.dev/native-file-system/) (NFS) API (via Google's demo [Text Editor](https://github.com/GoogleChromeLabs/text-editor) code).

## Launch

[https://alyw234237.github.io/text-editor/](https://alyw234237.github.io/text-editor/)

## Screenshot

![Screenshot](/screenshot.png)

## Features

* Open and save files as markdown (MD), plain text (TXT), or restricted rich-text (HTML).
* Views to edit the document as rich-text, markdown, or HTML code. Bidirectional live editing between rich-text and markdown views.
* Rich-text is constrained. Only headings, bold, italics, underline, strikethrough, superscript, subscript, bulleted lists, numbered lists, links, block quotes, code, tables, images, and horizontal lines are included. All other styling—e.g. font size, font color, spacing, alignment, etc.—is automatically filtered.
* Rich-text is displayed with a fixed appearance. Modifiable via stylesheet (or in preferences in the future).
* Partial support for live conversion of markdown into rich-text in rich-text editing mode. For example, typing `# Header title` will make an H1 header and typing `**This text is bold.**` will give bolded text. This feature does not currently work for links, tables, or images (use the formatting buttons, keyboard shorcuts, or markdown editing pane instead for these). Also includes live conversions for en (--) and em dashes (---).
* Editing and formatting keyboard shortcuts in rich-text mode (e.g., ctrl+o = open, ctrl+v = paste, ctrl+b = bold, etc.).
* Find and replace functionality in the rich-text view.

## Related

Similar live/rich-text markdown editors (all desktop applications—mostly [Electron](https://www.electronjs.org/)-based):

* [Typora](https://typora.io/)
* [Mark Text](https://github.com/marktext/marktext)
* [Zettlr](https://github.com/Zettlr/Zettlr)
* [Uncolored](https://github.com/n457/Uncolored)
* [Abricotine](http://abricotine.brrd.fr/)
* [ghostwriter](https://wereturtle.github.io/ghostwriter/)
* [VNote](https://github.com/tamlok/vnote)
* [UNOTES](https://marketplace.visualstudio.com/items?itemName=ryanmcalister.Unotes) for [VSCode](https://github.com/microsoft/vscode)

