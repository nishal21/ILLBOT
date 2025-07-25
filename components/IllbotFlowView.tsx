import React, { useState, useCallback } from 'react';
import {
  paraphraseText,
  summarizeText,
  checkGrammar,
  humanizeText,
  detectAIText,
  checkPlagiarism,
  researchTopic,
  completeText,
  analyzeText,
} from '../services/geminiService';
import {
  ParaphraseMode,
  SummarizerFormat,
  AIHumanizerTone,
  Mode,
} from '../types';
import { Loader } from './Loader';
import {
  ParaphraserIcon,
  SummarizerIcon,
  GrammarCheckerIcon,
  AIHumanizerIcon,
  AIDetectorIcon,
  PlagiarismCheckerIcon,
  ResearchIcon,
  WriteAssistIcon,
  AnalyticsIcon,
} from '../constants';

type ActionId = 'Paraphrase' | 'Summarize' | 'Grammar' | 'Humanize' | 'Detect' | 'Plagiarism' | 'Research' | 'WriteAssist' | 'Analytics';

const FLOW_ACTIONS: { id: ActionId; label: string; icon: React.ReactNode; requiresText: boolean; }[] = [
  { id: 'Research', label: 'Web Research', icon: <ResearchIcon />, requiresText: false },
  { id: 'WriteAssist', label: 'Complete Text', icon: <WriteAssistIcon />, requiresText: true },
  { id: 'Paraphrase', label: 'Paraphrase', icon: <ParaphraserIcon />, requiresText: true },
  { id: 'Summarize', label: 'Summarize', icon: <SummarizerIcon />, requiresText: true },
  { id: 'Humanize', label: 'AI Humanizer', icon: <AIHumanizerIcon />, requiresText: true },
  { id: 'Grammar', label: 'Check Grammar', icon: <GrammarCheckerIcon />, requiresText: true },
  { id: 'Analytics', label: 'Analyze Text', icon: <AnalyticsIcon />, requiresText: true },
  { id: 'Detect', label: 'AI Detector', icon: <AIDetectorIcon />, requiresText: true },
  { id: 'Plagiarism', label: 'Plagiarism Check', icon: <PlagiarismCheckerIcon />, requiresText: true },
];

const PARAPHRASE_MODES: ParaphraseMode[] = ['Simpler', 'Balanced', 'Formal', 'Creative', 'Expand', 'Shorten'];
const SUMMARY_FORMATS: SummarizerFormat[] = ['Paragraph', 'Bullet Points'];
const HUMANIZE_TONES: AIHumanizerTone[] = ['Neutral', 'Friendly', 'Professional', 'Confident'];

type FlowStep = {
    action: string;
    result: string;
    timestamp: Date;
}

interface IllbotFlowViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const IllbotFlowView: React.FC<IllbotFlowViewProps> = ({ logActivity }) => {
  const [currentText, setCurrentText] = useState<string>('');
  const [history, setHistory] = useState<FlowStep[]>([]);
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [actionParams, setActionParams] = useState<any>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActionSelect = (actionId: ActionId) => {
    setActiveAction(actionId);
    setError(null);
    // Reset params for the new action
    switch (actionId) {
      case 'Paraphrase':
        setActionParams({ mode: 'Balanced' });
        break;
      case 'Summarize':
        setActionParams({ format: 'Paragraph', wordCount: 100 });
        break;
      case 'Humanize':
        setActionParams({ tone: 'Neutral', level: 50 });
        break;
      case 'Research':
        setActionParams({ query: '' });
        break;
      default:
        setActionParams({});
        break;
    }
  };

  const handleApplyAction = useCallback(async () => {
    if (!activeAction) return;

    setIsLoading(true);
    setError(null);

    try {
        let resultText = '';
        let historyDescription = '';
        const wordCount = currentText.split(/\s+/).filter(Boolean).length;

        switch (activeAction) {
            case 'Paraphrase':
                resultText = await paraphraseText(currentText, actionParams.mode);
                historyDescription = `Paraphrased (${actionParams.mode})`;
                setCurrentText(resultText);
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Summarize':
                resultText = await summarizeText(currentText, actionParams.format, actionParams.wordCount);
                historyDescription = `Summarized (${actionParams.format}, ${actionParams.wordCount} words)`;
                setCurrentText(resultText);
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Grammar':
                resultText = await checkGrammar(currentText);
                historyDescription = 'Checked Grammar';
                 const plainText = resultText.replace(/~~\s*([^~]+?)\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
                setCurrentText(plainText);
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Humanize':
                resultText = await humanizeText(currentText, actionParams.tone, actionParams.level);
                historyDescription = `Humanized (${actionParams.tone}, Level ${actionParams.level})`;
                const humanizedPlainText = resultText.replace(/~~\s*[^~]+?\s*~~/g, '').replace(/\*\*\s*([^~*]+?)\s*\*\*/g, '$1');
                setCurrentText(humanizedPlainText);
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Detect':
                const detectResult = await detectAIText(currentText);
                resultText = `AI Detection Score: ${detectResult.score}%. \nExplanation: ${detectResult.explanation}`;
                historyDescription = `Detected AI Content (${detectResult.score}%)`;
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Plagiarism':
                const plagiarismResult = await checkPlagiarism(currentText);
                resultText = plagiarismResult.length > 0
                    ? `Found ${plagiarismResult.length} potential sources:\n` + plagiarismResult.map(s => `- ${s.title} (${s.uri})`).join('\n')
                    : 'No potential sources found.';
                historyDescription = `Checked for Plagiarism`;
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'WriteAssist':
                const completion = await completeText(currentText);
                resultText = completion;
                historyDescription = `Completed Text`;
                setCurrentText(prev => (prev.trim() ? prev.trim() + '\n\n' : '') + completion);
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Analytics':
                const analyticsResult = await analyzeText(currentText);
                resultText = `Readability: ${analyticsResult.readability}\nTone: ${analyticsResult.tone}\nWord Count: ${analyticsResult.wordCount}`;
                historyDescription = `Analyzed Text`;
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow, wordCount);
                break;
            case 'Research':
                const researchResult = await researchTopic(actionParams.query);
                const sourcesText = researchResult.sources.map(s => `[${s.title || 'Untitled Source'}](${s.uri})`).join('\n');
                resultText = `**Summary for "${actionParams.query}":**\n${researchResult.summary}\n\n**Sources:**\n${sourcesText}`;
                historyDescription = `Researched: "${actionParams.query}"`;
                logActivity(`Flow: ${historyDescription}`, Mode.IllbotFlow);
                break;
        }
        
        setHistory(prev => [...prev, { action: historyDescription, result: resultText, timestamp: new Date() }]);

    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [activeAction, currentText, actionParams, logActivity]);

  const renderActionControls = () => {
    switch (activeAction) {
      case 'Paraphrase':
        return (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-slate-300">Mode</h4>
            <div className="grid grid-cols-2 gap-2">
              {PARAPHRASE_MODES.map(mode => (
                <button key={mode} onClick={() => setActionParams({ mode })} className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${actionParams.mode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
        );
      case 'Summarize':
        const maxWords = Math.max(200, currentText.split(/\s+/).filter(Boolean).length);
        return (
            <div className="flex flex-col gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Format</h4>
                    <div className="flex bg-slate-700 p-1 rounded-lg">
                    {SUMMARY_FORMATS.map(format => (
                        <button key={format} onClick={() => setActionParams(p => ({ ...p, format }))} className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${actionParams.format === format ? 'bg-indigo-600 text-white' : 'hover:bg-slate-600'}`}>
                        {format}
                        </button>
                    ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Length: <span className="text-indigo-300 font-bold">{actionParams.wordCount} words</span></h4>
                    <input type="range" min="20" max={maxWords} value={actionParams.wordCount} onChange={(e) => setActionParams(p => ({ ...p, wordCount: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                </div>
          </div>
        );
      case 'Humanize':
        return (
            <div className="flex flex-col gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Tone</h4>
                    <div className="grid grid-cols-2 gap-2">
                    {HUMANIZE_TONES.map(tone => (
                        <button key={tone} onClick={() => setActionParams(p => ({ ...p, tone }))} className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${actionParams.tone === tone ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {tone}
                        </button>
                    ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Level: <span className="text-indigo-300 font-bold">{actionParams.level || 50}</span></h4>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={actionParams.level || 50}
                        onChange={(e) => setActionParams(p => ({ ...p, level: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        );
      case 'Research':
        return (
          <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Research Query</h4>
              <input
                  type="text"
                  value={actionParams.query || ''}
                  onChange={e => setActionParams({ query: e.target.value })}
                  placeholder="Enter topic to research..."
                  className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
              />
          </div>
        );
      default:
        return <p className="text-sm text-slate-400">This action has no additional settings.</p>;
    }
  };


  return (
    <div className="h-full grid grid-cols-12 gap-6">
      {/* History Panel */}
      <div className="col-span-12 lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex-shrink-0">History</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">Your workflow steps will appear here.</p>
          ) : (
            history.slice().reverse().map((step, index) => (
                <div key={history.length - index} className="bg-slate-700/50 p-2.5 rounded-lg border-l-2 border-indigo-500">
                    <p className="text-sm font-semibold text-slate-200">{history.length - index}. {step.action}</p>
                    <p className="text-xs text-slate-400 mt-1">{step.timestamp.toLocaleTimeString()}</p>
                    {(step.action.startsWith('Analyzed') || step.action.startsWith('Detected') || step.action.startsWith('Checked for Plagiarism') || step.action.startsWith('Researched')) && (
                       <div className="text-xs text-slate-300 mt-2 p-2 bg-slate-800/50 rounded whitespace-pre-wrap font-mono prose prose-invert prose-xs max-w-none"
                         dangerouslySetInnerHTML={{ __html: step.result.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                       ></div>
                    )}
                </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="col-span-12 lg:col-span-6 bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col relative">
        {isLoading && (
            <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-20">
                <Loader />
            </div>
        )}
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Start by typing, pasting text, or using the Research tool..."
          className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none placeholder-slate-500 text-slate-200"
        />
        <div className="flex-shrink-0 flex justify-end items-center p-2 border-t border-slate-700">
            <span className="text-xs text-slate-400">{currentText.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="col-span-12 lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Actions</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {FLOW_ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => handleActionSelect(action.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeAction === action.id ? 'bg-indigo-600/30 ring-2 ring-indigo-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
              disabled={(action.requiresText && !currentText.trim())}
            >
              <div className="w-5 h-5 text-indigo-300 flex-shrink-0">{action.icon}</div>
              <span className="text-sm font-medium text-slate-200">{action.label}</span>
            </button>
          ))}
        </div>
        {activeAction && (
          <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-700">
            {renderActionControls()}
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <button
              onClick={handleApplyAction}
              disabled={isLoading || (FLOW_ACTIONS.find(a => a.id === activeAction)?.requiresText && !currentText.trim()) || (activeAction === 'Research' && !actionParams.query?.trim())}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-base font-semibold bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              Apply Action
            </button>
          </div>
        )}
      </div>
    </div>
  );
};