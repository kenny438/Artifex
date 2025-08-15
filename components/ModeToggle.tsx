
import React from 'react';
import { AppMode } from '../types';
import { WorkflowIcon, LayoutIcon } from './Icons';

interface ModeToggleProps {
  mode: AppMode;
  onToggle: (mode: AppMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="absolute top-4 right-4 z-50 bg-white/50 backdrop-blur-sm p-1 rounded-full flex items-center space-x-1 shadow-md shadow-slate-300/20 border border-slate-200/50">
      <button
        onClick={() => onToggle('flow')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
          mode === 'flow' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
        }`}
        aria-pressed={mode === 'flow'}
      >
        <WorkflowIcon className="w-5 h-5" />
        <span>Flow</span>
      </button>
      <button
        onClick={() => onToggle('design')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
          mode === 'design' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
        }`}
        aria-pressed={mode === 'design'}
      >
        <LayoutIcon className="w-5 h-5" />
        <span>Design</span>
      </button>
    </div>
  );
};

export default ModeToggle;