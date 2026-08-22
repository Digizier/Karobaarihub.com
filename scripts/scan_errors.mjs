import fs from 'fs';

const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  // Check for .map on potentially undefined variables
  if (line.includes('.map(') && !line.includes('?.map') && !line.includes('|| []')) {
    console.log(`Potential undefined .map Line ${idx + 1}: ${line.trim()}`);
  }
  // Check for .filter on potentially undefined variables
  if (line.includes('.filter(') && !line.includes('?.filter') && !line.includes('|| []')) {
    console.log(`Potential undefined .filter Line ${idx + 1}: ${line.trim()}`);
  }
  // Check for .toLowerCase()
  if (line.includes('.toLowerCase(') && !line.includes('?.toLowerCase') && !line.includes('|| ""')) {
    console.log(`Potential undefined .toLowerCase Line ${idx + 1}: ${line.trim()}`);
  }
});
