import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  FileSpreadsheet, 
  Activity, 
  Moon, 
  MessageSquare, 
  Check, 
  Info,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MoodEntry, GASConfig } from '../types';
import { SOMATIC_SENSATIONS_LIST, TRIGGERS_LIST } from '../data/initialData';

interface MoodLoggerProps {
  onSaveEntry: (newEntry: Omit<MoodEntry, 'id' | 'timestamp' | 'syncedToGAS'>) => Promise<MoodEntry>;
  gasConfig: GASConfig;
  onNavigateToSetup: () => void;
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({
  onSaveEntry,
  gasConfig,
  onNavigateToSetup
}) => {
  // 2D Matrix State (Valence -5 to 5, Arousal -5 to 5)
  const [valence, setValence] = useState<number>(0);
  const [arousal, setArousal] = useState<number>(0);
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('ผ่อนคลาย ปานกลาง');
  const [secondaryEmotion, setSecondaryEmotion] = useState<string>('');
  
  const [selectedSomatic, setSelectedSomatic] = useState<string[]>(['calm_lightness']);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['quiet_me_time']);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [note, setNote] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdEntry, setCreatedEntry] = useState<MoodEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Suggested emotion choices based on quadrant
  const getQuadrantEmotions = (v: number, a: number) => {
    if (a >= 0 && v >= 0) return ['สดชื่นมีพลัง', 'ตื่นเต้น', 'กระตือรือร้น', 'ภูมิใจ', 'เบิกบาน'];
    if (a >= 0 && v < 0) return ['ตึงเครียด กังวล', 'โกรธ หงุดหงิด', 'กดดัน', 'กระวนกระวาย', 'ว้าวุ่นใจ'];
    if (a < 0 && v < 0) return ['เหนื่อยล้า หมดพลัง', 'เศร้าซึม', 'ท้อแท้', 'เหงา', 'สิ้นหวัง'];
    return ['ผ่อนคลาย สบายใจ', 'สงบเยือกเย็น', 'ซาบซึ้งใจ', 'พึงพอใจ', 'อบอุ่นใจ'];
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // 0 to rect.width
    const y = e.clientY - rect.top;  // 0 to rect.height

    // Convert to -5 to +5 range
    const normX = Math.round(((x / rect.width) * 10) - 5);
    const normY = Math.round((((rect.height - y) / rect.height) * 10) - 5);

    const clampedX = Math.max(-5, Math.min(5, normX));
    const clampedY = Math.max(-5, Math.min(5, normY));

    setValence(clampedX);
    setArousal(clampedY);

    const emotionSuggestions = getQuadrantEmotions(clampedX, clampedY);
    setPrimaryEmotion(emotionSuggestions[0]);
  };

  const toggleSomatic = (id: string) => {
    setSelectedSomatic(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleTrigger = (id: string) => {
    setSelectedTriggers(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    try {
      const entry = await onSaveEntry({
        date: dateStr,
        time: timeStr,
        valence,
        arousal,
        primaryEmotion,
        secondaryEmotion: secondaryEmotion || undefined,
        somaticSensations: selectedSomatic,
        triggers: selectedTriggers,
        energyLevel,
        sleepHours,
        note
      });

      setCreatedEntry(entry);
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการบันทึก: " + (err?.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewLog = () => {
    setCreatedEntry(null);
    setNote('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Somatic & Bio-Emotional Micro Check-in</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              จดบันทึกสภาวะอารมณ์และร่างกาย
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              ระบุระดับอารมณ์บนตาราง 2D พร้อมเช็กสัญญาณทางกายภาพ (Somatic Sensation) เพื่อส่งเข้า Google Sheet และประมวลผลด้วย AI เรียลไทม์
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400 block">การเชื่อมโยง Google Sheet</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mt-1 ${
              gasConfig.webAppUrl 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}>
              {gasConfig.webAppUrl ? 'พร้อมซิงค์แบบเรียลไทม์' : 'ยังไม่ได้ตั้งค่า GAS Web App'}
            </span>
          </div>
        </div>
      </div>

      {/* Success View after Submitting */}
      {createdEntry ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">บันทึกสภาวะอารมณ์สำเร็จ!</h2>
              <p className="text-sm text-slate-400">
                ข้อมูลถูกจัดเก็บเรียบร้อยแล้ว {createdEntry.syncedToGAS ? 'และถูกส่งไปยัง Google Sheet เรียลไทม์' : '(รอซิงค์เมื่อเชื่อมต่อ GAS)'}
              </p>
            </div>
          </div>

          {/* AI Micro Insight Card */}
          {createdEntry.aiDailyInsight && (
            <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>AI Daily Micro-Insight (จาก Gemini):</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed italic">
                "{createdEntry.aiDailyInsight}"
              </p>
            </div>
          )}

          {/* Entry Summary Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">อารมณ์หลัก</span>
              <span className="text-white font-medium">{createdEntry.primaryEmotion}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Valence / Energy</span>
              <span className="text-indigo-300 font-medium">{createdEntry.valence} / {createdEntry.arousal}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ชั่วโมงนอน</span>
              <span className="text-white font-medium">{createdEntry.sleepHours} ชม.</span>
            </div>
            <div>
              <span className="text-slate-500 block">สถานะ Google Sheet</span>
              <span className={createdEntry.syncedToGAS ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                {createdEntry.syncedToGAS ? 'Synced ✓' : 'Local Only'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleResetForNewLog}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
            >
              + บันทึกเพิ่มอีกรายการ
            </button>
            {!gasConfig.webAppUrl && (
              <button
                onClick={onNavigateToSetup}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all flex items-center space-x-2 border border-slate-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>เชื่อมต่อ Google Sheet รับส่งข้อมูล</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Logging Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: 2D Mood Plane (Valence vs Arousal) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>ตารางพิกัดอารมณ์และพลังงาน (Valence & Arousal Grid)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  แตะหรือคลิกจุดบนตารางเพื่อระบุระดับความรู้สึก (ซ้าย=ลบ, ขวา=บวก / บน=พลังงานสูง, ล่าง=พลังงานต่ำ)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">พิกัดปัจจุบัน</span>
                <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  V: {valence > 0 ? `+${valence}` : valence} | A: {arousal > 0 ? `+${arousal}` : arousal}
                </span>
              </div>
            </div>

            {/* Interactive Grid Canvas Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7">
                <div 
                  ref={gridRef}
                  onClick={handleGridClick}
                  className="relative w-full aspect-square max-w-[360px] mx-auto bg-slate-950 rounded-2xl border-2 border-slate-800 cursor-crosshair overflow-hidden select-none hover:border-indigo-500/50 transition-colors shadow-inner"
                >
                  {/* Axis Dividers */}
                  <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-800" />
                  <div className="absolute inset-y-0 left-1/2 border-r border-dashed border-slate-800" />

                  {/* Quadrant Labels */}
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    พลังงานสูง + เชิงบวก (High Positive)
                  </span>
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-rose-400/80 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                    พลังงานสูง + เชิงลบ (High Negative)
                  </span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                    พลังงานต่ำ + เชิงลบ (Low Negative)
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-teal-400/80 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-500/20">
                    พลังงานต่ำ + เชิงบวก (Low Positive)
                  </span>

                  {/* Marker Pin */}
                  <div 
                    className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/50 transition-all duration-150 flex items-center justify-center animate-bounce"
                    style={{
                      left: `${((valence + 5) / 10) * 100}%`,
                      top: `${((5 - arousal) / 10) * 100}%`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Emotion Name Selector */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    เลือกคำอธิบายอารมณ์หลักที่ตรงกับคุณมากที่สุด:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getQuadrantEmotions(valence, arousal).map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setPrimaryEmotion(emo)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          primaryEmotion === emo
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105 border border-indigo-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    ระบุอารมณ์รองเพิ่ม (ถ้ามี):
                  </label>
                  <input
                    type="text"
                    value={secondaryEmotion}
                    onChange={(e) => setSecondaryEmotion(e.target.value)}
                    placeholder="เช่น ตื่นเต้นลึกๆ, ปะปนกับความเกรงใจ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Somatic Body Sensations */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">2</span>
                <span>สัญญาณความรู้สึกทางร่างกาย (Somatic Body Sensations)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ร่างกายของคุณกำลังบอกอะไรอยู่? เลือกอาการทางกายที่เกิดขึ้นร่วมกับอารมณ์นี้
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {SOMATIC_SENSATIONS_LIST.map((somatic) => {
                const isSelected = selectedSomatic.includes(somatic.id);
                return (
                  <button
                    key={somatic.id}
                    type="button"
                    onClick={() => toggleSomatic(somatic.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                      isSelected
                        ? somatic.valenceAffinity === 'positive'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{somatic.labelTh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Triggers & Context */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                <span>ปัจจัยกระตุ้นและบริบท (Triggers & Environment)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                เหตุการณ์ สภาพแวดล้อม หรือพฤติกรรมรอบตัวใดบ้างที่มีส่วนส่งผลต่ออารมณ์นี้
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {TRIGGERS_LIST.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger.id);
                return (
                  <button
                    key={trigger.id}
                    type="button"
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-purple-950/80 text-purple-200 border-purple-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{trigger.labelTh}</span>
                  </button>
                );
              })}
            </div>

            {/* Sliders for Sleep and Physical Energy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>พลังงานร่างกาย (1 - 10)</span>
                  </label>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{energyLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                    <span>ชั่วโมงนอนเมื่อคืน</span>
                  </label>
                  <span className="text-xs font-mono text-purple-400 font-bold">{sleepHours} ชั่วโมง</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Reflection Note & Submit */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                <span>บันทึกความรู้สึก / เรื่องราวในใจ (Reflection Note)</span>
              </h2>
            </div>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="พิมเรื่องราว หรือความคิดที่กำลังวนเวียนอยู่ในหัวของคุณช่วงนี้..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>
                  {gasConfig.webAppUrl 
                    ? 'ข้อมูลจะถูกส่งไปยัง Google Sheet อัตโนมัติ' 
                    : 'ยังไม่ได้ระบุ GAS URL (ข้อมูลจะถูกเก็บบนเครื่องก่อน)'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึก & ประมวลผล AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>บันทึกและซิงค์ข้อมูลเรียลไทม์</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};
