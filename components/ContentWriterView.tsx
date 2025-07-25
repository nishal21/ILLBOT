import React, { useState, useCallback } from 'react';
import { writeContent } from '../services/geminiService';
import { ContentWriterTone, ContentWriterLength, Mode } from '../types';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, XCircleIcon } from './ViewIcons';
import { ContentWriterIcon } from '../constants';

const TONES: ContentWriterTone[] = ['Casual', 'Professional', 'Enthusiastic'];
const LENGTHS: ContentWriterLength[] = ['Short', 'Medium', 'Long'];

interface ContentWriterViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const ContentWriterView: React.FC<ContentWriterViewProps> = ({ logActivity }) => {
  const [topic, setTopic] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<ContentWriterTone>('Professional');
  const [length, setLength] = useState<ContentWriterLength>('Medium');
  const [copied, setCopied] = useState(false);

  const onWrite = useCallback(async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await writeContent(topic, length, tone);
      setOutputText(result);
      logActivity(`Wrote content on "${topic}"`, Mode.ContentWriter, result.split(/\s+/).filter(Boolean).length);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [topic, length, tone, logActivity]);

  const onCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClear = () => {
    setTopic('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex items-center gap-1">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors w-full ${tone === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex items-center gap-1">
            {LENGTHS.map(l => (
              <button key={l} onClick={() => setLength(l)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors w-full ${length === l ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onWrite}
          disabled={isLoading || !topic}
          className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><ContentWriterIcon className="w-5 h-5" /> Write Content</>}
        </button>
      </div>
      
      <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-4">
        <label htmlFor="topic-input" className="text-sm font-medium text-slate-400 mb-2">Content Topic</label>
        <div className="flex gap-2">
            <input
                id="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The future of renewable energy"
                className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
            />
            <button
                onClick={onClear}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                title="Clear topic"
                disabled={!topic}
            >
                <XCircleIcon />
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative min-h-[400px]">
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
          placeholder="Generated content will appear here..."
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
  );
};