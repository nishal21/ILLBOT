import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';
import { SummarizerFormat, Mode } from '../types';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, DocumentTextIcon, XCircleIcon } from './ViewIcons';

const SUMMARY_FORMATS: SummarizerFormat[] = ['Paragraph', 'Bullet Points'];

interface SummarizerViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<SummarizerFormat>('Paragraph');
  const [wordCount, setWordCount] = useState<number>(100);
  const [copied, setCopied] = useState(false);

  const onSummarize = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await summarizeText(inputText, format, wordCount);
      setOutputText(result);
      logActivity(`Summarized to ${wordCount} words`, Mode.Summarizer, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, format, wordCount, logActivity]);

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

  const maxWords = Math.max(200, inputText.split(/\s+/).filter(Boolean).length);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className=" bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex items-center gap-1">
              {SUMMARY_FORMATS.map(level => (
                <button
                  key={level}
                  onClick={() => setFormat(level)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors w-full ${
                    format === level ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-2 rounded-lg">
                <label htmlFor="word-count" className="text-sm font-medium text-slate-300 whitespace-nowrap">Length:</label>
                <input
                    id="word-count"
                    type="range"
                    min="20"
                    max={maxWords}
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-semibold text-indigo-300 w-12 text-center">{wordCount} words</span>
            </div>
        </div>
        <button
          onClick={onSummarize}
          disabled={isLoading || !inputText}
          className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><DocumentTextIcon /> Summarize </>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to summarize..."
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
          <div
            className="w-full flex-1 p-4 whitespace-pre-wrap overflow-y-auto"
          >
            {outputText ? (
                <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: outputText.replace(/\n/g, '<br />') }}></div>
            ) : (
                <span className="text-slate-500">Summary will appear here...</span>
            )}
          </div>
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