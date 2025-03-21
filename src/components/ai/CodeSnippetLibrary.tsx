import React, { useState } from 'react';
import { Search, Code, Copy, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LanguageOption } from './LanguageSelector';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  category: string;
}

interface CodeSnippetLibraryProps {
  onSelectSnippet: (code: string, language: string) => void;
  theme: 'light' | 'dark';
  languageOptions: LanguageOption[];
}

const CodeSnippetLibrary: React.FC<CodeSnippetLibraryProps> = ({
  onSelectSnippet,
  theme,
  languageOptions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['algorithms', 'dataStructures']);
  
  // Sample code snippets
  const codeSnippets: CodeSnippet[] = [
    {
      id: '1',
      title: 'Binary Search',
      description: 'Efficient search algorithm for sorted arrays',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Target not found
}`,
      language: 'javascript',
      tags: ['search', 'algorithm', 'efficient'],
      category: 'algorithms'
    },
    {
      id: '2',
      title: 'Linked List Implementation',
      description: 'Basic singly linked list with core operations',
      code: `class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  
  append(value) {
    const newNode = new Node(value);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    
    this.length++;
    return this;
  }
  
  prepend(value) {
    const newNode = new Node(value);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    
    this.length++;
    return this;
  }
  
  delete(value) {
    if (!this.head) return null;
    
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      return this;
    }
    
    let current = this.head;
    
    while (current.next && current.next.value !== value) {
      current = current.next;
    }
    
    if (current.next) {
      current.next = current.next.next;
      this.length--;
    }
    
    return this;
  }
}`,
      language: 'javascript',
      tags: ['data structure', 'linked list'],
      category: 'dataStructures'
    },
    {
      id: '3',
      title: 'React useState Hook',
      description: 'Basic example of React useState hook',
      code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;`,
      language: 'typescript',
      tags: ['react', 'hooks', 'state'],
      category: 'react'
    },
    {
      id: '4',
      title: 'Python Quick Sort',
      description: 'Implementation of quick sort algorithm in Python',
      code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Example usage
arr = [3, 6, 8, 10, 1, 2, 1]
sorted_arr = quick_sort(arr)
print(sorted_arr)  # [1, 1, 2, 3, 6, 8, 10]`,
      language: 'python',
      tags: ['sorting', 'algorithm', 'divide and conquer'],
      category: 'algorithms'
    }
  ];
  
  // Group snippets by category
  const snippetsByCategory: Record<string, CodeSnippet[]> = {};
  codeSnippets.forEach(snippet => {
    if (!snippetsByCategory[snippet.category]) {
      snippetsByCategory[snippet.category] = [];
    }
    snippetsByCategory[snippet.category].push(snippet);
  });
  
  // Filter snippets based on search query
  const filteredSnippets = searchQuery
    ? codeSnippets.filter(snippet => 
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Copy snippet to clipboard
  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };
  
  // Get language label
  const getLanguageLabel = (value: string): string => {
    const language = languageOptions.find(lang => lang.value === value);
    return language ? language.label : value;
  };
  
  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Code Snippet Library
        </h2>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets..."
            className={`w-full pl-10 pr-4 py-2 ${
              theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
            } border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>
      </div>
      
      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          // Search results
          <div className="space-y-4">
            <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Results ({filteredSnippets.length})
            </h3>
            {filteredSnippets.length === 0 ? (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No snippets found matching "{searchQuery}"
              </p>
            ) : (
              filteredSnippets.map(snippet => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onSelect={onSelectSnippet}
                  onCopy={copySnippet}
                  theme={theme}
                  getLanguageLabel={getLanguageLabel}
                />
              ))
            )}
          </div>
        ) : (
          // Categorized snippets
          <div className="space-y-4">
            {Object.entries(snippetsByCategory).map(([category, snippets]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center space-x-2 w-full text-left mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Folder className={`h-4 w-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <span className="font-medium capitalize">{category}</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    ({snippets.length})
                  </span>
                </button>
                
                {expandedCategories.includes(category) && (
                  <div className="space-y-3 ml-6">
                    {snippets.map(snippet => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        onSelect={onSelectSnippet}
                        onCopy={copySnippet}
                        theme={theme}
                        getLanguageLabel={getLanguageLabel}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SnippetCardProps {
  snippet: CodeSnippet;
  onSelect: (code: string, language: string) => void;
  onCopy: (code: string) => void;
  theme: 'light' | 'dark';
  getLanguageLabel: (value: string) => string;
}

const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onSelect,
  onCopy,
  theme,
  getLanguageLabel
}) => {
  return (
    <div className={`p-3 rounded-lg ${
      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
    } transition-colors cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {snippet.title}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            {snippet.description}
          </p>
          <div className="flex items-center mt-2">
            <span className={`text-xs px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {getLanguageLabel(snippet.language)}
            </span>
            <div className="flex flex-wrap ml-2">
              {snippet.tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded mr-1 mt-1 ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onCopy(snippet.code)}
            className={`p-1 rounded ${
              theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-200'
            }`}
            title="Copy code"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSelect(snippet.code, snippet.language)}
            className={`p-1 rounded ${
              theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-200'
            }`}
            title="Use in editor"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetLibrary;