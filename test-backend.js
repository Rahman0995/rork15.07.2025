// Simple test to check if backend compiles
const { spawn } = require('child_process');

console.log('Testing backend compilation...');

const tsc = spawn('npx', ['tsc', '--noEmit', '--project', '.'], {
  stdio: 'inherit',
  shell: true
});

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Backend compiles successfully!');
  } else {
    console.log('❌ Backend compilation failed with code:', code);
  }
  process.exit(code);
});

tsc.on('error', (error) => {
  console.error('❌ Error running TypeScript compiler:', error);
  process.exit(1);
});