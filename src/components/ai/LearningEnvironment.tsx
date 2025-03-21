import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Copy, 
  Save, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  BookOpen,
  Layers,
  SplitSquareVertical,
  Code as CodeIcon,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LanguageSelector, { LanguageOption } from './LanguageSelector';
import CodeSnippetLibrary from './CodeSnippetLibrary';

interface CodeOutput {
  type: 'result' | 'error' | 'log';
  content: string;
}

const LearningEnvironment: React.FC = () => {
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, world!");');
  const [output, setOutput] = useState<CodeOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [showLibrary, setShowLibrary] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const languageOptions: LanguageOption[] = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'csharp', label: 'C#', extension: 'cs' },
    { value: 'cpp', label: 'C++', extension: 'cpp' },
    { value: 'go', label: 'Go', extension: 'go' },
    { value: 'rust', label: 'Rust', extension: 'rs' },
    { value: 'ruby', label: 'Ruby', extension: 'rb' },
    { value: 'php', label: 'PHP', extension: 'php' },
    { value: 'swift', label: 'Swift', extension: 'swift' },
    { value: 'kotlin', label: 'Kotlin', extension: 'kt' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
  ];

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
    const selectedLanguage = languageOptions.find(lang => lang.value === language);
    const extension = selectedLanguage ? selectedLanguage.extension : 'txt';
    
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded as code.${extension}`);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value));
  };

  const handleSnippetSelect = (snippetCode: string, snippetLanguage: string) => {
    setCode(snippetCode);
    setLanguage(snippetLanguage);
    setShowLibrary(false);
    toast.success('Code snippet added to editor');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'} rounded-lg`}>
                <Layers className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Learning Environment
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                <BookOpen className="h-4 w-4" />
                <span>{showLibrary ? 'Hide Library' : 'Show Library'}</span>
              </button>
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
        <div className="flex h-[calc(100vh-10rem)]">
          {/* Code Snippet Library */}
          {showLibrary && (
            <div className="w-80 mr-4 rounded-xl shadow-sm overflow-hidden">
              <CodeSnippetLibrary 
                onSelectSnippet={handleSnippetSelect}
                theme={theme}
                languageOptions={languageOptions}
              />
            </div>
          )}
          
          {/* Main Editor and Output */}
          <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden flex flex-col`}>
            {/* Editor Controls */}
            <div className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <div className="w-40">
                  <LanguageSelector
                    selectedLanguage={language}
                    onLanguageChange={handleLanguageChange}
                    theme={theme}
                    languageOptions={languageOptions}
                  />
                </div>
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
            
            {/* Split View: Editor and Output */}
            <div className="flex-1 flex flex-col">
              {/* Code Editor */}
              <div className="h-1/2">
                <div className={`flex items-center justify-between p-2 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Code Editor
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={downloadCode}
                      className={`p-1 rounded ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                      aria-label="Download code"
                    >
                      <Download className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {code.split('\n').length} lines
                    </span>
                  </div>
                </div>
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full h-[calc(100%-36px)] p-4 font-mono resize-none focus:outline-none ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-100' 
                      : 'bg-white text-gray-900'
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                  spellCheck="false"
                />
              </div>
              
              {/* Run Button Bar */}
              <div className={`flex items-center justify-between px-4 py-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div></div>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                    theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Run code"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Run</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Console Output */}
              <div className={`h-1/2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`flex items-center justify-between p-2 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Console Output
                  </h3>
                  <button
                    onClick={clearOutput}
                    className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    aria-label="Clear console"
                  >
                    <RefreshCw className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
                <div 
                  ref={outputRef}
                  className={`h-[calc(100%-36px)] p-4 font-mono overflow-y-auto ${
                    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
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
      </div>
    </div>
  );
};

export default LearningEnvironment;