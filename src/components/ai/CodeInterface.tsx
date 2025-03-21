import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Copy, Save, Loader2, RefreshCw, Sparkles, Code as CodeIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CodeOutput {
  type: 'result' | 'error' | 'log';
  content: string;
}

const CodeInterface: React.FC = () => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, world!");');
  const [output, setOutput] = useState<CodeOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<string>('javascript');
  const [fileName, setFileName] = useState<string>('script.js');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
  ];

  useEffect(() => {
    // Update filename extension when language changes
    const selectedLanguage = languageOptions.find(lang => lang.value === language);
    if (selectedLanguage) {
      const nameWithoutExtension = fileName.split('.')[0];
      setFileName(`${nameWithoutExtension}.${selectedLanguage.extension}`);
    }
  }, [language]);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);

    // Simulate code execution
    setTimeout(() => {
      try {
        // For JavaScript, we can actually run it
        if (language === 'javascript') {
          // Create a safe execution environment
          const logs: string[] = [];
          const originalConsoleLog = console.log;
          
          // Override console.log to capture outputs
          console.log = (...args) => {
            logs.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '));
          };
          
          try {
            // Execute the code
            const result = new Function(code)();
            
            // Add logs to output
            logs.forEach(log => {
              setOutput(prev => [...prev, { type: 'log', content: log }]);
            });
            
            // Add result to output if it's not undefined
            if (result !== undefined) {
              setOutput(prev => [...prev, { 
                type: 'result', 
                content: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result) 
              }]);
            }
          } catch (error: any) {
            setOutput(prev => [...prev, { type: 'error', content: error.toString() }]);
          } finally {
            // Restore original console.log
            console.log = originalConsoleLog;
          }
        } else {
          // For other languages, just simulate output
          setOutput([
            { type: 'log', content: `Running ${language} code...` },
            { type: 'result', content: 'Execution completed successfully!' }
          ]);
        }
      } catch (error: any) {
        setOutput([{ type: 'error', content: error.toString() }]);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded as ${fileName}`);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value));
  };

  const generateAICode = () => {
    setIsRunning(true);
    
    // Simulate AI code generation
    setTimeout(() => {
      const aiGeneratedCode = `// AI-generated function to calculate factorial
function factorial(n) {
  // Base case: factorial of 0 or 1 is 1
  if (n === 0 || n === 1) {
    return 1;
  }
  
  // Recursive case: n! = n * (n-1)!
  return n * factorial(n - 1);
}

// Test the function with different values
console.log("Factorial of 5:", factorial(5));
console.log("Factorial of 10:", factorial(10));`;
      
      setCode(aiGeneratedCode);
      setIsRunning(false);
      toast.success('AI-generated code added');
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'} rounded-lg`}>
                <CodeIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Code Interface
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleThemeChange}
                className={`px-3 py-1 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Font Size:
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={generateAICode}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                  title="Generate AI Code"
                >
                  <Sparkles className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </button>
                <button
                  onClick={copyCode}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                  title="Copy Code"
                >
                  <Copy className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={downloadCode}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                  title="Download Code"
                >
                  <Download className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full h-[500px] p-4 font-mono resize-none focus:outline-none ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-gray-100' 
                  : 'bg-white text-gray-900'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              spellCheck="false"
            />
            <div className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {code.split('\n').length} lines
              </div>
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`flex items-center space-x-2 px-4 py-1 rounded ${
                  theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Console */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Console Output
              </h3>
              <button
                onClick={clearOutput}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                title="Clear Console"
              >
                <RefreshCw className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
            <div 
              ref={outputRef}
              className={`h-[500px] p-4 font-mono overflow-y-auto ${
                theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {output.length === 0 ? (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Run your code to see output here
                </div>
              ) : (
                output.map((item, index) => (
                  <div key={index} className="mb-2">
                    <span className={`${
                      item.type === 'error' 
                        ? 'text-red-500' 
                        : item.type === 'result' 
                        ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {item.type === 'error' ? '❌ Error: ' : item.type === 'result' ? '✅ Result: ' : '📋 Log: '}
                    </span>
                    <pre className="whitespace-pre-wrap">{item.content}</pre>
                  </div>
                ))
              )}
              {isRunning && (
                <div className="flex items-center space-x-2 text-yellow-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Executing code...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeInterface;