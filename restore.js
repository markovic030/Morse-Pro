const { execSync } = require('child_process');
try {
  console.log(execSync('git log -n 5').toString());
} catch(e) {
  console.error(e.toString());
}
