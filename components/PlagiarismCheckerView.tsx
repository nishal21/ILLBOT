import React, { useState, useCallback } from 'react';
import { checkPlagiarism, PlagiarismSource } from '../services/geminiService';
import { Loader } from './Loader';
import { PlagiarismCheckerIcon } from '../constants';
import { XCircleIcon } from './ViewIcons';
import { Mode } from '../types';

interface PlagiarismCheckerViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const PlagiarismCheckerView: React.FC<PlagiarismCheckerViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<PlagiarismSource[]>([]);

  const onCheck = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setSources([]);
    try {
      const plagiarismSources = await checkPlagiarism(inputText);
      setSources(plagiarismSources);
      logActivity(`Checked for plagiarism`, Mode.PlagiarismChecker, inputText.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, logActivity]);

  const onClear = () => {
    setInputText('');
    setSources([]);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          onClick={onCheck}
          disabled={isLoading || !inputText}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><PlagiarismCheckerIcon className="w-5 h-5" /> Check Plagiarism</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to check for plagiarism..."
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
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Potential Sources</h3>
            {!isLoading && !error && sources.length === 0 && (
              <div className="text-center text-slate-400 mt-10">
                <PlagiarismCheckerIcon className="w-16 h-16 mx-auto mb-4" />
                <p>No matching sources found or no text submitted.</p>
              </div>
            )}
            <ul className="space-y-3">
              {sources.map((source, index) => (
                <li key={index} className="bg-slate-700/50 p-3 rounded-lg">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-400 hover:underline truncate block"
                  >
                    {source.title || 'Untitled Source'}
                  </a>
                  <p className="text-xs text-slate-400 truncate">{source.uri}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};