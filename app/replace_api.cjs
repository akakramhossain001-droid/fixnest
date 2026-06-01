const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
const API_BASE = "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}";

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace 'http://localhost:5000...' with `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}...`
  // Example: fetch('http://localhost:5000/api/auth') -> fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`)
  
  // Regex to match 'http://localhost:5000/something'
  content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`' + API_BASE + '$1`');
  
  // Regex to match `http://localhost:5000/something${var}`
  content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`' + API_BASE + '$1`');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done!');
