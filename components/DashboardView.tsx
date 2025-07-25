import React, { useState } from 'react';
import { Mode, AppStats, ActivityLog } from '../types';
import { 
    ParaphraserIcon, 
    GrammarCheckerIcon, 
    SummarizerIcon, 
    AIChatIcon,
    IllbotIcon,
    ContentWriterIcon,
    AIHumanizerIcon,
    TranslateIcon,
    AIDetectorIcon,
    PlagiarismCheckerIcon,
    EssayGraderIcon,
    PracticeQuestionsIcon,
    FlashcardGeneratorIcon,
    CitationGeneratorIcon,
    IllbotFlowIcon,
    ResearchIcon
} from '../constants';
import { TrashIcon } from './ViewIcons';

interface DashboardViewProps {
  setMode: (mode: Mode) => void;
  stats: AppStats;
  activityLog: ActivityLog[];
  clearActivity: () => void;
}

const WordsProcessedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const ToolsUsedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const TasksCompletedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;

const writingTips = [
    "Use active voice to make your writing stronger and more direct.",
    "Vary your sentence structure to keep your readers engaged.",
    "Try the 'Expand' mode in the Paraphraser to add more detail to your ideas.",
    "Use the 'AI Humanizer' to make robotic text sound more natural."
];

const quickActions = [
    { label: Mode.Paraphraser, icon: <ParaphraserIcon /> },
    { label: Mode.Summarizer, icon: <SummarizerIcon /> },
    { label: Mode.ContentWriter, icon: <ContentWriterIcon /> },
    { label: Mode.GrammarChecker, icon: <GrammarCheckerIcon /> },
    { label: Mode.AIHumanizer, icon: <AIHumanizerIcon /> },
    { label: Mode.Translate, icon: <TranslateIcon /> },
    { label: Mode.AIDetector, icon: <AIDetectorIcon /> },
    { label: Mode.PlagiarismChecker, icon: <PlagiarismCheckerIcon /> },
    { label: Mode.Researcher, icon: <ResearchIcon /> },
    { label: Mode.EssayGrader, icon: <EssayGraderIcon /> },
    { label: Mode.PracticeQuestions, icon: <PracticeQuestionsIcon /> },
    { label: Mode.FlashcardGenerator, icon: <FlashcardGeneratorIcon /> },
    { label: Mode.CitationGenerator, icon: <CitationGeneratorIcon /> },
    { label: Mode.AIChat, icon: <AIChatIcon /> },
    { label: Mode.IllbotFlow, icon: <IllbotFlowIcon /> },
];

const Widget: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

export const DashboardView: React.FC<DashboardViewProps> = ({ setMode, stats, activityLog, clearActivity }) => {
    const [tip] = useState(writingTips[Math.floor(Math.random() * writingTips.length)]);

    return (
        <div className="h-full overflow-y-auto space-y-6 animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex items-center gap-4">
                <IllbotIcon className="w-12 h-12 text-indigo-400" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Your Command Center</h1>
                    <p className="text-slate-400">An overview of your writing activity and tools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Widget className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-300"><WordsProcessedIcon /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Words Processed</p>
                        <p className="text-2xl font-bold text-slate-100">{stats.wordsProcessed.toLocaleString()}</p>
                    </div>
                </Widget>
                <Widget className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-300"><ToolsUsedIcon /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Tools Used</p>
                        <p className="text-2xl font-bold text-slate-100">{stats.toolsUsed}</p>
                    </div>
                </Widget>
                <Widget className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-300"><TasksCompletedIcon /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Tasks Completed</p>
                        <p className="text-2xl font-bold text-slate-100">{stats.tasksCompleted}</p>
                    </div>
                </Widget>
                
                <Widget className="flex items-center gap-4">
                     <div className="p-3 bg-yellow-600/20 rounded-lg text-yellow-300"><TipIcon /></div>
                    <div>
                        <p className="text-slate-400 text-sm">Pro Tip</p>
                        <p className="text-sm font-medium text-slate-200">{tip}</p>
                    </div>
                </Widget>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Widget className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                        {quickActions.map(({ label, icon }) => (
                            <button key={label} onClick={() => setMode(label)} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group">
                                <div className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors">{icon}</div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </Widget>

                <Widget>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-200">Recent Activity</h2>
                        <button
                            onClick={clearActivity}
                            disabled={activityLog.length === 0}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                            title="Clear history"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                    {activityLog.length > 0 ? (
                        <ul className="space-y-1">
                            {activityLog.map((activity, index) => (
                                <li key={index}>
                                    <button onClick={() => setMode(activity.mode)} className="w-full text-left flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-700/70 transition-colors">
                                        <span className="text-sm text-slate-300">{activity.action}</span>
                                        <span className="text-xs text-slate-500">{formatTimeAgo(activity.timestamp)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500 text-center mt-8">No activity yet. Use a tool to get started!</p>
                    )}
                </Widget>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
