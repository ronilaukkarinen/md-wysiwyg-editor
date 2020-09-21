# Known Bugs and To-Do List

## TinyMCE UI

* Code toolbar button needs rework.
* Format -> Code missing from pop-up toolbar.
* Toolbar wrap on narrow width not working.
* Image insert -> puts URL. Do custom images dialogue menu with both image URL and image file -> blob options.
* Can fix tables with custom dialog menu + insert table (instead of tableInsertDialog menu).
* Formatting button is non-ideal... change back to heading button/menu?
* With heading toolbar button and extra formats drop-down buttons the buttons aren't highlighted when formats are active.
** Option?: addToggleMenuItem() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addtogglemenuitem
*** https://www.tiny.cloud/docs/ui-components/menuitems/#togglemenuitems
* Preferences option to hide menu bar? (With alternatives for interaction)

## Custom UI

* Scrollbar sync doesn't scroll at bottom completely for the other scrollbar if smaller.
* Markdown editor isn't updating HTML editor on new lines or spaces... only characters.
* Replace markdown pane textarea with a lightweight code editor library:
** https://github.com/kazzkiq/CodeFlask / https://kazzkiq.github.io/CodeFlask/
** https://github.com/antonmedv/codejar / https://medv.io/codejar/
** https://ourcodeworld.com/articles/read/309/top-5-best-code-editor-plugins-written-in-javascript
* Maybe use this instead of saving the info in variable (but would conflict if additional sidebars in future):
** tinymce.activeEditor.queryCommandValue('ToggleSidebar');
** ^ Returns the current state of sidebar (open or closed).
* Need to re-implement this maybe (delay before updating):
```
var editorChangeHandler = function() {
  // Wait 200 ms before updating...
  setTimeout(function () {
    var content = editor.getContent();
    updateMarkdown(converter, editor, content);
    Decoration.forHtml(converter, node_Element.fromDom(editor.getBody()));
  }, 200);
};
```
* Help views for keyboard shortcuts and typed markdown-to-rich-text conversions?

## Editing

* p vs. br behavior... option...
** Set padding and margin for p, headers, other elements to 0
** Change Showdown and Turndown conversions for these elements from two linebreaks (\n\n) to one (\n)
** Adjust line height (default 1.6, maybe change to 1.4)
** Reduce empty line height if possible (?)
* Code blocks in rich-text mode need work.
* Live-typing markdown-to-rich-text conversion of link, image, multi-line code, others not added.
* Tabs are converted into &emsp; with open .txt file (otherwise tabs removed completely).
** Maybe helpful: https://stackoverflow.com/questions/2237497/
* Code block autocomplete needs work... maybe helpful:
** addAutocompleter() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addautocompleter
*** ^ "When a configured string pattern is matched in the content while typing, the autocompleter will be triggered."

## User Input

* More keyboard shortcuts?:
** Ctrl+` -> Code
** Ctrl+Shift+O -> Open folder (later?)
** Headings: Ctrl+1-6 (?)
** Image: Ctrl+Shift+I
** Strikethrough: Ctrl+D
** Link: Ctrl+L (?)
** Ctrl+_ (i.e., Ctrl+Shift+-) or Alt+Ctrl+- (Alt+Ctrl+_) -> Horizontal line
* Add Alt + F keyboard shortcut to open File menu if possible.
* Use Chrome search for Ctrl+F? Disable TinyMCE shortcut?
** Tried but couldn't remove/override TinyMCE's Ctrl+F.
* Disable Ctrl+R, dev tools, and other keyboard shortcuts?
* Encounter this sometimes with quit: "Scripts may only close windows that were opened by them".
* Fullscreen button and/or keyboard shortcut doesn't work in non-app mode (sometimes?).

## HTML–Markdown Conversion

* Markdown front matter is fenced with code block to prevent removal/alteration.
* Headers are added to headerless tables with Turndown so they aren't removed (although this doesn't always work/happen).
* Showdown can't handle headerless tables.
* Showdown escapes various things. Markdown characters (e.g., "~", "|", "0.5" -> 0.\5). Happens even in URLs.
** Showdown did this escape also:
*** `[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))-like` -> `[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))\-like`
* Turndown and/or Showdown remove extra lines at end of files. Same with markdown-to-HTML conversion (or maybe that's TinyMCE).
* Both Turndown and Showdown don't parse this URL right: `Stege et al., 199628:5%3C307::AID-PROS6%3E3.0.CO;2-8` ->
** `([Stege et al., 1996](https://doi.org/10.1002/(SICI)1097-0045(199605)28:5<307::AID-PROS6>3.0.CO;2-8)).`
** ^ Breaks after the second parenthesis -> "199605)28" (that parenthesis)
* Showdown/Turndown HTML-to-markdown replaces markdown within HTML tags with HTML (changed `**` to `<em></em>` and `[]()` to `<a...`).
* Another JS HTML-to-markdown converter to look at (but node.js):
** https://github.com/breakdance/breakdance
* Neither Turndown nor Showdown handle Shift+Enter behavior (<br >'s)... both just collapse the newlines.
* Turndown (but not Showdown) HTML-to-markdown is dropping extra line breaks.
** But Showdown markdown-to-HTML is dropping extra line breaks...
* ``` `...` ``` pattern -> Converts to <span><code></span></code> in markdown with Turndown (but converts correctly with Showdown)
* ` ```...``` ` pattern -> Converts to <pre></pre> in markdown with Showdown (but converts correctly with Turndown)
* Turndown should drop empty links for headings with copy + paste HTML.

## File Handling

* No default filename with save file as.
** Not possible to fix due to current Native File System limitations—not currently supported.
*** https://github.com/WICG/native-file-system/issues/80
* Open with doesn't allow use of file handle for subsequent save without prompt at this time.
* Can't automatically load last open file on start due to inability to store file handle.

## Cut/Copy/Paste Behavior

* Change copy action to copy as HTML (remove the excess formatting and get the pure *intended* rich-text—not the displayed styling).
** Special copy button/shortcut code wasn't working in some contexts so had to disable and revert back to original.
* Copy image in Chrome or copy HTML page contents including image -> converts into image URL instead of blob.
** Should be applied to cut as well.
* Image blobs: copy image from paint -> paste + saving and opening files DOES WORK!

## Miscellaneous

* Decide on a name.
* Move to new repository + username (remember to change links in code).
* Make new screenshots with shadows.
* Add app install/add to homescreen prompt stuff.
** https://github.com/pwa-builder/pwa-install
** https://love2dev.com/pwa/add-to-homescreen-library/
** https://github.com/docluv/add-to-homescreen
* Add app update stuff?
** https://github.com/pwa-builder/pwa-update
* Service worker bug causing app to eat CPU/RAM sometimes?
* Service worker and caching dependencies/etc.
** https://www.smashingmagazine.com/2016/08/a-beginners-guide-to-progressive-web-apps/
* Dynamically load JavaScript dependencies (markdown–HTML engines) to load faster + save bandwidth:
** https://www.kirupa.com/html5/loading_script_files_dynamically.htm
* Whatever else that's missing...

