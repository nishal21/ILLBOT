import React, { useState, useCallback } from 'react';
import { humanizeText, detectAIText } from '../services/geminiService';
import { AIHumanizerTone, Mode } from '../types';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, XCircleIcon } from './ViewIcons';
import { AIHumanizerIcon } from '../constants';

const TONE_LEVELS: AIHumanizerTone[] = ['Neutral', 'Friendly', 'Professional', 'Confident'];

const parseChanges = (text: string): React.ReactNode => {
    // This regex will find ~~...~~**...** patterns
    const regex = /(~~\s*([^~]+?)\s*~~\s*\*\*\s*([^~*]+?)\s*\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (index % 4 === 2) { // The original, deleted part (render subtly)
            return <del key={index} className="text-red-400/60 bg-red-900/20 px-1 rounded">{part}</del>;
        }
        if (index % 4 === 3) { // The new, added part (highlighted)
            return <span key={index} className="text-cyan-300 bg-cyan-900/40 px-1 rounded font-medium">{part}</span>;
        }
        if (index % 4 === 0) { // Regular text
            return <span key={index}>{part}</span>;
        }
        return null;
    });
};

const VibeCheckMeter: React.FC<{ before: number; after: number }> = ({ before, after }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 mt-4">
        <h4 className="text-base font-semibold text-slate-200">Vibe Check™ Results</h4>
        <div className="space-y-2">
            <div>
                <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-400">Before (AI Score)</span>
                    <span className="font-bold text-red-400">{before.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${before}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-400">After (AI Score)</span>
                    <span className="font-bold text-green-400">{after.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${after}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
        </div>
        <p className="text-xs text-slate-500">Lower AI score is better. This indicates the text is more likely to be seen as human-written.</p>
    </div>
);

interface AIHumanizerViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const AIHumanizerView: React.FC<AIHumanizerViewProps> = ({ logActivity }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<AIHumanizerTone>('Neutral');
  const [humanizeLevel, setHumanizeLevel] = useState<number>(50);
  const [vibeCheckResult, setVibeCheckResult] = useState<{ before: number, after: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const onHumanize = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    setVibeCheckResult(null);
    try {
      // 1. Vibe Check Before
      const beforeResult = await detectAIText(inputText);
      
      // 2. Humanize
      const humanizedResult = await humanizeText(inputText, tone, humanizeLevel);
      setOutputText(humanizedResult);
      
      // 3. Vibe Check After
      const plainHumanizedText = humanizedResult.replace(/~~\s*[^~]+?\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
      const afterResult = await detectAIText(plainHumanizedText);
      
      // 4. Set results
      setVibeCheckResult({ before: beforeResult.score, after: afterResult.score });
      logActivity(`Humanized text (Level ${humanizeLevel})`, Mode.AIHumanizer, inputText.split(/\s+/).filter(Boolean).length);

    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, tone, humanizeLevel, logActivity]);

  const onCopy = () => {
    // Clean up the markdown before copying to get only the final, humanized text
    const plainText = outputText.replace(/~~\s*[^~]+?\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setVibeCheckResult(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
          <div className=" bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex items-center gap-1">
            {TONE_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => setTone(level)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tone === level ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-2 rounded-lg">
                <label htmlFor="humanize-level" className="text-sm font-medium text-slate-300 whitespace-nowrap">Humanize Level:</label>
                <input
                    id="humanize-level"
                    type="range"
                    min="1"
                    max="100"
                    value={humanizeLevel}
                    onChange={(e) => setHumanizeLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-semibold text-indigo-300 w-8 text-center">{humanizeLevel}</span>
            </div>
        </div>
        <button
          onClick={onHumanize}
          disabled={isLoading || !inputText}
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><AIHumanizerIcon className="w-5 h-5" /> Humanize & Vibe Check</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter AI-generated text here..."
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
            <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
              <div className="text-center">
                <Loader />
                <p className="text-slate-300 mt-2 text-sm">Performing Vibe Check & Humanizing...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center p-4 rounded-xl z-10">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}
          <div className="w-full flex-1 p-4 bg-transparent overflow-y-auto leading-relaxed">
            {outputText ? (
                parseChanges(outputText)
              ) : (
                <span className="text-slate-500">Human-like text with highlights will appear here...</span>
              )}
          </div>
          <div className="flex flex-col p-2 border-t border-slate-700">
            {vibeCheckResult && !isLoading && <VibeCheckMeter before={vibeCheckResult.before} after={vibeCheckResult.after} />}
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-400">Showing changes</span>
                <button onClick={onCopy} className="p-2 text-slate-400 hover:text-white transition-colors" disabled={!outputText}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};