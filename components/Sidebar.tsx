
import React from 'react';
import { Mode } from '../types';
import {
  DashboardIcon,
  ParaphraserIcon,
  SummarizerIcon,
  GrammarCheckerIcon,
  AIDetectorIcon,
  PlagiarismCheckerIcon,
  AIHumanizerIcon,
  AIChatIcon,
  TranslateIcon,
  CitationGeneratorIcon,
  IllbotFlowIcon,
  PracticeQuestionsIcon,
  EssayGraderIcon,
  ContentWriterIcon,
  FlashcardGeneratorIcon,
  IllbotIcon,
  ResearchIcon,
  SettingsIcon
} from '../constants';

interface SidebarProps {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onSettingsClick: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: Mode;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isSidebarOpen, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full h-12 gap-3 px-3 rounded-lg transition-all duration-200 ease-in-out
      ${
        isActive
          ? 'bg-indigo-600/30 text-indigo-200 font-semibold'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }
      ${isSidebarOpen ? 'justify-start' : 'justify-center'}
      `}
    aria-label={`Switch to ${label} mode`}
    title={label}
  >
    <div className="w-6 h-6 flex-shrink-0">{icon}</div>
    {isSidebarOpen && <span className="text-sm truncate">{label}</span>}
  </button>
);

const ToggleIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
    )}
  </svg>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, isSidebarOpen, setIsSidebarOpen, onSettingsClick }) => {
  const navItems = [
    { mode: Mode.Dashboard, icon: <DashboardIcon /> },
    // Writing Aids
    { mode: Mode.Paraphraser, icon: <ParaphraserIcon /> },
    { mode: Mode.Summarizer, icon: <SummarizerIcon /> },
    { mode: Mode.ContentWriter, icon: <ContentWriterIcon /> },
    { mode: Mode.GrammarChecker, icon: <GrammarCheckerIcon /> },
    { mode: Mode.AIHumanizer, icon: <AIHumanizerIcon /> },
    { mode: Mode.Translate, icon: <TranslateIcon /> },
    // Verification Aids
    { mode: Mode.AIDetector, icon: <AIDetectorIcon /> },
    { mode: Mode.PlagiarismChecker, icon: <PlagiarismCheckerIcon /> },
    // Study Aids
    { mode: Mode.Researcher, icon: <ResearchIcon /> },
    { mode: Mode.EssayGrader, icon: <EssayGraderIcon /> },
    { mode: Mode.PracticeQuestions, icon: <PracticeQuestionsIcon /> },
    { mode: Mode.FlashcardGenerator, icon: <FlashcardGeneratorIcon /> },
    // Utilities
    { mode: Mode.CitationGenerator, icon: <CitationGeneratorIcon /> },
    { mode: Mode.AIChat, icon: <AIChatIcon /> },
    { mode: Mode.IllbotFlow, icon: <IllbotFlowIcon /> },
  ];

  return (
    <aside className={`flex-shrink-0 bg-[#020617] p-2 flex flex-col gap-4 border-r border-slate-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-60' : 'w-20'}`}>
       <div className={`flex-shrink-0 flex items-center gap-3 px-2 h-14 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <IllbotIcon className="w-8 h-8 text-indigo-400 flex-shrink-0"/>
            {isSidebarOpen && <h1 className="text-xl font-bold text-slate-100 tracking-wider">ILLBOT</h1>}
        </div>
      <nav className="flex-1 flex flex-col gap-2 mt-2 overflow-y-auto">
        {navItems.map(({ mode, icon }) => (
          <NavItem
            key={mode}
            label={mode}
            icon={icon}
            isActive={currentMode === mode}
            isSidebarOpen={isSidebarOpen}
            onClick={() => setMode(mode)}
          />
        ))}
      </nav>
       <div className="flex-shrink-0 mt-auto flex flex-col gap-1">
          <button 
            onClick={onSettingsClick}
            className={`flex items-center w-full h-12 gap-3 px-3 rounded-lg transition-all duration-200 ease-in-out text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 ${!isSidebarOpen && 'justify-center'}`}
            title="Settings"
          >
              <div className="w-6 h-6 flex-shrink-0"><SettingsIcon /></div>
              {isSidebarOpen && <span className="text-sm truncate">Settings</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center w-full h-12 gap-3 px-3 rounded-lg transition-all duration-200 ease-in-out text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 ${!isSidebarOpen && 'justify-center'}`}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
              <div className="w-6 h-6 flex-shrink-0"><ToggleIcon open={isSidebarOpen} /></div>
              {isSidebarOpen && <span className="text-sm truncate">Collapse</span>}
          </button>
      </div>
    </aside>
  );
};
