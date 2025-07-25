import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ParaphraserView } from './components/ParaphraserView';
import { SummarizerView } from './components/SummarizerView';
import { GrammarCheckerView } from './components/GrammarCheckerView';
import { AIDetectorView } from './components/AIDetectorView';
import { PlagiarismCheckerView } from './components/PlagiarismCheckerView';
import { AIHumanizerView } from './components/AIHumanizerView';
import { AIChatView } from './components/AIChatView';
import { TranslateView } from './components/TranslateView';
import { CitationGeneratorView } from './components/CitationGeneratorView';
import { FlowContainerView } from './components/FlowContainerView';
import { PracticeQuestionsView } from './components/PracticeQuestionsView';
import { EssayGraderView } from './components/EssayGraderView';
import { ContentWriterView } from './components/ContentWriterView';
import { FlashcardGeneratorView } from './components/FlashcardGeneratorView';
import { DashboardView } from './components/DashboardView';
import { ResearcherView } from './components/ResearcherView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Loader } from './components/Loader';

import { Mode, AppStats, ActivityLog } from './types';
import { IllbotIcon } from './constants';
import { initializeAiClient } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AppStats>({ wordsProcessed: 0, tasksCompleted: 0, toolsUsed: 0 });

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('geminiApiKey');
    if (key && initializeAiClient(key)) {
      setApiKey(key);
    } else {
      localStorage.removeItem('geminiApiKey'); // Clear bad key if it exists
      setIsApiModalOpen(true);
    }
    setIsInitialized(true);
  }, []);

  const handleSaveKey = async (key: string): Promise<boolean> => {
    if (initializeAiClient(key)) {
      localStorage.setItem('geminiApiKey', key);
      setApiKey(key);
      setIsApiModalOpen(false);
      return true;
    }
    return false;
  };

  const handleClearKey = () => {
    localStorage.removeItem('geminiApiKey');
    setApiKey(null);
    initializeAiClient(''); // De-initialize the client
    setIsApiModalOpen(true);
  };

  const logActivity = useCallback((action: string, mode: Mode, wordCount: number = 0) => {
    const newLog: ActivityLog = { action, mode, timestamp: new Date() };
    setActivityLog(prevLog => [newLog, ...prevLog].slice(0, 10));
    setStats(prevStats => {
        const updatedTools = new Set(activityLog.map(item => item.mode));
        updatedTools.add(mode);
        return {
            wordsProcessed: prevStats.wordsProcessed + wordCount,
            tasksCompleted: prevStats.tasksCompleted + 1,
            toolsUsed: updatedTools.size,
        };
    });
  }, [activityLog]);

  const clearActivity = useCallback(() => {
    setActivityLog([]);
    setStats({ wordsProcessed: 0, tasksCompleted: 0, toolsUsed: 0 });
  }, []);


  const renderView = () => {
    switch (mode) {
      case Mode.Dashboard:
        return <DashboardView setMode={setMode} stats={stats} activityLog={activityLog} clearActivity={clearActivity} />;
      case Mode.Paraphraser:
        return <ParaphraserView logActivity={logActivity} />;
      case Mode.GrammarChecker:
        return <GrammarCheckerView logActivity={logActivity} />;
      case Mode.AIDetector:
        return <AIDetectorView logActivity={logActivity} />;
      case Mode.PlagiarismChecker:
        return <PlagiarismCheckerView logActivity={logActivity} />;
      case Mode.AIHumanizer:
        return <AIHumanizerView logActivity={logActivity} />;
      case Mode.AIChat:
        return <AIChatView logActivity={logActivity} />;
      case Mode.Translate:
        return <TranslateView logActivity={logActivity} />;
      case Mode.Summarizer:
        return <SummarizerView logActivity={logActivity} />;
      case Mode.CitationGenerator:
        return <CitationGeneratorView logActivity={logActivity} />;
      case Mode.IllbotFlow:
        return <FlowContainerView logActivity={logActivity}/>;
      case Mode.PracticeQuestions:
        return <PracticeQuestionsView logActivity={logActivity} />;
      case Mode.EssayGrader:
        return <EssayGraderView logActivity={logActivity} />;
      case Mode.ContentWriter:
        return <ContentWriterView logActivity={logActivity} />;
      case Mode.FlashcardGenerator:
        return <FlashcardGeneratorView logActivity={logActivity} />;
      case Mode.Researcher:
        return <ResearcherView logActivity={logActivity} />;
      default:
        return <DashboardView setMode={setMode} stats={stats} activityLog={activityLog} clearActivity={clearActivity} />;
    }
  };

  if (!isInitialized) {
      return (
          <div className="flex h-screen w-full bg-[#020617] items-center justify-center">
              <Loader />
          </div>
      );
  }

  return (
    <>
      {isApiModalOpen && <ApiKeyModal 
          onSave={handleSaveKey} 
          onClose={() => { if(apiKey) setIsApiModalOpen(false); }}
          currentKey={apiKey}
          onClear={handleClearKey}
       />}
      <div className={`flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden transition-all duration-300 ${isApiModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <Sidebar 
          currentMode={mode} 
          setMode={setMode} 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onSettingsClick={() => setIsApiModalOpen(true)}
        />
        <main className="relative flex-1 flex flex-col h-full bg-[#0f172a]">
          <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          
          <header className="flex-shrink-0 flex items-center justify-between p-4 px-8 border-b border-slate-700/50 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-white"><IllbotIcon /></div>
              <h1 className="text-lg font-semibold text-slate-100">ILLBOT <span className="text-xs text-indigo-400 font-mono">v2.0</span></h1>
            </div>
          </header>

          <div className="relative flex-1 p-4 md:p-8 overflow-y-auto">
            {renderView()}
          </div>

          <footer className="flex-shrink-0 flex items-center justify-center text-xs text-slate-500 p-4 px-8 border-t border-slate-700/50 z-10">
            <p>Advanced AI Writing Assistant</p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default App;
