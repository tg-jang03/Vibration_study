import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const [url, outFile, height = '3500'] = process.argv.slice(2);
if (!url || !outFile) {
  console.error('Usage: node scripts/capture.mjs <url> <outFile> [height]');
  process.exit(1);
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const absoluteOut = path.resolve(process.cwd(), outFile);

const args = [
  '--headless=new',
  `--window-size=1100,${height}`,
  '--virtual-time-budget=8000',
  `--screenshot=${absoluteOut}`,
  url,
];

execFile(edgePath, args, (err) => {
  if (err) {
    console.error('Capture error:', err);
    process.exit(1);
  }
  if (fs.existsSync(absoluteOut)) {
    const stat = fs.statSync(absoluteOut);
    console.log(`Saved screenshot: ${absoluteOut} (${stat.size} bytes)`);
  } else {
    console.error('Screenshot file was not generated');
    process.exit(1);
  }
});
