import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RefreshCw, 
  HeartHandshake, 
  HelpCircle,
  Zap,
  MessageSquareQuote
} from 'lucide-react';
import { CopilotMessage, MoodEntry } from '../types';

interface AICopilotProps {
  moodEntries: MoodEntry[];
}

export const AICopilot: React.FC<AICopilotProps> = ({ moodEntries }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'สวัสดีครับ ผมคือ MindMirror AI ที่ปรึกษาสุขภาพจิตส่วนบุคคลของคุณ พร้อมรับฟังและช่วยคุณสะท้อนความคิด สภาวะอารมณ์ และสัญญาณทางกายภาพจากบันทึกของคุณ วันนี้มีเรื่องอะไรที่อยากพูดคุยหรือระบายให้ฟังไหมครับ?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: CopilotMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          moodEntries
        })
      });

      const data = await response.json();
      const aiReply = data.reply || 'ผมเข้าใจสภาวะที่คุณกำลังเผชิญอยู่ ลองสังเกตลมหายใจและอนุญาตให้ตัวเองพักผ่อนสั้นๆ นะครับ';

      const assistantMsg: CopilotMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: CopilotMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: 'ขออภัยครับ เกิดปัญหาในการเชื่อมต่อระบบ AI ชั่วคราว แต่ผมยังคงเป็นกำลังใจให้คุณเสมอนะครับ',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChipClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-teal-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MindMirror AI Copilot
            </h1>
            <p className="text-slate-300 text-xs mt-0.5">
              ผู้ช่วยรับฟังเชิงจิตวิทยา CBT & ACT พร้อมประมวลผลตามบริบทบันทึกอารมณ์ของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col h-[520px] shadow-2xl">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-2 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 text-slate-400 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs italic flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>MindMirror กำลังคิดและเรียบเรียงคำตอบเชิงจิตวิทยา...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-500 block mb-2">
            คำถามแนะนำตามสภาวะอารมณ์ของคุณ:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePromptChipClick("ทำไมช่วงนี้ผมมักจะแน่นหน้าอกและตึงไหล่เวลาทำงานครับ?")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all text-left"
            >
              💭 ทำไมช่วงนี้ชอบแน่นหน้าอกเวลาทำงาน?
            </button>
            <button
              onClick={() => handlePromptChipClick("ช่วยแนะนำวิธีผ่อนคลายความกังวลจากงานเร่งด่วนตามหลัก CBT ทีครับ")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all text-left"
            >
              🌿 วิธีผ่อนคลายความกังวลจากงานเร่งด่วน
            </button>
            <button
              onClick={() => handlePromptChipClick("วิเคราะห์ความสัมพันธ์ระหว่างชั่วโมงการนอนกับการสวิงของอารมณ์ให้หน่อยครับ")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all text-left"
            >
              🌙 วิเคราะห์ชั่วโมงนอนกับอารมณ์สวิง
            </button>
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="pt-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์เรื่องราว หรือถามข้อสงสัยเกี่ยวกับสภาวะจิตใจ..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
