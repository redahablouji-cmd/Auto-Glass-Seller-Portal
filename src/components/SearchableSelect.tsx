import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showOtherOption?: boolean;
  otherLabel?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  required = false,
  className = "",
  showOtherOption = false,
  otherLabel = "Other"
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayValue = value === "OTHER" ? otherLabel : value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div 
        className={`relative flex items-center border rounded-xl bg-white transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-slate-300'
        } ${isOpen ? 'ring-2 ring-indigo-400/30 border-indigo-400' : 'border-slate-200'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 px-3 py-2.5 text-slate-800 truncate">
          {value ? displayValue : <span className="text-slate-400">{placeholder}</span>}
        </div>
        <div className="px-2 text-slate-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-slate-400"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    value === option ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                No results found
              </div>
            )}
            
            {showOtherOption && (
              <div
                className={`px-4 py-2 text-sm cursor-pointer border-t border-slate-100 transition-colors ${
                  value === "OTHER" ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-amber-600 hover:bg-amber-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("OTHER");
                }}
              >
                {otherLabel}
              </div>
            )}
          </div>
        </div>
      )}
      
      {required && !value && (
        <input 
          tabIndex={-1} 
          autoComplete="off" 
          style={{ opacity: 0, height: 0, padding: 0, position: 'absolute' }} 
          required 
          value="" 
          onChange={() => {}} 
        />
      )}
    </div>
  );
}
