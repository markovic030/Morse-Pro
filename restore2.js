import { execSync } from 'child_process';
try {
  console.log(execSync('git log --oneline -n 2').toString());
  execSync('git checkout HEAD -- public/js/input.js');
  console.log("Restored input.js from git!");
} catch (e) {
  console.log("Git error:", e.toString());
}
