import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle2, 
  FileSpreadsheet, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { MoodEntry, WeeklyAnalysis, GASConfig } from '../types';

interface WeeklyReportProps {
  weeklyAnalysis: WeeklyAnalysis | null;
  entries: MoodEntry[];
  gasConfig: GASConfig;
  onGenerateWeeklyReport: () => Promise<WeeklyAnalysis>;
  onSyncWeeklyReportToGAS: (report: WeeklyAnalysis) => Promise<boolean>;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  weeklyAnalysis,
  entries,
  gasConfig,
  onGenerateWeeklyReport,
  onSyncWeeklyReportToGAS
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      await onGenerateWeeklyReport();
    } catch (err: any) {
      setErrorMsg("ไม่สามารถสร้างรายงาน AI ได้: " + (err?.message || String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncToGAS = async () => {
    if (!weeklyAnalysis) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setErrorMsg(null);

    try {
      const ok = await onSyncWeeklyReportToGAS(weeklyAnalysis);
      if (ok) {
        setSyncSuccessMsg("บันทึกรายงาน AI รายสัปดาห์ลงแผ่นงาน Google Sheet เรียบร้อยแล้ว!");
      } else {
        setErrorMsg("ไม่สามารถเชื่อมต่อ Google Sheet ได้ ตรวจสอบ URL ในหน้าตั้งค่า GAS");
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการซิงค์: " + (err?.message || String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Weekly Neuro-Psychological Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ศูนย์วิเคราะห์และประมวลผลแนวโน้มสุขภาพจิตรายสัปดาห์
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              ระบบปัญญาประดิษฐ์ Gemini สังเคราะห์ข้อมูลการบันทึกอารมณ์ สัญญาณทางกายภาพ และปัจจัยกระตุ้นในรอบ 7 วัน เพื่อสร้างแผนพัฒนาการเติบโตทางจิตใจ (CBT Experiments)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || entries.length === 0}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังประมวลผล AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>สร้างรายงาน AI สัปดาห์นี้</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {weeklyAnalysis ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Score & Dominant Emotions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Resilience Score Gauge Card */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
              <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>คะแนนความยืดหยุ่นทางจิตใจ (Resilience Index)</span>
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500"
                    strokeDasharray={`${weeklyAnalysis.resilienceIndex}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono text-white">
                    {weeklyAnalysis.resilienceIndex}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {weeklyAnalysis.resilienceIndex >= 70 ? 'เกณฑ์ยืดหยุ่นสูงมาก (High Recovery)' : 'เกณฑ์กำลังฟื้นฟู (Moderate)'}
              </span>
            </div>

            {/* Dominant Emotions & Key Triggers */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  อารมณ์เด่นประจำสัปดาห์ (Dominant Emotions)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {weeklyAnalysis.dominantEmotions?.map((emo, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold shadow-sm"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ปัจจัยกระตุ้นและผลกระทบหลัก (Key Triggers)
                </h3>
                <div className="space-y-2">
                  {weeklyAnalysis.keyTriggers?.map((tr, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-200 font-medium">{tr.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          tr.impact === 'positive' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tr.impact === 'positive' ? 'ด้านบวก' : 'ด้านลบ/แรงกดดัน'}
                        </span>
                        <span className="text-slate-500 font-mono">ความถี่: {tr.frequency}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* AI Executive Summary & Psychological Deep Dive */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">สรุปภาพรวมและบทวิเคราะห์ทางจิตวิทยา</h2>
                <p className="text-xs text-slate-400">ประมวลผลโดยวิเคราะห์สภาวะระบบประสาทอัตโนมัติ (Autonomic Nervous System Context)</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
              <div className="bg-indigo-950/30 p-4 rounded-2xl border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  สรุปภาพรวม AI (Executive Summary):
                </h4>
                <p>{weeklyAnalysis.summaryTh}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  บทวิเคราะห์เชิงลึก (Neuro-Psychological Deep Dive):
                </h4>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {weeklyAnalysis.psychologicalAnalysisTh}
                </p>
              </div>

              {/* Somatic Correlations */}
              <div>
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4" />
                  <span>รูปแบบความสัมพันธ์ทางกายภาพ (Somatic Correlations):</span>
                </h4>
                <ul className="space-y-2">
                  {weeklyAnalysis.somaticCorrelations?.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CBT & ACT Behavioral Experiments */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">ข้อเสนอแนะการทดลองทางพฤติกรรม (CBT & ACT Experiments)</h2>
                <p className="text-xs text-slate-400">ข้อปฏิบัติตามหลักจิตวิทยาพฤติกรรมสำหรับการพัฒนาในสัปดาห์ถัดไป</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {weeklyAnalysis.cbtExperimentsTh?.map((exp, idx) => (
                <div key={idx} className="bg-gradient-to-b from-slate-950 to-slate-900 border border-purple-500/20 rounded-2xl p-4 space-y-2 relative">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {exp}
                  </p>
                </div>
              ))}
            </div>

            {/* Sync Report to Google Sheet Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>เก็บบันทึกรายงาน AI สัปดาห์นี้ลงในชีต 'Weekly_AI_Reports'</span>
              </span>

              <button
                onClick={handleSyncToGAS}
                disabled={isSyncing || !gasConfig.webAppUrl}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกเข้า Sheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>บันทึกรายงานสัปดาห์นี้ลง Google Sheet</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">ยังไม่ได้ประมวลผลรายงานสัปดาห์นี้</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            กดปุ่มสร้างรายงานเพื่อให้ Gemini AI ทำการวิเคราะห์รูปแบบสภาวะอารมณ์และสัญญาณทางกายภาพของคุณตลอดสัปดาห์
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || entries.length === 0}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-current" />
            <span>สร้างรายงาน AI ทันที</span>
          </button>
        </div>
      )}

    </div>
  );
};
