import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface LanguageOption {
  value: string;
  label: string;
  extension: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  theme: 'light' | 'dark';
  languageOptions: LanguageOption[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  theme,
  languageOptions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = languageOptions.find(option => option.value === selectedLanguage);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded ${
          theme === 'dark' 
            ? 'bg-gray-700 text-white border-gray-600' 
            : 'bg-white text-gray-900 border-gray-300'
        } border`}
      >
        <span>{selectedOption?.label || 'Select language'}</span>
        <ChevronDown className={`h-4 w-4 ml-2 ${isOpen ? 'transform rotate-180' : ''} transition-transform`} />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } max-h-60 overflow-auto`}
        >
          <ul className="py-1">
            {languageOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-900'
                  } ${selectedLanguage === option.value ? 'bg-purple-50 text-purple-700' : ''}`}
                  onClick={() => {
                    onLanguageChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {selectedLanguage === option.value && (
                    <Check className="h-4 w-4 text-purple-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;