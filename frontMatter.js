// frontMatter.js

// Usage: frontMatter = getFrontMatter(data, format);
// where format = 'markdown' or 'HTML'
function getFrontMatter(data, format) {

  var frontMatter = '';

  // If data format is markdown
  if (format == 'markdown') {
    // YAML front matter (---)
    if (data.match(/^((---)\n)/) != null) {
      // var frontMatter = data.match(/^(---\n)(.|\n)*(\n---\n)$/m); // For some reason this returns phantom extra chars at the end
      frontMatter = data.match(/^(---\n)(.|\n)*(\n---\n)$/gm)[0]; // And this fixes it (only take first match)
    // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)\n)/) != null) {
      // var frontMatter = data.match(/^(\+\+\+\n)(.|\n)*(\n\+\+\+\n)$/m); // Phantom extra chars
      frontMatter = data.match(/^(\+\+\+\n)(.|\n)*(\n\+\+\+\n)$/gm[0]); // Fix
    }
  // If data format is HTML
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)\n)/) != null) {
      //var frontMatter = data.match(/^(<pre><code>---\n)(.|\n)*(\n---\n<\/code><\/pre>)$/m); // Phantom extra chars
      frontMatter = data.match(/^(<pre><code>---\n)(.|\n)*(\n---\n<\/code><\/pre>)$/gm[0]); // Fix
    // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)\n)/) != null) {
      //var frontMatter = data.match(/^(<pre><code>\+\+\+\n)(.|\n)*(\n\+\+\+\n<\/code><\/pre>)$/m); // Phantom extra chars
      frontMatter = data.match(/^(<pre><code>\+\+\+\n)(.|\n)*(\n\+\+\+\n<\/code><\/pre>)$/gm[0]); // Fix
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
    if (data.match(/^((---)\n)/) != null) {
      data = data.replace(/^(---\n)(.|\n)*(\n---\n)$/m, function(match) {
        return '';
      });
    // TOML front matter (+++)
    } else if (data.match(/^((\+\+\+)\n)/) != null) {
      data = data.replace(/^(\+\+\+\n)(.|\n)*(\n\+\+\+\n)$/m, function(match) {
        return '';
      });
    }
  // If data format is HTML
  } else if (format == 'html') {
    // YAML front matter (---)
    if (data.match(/^((<pre><code>---)\n)/) != null) {
      data = data.replace(/^(<pre><code>---\n)(.|\n)*(\n---\n<\/code><\/pre>)$/m, function(match) {
        return '';
      });
    // TOML front matter (+++)
    } else if (data.match(/^((<pre><code>\+\+\+)\n)/) != null) {
      data = data.replace(/^(<pre><code>\+\+\+\n)(.|\n)*(\n\+\+\+\n<\/code><\/pre>)$/m, function(match) {
        return '';
      });
    }
  }

  return data;
}

// Usage: data = addFrontMatter(data, frontMatter, format);
// where format = 'markdown' or 'HTML'
function addFrontMatter(data, frontMatter, format) {

  // If data format is markdown
  if (format == 'markdown') {
    data = frontMatter + '\n' + data;
  // If data format is HTML
  } else if (format == 'html') {
    data = '<pre><code>' + frontMatter + '</code></pre>' + '\n' + data;
  }

  return data;
}

