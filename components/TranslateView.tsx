import React, { useState, useCallback } from 'react';
import { translateText } from '../services/geminiService';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, XCircleIcon } from './ViewIcons';
import { TranslateIcon } from '../constants';
import { Mode } from '../types';

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Japanese', 'Chinese (Simplified)', 'Russian', 'Italian', 'Portuguese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Turkish', 'Polish'
];

interface TranslateViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const TranslateView: React.FC<TranslateViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [copied, setCopied] = useState(false);

  const onTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await translateText(inputText, targetLanguage);
      setOutputText(result);
      logActivity(`Translated to ${targetLanguage}`, Mode.Translate, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, targetLanguage, logActivity]);

  const onCopy = () => {
    navigator.clipboard.writeText(outputText);
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 p-3 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <button
          onClick={onTranslate}
          disabled={isLoading || !inputText}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><TranslateIcon className="w-5 h-5" /> Translate</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
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
          <textarea
            value={outputText}
            readOnly
            placeholder="Translation will appear here..."
            className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none placeholder-slate-500 text-slate-200"
          ></textarea>
          <div className="flex justify-between items-center p-2 border-t border-slate-700">
            <span className="text-xs text-slate-400">{targetLanguage}</span>
            <button onClick={onCopy} className="p-2 text-slate-400 hover:text-white transition-colors" disabled={!outputText}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};