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
    if (line.includes('/product/') && !line.includes('/product/?slug=') && !line.includes('//')) {
      console.log(`PRODUCT LINK ${file}:${idx + 1}: ${line.trim()}`);
    }
    if (line.includes('/real-estate/property/') && !line.includes('/real-estate/property/?slug=') && !line.includes('//')) {
      console.log(`PROPERTY LINK ${file}:${idx + 1}: ${line.trim()}`);
    }
    if (line.includes('/digital-books/') && !line.includes('/digital-books/?slug=') && !line.includes('//')) {
      console.log(`BOOK LINK ${file}:${idx + 1}: ${line.trim()}`);
    }
    if (line.includes('/courses/') && !line.includes('/courses/?slug=') && !line.includes('//')) {
      console.log(`COURSE LINK ${file}:${idx + 1}: ${line.trim()}`);
    }
  });
});
