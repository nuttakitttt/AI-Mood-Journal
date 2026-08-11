export function generateGoogleAppsScriptCode(): string {
  return `/**
 * ==============================================================================
 *  MindSync AI - Google Apps Script (GAS) Sync Engine v1.0
 *  ส่วนบันทึกสุขภาพจิต & วิเคราะห์อารมณ์เรียลไทม์
 * ==============================================================================
 *  คำแนะนำการใช้งาน:
 *  1. ใน Google Sheet ของคุณ -> ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 *  2. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดชุดนี้ลงไป
 *  3. กดบันทึก (Ctrl+S หรือ Cmd+S)
 *  4. กดปุ่ม "ทำให้ใช้งานได้อย่างเป็นทางการ" (Deploy) -> "การทำให้ใช้งานได้อย่างเป็นทางการใหม่" (New Deployment)
 *  5. เลือกประเภท: "เว็บแอป" (Web App)
 *     - คำอธิบาย: MindSync Realtime API
 *     - สิทธิ์เข้าถึง (Execute as): "ฉัน" (Me)
 *     - ใครมีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone) **สำคัญมากเพื่อรับ Webhook**
 *  6. กด Deploy -> คัดลอก "URL ของเว็บแอป" (Web App URL) มาวางในแอป MindSync AI!
 * ==============================================================================
 */

// ชื่อ Sheet หลักสำหรับเก็บข้อมูล
const SHEET_MOODS = "Mood_Logs";
const SHEET_WEEKLY = "Weekly_AI_Reports";
const SHEET_SUMMARY = "Sync_Summary";

/**
 * ฟังก์ชันหลักรับข้อมูล POST เรียลไทม์จาก MindSync AI Web App
 */
function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || "save_entry";
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetStructure(ss);

    if (action === "save_entry" || action === "sync_batch") {
      const entries = Array.isArray(postData.entries) ? postData.entries : [postData.entry];
      const sheet = ss.getSheetByName(SHEET_MOODS);
      
      let insertedCount = 0;
      entries.forEach(item => {
        if (!item) return;
        
        // ตรวจสอบว่ามี ID นี้อยู่แล้วหรือไม่ (อัปเดตถ้ามี / เพิ่มใหม่ถ้าไม่มี)
        const existingRowIndex = findRowById(sheet, item.id);
        const rowData = [
          item.id || "ID_" + new Date().getTime(),
          item.timestamp || new Date().toISOString(),
          item.date || "",
          item.time || "",
          item.valence !== undefined ? item.valence : 0,
          item.arousal !== undefined ? item.arousal : 0,
          item.primaryEmotion || "",
          item.secondaryEmotion || "",
          Array.isArray(item.somaticSensations) ? item.somaticSensations.join(", ") : (item.somaticSensations || ""),
          Array.isArray(item.triggers) ? item.triggers.join(", ") : (item.triggers || ""),
          item.energyLevel !== undefined ? item.energyLevel : "",
          item.sleepHours !== undefined ? item.sleepHours : "",
          item.note || "",
          item.aiDailyInsight || "",
          new Date()
        ];

        if (existingRowIndex > 0) {
          sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
          sheet.appendRow(rowData);
          formatRowColor(sheet, sheet.getLastRow(), item.valence);
        }
        insertedCount++;
      });

      // บันทึก Summary Log
      logSyncEvent(ss, "MOOD_SYNC", "SUCCESS", \`Synced \${insertedCount} entries successfully.\`);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: \`Successfully synced \${insertedCount} entries to Google Sheets!\`,
        syncedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (action === "save_weekly_report") {
      const report = postData.report;
      const sheet = ss.getSheetByName(SHEET_WEEKLY);
      
      const rowData = [
        report.id || "W_" + new Date().getTime(),
        report.generatedAt || new Date().toISOString(),
        \`\${report.weekStartDate} ถึง \${report.weekEndDate}\`,
        report.resilienceIndex || 0,
        Array.isArray(report.dominantEmotions) ? report.dominantEmotions.join(", ") : "",
        JSON.stringify(report.keyTriggers || []),
        Array.isArray(report.somaticCorrelations) ? report.somaticCorrelations.join(" | ") : "",
        report.summaryTh || "",
        report.psychologicalAnalysisTh || "",
        Array.isArray(report.cbtExperimentsTh) ? report.cbtExperimentsTh.join(" \\n") : "",
        new Date()
      ];

      sheet.appendRow(rowData);
      logSyncEvent(ss, "WEEKLY_REPORT", "SUCCESS", \`Weekly AI Report for \${report.weekStartDate} saved.\`);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Weekly AI Analysis saved to Google Sheets!",
        syncedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "MindSync Google Apps Script Engine is active and connected!",
        spreadsheetName: ss.getName(),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    lock.releaseLock();
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ฟังก์ชันรับ GET สำหรับดึงข้อมูลล่าสุดกลับไปที่ MindSync App
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetStructure(ss);
    
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : "fetch_logs";

    if (action === "fetch_logs") {
      const sheet = ss.getSheetByName(SHEET_MOODS);
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", entries: [] })).setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data[0];
      const entries = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        entries.push({
          id: String(row[0]),
          timestamp: String(row[1]),
          date: String(row[2]),
          time: String(row[3]),
          valence: Number(row[4]),
          arousal: Number(row[5]),
          primaryEmotion: String(row[6]),
          secondaryEmotion: String(row[7]),
          somaticSensations: row[8] ? String(row[8]).split(", ") : [],
          triggers: row[9] ? String(row[9]).split(", ") : [],
          energyLevel: Number(row[10]),
          sleepHours: Number(row[11]),
          note: String(row[12]),
          aiDailyInsight: String(row[13]),
          syncedToGAS: true
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        total: entries.length,
        entries: entries
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "MindSync GAS Endpoint is ready.",
      spreadsheetName: ss.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * สร้างโครงสร้างแผ่นงานและหัวข้อคอลัมน์ให้อัตโนมัติพร้อมการจัดสไตล์สวยงาม
 */
function ensureSheetStructure(ss) {
  // 1. Mood Logs Sheet
  let moodSheet = ss.getSheetByName(SHEET_MOODS);
  if (!moodSheet) {
    moodSheet = ss.insertSheet(SHEET_MOODS);
    const headers = [
      "ID รายการ", "เวลาบันทึก (ISO)", "วันที่", "เวลา",
      "ระดับอารมณ์ (-5 ถึง +5)", "ระดับพลังงาน (-5 ถึง +5)",
      "อารมณ์หลัก", "อารมณ์รอง", "อาการทางกาย (Somatic)", "ปัจจัยกระตุ้น (Triggers)",
      "พลังงานร่างกาย (1-10)", "ชั่วโมงนอน", "บันทึกความคิด", "AI Daily Insight", "เวลาซิงค์เข้า Sheet"
    ];
    moodSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    moodSheet.getRange(1, 1, 1, headers.length)
      .setBackground("#4F46E5")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    moodSheet.setFrozenRows(1);
  }

  // 2. Weekly Reports Sheet
  let weeklySheet = ss.getSheetByName(SHEET_WEEKLY);
  if (!weeklySheet) {
    weeklySheet = ss.insertSheet(SHEET_WEEKLY);
    const headers = [
      "ID รายงาน", "วันที่สร้าง", "ช่วงสัปดาห์", "ดัชนีฟื้นตัว (Resilience Index)",
      "อารมณ์เด่นประจำสัปดาห์", "ปัจจัยกระตุ้นหลัก (JSON)", "ความสัมพันธ์ทางกายภาพ (Somatic)",
      "สรุปภาพรวม AI", "บทวิเคราะห์ทางจิตวิทยา", "ข้อเสนอแนะ CBT", "เวลาลงบันทึก"
    ];
    weeklySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    weeklySheet.getRange(1, 1, 1, headers.length)
      .setBackground("#0D9488")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    weeklySheet.setFrozenRows(1);
  }

  // 3. Summary & Log Sheet
  let summarySheet = ss.getSheetByName(SHEET_SUMMARY);
  if (!summarySheet) {
    summarySheet = ss.insertSheet(SHEET_SUMMARY);
    const headers = ["เวลาที่บันทึก", "ประเภทอีเวนต์", "สถานะ", "รายละเอียดข้อความ"];
    summarySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    summarySheet.getRange(1, 1, 1, headers.length)
      .setBackground("#374151")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold");
    summarySheet.setFrozenRows(1);
  }
}

/**
 * ใส่สีไฮไลท์แถวตามระดับ Valence ของอารมณ์
 */
function formatRowColor(sheet, rowIdx, valence) {
  if (!sheet || rowIdx <= 1) return;
  const range = sheet.getRange(rowIdx, 1, 1, 15);
  const val = Number(valence);
  
  if (val >= 3) {
    range.setBackground("#ECFDF5"); // เขียวอ่อนสดใส
  } else if (val > 0) {
    range.setBackground("#F0FDF4");
  } else if (val === 0) {
    range.setBackground("#F9FAFB"); // เทาเป็นกลาง
  } else if (val >= -2) {
    range.setBackground("#FFFBEB"); // ส้มอ่อนเตือน
  } else {
    range.setBackground("#FEF2F2"); // แดงอ่อนตึงเครียด
  }
}

/**
 * ค้นหาแถวด้วย ID
 */
function findRowById(sheet, id) {
  if (!sheet || !id) return -1;
  const data = sheet.getRange("A:A").getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i + 1; // 1-based row index
    }
  }
  return -1;
}

/**
 * ลงบันทึกประวัติซิงค์
 */
function logSyncEvent(ss, type, status, message) {
  try {
    const sheet = ss.getSheetByName(SHEET_SUMMARY);
    if (sheet) {
      sheet.appendRow([new Date(), type, status, message]);
    }
  } catch (e) {
    // ignore
  }
}
`;
}
