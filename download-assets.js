import fs from 'fs/promises';
import path from 'path';

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);
  const data = await response.text();
  await fs.writeFile(dest, data);
}

async function main() {
  console.log('Downloading Lucide script...');
  await downloadFile('https://unpkg.com/lucide@latest/dist/umd/lucide.min.js', 'public/js/lucide.min.js');
  console.log('Lucide script downloaded successfully.');
}

main().catch(console.error);
