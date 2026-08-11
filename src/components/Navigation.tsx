import React from 'react';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  FileSpreadsheet, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { GASConfig } from '../types';

interface NavigationProps {
  activeTab: 'dashboard' | 'logger' | 'weekly' | 'gas_setup' | 'copilot';
  setActiveTab: (tab: 'dashboard' | 'logger' | 'weekly' | 'gas_setup' | 'copilot') => void;
  gasConfig: GASConfig;
  unsyncedCount: number;
  onQuickSync: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  gasConfig,
  unsyncedCount,
  onQuickSync
}) => {
  const isGASConnected = Boolean(gasConfig.webAppUrl && gasConfig.syncStatus === 'success');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  MindSync AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-full">
                  Realtime GAS Sheet
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบบันทึกสุขภาพจิต & วิเคราะห์แนวโน้มเรียลไทม์
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ภาพรวม</span>
            </button>

            <button
              onClick={() => setActiveTab('logger')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'logger'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>จดบันทึกอารมณ์</span>
            </button>

            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>วิเคราะห์รายสัปดาห์</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'copilot'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>MindMirror AI</span>
            </button>

            <button
              onClick={() => setActiveTab('gas_setup')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'gas_setup'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-green-400" />
              <span>Google Sheet Sync</span>
              {unsyncedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
              )}
            </button>
          </nav>

          {/* Right Action / GAS Sync Status Badge */}
          <div className="flex items-center space-x-3">
            {/* GAS Sync Status Button */}
            <div 
              onClick={() => setActiveTab('gas_setup')}
              className="hidden lg:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all text-xs"
            >
              {gasConfig.syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-indigo-300 font-medium">กำลังซิงค์...</span>
                </>
              ) : isGASConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">GAS Connected</span>
                </>
              ) : gasConfig.webAppUrl ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-medium">ยังไม่เปิดการซิงค์</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 font-medium">ตั้งค่า Google Sheet</span>
                </>
              )}

              {unsyncedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  {unsyncedCount} รอดำเนินการ
                </span>
              )}
            </div>

            {/* Quick Check-in Button */}
            <button
              onClick={() => setActiveTab('logger')}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">บันทึกอารมณ์ทันที</span>
              <span className="sm:hidden">บันทึก</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab bar bottom fallback */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800/80 px-2 py-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center text-[10px] font-medium p-1 ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>ภาพรวม</span>
        </button>
        <button
          onClick={() => setActiveTab('logger')}
          className={`flex flex-col items-center text-[10px] font-medium p-1 ${
            activeTab === 'logger' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <PlusCircle className="w-4 h-4 mb-0.5" />
          <span>จดอารมณ์</span>
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex flex-col items-center text-[10px] font-medium p-1 ${
            activeTab === 'weekly' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>รายสัปดาห์</span>
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex flex-col items-center text-[10px] font-medium p-1 ${
            activeTab === 'copilot' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4 mb-0.5" />
          <span>AI Copilot</span>
        </button>
        <button
          onClick={() => setActiveTab('gas_setup')}
          className={`flex flex-col items-center text-[10px] font-medium p-1 relative ${
            activeTab === 'gas_setup' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>Sheet Sync</span>
          {unsyncedCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-2" />
          )}
        </button>
      </div>
    </header>
  );
};
