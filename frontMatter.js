// frontMatter.js

// Detect file line ending type
// From https://stackoverflow.com/questions/34820267/detecting-type-of-line-breaks/55661801#55661801
function getLineEndingType(data) {
  const indexOfLF = data.indexOf('\n', 1);
  if (indexOfLF === -1) {
    if (data.indexOf('\r') !== -1) {
      return '\r';
    }
    return '\n';
  }
  if (data[indexOfLF - 1] === '\r') {
    return '\r\n';
  }
  return '\n';
}

// Usage: frontMatter = getFrontMatter(data, format);
// where format = 'markdown' or 'HTML'
function getFrontMatter(data, format) {

  var frontMatter = '';

  // If data format is markdown
  if (format == 'markdown') {
    // YAML front matter (---)
    if (data.match(/^((---)(?:\r\n|\n))/) != null) {
      // var frontMatter = data.match(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/m); // For some reason this returns phantom extra chars at the end
      frontMatter = data.match(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/gm)[0]; // And this fixes it (only take first match)
    // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)(?:\r\n|\n))/) != null) {
      // var frontMatter = data.match(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/m); // Phantom extra chars
      frontMatter = data.match(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/gm)[0]; // Fix
    }
  // If data format is HTML
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)(?:\r\n|\n))/) != null) {
      //var frontMatter = data.match(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/m); // Phantom extra chars
      frontMatter = data.match(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/gm)[0]; // Fix
    // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)(?:\r\n|\n))/) != null) {
      //var frontMatter = data.match(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/m); // Phantom extra chars
      frontMatter = data.match(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/gm)[0]; // Fix
    }
  }

  return frontMatter;
}

// Usage: data = removeFrontMatter(data, format);
// where format = 'markdown' or 'HTML'
function removeFrontMatter(data, format) {

  // If data format is markdown
  if (format == 'markdown') {
    // YAML front matter (---)
    if (data.match(/^((---)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/m, function(match) {
        return '';
      });
    // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/m, function(match) {
        return '';
      });
    }
  // If data format is HTML
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(<pre><code>---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n)<\/code><\/pre>)$/m, function(match) {
        return '';
      });
    // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)(?:\r\n|\n))/) != null) {
      data = data.replace(/^(<pre><code>\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n)<\/code><\/pre>)$/m, function(match) {
        return '';
      });
    }
  }

  return data;
}

// Usage: data = addFrontMatter(data, frontMatter, format);
// where format = 'markdown' or 'HTML'
function addFrontMatter(data, frontMatter, format) {

  // Get the correct line ending type
  var lineEndingType = getLineEndingType(data);

  // If data format is markdown
  if (format == 'markdown') {
    data = frontMatter + lineEndingType + data;
  // If data format is HTML
  } else if (format == 'html') {
    data = '<pre><code>' + frontMatter + '</code></pre>' + lineEndingType + data;
  }

  return data;
}

// Put front matter into a markdown code block so that it isn't parsed (old method of handling front matter)
function putFrontMatterInCodeBlock(data) {

  // Get the correct line ending type
  var lineEndingType = getLineEndingType(data);

  // YAML front matter (---)
  if (data.match(/^((---)(?:\r\n|\n))/) != null) {
    data = data.replace(/^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/m, function(match) {
      return '```' + lineEndingType + match + '```';
    });
  // TOML front matter (---)
  } else if (data.match(/^((\+\+\+)(?:\r\n|\n))/) != null) {
    data = data.replace(/^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/m, function(match) {
      return '```' + lineEndingType + match + '```';
    });
  }

  return data;
}

// Undo put front matter into a markdown code block
function undoPutFrontMatterInCodeBlock(data) {

  // To-do...

  return data;
}

