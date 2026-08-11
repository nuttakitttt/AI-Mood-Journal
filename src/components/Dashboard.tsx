import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  Sparkles, 
  FileSpreadsheet, 
  PlusCircle, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Moon
} from 'lucide-react';
import { MoodEntry, WeeklyAnalysis, GASConfig } from '../types';
import { SOMATIC_SENSATIONS_LIST, TRIGGERS_LIST } from '../data/initialData';

interface DashboardProps {
  entries: MoodEntry[];
  weeklyAnalysis: WeeklyAnalysis | null;
  gasConfig: GASConfig;
  onNavigateToLogger: () => void;
  onNavigateToWeekly: () => void;
  onNavigateToSetup: () => void;
  onSyncSingleEntry: (entry: MoodEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  entries,
  weeklyAnalysis,
  gasConfig,
  onNavigateToLogger,
  onNavigateToWeekly,
  onNavigateToSetup,
  onSyncSingleEntry
}) => {
  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const unsyncedCount = entries.filter(e => !e.syncedToGAS).length;

  // Prepare chart data for 7-Day Valence Flow
  const trendData = entries.slice(-10).map(e => ({
    timeLabel: `${e.date.substring(5)} ${e.time}`,
    valence: e.valence,
    arousal: e.arousal,
    sleep: e.sleepHours,
    emotion: e.primaryEmotion
  }));

  // Calculate Somatic Frequency
  const somaticCounts: Record<string, number> = {};
  entries.forEach(e => {
    e.somaticSensations?.forEach(s => {
      somaticCounts[s] = (somaticCounts[s] || 0) + 1;
    });
  });

  const somaticChartData = Object.entries(somaticCounts)
    .map(([id, count]) => {
      const item = SOMATIC_SENSATIONS_LIST.find(s => s.id === id);
      return {
        name: item ? item.labelTh : id,
        count,
        affinity: item?.valenceAffinity || 'neutral'
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              แผงควบคุมสภาวะสุขภาพจิต (MindPulse Analytics)
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ข้อมูลอารมณ์ล่าสุด ซิงค์อัตโนมัติกับ Google Sheet และประมวลผลด้วย Gemini AI
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToLogger}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ บันทึกอารมณ์</span>
          </button>

          <button
            onClick={onNavigateToWeekly}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>วิเคราะห์รายสัปดาห์</span>
          </button>

          <button
            onClick={onNavigateToSetup}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Google Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Current Emotion State */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>อารมณ์ล่าสุด</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {latestEntry ? latestEntry.primaryEmotion : 'ยังไม่มีบันทึก'}
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
              (latestEntry?.valence || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              Valence: {latestEntry?.valence}
            </span>
            <span className="text-slate-500">
              {latestEntry ? `${latestEntry.date} ${latestEntry.time}` : '-'}
            </span>
          </div>
        </div>

        {/* Card 2: Resilience Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>ดัชนีฟื้นตัว (Resilience Index)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-indigo-400 font-mono">
              {weeklyAnalysis ? weeklyAnalysis.resilienceIndex : 75}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            {weeklyAnalysis ? weeklyAnalysis.summaryTh : 'สภาวะจิตใจมีความยืดหยุ่นในเกณฑ์ดี'}
          </p>
        </div>

        {/* Card 3: Avg Sleep & Energy */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>การนอน & พลังงานกาย</span>
            <Moon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {latestEntry ? `${latestEntry.sleepHours} ชม.` : '-'}
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>พลังงานกาย: {latestEntry ? `${latestEntry.energyLevel}/10` : '-'}</span>
          </div>
        </div>

        {/* Card 4: Google Sheet Realtime Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden cursor-pointer hover:border-slate-700 transition-colors" onClick={onNavigateToSetup}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>สถานะ Google Sheet</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
            {gasConfig.webAppUrl ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>ซิงค์เรียลไทม์</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300">ยังไม่ได้ตั้งค่า</span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>บันทึกทั้งหมด: {entries.length}</span>
            {unsyncedCount > 0 && (
              <span className="text-amber-400 font-medium">รอดำเนินการ {unsyncedCount}</span>
            )}
          </div>
        </div>

      </div>

      {/* Charts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart: Valence & Arousal 7-Day Trend */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>กราฟแนวโน้มระดับอารมณ์และพลังงาน (Valence Flow)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                เปรียบเทียบระดับอารมณ์ (-5 ถึง +5) และระดับพลังงานในแต่ละช่วงเวลา
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center space-x-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Valence (อารมณ์)</span>
              </span>
              <span className="flex items-center space-x-1 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Arousal (พลังงาน)</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="valenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="arousalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[-5, 5]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="valence" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#valenceGrad)" name="Valence" />
                <Area type="monotone" dataKey="arousal" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#arousalGrad)" name="Arousal" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Somatic Frequency Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <span>ความถี่สภาวะทางกาย (Somatic)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 สัญญาณทางกายภาพที่ปรากฏบ่อยที่สุด
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            {somaticChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={somaticChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {somaticChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.affinity === 'positive' ? '#10b981' : entry.affinity === 'negative' ? '#f43f5e' : '#6366f1'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                ยังไม่มีข้อมูลสัญญาณทางกายภาพ
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Entries & AI Micro Insights List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>ประวัติการจดบันทึกอารมณ์ล่าสุด</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              แสดงรายการบันทึกอารมณ์ สัญญาณทางกายภาพ และคำแนะนำ AI Micro-Insight รายวัน
            </p>
          </div>

          <button
            onClick={onNavigateToLogger}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>+ เพิ่มบันทึกใหม่</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {entries.slice().reverse().map((entry) => {
            const isPositive = entry.valence >= 0;
            return (
              <div 
                key={entry.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 transition-all"
              >
                {/* Header line of item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      isPositive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {entry.primaryEmotion}
                    </span>
                    {entry.secondaryEmotion && (
                      <span className="text-xs text-slate-400">({entry.secondaryEmotion})</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="font-mono">{entry.date} {entry.time}</span>
                    
                    {/* Sync Status Badge */}
                    {entry.syncedToGAS ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Synced Sheet</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onSyncSingleEntry(entry)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-medium border border-amber-500/30 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>กดซิงค์ลง Sheet</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">สัญญาณทางกาย (Somatic):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.somaticSensations && entry.somaticSensations.length > 0 ? (
                        entry.somaticSensations.map(sId => {
                          const item = SOMATIC_SENSATIONS_LIST.find(s => s.id === sId);
                          return (
                            <span key={sId} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                              {item ? item.labelTh : sId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">ปัจจัยกระตุ้น (Triggers):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.triggers && entry.triggers.length > 0 ? (
                        entry.triggers.map(tId => {
                          const item = TRIGGERS_LIST.find(t => t.id === tId);
                          return (
                            <span key={tId} className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[11px]">
                              {item ? item.labelTh : tId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thought Note */}
                {entry.note && (
                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    "{entry.note}"
                  </p>
                )}

                {/* AI Daily Insight */}
                {entry.aiDailyInsight && (
                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      <strong className="text-indigo-300 font-semibold mr-1">AI Insight:</strong>
                      {entry.aiDailyInsight}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
