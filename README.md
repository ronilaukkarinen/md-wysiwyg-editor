# Text Editor

"Text Editor" (placeholder name) is a simple online constrained-rich-text and markdown editor. It is a [Progressive Web App](https://web.dev/progressive-web-apps/) (PWA) made with [TinyMCE 5](https://github.com/tinymce/tinymce), [Showdown](https://github.com/showdownjs/showdown), [Turndown](https://github.com/domchristie/turndown), and the new [Native File System](https://web.dev/native-file-system/) (NFS) API (via Google's demo [Text Editor](https://github.com/GoogleChromeLabs/text-editor) code). Currently in a developmental stage—[use cautiously!](#Notes)

Home page and GitHub repository:

* [https://github.com/Alyw234237/text-editor/](https://github.com/Alyw234237/text-editor/)

## Launch

Visit this link to launch the application:

* [https://alyw234237.github.io/text-editor/](https://alyw234237.github.io/text-editor/)

Or this link to open this README.md file in the editor with the markdown pane open:

* [https://alyw234237.github.io/text-editor/?mdf=README.md&mdv=true](https://alyw234237.github.io/text-editor/?mdf=README.md&mdv=true)

### Requirements

Make sure that your web browser is up to date and you have Native File System enabled (e.g., in Google Chrome flags—not enabled by default at this time):

* [chrome://flags/#native-file-system-api](chrome://flags/#native-file-system-api)
* [chrome://flags/#file-handling-api](chrome://flags/#file-handling-api)

## Screenshots

### Light Mode

[![Screenshot](images/screenshot-light-mode.png)](https://raw.githubusercontent.com/Alyw234237/text-editor/main/images/screenshot-light-mode.png)

### Dark Mode

[![Screenshot](images/screenshot-dark-mode.png)](https://raw.githubusercontent.com/Alyw234237/text-editor/main/images/screenshot-dark-mode.png)

### Dual-Pane Markdown View (Dark Mode)

[![Screenshot](images/screenshot-markdown.png)](https://raw.githubusercontent.com/Alyw234237/text-editor/main/images/screenshot-markdown.png)

## Features

* Rich-text/WYSIWIG markdown editor.
* File handling: open, save, save as, and open with/file association of markdown, HTML, and text files via Native File System API.
* Bidirectional live editing between rich-text and markdown views (as well as an HTML view).
* Rich-text is constrained essentially to the formatting options of markdown and a small amount more. The rich-text features that are supported include headings, bold, italics, underline, strikethrough, superscript, subscript, bulleted lists, numbered lists, links, block quotes, code, tables, images, and horizontal lines. Everything else—e.g. font size, colors, alignment, positioning, etc.—is automatically sanitized and filtered as soon as it enters the editor.
* Automatic conversion of typed markdown syntax into rich-text formatting in rich-text editing mode. For example, typing `# Header title` will make an H1 header and typing `This text is bold.` will give bolded text. In addition to markdown syntax, certain strings will convert to special characters (e.g., `--` to en dash and `---` to em dash). See [pattern-conversions.md](docs/pattern-conversions.md) for a list of conversions.
* Keyboard shortcuts for editing, formatting, etc. (except where prevented by browser—e.g., Ctrl+N for new file in non-app mode). See [keyboard-shortcuts.md](docs/keyboard-shortcuts.md) for a list.
* Works offline when installed as a PWA. Mobile-friendly. Light and dark modes.
* Option to switch between HTML-to-markdown conversion engines (Turndown and Showdown) in preferences. The Turndown engine is better for this conversion and is set to default. Markdown-to-HTML conversion is always handled by Showdown.
* Optional customization of rich-text appearance via CSS in preferences.

## Notes

The editor is still under development and has [many bugs](docs/bugs-and-to-do.md).

Due to the bidirectional conversion between rich text/HTML and markdown, the editor may alter markdown files—sometimes in undesirable ways. A number of examples are illustrative. Escapes (`\`) may be added to certain markdown syntax characters that aren't part of the markdown (e.g., `~`, `|`). Headerless markdown tables will be escaped and thereby broken with Showdown as the HTML-to-markdown engine. YAML and TOML front matter is automatically put inside of a markdown code block (<code>```</code>) to prevent it from being parsed by the HTML-to-markdown engines. Changes to markdown files will vary depending on whether Turndown or Showdown is selected as the HTML-to-markdown conversion engine. For example, Showdown doesn't handle headerless tables, whereas Turndown does via a plugin although it adds an empty header row to the tables and doesn't always work.

Rich-text editing is dependable but as described the markdown functionality has issues here and there. Hence, you've been warned—use the markdown features (bidirectional HTML–markdown conversion via markdown pane and open/save files as markdown) at your own risk!

### Future

* Lots of [bug fixes](docs/bugs-and-to-do.md) and minor features.
* Tabs for multiple documents at once?
* Pane for files and table of contents?
* Other things...

## Related

A number of similar editors exist. These are either rich-text-oriented markdown editors (mostly [Electron](https://www.electronjs.org/)-based desktop applications) or online markdown editors:

| Desktop | Web |
| --- | --- |
| [Typora](https://typora.io/) | [StackEdit](https://stackedit.io/) |
| [Mark Text](https://github.com/marktext/marktext) | [SimpleMDE](https://simplemde.com/) |
| [Zettlr](https://github.com/Zettlr/Zettlr) | [Dillinger](https://dillinger.io/) |
| [Uncolored](https://github.com/n457/Uncolored) | [Editor.md](https://pandao.github.io/editor.md/en.html) |
| [Abricotine](http://abricotine.brrd.fr/) | [More...](https://www.webfx.com/blog/web-design/online-markdown-editors/) |
| [ghostwriter](https://wereturtle.github.io/ghostwriter/) |  |
| [VNote](https://github.com/tamlok/vnote) |  |
| [UNOTES](https://marketplace.visualstudio.com/items?itemName=ryanmcalister.Unotes) ([VSCode](https://github.com/microsoft/vscode) extension) |

<!--## Support

If you like this application, consider [buying Aly W. a cup of boba tea](https://www.buymeacoffee.com/alyw234237). 🧋-->

