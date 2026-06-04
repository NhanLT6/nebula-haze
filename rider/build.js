#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const releasesDir = path.join(__dirname, 'releases');
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

function nextVersion() {
  const PATCH_MAX = 10;
  const MINOR_MAX = 10;
  const files = fs.readdirSync(releasesDir);
  const versions = files
    .map(f => f.match(/^nebula-haze-(\d+)\.(\d+)\.(\d+)\.jar$/))
    .filter(Boolean)
    .map(([, major, minor, patch]) => [+major, +minor, +patch]);

  if (versions.length === 0) return '1.0.0';

  versions.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  let [major, minor, patch] = versions[0];

  patch += 1;
  if (patch >= PATCH_MAX) { patch = 0; minor += 1; }
  if (minor >= MINOR_MAX) { minor = 0; major += 1; }

  return `${major}.${minor}.${patch}`;
}

const version = nextVersion();
const outputFilename = `nebula-haze-${version}.jar`;
const outputPath = path.join(releasesDir, outputFilename);

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('error', (err) => { console.error('Error writing JAR:', err); process.exit(1); });
archive.on('error', (err) => { console.error('Error creating archive:', err); process.exit(1); });

archive.pipe(output);

console.log('Building theme JAR...');

archive.directory('META-INF/', 'META-INF');
console.log('  Added META-INF/');

archive.file('nebula-haze.xml', { name: 'nebula-haze.xml' });
console.log('  Added nebula-haze.xml');

archive.file('nebula-haze.theme.json', { name: 'nebula-haze.theme.json' });
console.log('  Added nebula-haze.theme.json');

output.on('close', () => {
  console.log(`\nTheme JAR created successfully!`);
  console.log(`Output: ${outputPath}`);
  console.log(`Size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
  console.log(`Version: ${version}\n`);
  process.exit(0);
});

archive.finalize();
