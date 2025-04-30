const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonBridge {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.basePath = path.join(__dirname, '..', 'GenAI');
    this.ensureDirectoriesExist();
  }

  ensureDirectoriesExist() {
    const dirs = [
      path.join(__dirname, '..', 'output', 'stories'),
      path.join(__dirname, '..', 'output', 'images', 'characters'),
      path.join(__dirname, '..', 'output', 'images', 'backgrounds'),
      path.join(__dirname, '..', 'output', 'temp'),
      path.join(__dirname, '..', 'output', 'summaries')
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }

  async executeScript(scriptName, args = {}) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.basePath, scriptName);
      
      // Create a JSON string of arguments to pass to Python
      const argsString = JSON.stringify(args);
      
      console.log(`Executing Python script: ${scriptPath}`);
      
      // Run the entire Python file directly with arguments
      const pythonProcess = spawn(this.pythonPath, [
        scriptPath,
        JSON.stringify(args)
      ]);

      let result = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
        console.log(`Python output: ${data.toString().substring(0, 200)}...`); // Only log part to avoid cluttering
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python error: ${data.toString()}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        }

        try {
          // Try to find the JSON in the output
          const jsonStartPos = result.indexOf('{');
          const jsonEndPos = result.lastIndexOf('}') + 1;
          
          if (jsonStartPos >= 0 && jsonEndPos > jsonStartPos) {
            const jsonStr = result.substring(jsonStartPos, jsonEndPos);
            try {
              const parsedResult = JSON.parse(jsonStr);
              resolve(parsedResult);
            } catch (parseError) {
              reject(new Error(`Failed to parse JSON: ${jsonStr.substring(0, 100)}...`));
            }
          } else {
            reject(new Error(`No JSON found in Python output: ${result.substring(0, 100)}...`));
          }
        } catch (e) {
          reject(new Error(`Error extracting JSON from Python output: ${e.message}`));
        }
      });
    });
  }

  async generateStory() {
    console.log("Executing entire NovelGenerator.py script");
    return this.executeScript('NovelGenerator.py');
  }

  async generateQuiz(storyData, difficulty) {
    console.log("Executing entire QuizGenerator.py script");
    return this.executeScript('QuizGenerator.py', { 
      story_data: storyData,
      difficulty: difficulty 
    });
  }

  async generateSummary(storyData, selectedInterest) {
    console.log("Executing entire Summarizer.py script");
    return this.executeScript('Summarizer.py', {
      story_data: storyData,
      selected_interest: selectedInterest
    });
  }

  async testPythonConnection() {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        '-c', 
        'import sys, json; print(json.dumps({"status": "success", "python_version": sys.version}))'
      ]);

      let result = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        }

        try {
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${result}`));
        }
      });
    });
  }

  async loadUserData() {
    console.log("Explicitly loading user preferences...");
    return this.executeScript('NovelGenerator.py', { action: 'load_user_data' });
  }
}

module.exports = new PythonBridge();
