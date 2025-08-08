
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
import { LandingView } from './components/LandingView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { initializeAi, clearAi, isAiInitialized } from './services/geminiService';

import { Mode, AppStats, ActivityLog } from './types';
import { IllbotIcon } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AppStats>({ wordsProcessed: 0, tasksCompleted: 0, toolsUsed: 0 });

  const [showLanding, setShowLanding] = useState(true);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
        initializeAi(storedKey).then(success => {
            if (success) {
                setApiKey(storedKey);
                setIsApiKeySet(true);
            } else {
                localStorage.removeItem('geminiApiKey');
            }
        });
    }
  }, []);


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

  const handleEnter = () => {
    setShowLanding(false);
    if (!isAiInitialized()) {
        setIsApiKeyModalOpen(true);
    }
  };

  const handleSaveApiKey = useCallback(async (key: string) => {
    const success = await initializeAi(key);
    if (success) {
        localStorage.setItem('geminiApiKey', key);
        setApiKey(key);
        setIsApiKeySet(true);
        setIsApiKeyModalOpen(false);
    }
    return success;
  }, []);

  const handleClearApiKey = useCallback(() => {
    localStorage.removeItem('geminiApiKey');
    clearAi();
    setApiKey(null);
    setIsApiKeySet(false);
    setIsApiKeyModalOpen(true);
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

  if (showLanding) {
    return <LandingView onEnter={handleEnter} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden transition-all duration-300">
       {isApiKeyModalOpen && (
            <ApiKeyModal
                onSave={handleSaveApiKey}
                onClose={() => isApiKeySet && setIsApiKeyModalOpen(false)}
                currentKey={apiKey}
                onClear={handleClearApiKey}
            />
        )}
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
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
  );
};

export default App;
