import React, { useState, useCallback } from 'react';
import { generateCitation } from '../services/geminiService';
import { CitationStyle, CitationMode, Mode } from '../types';
import { Loader } from './Loader';
import { CopyIcon, CheckIcon, XCircleIcon } from './ViewIcons';
import { CitationGeneratorIcon } from '../constants';

const CITATION_STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago'];
const CITATION_MODES: CitationMode[] = ['Manual', 'From URL'];

const ManualInput: React.FC<{
  sourceData: { [key: string]: string };
  setSourceData: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}> = ({ sourceData, setSourceData }) => {
  const fields = ['Title', 'Author(s)', 'Publication Date', 'Website/Journal Name'];
  const handleChange = (field: string, value: string) => {
    setSourceData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(field => (
        <div key={field}>
          <label className="text-sm font-medium text-slate-400 mb-1 block">{field}</label>
          <input
            type="text"
            value={sourceData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
          />
        </div>
      ))}
    </div>
  );
};

const URLInput: React.FC<{
    url: string;
    setUrl: (url: string) => void;
}> = ({ url, setUrl }) => (
    <div>
        <label className="text-sm font-medium text-slate-400 mb-1 block">Source URL</label>
        <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
        />
    </div>
);

interface CitationGeneratorViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const CitationGeneratorView: React.FC<CitationGeneratorViewProps> = ({ logActivity }) => {
  const [citation, setCitation] = useState<string>('');
  const [style, setStyle] = useState<CitationStyle>('APA');
  const [mode, setMode] = useState<CitationMode>('From URL');
  const [sourceData, setSourceData] = useState<{ [key: string]: string }>({});
  const [url, setUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isInputValid = mode === 'From URL' ? url.trim() !== '' : Object.values(sourceData).some(v => v.trim() !== '');

  const onGenerate = useCallback(async () => {
    if (!isInputValid) return;
    setIsLoading(true);
    setError(null);
    setCitation('');
    try {
      const dataToCite = mode === 'From URL' ? { url } : sourceData;
      const result = await generateCitation(style, dataToCite);
      setCitation(result);
      logActivity(`Generated ${style} citation`, Mode.CitationGenerator);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [style, mode, url, sourceData, isInputValid, logActivity]);

  const onCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClear = () => {
    setSourceData({});
    setUrl('');
    setCitation('');
    setError(null);
  }

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 p-1 rounded-lg flex items-center gap-1">
          {CITATION_STYLES.map(level => (
            <button
              key={level}
              onClick={() => setStyle(level)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                style === level ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading || !isInputValid}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader /> : <><CitationGeneratorIcon className="w-5 h-5" /> Generate</>}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-slate-700/50 p-1 rounded-lg flex items-center gap-1">
                    {CITATION_MODES.map(m => (
                        <button key={m} onClick={() => setMode(m)}
                         className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${mode === m ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                           {m}
                        </button>
                    ))}
                </div>
                <button onClick={onClear} className="p-1 text-slate-400 hover:text-white transition-colors" title="Clear inputs">
                    <XCircleIcon />
                </button>
            </div>
            {mode === 'Manual' ? <ManualInput sourceData={sourceData} setSourceData={setSourceData} /> : <URLInput url={url} setUrl={setUrl} />}
        </div>
        <div className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg relative min-h-[150px]">
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
          <div className="w-full flex-1 p-4 text-slate-200">
             {citation ? citation : <span className="text-slate-500">Formatted citation will appear here...</span>}
          </div>
          <div className="flex justify-between items-center p-2 border-t border-slate-700">
            <span className="text-xs text-slate-400">{style} Style</span>
            <button onClick={onCopy} className="p-2 text-slate-400 hover:text-white transition-colors" disabled={!citation}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};