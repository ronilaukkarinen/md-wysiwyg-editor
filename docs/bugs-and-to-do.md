# Known Bugs and To-Do List

## TinyMCE UI

* Code toolbar button needs rework.
* Format -> Code missing from pop-up toolbar.
* Toolbar wrap on narrow width not working.
* Image insert -> puts URL. Do custom images dialogue menu with both image URL and image file -> blob options.
* Can fix tables with custom dialog menu + insert table (instead of tableInsertDialog menu).
* Formatting button is non-ideal... change back to heading button/menu?
* With heading toolbar button and extra formats drop-down buttons the buttons aren't highlighted when formats are active.
  * Option?: addToggleMenuItem() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addtogglemenuitem
    * https://www.tiny.cloud/docs/ui-components/menuitems/#togglemenuitems
* Preferences option to hide menu bar? (With alternatives for interaction.)
* Formatting buttons (e.g., bold) don't work with markdown editor.
* Dropdown buttons (extra formatting and markdown) aren't showing on mobile due to sliding toolbar...
* Editor doesn't get focus on launch in app mode?

## Custom UI

* Scrollbar sync doesn't scroll at bottom completely for the other scrollbar if smaller.
* Need to make scrollbars sync again after updating panes.
* Markdown editor isn't updating HTML editor on new lines or spaces... only characters.
* Maybe use this instead of saving the info in variable (but would conflict if additional sidebars in future):
  * `tinymce.activeEditor.queryCommandValue('ToggleSidebar');`
    * Returns the current state of sidebar (open or closed).
* Help views for keyboard shortcuts and typed markdown-to-rich-text conversions?
* CSS styling colors with text selection in markdown editor need fixing (especially dark mode).
* Scroll sync doesn't work on startup if mouse cursor hasn't been moved yet (i.e., if scroll was done first).
* Do sync scroll based on line number?
* Transition artifacts when opening/closing markdown sidebar with adjust editor spacing.
* Markdown editor vertical scrollbar scrolls above the editing area in markdown mode and split-screen mode.
* Can currently only enter markdown editor split-screen mode via WYSIWYG editor full-page mode.
  * Button and keyboard shortcuts don't work otherwise (i.e., if in markdown editor full-page mode).
* Non-EasyMDE markdown editor scrollbar should be on far right.
* Non-EasyMDE markdown editor scroll goes to end on launch.

## Editing

* p vs. br behavior... option...
  * How to mimic Notepad-style in WYSIWYG editor:
    * Set padding and margin for p, headers, other elements to 0.
    * Change HTML-to-markdown conversions for these elements from two linebreaks (`\n\n`) to one (`\n`).
    * Adjust line height (default 1.6, maybe change to 1.4).
    * Reduce empty line height if possible (?).
    * But causes problems with markdown conversion.
* Code blocks in rich-text mode need work.
* Live-typing markdown-to-rich-text conversion of link, image, multi-line code, others not added.
* Tabs are converted into `&emsp;` with open .txt file (otherwise tabs removed completely).
  * Maybe helpful: https://stackoverflow.com/questions/2237497/
* Code block autocomplete needs work... maybe helpful:
  * addAutocompleter() -> https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addautocompleter
    * "When a configured string pattern is matched in the content while typing, the autocompleter will be triggered."
* Link active highlight bug in dark mode.
* Can't click to move caret in margins in markdown editor full-width mode.
* Local images don't display... possible to fix or remedy somehow?

## User Input

* More keyboard shortcuts?:
  * Ctrl+` -> Code
    * Doesn't work...
  * Ctrl+Shift+O -> Open folder (later?)
  * Ctrl+Shift+I for insert image conflicts with Developer Tools in Chrome (but does work in browser).
  * Ctrl+Shift+T for insert table conflicts with undo close tab (and doesn't work in browser).
* Need to work on keyboard shortcuts in markdown editor mode.
  * E.g., Ctrl+D causes line to be deleted instead of strikethrough (CodeMirror default).
* Add Alt + F keyboard shortcut to open File menu if possible.
* Use Chrome search for Ctrl+F? Disable TinyMCE shortcut?
  * Tried but couldn't remove/override TinyMCE's Ctrl+F.
* Disable Ctrl+R, dev tools, and other keyboard shortcuts?
  * Dev tools already disabled via insert image shorcut.
* Encounter this sometimes with menu quit: "Scripts may only close windows that were opened by them".
* Fullscreen button and/or keyboard shortcut doesn't work in non-app mode (sometimes?).

## HTML–Markdown Conversion

* Showdown can't handle headerless tables.
* Showdown escapes various things. Markdown characters (e.g., "~", "|", "0.5" -> 0.5). Happens even in URLs.
  * Showdown did this escape also:
    * `[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))-like` -> `[alcohol](https://en.wikipedia.org/wiki/Alcohol_(drug))\-like`
* Turndown and/or Showdown remove extra lines at end of files. Same with markdown-to-HTML conversion (or maybe that's TinyMCE).
* Both Turndown and Showdown don't parse this URL right: `Stege et al., 199628:5%3C307::AID-PROS6%3E3.0.CO;2-8` ->
  * `([Stege et al., 1996](https://doi.org/10.1002/(SICI)1097-0045(199605)28:5<307::AID-PROS6>3.0.CO;2-8)).`
    * Breaks after the second closing parenthesis -> "199605)28" (that parenthesis)
* Showdown HTML-to-markdown replaces markdown within HTML tags with HTML (changed `**` to `<em></em>` and `[]()` to `<a...`).
* Another JS HTML-to-markdown converter to look at (but node.js):
  * https://github.com/breakdance/breakdance
* Neither Turndown nor Showdown HTML-to-markdown handle Shift+Enter behavior right (`<br >`'s)... both just collapse the newlines.
* Turndown (but not Showdown) HTML-to-markdown is dropping extra line breaks.
  * But Showdown markdown-to-HTML is dropping extra line breaks...
* ``` `...` ``` pattern -> Converts to `<span><code></span></code>` in markdown with Turndown (but converts correctly with Showdown)
* ` ```...``` ` pattern -> Converts to `<pre></pre>` in markdown with Showdown (but converts correctly with Turndown)
* Turndown should drop empty links for headings with copy + paste HTML.

## File Handling

* Can't automatically load last open file on start due to inability to store file handle. Possible to fix?

## Cut/Copy/Paste Behavior

* Change copy action to copy as HTML (remove the excess formatting and get the pure *intended* rich-text—not the displayed styling).
  * Special copy button/shortcut code wasn't working in some contexts so had to disable and revert back to original.
* Copy image in Chrome or copy HTML page contents including image -> converts into image URL instead of blob.
  * Should be applied to cut as well.
* Image blobs: copy image from paint -> paste + saving and opening files DOES WORK!

## Miscellaneous

* Decide on a name.
* Add app install/add to homescreen prompt stuff.
  * https://github.com/pwa-builder/pwa-install
  * https://love2dev.com/pwa/add-to-homescreen-library/
  * https://github.com/docluv/add-to-homescreen
* Add app update stuff?
  * https://github.com/pwa-builder/pwa-update
* Service worker and caching dependencies/etc.
  * https://www.smashingmagazine.com/2016/08/a-beginners-guide-to-progressive-web-apps/
* Dynamically load JavaScript dependencies (markdown–HTML engines) to load faster + save bandwidth:
  * https://www.kirupa.com/html5/loading_script_files_dynamically.htm
* Whatever else that's missing...

## Unsorted

* Markdown front matter fix works for default use case (MD, YAML) but need to test other use cases (e.g., HTML, TOML, etc.).
* Markdown front matter is hidden in WYSIWYG editing view. Make it display in a code block. TinyMCE might be finicky though...
  * Can put this in the WYSIWYG editor iFrame above the `<body></body>` tag:
    * ```
      <div id="front-matter-wysiwyg" style="padding: 30px 30px 0px 30px; max-width: 745px; margin: 0 auto;">
        <div style=" background-color: #f2f2f2; border-radius: 5px; padding: 5px; width: 100%; border: none; resize: none; font-size: 16px; font-family: Consolas, Menlo, Monaco, &quot;Lucida Console&quot;, &quot;Courier New&quot;, monospace;" spellcheck="false" contenteditable>
          <p>---</p><p>adsfasdfadsfadf</p><p>sdfasdfas</p><p>sdfasdfafd</p><p>---</p>
        </div>
      </div>
      ```
* Disabled `asfdasdf\n---` heading styling for EasyMDE markdown editing mode as a hack fix so doesn't mess up front matter display. But should style these headings and instead needs to just ignore front matter there. Search for ` //` in `easymde.js` for fix.
* Write the undoPutFrontMatterInCodeBlock() function. Might be useful for supporting front matter display/editing in WYSIWYG mode.
* HTML-to-markdown with Turndown needs to ignore Liquid code... will break Liquid code if markdown parser happens to modify it.
  * Previously markdown-it autolink was breaking Liquid code in markdown but disabled autolink and this fixed that issue.

## New (2021/02/20)

### Less important

* For tables, changes `| |` to `|  |` (maybe fine?)
* For tables, changes `|  Blah` (two spaces) to `| Blah` (one space) (maybe fine?)
* Converts markdown inside of HTML tags into HTML (fixed for `<small>` tag)
* Changes `\<50 ng/dL` to `<50 ng/dL` (maybe fine?)
* Changes `10.1002/(SICI)1097-0045(199605)28:5<307::AID-PROS6>3.0.CO;2-8` to `10.1002/(SICI)1097-0045(199605)28:5%3C307::AID-PROS6%3E3.0.CO;2-8` (maybe fine? -> Update: Doesn't break links!)
* Changes `[mass spectrometry](https://en.wikipedia.org/wiki/Mass_spectrometry)-based` to `[mass spectrometry](https://en.wikipedia.org/wiki/Mass_spectrometry)\-based test` (maybe okay?)
* Removes trailing spaces from paragraphs (maybe fine)

### More important

* Seems to be breaking indented bullets... (try editing this bugs-and-to-do.md file to see)
* ~~Converts fancier (colspan/rowspan) HTML tables (and breaks them badly)~~ -> update: use custom `<htmlprotect>` tag to protect them where needed
  * Optionally... don't convert table to markdown if colspan or rowspan attributes?
* **Need to test editor on all site pages now**

## New (2021/09/29)

* TinyMCE *might* cause problems with `&nbsp;`... test and make sure it doesn't
  * https://stackoverflow.com/questions/61221847/prevent-tinymce-from-replacing-nbsp-to-regular-space
* TinyMCE still does filters inside of `<htmlprotect>` (so can't use e.g. `text-align: center;` or `font-weight: strong;` CSS tags in table headers, have to use `<th>` and `<b>`
* Editor removes line breaks/white space inside of `<htmlprotect>`
* TinyMCE doesn't do markdown table headers right (does bold and puts under header row)
* In code -> "To-do: Change this so more foolproof (i.e., "untitled.md" check)"
* In code -> "Disable this for now as will double in the case of Ctrl + W"
* Fix Ctrl+W exit so when empty but dirty it won't prompt about saving changes?
* No newline at end of file (Turndown likely culprit)
* Editor is converting all CRLF line endings to LF. What's causing it?

## New (2021/10/25)

* Another markdown parser—for Kramdown (has client version also):
  * https://github.com/GitbookIO/kramed
* And:
  * https://github.com/GitbookIO/markup-it
* TinyMCE CSS styling not enough vertical space after table when next element is e.g. heading.
* No image dialogue/toolbar popping up on click image.
* Remove Showdown.

## Major to-do items (2021/10/03)

Note that these are largely adapted or copied from above.

### More fixable and important

* Messing up markdown bullet-point lists when two or more in a row.
* Messing up markdown indented bullet points in bullet-point lists.
* Removes trailing endlines (should preserve / keep two (`\n\n`)).
* Ctrl+Z removes one character at a time in TinyMCE... increase to whole-word or something else higher.
* TinyMCE still does filters inside of `<htmlprotect>` (so can't use e.g. `text-align: center;` or `font-weight: strong;` CSS tags in table headers, have to use `<th>` and `<b>`. Needs to not apply filters to those tags.
* Something is removing line breaks/white space inside of `<htmlprotect>`. Needs to leave unchanged.

### Less easily fixable and/or less important

* Converting all line endings to LF and shouldn't be (should use original line endings).
* Markdown front matter is hidden in WYSIWYG editing view. Make it display in an editable code block.
  * May be able to put a second editor element above TinyMCE for editing that.
* EasyMDE needs to ignore front matter in markdown (i.e., disable EasyMDE syntax-to-styling there).
* HTML-to-markdown with Turndown needs to ignore Liquid code... will break Liquid code if markdown parser happens to modify it.
* TinyMCE doesn't do markdown table headers right (does bold and puts under header row). Possible to fix?
* Some way to load and display local images possibly? Probably not possible. (Or maybe option to set a URL to load relative-path images from URL instead -- i.e., tranfsemscience.org.)

