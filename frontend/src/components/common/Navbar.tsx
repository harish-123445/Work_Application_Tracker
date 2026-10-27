import React from 'react';
import { Briefcase, LayoutGrid, Table2, BarChart2, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'board' | 'table' | 'dashboard';
  setActiveTab: (tab: 'board' | 'table' | 'dashboard') => void;
  onOpenNewModal: () => void;
  onSeedData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewModal,
  onSeedData,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Workspace Title */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">Work Tracker</span>
              <span className="ml-2 text-xs text-gray-400 font-normal">v1.0</span>
            </div>
          </div>

          {/* Clean Segmented Tab Control */}
          <nav className="flex items-center space-x-1 border-l border-gray-200 pl-6">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'board'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'table'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSeedData}
            title="Populate demo data"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-gray-400" />
            <span>Sample Data</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-gray-900 hover:bg-black shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </div>
    </header>
  );
};
