# Text Editor

Text Editor is a simple online constrained-rich-text and markdown editor. It is a [Progressive Web App](https://web.dev/progressive-web-apps/) (PWA) made with [TinyMCE 5](https://github.com/tinymce/tinymce), [Showdown](https://github.com/showdownjs/showdown) (via a modified [TinyMCE labs plugin](https://www.tiny.cloud/labs/markdown/)), and the emerging [Native File System](https://web.dev/native-file-system/) (NFS) API (via Google's demo [Text Editor](https://github.com/GoogleChromeLabs/text-editor) code).

## Launch

Visit this link to launch the application:

<ul><li><a href="https://alyw234237.github.io/text-editor/">https://alyw234237.github.io/text-editor/</a></li></ul>

Make sure that your web browser is up to date and you have Native File System enabled (e.g., in Google Chrome flags—not enabled by default at this time):

<ul><li><a href="chrome://flags/#native-file-system-api">chrome://flags/#native-file-system-api</a></li><li><a href="chrome://flags/#file-handling-api">chrome://flags/#file-handling-api</a></li></ul>

## Screenshot

![Screenshot](screenshot-light-mode.png)

![Screenshot](images/screenshot-dark-mode.png)

![Screenshot](images/screenshot-markdown.png)

## Features

<ul><li>Open and save files as markdown (MD), constrained rich-text (HTML), and plain text (TXT).</li><li>Bidirectional live editing between rich-text and markdown views. Also an HTML code view and editor.</li><li>Rich-text is constrained essentially to the formatting options of markdown and a small amount more. The rich-text features that are supported include headings, bold, italics, underline, strikethrough, superscript, subscript, bulleted lists, numbered lists, links, block quotes, code, tables, images, and horizontal lines. Everything else—e.g. font size, colors, alignment, positioning, etc.—is automatically sanitized and filtered as soon as it enters the editor.</li><li>Automatic conversion of typed markdown syntax into rich text in rich-text editing mode. For example, typing <code># Header title</code> will make an H1 header and typing <code>**This text is bold.**</code> will give bolded text. These conversions for links, images, task lists, and tables are not supported. In addition to markdown syntax, certain strings will convert to special characters (e.g., <code>--</code> to en dash and <code>---</code> to em dash). See <a href="docs/pattern-conversions.md">pattern-conversions.md</a> for a list of conversions.</li><li>Keyboard shortcuts for editing, formatting, etc. (except where prevented by browser—e.g., Ctrl+N for new file in non-app mode). See <a href="docs/keyboard-shortcuts.md">keyboard-shortcuts.md</a> for a list.</li><li>Works offline when installed as a PWA.</li><li>Mobile-friendly.</li><li>Dark mode.</li><li>Optional customization of rich-text appearance via CSS in preferences.</li></ul>

## Notes

Due to the bidirectional conversion between rich text/HTML and markdown, the editor may alter your markdown files. For instance, certain characters may be escaped. Most importantly however, currently there's a limitation that causes front matter (e.g., YAML) to be removed from markdown files.

### Future

<ul><li>"Open with" / file association support.</li><li>Lots of bug fixes.</li></ul>

## Support

If you like this application, consider [buying Aly W. a cup of boba tea](https://www.buymeacoffee.com/alyw234237). 🧋

## Related

A number of similar editors exist. These are either rich-text-oriented markdown editors (mostly [Electron](https://www.electronjs.org/)\-based desktop applications) or online markdown editors:

| Desktop | Web |
| --- | --- |
| [Typora](https://typora.io/) | [StackEdit](https://stackedit.io/) |
| [Mark Text](https://github.com/marktext/marktext) | [SimpleMDE](https://simplemde.com/) |
| [Zettlr](https://github.com/Zettlr/Zettlr) | [Dillinger](https://dillinger.io/) |
| [Uncolored](https://github.com/n457/Uncolored) | [Editor.md](http://editor.md/) |
| [Abricotine](http://abricotine.brrd.fr/) | [Moreâ€¦](https://www.webfx.com/blog/web-design/online-markdown-editors/) |
| [ghostwriter](https://wereturtle.github.io/ghostwriter/) |  |
| [VNote](https://github.com/tamlok/vnote) |  |
| [UNOTES](https://marketplace.visualstudio.com/items?itemName=ryanmcalister.Unotes) ([VSCode](https://github.com/microsoft/vscode) extension) |  |

