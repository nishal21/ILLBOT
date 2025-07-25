import React, { useState, useCallback } from 'react';
import { paraphraseText } from '../services/geminiService';
import { ParaphraseMode, Mode } from '../types';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, ArrowPathIcon, XCircleIcon } from './ViewIcons';

const PARAPHRASE_MODES: ParaphraseMode[] = ['Simpler', 'Balanced', 'Formal', 'Creative', 'Expand', 'Shorten'];

interface ParaphraserViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const ParaphraserView: React.FC<ParaphraserViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ParaphraseMode>('Balanced');
  const [copied, setCopied] = useState(false);

  const onParaphrase = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await paraphraseText(inputText, mode);
      setOutputText(result);
      logActivity(`Paraphrased to "${mode}"`, Mode.Paraphraser, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, logActivity]);

  const onCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex flex-wrap items-center gap-1">
          {PARAPHRASE_MODES.map(level => (
            <button
              key={level}
              onClick={() => setMode(level)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === level ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <button
          onClick={onParaphrase}
          disabled={isLoading || !inputText}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <> <ArrowPathIcon /> Paraphrase </>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
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
            placeholder="AI output will appear here..."
            className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none placeholder-slate-500 text-slate-200"
          ></textarea>
           <div className="flex justify-between items-center p-2 border-t border-slate-700">
             <span className="text-xs text-slate-400">{outputText.split(/\s+/).filter(Boolean).length} words</span>
             <button onClick={onCopy} className="p-2 text-slate-400 hover:text-white transition-colors" disabled={!outputText}>
                {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
           </div>
        </div>
      </div>
    </div>
  );
};