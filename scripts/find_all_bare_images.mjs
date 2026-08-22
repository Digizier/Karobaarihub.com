import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(fullPath, fileList);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = walkDir('.');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('<Image') || (line.includes('src={') && line.includes('<Image'))) {
      // check if it uses bare variable without fallback
      if (!line.includes('||') && !line.includes('"/') && !line.includes('`') && line.includes('src={')) {
        console.log(`${file}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
});
