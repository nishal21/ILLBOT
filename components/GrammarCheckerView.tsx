import React, { useState, useCallback } from 'react';
import { checkGrammar } from '../services/geminiService';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, CheckBadgeIcon, XCircleIcon } from './ViewIcons';
import { Mode } from '../types';

const parseCorrections = (text: string): React.ReactNode => {
    // This regex will find ~~...~~**...** patterns
    const regex = /(~~\s*([^~]+?)\s*~~\s*\*\*\s*([^~*]+?)\s*\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (index % 4 === 2) { // The original, deleted part
            return <del key={index} className="text-red-400 bg-red-900/30 px-1 rounded">{part}</del>;
        }
        if (index % 4 === 3) { // The new, corrected part
            return <strong key={index} className="text-green-400 bg-green-900/30 px-1 rounded">{part}</strong>;
        }
        if (index % 4 === 0) { // Regular text
            return <span key={index}>{part}</span>;
        }
        return null;
    });
};

interface GrammarCheckerViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const GrammarCheckerView: React.FC<GrammarCheckerViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onCheckGrammar = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await checkGrammar(inputText);
      setOutputText(result);
      logActivity('Checked grammar', Mode.GrammarChecker, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, logActivity]);

  const onCopy = () => {
    // Clean up the markdown before copying
    const plainText = outputText.replace(/~~\s*([^~]+?)\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const onClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          onClick={onCheckGrammar}
          disabled={isLoading || !inputText}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><CheckBadgeIcon /> Check Grammar</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to check for errors..."
            className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none placeholder-slate-500 text-slate-200"
          ></textarea>
          <div className="flex justify-between items-center p-2 border-t border-slate-700">
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-white transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
              title="Clear text"
              disabled={!inputText}
            >
              <XCircleIcon />
            </button>
            <span className="text-xs text-slate-400">{inputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <Loader />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center p-4 rounded-xl">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}
          <div className="w-full flex-1 p-4 bg-transparent overflow-y-auto leading-relaxed">
            {outputText ? (
                parseCorrections(outputText)
            ) : (
                <span className="text-slate-500">Corrected text with highlights will appear here...</span>
            )}
          </div>
           <div className="flex justify-between items-center p-2 border-t border-slate-700">
             <span className="text-xs text-slate-400">Showing corrections</span>
             <button onClick={onCopy} className="p-2 text-slate-400 hover:text-white transition-colors" disabled={!outputText}>
                {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};