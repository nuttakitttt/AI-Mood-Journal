import React, { useState, useEffect } from 'react';
import { 
  MoodEntry, 
  WeeklyAnalysis, 
  GASConfig, 
  SyncLogItem 
} from './types';
import { 
  INITIAL_MOOD_ENTRIES, 
  INITIAL_WEEKLY_ANALYSIS 
} from './data/initialData';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MoodLogger } from './components/MoodLogger';
import { WeeklyReport } from './components/WeeklyReport';
import { GASSyncSetup } from './components/GASSyncSetup';
import { AICopilot } from './components/AICopilot';

export default function App() {
  // 1. Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logger' | 'weekly' | 'gas_setup' | 'copilot'>('dashboard');

  // 2. Entries State with localStorage persistence
  const [entries, setEntries] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('mindsync_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MOOD_ENTRIES;
  });

  // 3. Weekly Analysis State
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyAnalysis | null>(() => {
    const saved = localStorage.getItem('mindsync_weekly_analysis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_WEEKLY_ANALYSIS;
  });

  // 4. Google Apps Script Config State
  const [gasConfig, setGasConfig] = useState<GASConfig>(() => {
    const saved = localStorage.getItem('mindsync_gas_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      webAppUrl: '',
      sheetName: 'Mood_Logs',
      autoSync: true,
      syncStatus: 'idle'
    };
  });

  // 5. Sync Event Logs State
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(() => {
    const saved = localStorage.getItem('mindsync_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'log-001',
        timestamp: new Date().toISOString(),
        type: 'test_ping',
        status: 'success',
        message: 'MindSync AI Engine initialized.'
      }
    ];
  });

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('mindsync_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (weeklyAnalysis) {
      localStorage.setItem('mindsync_weekly_analysis', JSON.stringify(weeklyAnalysis));
    }
  }, [weeklyAnalysis]);

  useEffect(() => {
    localStorage.setItem('mindsync_gas_config', JSON.stringify(gasConfig));
  }, [gasConfig]);

  useEffect(() => {
    localStorage.setItem('mindsync_logs', JSON.stringify(syncLogs));
  }, [syncLogs]);

  const addSyncLog = (type: SyncLogItem['type'], status: 'success' | 'error', message: string) => {
    const newLog: SyncLogItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      type,
      status,
      message
    };
    setSyncLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Ping GAS Web App
  const handlePingGAS = async (): Promise<boolean> => {
    if (!gasConfig.webAppUrl) return false;

    setGasConfig(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      const res = await fetch('/api/sync/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: gasConfig.webAppUrl,
          payload: { action: 'ping' }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setGasConfig(prev => ({
          ...prev,
          syncStatus: 'success',
          lastSyncTime: new Date().toISOString(),
          errorMessage: undefined
        }));
        addSyncLog('test_ping', 'success', `Connected to GAS: ${data.spreadsheetName || 'Sheet'}`);
        return true;
      } else {
        setGasConfig(prev => ({
          ...prev,
          syncStatus: 'error',
          errorMessage: data.message || 'Ping failed'
        }));
        addSyncLog('test_ping', 'error', data.message || 'GAS Ping returned error status');
        return false;
      }
    } catch (err: any) {
      setGasConfig(prev => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: err?.message || String(err)
      }));
      addSyncLog('test_ping', 'error', err?.message || 'Network error pinging GAS');
      return false;
    }
  };

  // Save Entry with AI Micro Insight & Realtime GAS Sync
  const handleSaveEntry = async (newEntryData: Omit<MoodEntry, 'id' | 'timestamp' | 'syncedToGAS'>): Promise<MoodEntry> => {
    const entryId = 'entry-' + Date.now();
    const timestamp = new Date().toISOString();

    // 1. Call Gemini API for Daily Micro-Insight
    let aiDailyInsight = '';
    try {
      const res = await fetch('/api/gemini/daily-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: newEntryData })
      });
      const data = await res.json();
      aiDailyInsight = data.insight || '';
    } catch (e) {
      console.error("AI Insight failed:", e);
    }

    // 2. Build full MoodEntry
    let entry: MoodEntry = {
      ...newEntryData,
      id: entryId,
      timestamp,
      aiDailyInsight,
      syncedToGAS: false
    };

    // 3. Realtime Sync to Google Sheet if GAS URL is configured
    if (gasConfig.webAppUrl) {
      setGasConfig(prev => ({ ...prev, syncStatus: 'syncing' }));
      try {
        const res = await fetch('/api/sync/gas-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webAppUrl: gasConfig.webAppUrl,
            payload: {
              action: 'save_entry',
              entry
            }
          })
        });

        const data = await res.json();
        if (data.status === 'success') {
          entry.syncedToGAS = true;
          entry.syncedAt = new Date().toISOString();
          setGasConfig(prev => ({
            ...prev,
            syncStatus: 'success',
            lastSyncTime: new Date().toISOString()
          }));
          addSyncLog('export_mood', 'success', `Synced entry [${entry.primaryEmotion}] to Google Sheet`);
        } else {
          addSyncLog('export_mood', 'error', `GAS sync failed: ${data.message}`);
        }
      } catch (err: any) {
        addSyncLog('export_mood', 'error', `Failed sending entry to GAS: ${err?.message || String(err)}`);
      }
    }

    setEntries(prev => [...prev, entry]);
    return entry;
  };

  // Sync a single entry on demand
  const handleSyncSingleEntry = async (entry: MoodEntry) => {
    if (!gasConfig.webAppUrl) {
      setActiveTab('gas_setup');
      return;
    }

    try {
      const res = await fetch('/api/sync/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: gasConfig.webAppUrl,
          payload: { action: 'save_entry', entry }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, syncedToGAS: true, syncedAt: new Date().toISOString() } : e));
        addSyncLog('export_mood', 'success', `Synced single entry [${entry.primaryEmotion}]`);
      }
    } catch (err: any) {
      addSyncLog('export_mood', 'error', `Single sync failed: ${err?.message || String(err)}`);
    }
  };

  // Sync Batch (All Unsynced Entries)
  const handleBatchSync = async () => {
    if (!gasConfig.webAppUrl) return;
    const unsynced = entries.filter(e => !e.syncedToGAS);
    if (unsynced.length === 0) return;

    setGasConfig(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      const res = await fetch('/api/sync/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: gasConfig.webAppUrl,
          payload: {
            action: 'sync_batch',
            entries: unsynced
          }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        const now = new Date().toISOString();
        setEntries(prev => prev.map(e => ({ ...e, syncedToGAS: true, syncedAt: now })));
        setGasConfig(prev => ({
          ...prev,
          syncStatus: 'success',
          lastSyncTime: now
        }));
        addSyncLog('sync_batch', 'success', `Synced ${unsynced.length} entries in batch to Google Sheet`);
      } else {
        addSyncLog('sync_batch', 'error', data.message || 'Batch sync failed');
      }
    } catch (err: any) {
      addSyncLog('sync_batch', 'error', err?.message || 'Error during batch sync');
    }
  };

  // Sync Weekly Report to Google Sheet
  const handleSyncWeeklyReportToGAS = async (report: WeeklyAnalysis): Promise<boolean> => {
    if (!gasConfig.webAppUrl) return false;

    try {
      const res = await fetch('/api/sync/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: gasConfig.webAppUrl,
          payload: {
            action: 'save_weekly_report',
            report
          }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        addSyncLog('weekly_report', 'success', `Saved Weekly AI Report to GAS sheet 'Weekly_AI_Reports'`);
        return true;
      } else {
        addSyncLog('weekly_report', 'error', data.message || 'Weekly report sync failed');
        return false;
      }
    } catch (err: any) {
      addSyncLog('weekly_report', 'error', err?.message || 'Failed sending weekly report');
      return false;
    }
  };

  // Generate Weekly AI Report with Gemini API
  const handleGenerateWeeklyReport = async (): Promise<WeeklyAnalysis> => {
    const weekStartDate = entries.length > 0 ? entries[0].date : new Date().toISOString().split('T')[0];
    const weekEndDate = entries.length > 0 ? entries[entries.length - 1].date : new Date().toISOString().split('T')[0];

    const res = await fetch('/api/gemini/weekly-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries,
        weekStartDate,
        weekEndDate
      })
    });

    const report: WeeklyAnalysis = await res.json();
    setWeeklyAnalysis(report);
    return report;
  };

  // Fetch Existing Entries from Google Sheet
  const handleFetchFromGAS = async (): Promise<MoodEntry[]> => {
    if (!gasConfig.webAppUrl) return [];

    try {
      const fetchUrl = `${gasConfig.webAppUrl}?action=fetch_logs`;
      const res = await fetch('/api/sync/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: fetchUrl,
          payload: { action: 'fetch_logs' }
        })
      });

      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.entries)) {
        addSyncLog('export_mood', 'success', `Fetched ${data.entries.length} entries from Google Sheet`);
        return data.entries;
      }
      return [];
    } catch (e: any) {
      addSyncLog('export_mood', 'error', `Fetch error: ${e?.message || String(e)}`);
      return [];
    }
  };

  const unsyncedCount = entries.filter(e => !e.syncedToGAS).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gasConfig={gasConfig}
        unsyncedCount={unsyncedCount}
        onQuickSync={handleBatchSync}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            entries={entries}
            weeklyAnalysis={weeklyAnalysis}
            gasConfig={gasConfig}
            onNavigateToLogger={() => setActiveTab('logger')}
            onNavigateToWeekly={() => setActiveTab('weekly')}
            onNavigateToSetup={() => setActiveTab('gas_setup')}
            onSyncSingleEntry={handleSyncSingleEntry}
          />
        )}

        {activeTab === 'logger' && (
          <MoodLogger
            onSaveEntry={handleSaveEntry}
            gasConfig={gasConfig}
            onNavigateToSetup={() => setActiveTab('gas_setup')}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReport
            weeklyAnalysis={weeklyAnalysis}
            entries={entries}
            gasConfig={gasConfig}
            onGenerateWeeklyReport={handleGenerateWeeklyReport}
            onSyncWeeklyReportToGAS={handleSyncWeeklyReportToGAS}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilot moodEntries={entries} />
        )}

        {activeTab === 'gas_setup' && (
          <GASSyncSetup
            gasConfig={gasConfig}
            setGasConfig={setGasConfig}
            syncLogs={syncLogs}
            unsyncedCount={unsyncedCount}
            onPingGAS={handlePingGAS}
            onBatchSync={handleBatchSync}
            onFetchFromGAS={handleFetchFromGAS}
          />
        )}
      </main>
    </div>
  );
}
