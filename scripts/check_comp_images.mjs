import fs from 'fs';
import path from 'path';

function checkFileImages(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('<Image') || line.includes('src={')) {
      if (line.includes('src={') && !line.includes('||') && !line.includes('"/') && !line.includes('`') && !line.includes('cat.image_url ||')) {
        console.log(`${file}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
}

const compFiles = fs.readdirSync('components').map(f => path.join('components', f));
compFiles.forEach(f => {
  if (f.endsWith('.tsx')) checkFileImages(f);
});
