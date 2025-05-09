import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ora from 'ora';

export async function ensureOnnxModel() {
  const modelPath = path.join(process.cwd(), 'backend', 'model', 'food101.onnx');
  if (fs.existsSync(modelPath)) {
    console.log('✅ food101.onnx already exists.');
    return;
  }

  console.log('📦 ONNX model not found. Attempting to convert from Hugging Face...');
  const exportScriptPath = path.join('backend', 'scripts', 'export_to_onnx.py');
  const spinner = ora('Downloading and exporting model...').start();

  return new Promise((resolve, reject) => {
    exec(`python "${exportScriptPath}"`, (err, stdout, stderr) => {
      if (err) {
        spinner.fail('❌ Failed to export model');
        console.error(stderr);
        return reject(err);
      }

      console.log(stdout);

      // Confirm model exists
      if (fs.existsSync(modelPath)) {
        spinner.succeed('✅ Model is ready and verified.');
        return resolve();
      } else {
        spinner.fail('❌ Export reported success, but ONNX file not found.');
        return reject(new Error('ONNX file missing after export.'));
      }
    });
  });
}
