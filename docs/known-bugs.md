`* No default filename with NFS:
** Not currently supported:
*** https://github.com/WICG/native-file-system/issues/80


- If focus not in editor, keyboard shortcuts don't work


- More shortcuts?:
	- Alt+Ctrl+- -> HR
	- Ctrl+` -> Code
	- Ctrl+Shift+O -> Open folder (later)
	- Headings: Ctrl+1-6 (?)
	- Image: Ctrl+Shift+I
	- Strikethrough: Ctrl+D
	- Link: Ctrl+L (?)

- Markdown editor isn't updating as often


- Add app to open with context menu in file browser and handle.

- Tab not working properly needs fix.

- Format -> Code missing from toolbar.

- Remove extra styling on copy.

- Add Alt + F -> open file menu.

- Markdown front matter is fenced with code block

- Toolbar wrap on narrow width not working.

- Live-typing markdown-to-rich-text conversion of link, image, multi-line code, others not working.

- Disable Ctrl+R, dev tools, and other keyboard shortcuts?

- Use Chrome search for Ctrl+F? Remove TinyMCE shortcut?

- Hide menu bar option?

- Paste rich text is including spacing/etc... need to restrict more like plain text paste with new lines? Filters/postprocessing?

- Get this sometimes: Scripts may only close windows that were opened by them

- Image blobs: Copy image from paint -> paste + saving and opening files DOES WORK!
- Copy image in Chrome or copy HTML page contents including image -> converts into image URL instead of blob.

- Image insert -> puts URL but should be URL AND file -> blob options.

- Replace markdown pane textarea with a lightweight code editor library:
  - https://github.com/kazzkiq/CodeFlask / https://kazzkiq.github.io/CodeFlask/
  - https://github.com/antonmedv/codejar / https://medv.io/codejar/
  - https://ourcodeworld.com/articles/read/309/top-5-best-code-editor-plugins-written-in-javascript

- Code blocks in rich-text mode need work.

- Modify copy -> copy as HTML code then turn into HTML (remove excess formatting).
- Fullscreen button / shortcut doesn't work sometimes?

- Rich text (md->html converter) is misdisplaying: "(Stege et al., 199628:5<307::AID-PROS6>3.0.CO;2-8))."
	^ "([Stege et al., 1996](https://doi.org/10.1002/(SICI)1097-0045(199605)28:5<307::AID-PROS6>3.0.CO;2-8))."
	^ Breaks after the second parenthesis -> "199605)28" (that parenthesis)


- Showdown can't handle headerless tables

- Showdown escapes various things. Markdown characters (e.g., "~", "|", "0.5" -> 0.\5). Happens even in URLs.
- Showdown did this:
	"[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))-like" ->
	"[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))\-like"

- Showdown replaced markdown in HTML with HTML (changed ** to <em></em> and []() to <a...)

- Showdown removed trailing whitespace at end from a line



* p vs. br behavior... option...
** Set padding and margin for p, headers, other elements to 0
** Change Showdown and Turndown conversions for these elements from two linebreaks (\n\n) to one (\n)
** Adjust line height (default 1.6, maybe change to 1.4)
** Reduce empty line height if possible (?)



* Can fix tables with custom dialog menu + insert table (instead of tableInsertDialog menu).
* Look into custom images dialog menu with both upload as blob and URL options.


* Nice-looking client-side file save library ->
** https://github.com/eligrey/FileSaver.js


* Another JS HTML-to-markdown converter to look at (but node.js):
** https://github.com/breakdance/breakdance

* Add keyboard shorcut for files menu if possible (Alt + F)
* 

* addToggleMenuItem() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addtogglemenuitem
** https://www.tiny.cloud/docs/ui-components/menuitems/#togglemenuitems
* addAutocompleter() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addautocompleter

* ``` `...` ``` pattern -> Converts to <span><code></span></code> in markdown with Turndown (but converts correctly with Showdown)
* ` ```...``` ` pattern -> Converts to <pre></pre> in markdown with Showdown (but converts correctly with Turndown)

* No default filename with save file as—not possible to fix due to current Native File System limitations.

* Neither Turndown nor Showdown handle Shift+Enter behavior... both just collapse the newlines.

* .txt files don't open right... all line breaks lost.

* Turndown (but not Showdown) is dropping extra line breaks.
** But Showdown markdown to HTML is dropping extra line breaks...

* Scrollbar sync doesn't scroll at bottom completely for the other scrollbar if smaller.

* Tabs are converted into &emsp; with open .txt file (otherwise tabs removed completely).

