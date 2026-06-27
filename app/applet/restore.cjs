const { execSync } = require('child_process');
try {
  console.log(execSync('git log --oneline').toString());
  execSync('git checkout HEAD -- public/js/input.js');
  console.log("Restored input.js from git!");
} catch (e) {
  console.log("Git error:", e.toString());
}
