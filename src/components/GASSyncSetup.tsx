import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Link, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Code, 
  HelpCircle,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';
import { GASConfig, SyncLogItem, MoodEntry } from '../types';
import { generateGoogleAppsScriptCode } from '../lib/gasScriptGenerator';

interface GASSyncSetupProps {
  gasConfig: GASConfig;
  setGasConfig: React.Dispatch<React.SetStateAction<GASConfig>>;
  syncLogs: SyncLogItem[];
  unsyncedCount: number;
  onPingGAS: () => Promise<boolean>;
  onBatchSync: () => Promise<void>;
  onFetchFromGAS: () => Promise<MoodEntry[]>;
}

export const GASSyncSetup: React.FC<GASSyncSetupProps> = ({
  gasConfig,
  setGasConfig,
  syncLogs,
  unsyncedCount,
  onPingGAS,
  onBatchSync,
  onFetchFromGAS
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncingBatch, setIsSyncingBatch] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const gasCode = generateGoogleAppsScriptCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onPingGAS();
      if (ok) {
        setTestResult({
          success: true,
          msg: "เชื่อมต่อกับ Google Apps Script Web App สำเร็จแล้ว!"
        });
      } else {
        setTestResult({
          success: false,
          msg: "ไม่สามารถเชื่อมต่อได้ ตรวจสอบว่าเลือกสิทธิ์ 'Anyone' (ทุกคน) ในการ Deploy เป็น Web App"
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: "เกิดข้อผิดพลาด: " + (err?.message || String(err))
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleBatchSyncClick = async () => {
    setIsSyncingBatch(true);
    try {
      await onBatchSync();
    } catch (e) {
      // handled inside
    } finally {
      setIsSyncingBatch(false);
    }
  };

  const handleFetchClick = async () => {
    setIsFetching(true);
    try {
      await onFetchFromGAS();
    } catch (e) {
      // handled
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time Google Apps Script (GAS) Sync Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            เชื่อมต่อบันทึกสุขภาพจิตกับ Google Sheet เรียลไทม์
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            ซิงค์ข้อมูลบันทึกอารมณ์ สัญญาณทางกายภาพ และรายงาน AI ลงใน Google Sheet ของคุณเองได้ฟรี 100% โดยไม่มีข้อจำกัด ด้วย Google Apps Script Web App Endpoint
          </p>
        </div>
      </div>

      {/* Connection Endpoint Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Link className="w-5 h-5 text-emerald-400" />
              <span>การตั้งค่า Google Apps Script Web App URL</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              นำ URL ที่ได้จากการ Deploy Web App ใน Google Sheet มาวางที่นี่
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              gasConfig.syncStatus === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}>
              {gasConfig.syncStatus === 'success' ? 'Connected ✓' : 'DisConnected'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Google Apps Script Web App URL (Exec Endpoint):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={gasConfig.webAppUrl}
                onChange={(e) => setGasConfig(prev => ({ ...prev, webAppUrl: e.target.value }))}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !gasConfig.webAppUrl}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังทดสอบ...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-current" />
                    <span>ทดสอบการเชื่อมต่อ (Ping)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />}
              <span>{testResult.msg}</span>
            </div>
          )}

          {/* Sync Control Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBatchSyncClick}
                disabled={isSyncingBatch || unsyncedCount === 0 || !gasConfig.webAppUrl}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>ส่งข้อมูลที่รอดำเนินการ ({unsyncedCount}) ลง Sheet</span>
              </button>

              <button
                onClick={handleFetchClick}
                disabled={isFetching || !gasConfig.webAppUrl}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>ดึงข้อมูลอารมณ์ทั้งหมดจาก Google Sheet</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              เวลาซิงค์ล่าสุด: {gasConfig.lastSyncTime ? new Date(gasConfig.lastSyncTime).toLocaleTimeString() : 'ยังไม่มีการซิงค์'}
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-Step GAS Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>วิธีติดตั้ง Google Apps Script ใน Google Sheet ของคุณ (ทำเพียงครั้งเดียว)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            สี่ขั้นตอนง่ายๆ ในการเปลี่ยน Google Sheet ให้กลายเป็น API รับส่งข้อมูลเรียลไทม์ส่วนตัว
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">1</div>
            <h3 className="font-semibold text-white">สร้าง Google Sheet</h3>
            <p className="text-slate-400 leading-relaxed">
              ไปที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center">sheets.new <ExternalLink className="w-3 h-3 ml-0.5" /></a> แล้วเปิดตารางใหม่ จากนั้นไปที่เมนู <strong className="text-slate-200">ส่วนขยาย (Extensions) &gt; Apps Script</strong>
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">2</div>
            <h3 className="font-semibold text-white">วางโค้ด GAS</h3>
            <p className="text-slate-400 leading-relaxed">
              คัดลอกชุดโค้ดด้านล่างนี้ทั้งหมด นำไปวางแทนที่โค้ดเดิมใน Apps Script แล้วกด <strong className="text-slate-200">บันทึก (Ctrl+S)</strong>
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">3</div>
            <h3 className="font-semibold text-white">Deploy เป็น Web App</h3>
            <p className="text-slate-400 leading-relaxed">
              กดปุ่ม <strong className="text-slate-200">Deploy &gt; New deployment</strong> เลือกประเภท <strong className="text-slate-200">Web App</strong> ตั้งสิทธิ์เข้าถึง (Who has access) เป็น <strong className="text-emerald-400">Anyone (ทุกคน)</strong>
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">4</div>
            <h3 className="font-semibold text-white">นำ Web App URL มาวาง</h3>
            <p className="text-slate-400 leading-relaxed">
              คัดลอก URL ของ Web App ที่ได้จาก Google มาวางในช่องด้านบน แล้วกดทดสอบปุ่ม Ping!
            </p>
          </div>
        </div>

        {/* Copy Code Box */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span>ชุดโค้ด Google Apps Script (1-Click Copy Code):</span>
            </span>

            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>คัดลอกเรียบร้อยแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกโค้ด GAS ทั้งหมด</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed select-all">
            <pre>{gasCode}</pre>
          </div>
        </div>
      </div>

      {/* Sync Log History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">ประวัติการรับส่ง Webhook (Sync Event Logs)</h2>
          <p className="text-xs text-slate-400">รายการบันทึกการส่งข้อมูลระหว่าง MindSync AI กับ Google Sheet</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">เวลา</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {syncLogs.length > 0 ? (
                syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-slate-200">{log.type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{log.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    ยังไม่มีประวัติการซิงค์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
