#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Editable list of glob patterns to ignore.
// Any file or directory whose name matches one of the ignore patterns will be skipped.
const IGNORE_PATTERNS: string[] = [
  '*test*',            // Skip files/directories containing "test"
  '.*',                // Skip hidden files/directories (those starting with a dot)
  'node_modules',      // Skip node_modules directory
  'package-lock.json', // Skip package-lock.json files
  'build',             // Skip build directories
  'dist',              // Skip dist directories
  'target',            // Skip target directories
  'LICENSE',
  '*.svg',
  '*bruno*'
];

/**
 * Convert a glob pattern to a regular expression.
 * This function escapes regex special characters and replaces:
 * - '*' with '.*'
 * - '?' with '.'
 */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/([.+^${}()|[\]\\])/g, '\\$1');
  const regexStr = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
  return new RegExp(regexStr);
}

// Precompute regexes for ignore patterns.
const IGNORE_REGEXES: RegExp[] = IGNORE_PATTERNS.map(globToRegExp);

function shouldIgnore(name: string): boolean {
  // Return true if the given name matches any of the ignore patterns.
  return IGNORE_REGEXES.some(regex => regex.test(name));
}

function processDirectory(baseDir: string, currentDir: string = baseDir): void {
  let entries: fs.Dirent[];
  try {
    // Read directory entries with file type information.
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch (err: any) {
    console.error(`Error reading directory ${currentDir}: ${err}`);
    return;
  }

  entries.forEach((entry: fs.Dirent) => {
    if (entry.isDirectory()) {
      if (shouldIgnore(entry.name)) {
        return; // Skip directories matching ignore patterns.
      }
      // Recurse into the subdirectory.
      processDirectory(baseDir, path.join(currentDir, entry.name));
    } else if (entry.isFile()) {
      if (shouldIgnore(entry.name)) {
        return; // Skip files matching ignore patterns.
      }
      const filePath: string = path.join(currentDir, entry.name);
      // Compute the relative path from baseDir for clearer output.
      const relPath: string = path.relative(baseDir, filePath);
      console.log(`File: ${relPath}`);
      try {
        const content: string = fs.readFileSync(filePath, 'utf-8');
        console.log(content);
      } catch (err: any) {
        console.error(`Error reading file ${filePath}: ${err}`);
      }
      // Print an extra blank line between file outputs.
      console.log();
    }
  });
}

const pathToDocs = path.resolve(__dirname, '../../apps/mantine.dev/src/pages/core/');

function main(): void {
  const baseDir: string = pathToDocs;

  try {
    if (!fs.statSync(baseDir).isDirectory()) {
      console.log("Provided path is not a directory.");
      process.exit(1);
    }
  } catch (err: any) {
    console.log(`Error accessing provided path: ${err}`);
    process.exit(1);
  }

  processDirectory(baseDir);
}

main();
