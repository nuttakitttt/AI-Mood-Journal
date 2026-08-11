import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini API client (Server side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "MindSync AI" });
});

// 1. Generate Daily Micro-Insight
app.post("/api/gemini/daily-insight", async (req, res) => {
  try {
    const { entry } = req.body;
    if (!entry) {
      return res.status(400).json({ error: "Missing mood entry" });
    }

    const prompt = `คุณคือผู้เชี่ยวชาญด้านจิตวิทยาและการแพทย์เชิงพฤติกรรม (Behavioral Health Specialist)
โปรดวิเคราะห์การลงบันทึกอารมณ์และสภาวะทางกาย (Somatic State) ต่อไปนี้ และเขียนข้อความวิเคราะห์สั้นๆ (Daily Micro-Insight) ความยาวประมาณ 2-3 ประโยค ภาษาไทย:

- ระดับอารมณ์ (Valence -5 ถึง +5): ${entry.valence}
- ระดับพลังงาน (Arousal -5 ถึง +5): ${entry.arousal}
- อารมณ์หลัก: ${entry.primaryEmotion} ${entry.secondaryEmotion ? `(${entry.secondaryEmotion})` : ''}
- อาการทางกายภาพ (Somatic Sensations): ${Array.isArray(entry.somaticSensations) ? entry.somaticSensations.join(', ') : 'ไม่มี'}
- ปัจจัยกระตุ้น (Triggers): ${Array.isArray(entry.triggers) ? entry.triggers.join(', ') : 'ไม่มี'}
- พลังงานร่างกาย: ${entry.energyLevel}/10 | ชั่วโมงนอน: ${entry.sleepHours} ชม.
- ข้อความบันทึกความคิด: "${entry.note || 'ไม่ได้ระบุ'}"

คำแนะนำ:
1. แสดงความเข้าอกเข้าใจ (Empathetic) และเป็นมิตรอย่างอบอุ่น
2. ชี้ให้เห็นความเชื่อมโยงระหว่าง "อาการทางกาย" กับ "ความคิด/อารมณ์" (Somatic Connection)
3. เสนอคำแนะนำปฏิบัติการปรับระบบประสาทสั้นๆ 1 ข้อ (เช่น การผ่อนคลายกล้ามเนื้อ, การหายใจแบบ 4-7-8, การจิบน้ำ, การพักสายตา)
4. ไม่ต้องใส่คำนำหน้ายาว ให้เริ่มบทวิเคราะห์ทันที`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "ตอบเป็นภาษาไทยที่เป็นมิตร ให้ความอบอุ่น ละมุนละม่อม และถูกต้องตามหลักจิตวิทยาการให้คำปรึกษา",
        temperature: 0.7,
      }
    });

    const insight = response.text ? response.text.trim() : "รับทราบบันทึกอารมณ์เรียบร้อยแล้ว หมั่นสังเกตลมหายใจและพักผ่อนให้เพียงพอนะครับ";
    res.json({ insight });
  } catch (error: any) {
    console.error("Error generating daily insight:", error);
    res.status(500).json({ 
      error: "Failed to generate AI insight", 
      details: error?.message || String(error) 
    });
  }
});

// 2. Generate Weekly AI Mental Health & Trend Report
app.post("/api/gemini/weekly-analysis", async (req, res) => {
  try {
    const { entries, weekStartDate, weekEndDate } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "No entries provided for weekly analysis" });
    }

    const entriesSummary = entries.map(e => `
[${e.date} ${e.time}]
- Valence: ${e.valence}, Arousal: ${e.arousal}, Emotion: ${e.primaryEmotion}
- Somatic: ${Array.isArray(e.somaticSensations) ? e.somaticSensations.join(', ') : ''}
- Triggers: ${Array.isArray(e.triggers) ? e.triggers.join(', ') : ''}
- Sleep: ${e.sleepHours}h, Energy: ${e.energyLevel}/10
- Note: ${e.note || '-'}
`).join('\n');

    const prompt = `คุณคือวิเคราะห์จิตวิทยาระดับแนวหน้า (Lead Neuro-Psychological Analyst)
วิเคราะห์ชุดบันทึกอารมณ์และสภาวะทางกายภาพในรอบสัปดาห์ระหว่างวันที่ ${weekStartDate} ถึง ${weekEndDate} ต่อไปนี้:

${entriesSummary}

โปรดประมวลผลวิเคราะห์ออกมาเป็นโครงสร้าง JSON ภาษาไทย เพื่อสะท้อนแนวโน้มสุขภาพจิตในสัปดาห์นี้:
- resilienceIndex: คะแนนความยืดหยุ่นทางจิตใจ (0 ถึง 100)
- dominantEmotions: อารมณ์เด่นๆ 2-4 อารมณ์
- keyTriggers: รายการปัจจัยกระตุ้น พร้อมประเภทผลกระทบ (positive, negative, neutral) และความถี่
- somaticCorrelations: รายการข้อค้นพบความสัมพันธ์ระหว่างอารมณ์กับสภาวะทางกาย เช่น "อาการแน่นหน้าอกสัมพันธ์กับเดดไลน์งานช่วงบ่าย" 2-3 ข้อ
- summaryTh: บทสรุปภาพรวมสุขภาพจิตสัปดาห์นี้ (ภาษาไทย 2-3 ประโยค)
- psychologicalAnalysisTh: บทวิเคราะห์แนวโน้มทางจิตวิทยา ความเร็วในการฟื้นตัว และจุดที่ควรตระหนักรู้ (ภาษาไทย 1 ย่อหน้าละเอียด)
- cbtExperimentsTh: ข้อเสนอแนะการทดลองทางพฤติกรรมและความคิด (CBT & ACT Experiments) 3 ข้อสำหรับสัปดาห์ถัดไป
- recommendedActionsTh: การกระทำที่แนะนำ 3 ข้อ`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resilienceIndex: { type: Type.INTEGER, description: "Score from 0 to 100" },
            dominantEmotions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of dominant emotions" 
            },
            keyTriggers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  impact: { type: Type.STRING, description: "positive, negative, or neutral" },
                  frequency: { type: Type.INTEGER }
                },
                required: ["name", "impact", "frequency"]
              }
            },
            somaticCorrelations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summaryTh: { type: Type.STRING },
            psychologicalAnalysisTh: { type: Type.STRING },
            cbtExperimentsTh: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedActionsTh: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "resilienceIndex", "dominantEmotions", "keyTriggers", 
            "somaticCorrelations", "summaryTh", "psychologicalAnalysisTh", 
            "cbtExperimentsTh", "recommendedActionsTh"
          ]
        }
      }
    });

    const jsonText = response.text?.trim() || "{}";
    const analysisData = JSON.parse(jsonText);

    res.json({
      id: "weekly-" + Date.now(),
      weekStartDate: weekStartDate || new Date().toISOString().split('T')[0],
      weekEndDate: weekEndDate || new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      ...analysisData
    });

  } catch (error: any) {
    console.error("Error generating weekly analysis:", error);
    res.status(500).json({ 
      error: "Failed to generate weekly analysis", 
      details: error?.message || String(error) 
    });
  }
});

// 3. AI MindMirror Copilot Chat
app.post("/api/gemini/copilot-chat", async (req, res) => {
  try {
    const { messages, moodEntries } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }

    const recentLogsContext = Array.isArray(moodEntries) && moodEntries.length > 0
      ? moodEntries.slice(-5).map(e => `[${e.date} ${e.time}] อารมณ์: ${e.primaryEmotion} (Valence ${e.valence}, Arousal ${e.arousal}), ร่างกาย: ${e.somaticSensations?.join(', ')}, โน้ต: ${e.note}`).join('\n')
      : "ยังไม่มีบันทึกอารมณ์ล่าสุด";

    const systemInstruction = `คุณคือ "MindMirror AI" ที่ปรึกษาสุขภาพจิตส่วนบุคคลที่เปี่ยมด้วยความเห็นอกเห็นใจ (Empathetic Mental Health Copilot)
คุณใช้หลักการ Acceptance and Commitment Therapy (ACT) และ Cognitive Behavioral Therapy (CBT)

ข้อมูลบริบทบันทึกอารมณ์ล่าสุดของผู้ใช้:
${recentLogsContext}

กฎการตอบ:
1. ตอบเป็นภาษาไทยด้วยน้ำเสียงนุ่มนวล เป็นกันเอง อบอุ่น และปลอบประโลมใจ
2. อ้างอิงสภาวะทางกายหรืออารมณ์ล่าสุดของผู้ใช้อย่างใส่ใจเมื่อเหมาะสม
3. ถามคำถามปลายเปิดชวนสะท้อนความคิด (Reflective Question) หรือเสนอแบบฝึกหัดตระหนักรู้ 1 ข้อ
4. คำตอบไม่ควรยาวเกินไป (2-4 ย่อหน้าสั้นๆ) ให้ผู้ใช้รู้สึกสบายใจและไม่ถูกกดดัน`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // If the last message is from user, add system context or query
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const replyText = response.text?.trim() || "ผมพร้อมรับฟังทุกเรื่องราวของคุณเสมอครับ ลองเล่าเพิ่มได้เลยนะครับ";
    res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Error in copilot chat:", error);
    res.status(500).json({ 
      error: "Copilot chat failed", 
      details: error?.message || String(error) 
    });
  }
});

// 4. Proxy Google Apps Script Webhook
app.post("/api/sync/gas-proxy", async (req, res) => {
  try {
    const { webAppUrl, payload } = req.body;
    if (!webAppUrl || typeof webAppUrl !== 'string' || !webAppUrl.startsWith("http")) {
      return res.status(400).json({ error: "Invalid Google Apps Script Web App URL" });
    }

    const gasResponse = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const textResult = await gasResponse.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(textResult);
    } catch (e) {
      jsonResult = { status: "raw", responseText: textResult };
    }

    res.json(jsonResult);
  } catch (error: any) {
    console.error("Error proxying to GAS:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to connect to Google Apps Script Web App: " + (error?.message || String(error)) 
    });
  }
});

// ============================================================================
// SERVER INITIALIZATION & VITE MIDDLEWARE
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MindSync AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
