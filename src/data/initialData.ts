import { MoodEntry, WeeklyAnalysis, SomaticSensation, TriggerItem } from '../types';

export const SOMATIC_SENSATIONS_LIST: SomaticSensation[] = [
  { id: 'chest_tightness', category: 'chest', labelTh: 'แน่นหน้าอก / อึดอัด', labelEn: 'Chest Tightness', valenceAffinity: 'negative' },
  { id: 'jaw_clenching', category: 'jaw', labelTh: 'เกร็งกราม / ขบฟัน', labelEn: 'Jaw Clenching', valenceAffinity: 'negative' },
  { id: 'temple_pressure', category: 'head', labelTh: 'ปวดตึงขมับ / หัวตึง', labelEn: 'Temple Pressure', valenceAffinity: 'negative' },
  { id: 'stomach_knot', category: 'stomach', labelTh: 'ม้วนปั่นป่วนในท้อง', labelEn: 'Stomach Knot', valenceAffinity: 'negative' },
  { id: 'shoulder_stiffness', category: 'shoulders_neck', labelTh: 'ไหล่ตึงหนัก / คอตึง', labelEn: 'Stiff Shoulders & Neck', valenceAffinity: 'negative' },
  { id: 'cold_hands', category: 'hands_feet', labelTh: 'มือเท้าเย็นชา', labelEn: 'Cold Hands/Feet', valenceAffinity: 'negative' },
  { id: 'restless_energy', category: 'whole_body', labelTh: 'กระวนกระวาย อยู่ไม่สุข', labelEn: 'Restless Energy', valenceAffinity: 'neutral' },
  { id: 'calm_lightness', category: 'chest', labelTh: 'เบาสบายช่วงอก / หายใจทั่วท้อง', labelEn: 'Calm Lightness', valenceAffinity: 'positive' },
  { id: 'warm_vitality', category: 'whole_body', labelTh: 'อบอุ่นผ่อนคลายทั่วร่างกาย', labelEn: 'Warm Vitality', valenceAffinity: 'positive' },
  { id: 'muscle_relaxation', category: 'shoulders_neck', labelTh: 'กล้ามเนื้อคลายตัว', labelEn: 'Relaxed Muscles', valenceAffinity: 'positive' },
];

export const TRIGGERS_LIST: TriggerItem[] = [
  { id: 'work_deadline', category: 'work_study', labelTh: 'เดดไลน์งาน / งานเร่ง', labelEn: 'Work Deadline', icon: 'Briefcase' },
  { id: 'late_meeting', category: 'work_study', labelTh: 'ประชุมยาวนาน / ความเห็นไม่ตรงกัน', labelEn: 'Long Meetings', icon: 'Users' },
  { id: 'low_sleep', category: 'health_lifestyle', labelTh: 'นอนน้อย / เพลียสะสม', labelEn: 'Low Sleep', icon: 'Moon' },
  { id: 'screen_overload', category: 'environment', labelTh: 'จ้องจอนานเกินไป', labelEn: 'Screen Overload', icon: 'Monitor' },
  { id: 'caffeine_spike', category: 'health_lifestyle', labelTh: 'กาแฟ/ชา มากเกินไป', labelEn: 'Too Much Caffeine', icon: 'Coffee' },
  { id: 'exercise_done', category: 'health_lifestyle', labelTh: 'ได้ออกกำลังกาย/เดินยืดเส้น', labelEn: 'Exercise Completed', icon: 'Activity' },
  { id: 'family_chat', category: 'relationships', labelTh: 'ได้พูดคุยกับครอบครัว/คนรัก', labelEn: 'Talked with Family', icon: 'Heart' },
  { id: 'nature_walk', category: 'environment', labelTh: 'ได้สัมผัสธรรมชาติ/รับลม', labelEn: 'Nature Walk', icon: 'Sun' },
  { id: 'financial_worry', category: 'internal', labelTh: 'กังวลค่าใช้จ่าย/การเงิน', labelEn: 'Financial Stress', icon: 'DollarSign' },
  { id: 'quiet_me_time', category: 'environment', labelTh: 'ช่วงเวลาเงียบส่วนตัว', labelEn: 'Quiet Me-Time', icon: 'Feather' },
];

export const INITIAL_MOOD_ENTRIES: MoodEntry[] = [
  {
    id: 'entry-101',
    timestamp: '2026-08-04T08:30:00.000Z',
    date: '2026-08-04',
    time: '08:30',
    valence: 2,
    arousal: 3,
    primaryEmotion: 'สดชื่นมีพลัง',
    secondaryEmotion: 'กระตือรือร้น',
    somaticSensations: ['calm_lightness', 'warm_vitality'],
    triggers: ['exercise_done', 'quiet_me_time'],
    energyLevel: 8,
    sleepHours: 7.5,
    note: 'วิ่งออกกำลังกายตอนเช้าแล้วชงกาแฟดื่ม รู้สึกพร้อมสำหรับสัปดาห์ใหม่',
    aiDailyInsight: 'การเริ่มวันด้วยกิจกรรมกลางแจ้งช่วยกระตุ้นโดพามีนอย่างสมดุล รักษารายการปฏิบัตินี้ไว้เพื่อช่วยผ่อนแรงในวันถัดไป',
    syncedToGAS: true,
    syncedAt: '2026-08-04T08:30:05.000Z'
  },
  {
    id: 'entry-102',
    timestamp: '2026-08-04T18:45:00.000Z',
    date: '2026-08-04',
    time: '18:45',
    valence: -2,
    arousal: 4,
    primaryEmotion: 'ตึงเครียด กังวล',
    secondaryEmotion: 'กดดัน',
    somaticSensations: ['chest_tightness', 'shoulder_stiffness'],
    triggers: ['work_deadline', 'late_meeting'],
    energyLevel: 5,
    sleepHours: 7.5,
    note: 'ประชุมติดกัน 3 ชั่วโมง มีคอมเมนต์แก้โปรเจกต์ด่วน รู้สึกหน้าอกอึดอัดเล็กน้อย',
    aiDailyInsight: 'ตรวจพบอาการตึงเครียดสะสมบริเวณอกและไหล่ ลองหยุดหมุนคอ 1 นาที และหายใจแบบ 4-7-8 ก่อนเริ่มงานส่วนถัดไป',
    syncedToGAS: true,
    syncedAt: '2026-08-04T18:45:10.000Z'
  },
  {
    id: 'entry-103',
    timestamp: '2026-08-05T14:15:00.000Z',
    date: '2026-08-05',
    time: '14:15',
    valence: -3,
    arousal: 2,
    primaryEmotion: 'เหนื่อยล้า หมดพลัง',
    secondaryEmotion: 'ท้อแท้เล็กน้อย',
    somaticSensations: ['temple_pressure', 'stomach_knot'],
    triggers: ['low_sleep', 'screen_overload', 'caffeine_spike'],
    energyLevel: 3,
    sleepHours: 5.0,
    note: 'เมื่อคืนนอนไม่ค่อยหลับ กาแฟแก้วที่ 3 แล้วแต่ยังปวดหัวตึงๆ มองจอนานเกินไป',
    aiDailyInsight: 'สัญญาณเตือนภาวะ Sensory Overload จากแสงจอและกาแฟเกินพิกัด แนะนำให้ปิดจอพักสายตา 10 นาที ดื่มน้ำอุณหภูมิห้อง',
    syncedToGAS: true,
    syncedAt: '2026-08-05T14:15:08.000Z'
  },
  {
    id: 'entry-104',
    timestamp: '2026-08-06T20:30:00.000Z',
    date: '2026-08-06',
    time: '20:30',
    valence: 3,
    arousal: -2,
    primaryEmotion: 'ผ่อนคลาย สบายใจ',
    secondaryEmotion: 'ซาบซึ้งใจ',
    somaticSensations: ['muscle_relaxation', 'calm_lightness'],
    triggers: ['family_chat', 'nature_walk'],
    energyLevel: 7,
    sleepHours: 8.0,
    note: 'เลิกงานไว ได้ไปเดินสวนสาธารณะกับเพื่อน แล้วโทรคุยกับแม่ รู้สึกอบอุ่นผ่อนคลายขึ้นมาก',
    aiDailyInsight: 'การเชื่อมโยงทางสังคมเชิงบวก (Social Connection) เป็นตัวรับแรงกระแทกจากความเครียดสะสมได้ดีที่สุด',
    syncedToGAS: true,
    syncedAt: '2026-08-06T20:30:04.000Z'
  },
  {
    id: 'entry-105',
    timestamp: '2026-08-07T16:00:00.000Z',
    date: '2026-08-07',
    time: '16:00',
    valence: -1,
    arousal: 3,
    primaryEmotion: 'ฟิตงาน รีบร้อน',
    secondaryEmotion: 'กังวลประเด็นการเงิน',
    somaticSensations: ['jaw_clenching'],
    triggers: ['work_deadline', 'financial_worry'],
    energyLevel: 6,
    sleepHours: 6.5,
    note: 'พยายามปิดงานส่งก่อนเสาร์อาทิตย์ เผลอกัดฟันเกร็งกรามตอนพิมพ์งาน',
    aiDailyInsight: 'ตรวจพบอาการ Jaw Clenching โดยไม่รู้ตัว ลองอ้าปากกว้างๆ แล้วแลบลิ้นลงล่างเพื่อผ่อนคลายกล้ามเนื้อใบหน้า',
    syncedToGAS: true,
    syncedAt: '2026-08-07T16:00:12.000Z'
  },
  {
    id: 'entry-106',
    timestamp: '2026-08-08T11:20:00.000Z',
    date: '2026-08-08',
    time: '11:20',
    valence: 4,
    arousal: 1,
    primaryEmotion: 'สงบ มีความสุข',
    secondaryEmotion: 'เป็นอิสระ',
    somaticSensations: ['calm_lightness', 'warm_vitality'],
    triggers: ['quiet_me_time', 'nature_walk'],
    energyLevel: 8,
    sleepHours: 8.5,
    note: 'วันเสาร์ตื่นสายเบาๆ นั่งจิบชาอ่านหนังสือฟังเพลงโลฟาย ไม่ได้เปิดไลน์งานเลย',
    aiDailyInsight: 'ช่วงเวลาไร้การขัดจังหวะ (Uninterrupted Flow State) ช่วยฟื้นฟูระบบประสาทพาราซิมพาเทติกอย่างลึกซึ้ง',
    syncedToGAS: true,
    syncedAt: '2026-08-08T11:20:02.000Z'
  },
  {
    id: 'entry-107',
    timestamp: '2026-08-09T21:00:00.000Z',
    date: '2026-08-09',
    time: '21:00',
    valence: 1,
    arousal: -1,
    primaryEmotion: 'เตรียมพร้อม เรียบง่าย',
    secondaryEmotion: 'ตระหนักรู้',
    somaticSensations: ['muscle_relaxation'],
    triggers: ['quiet_me_time'],
    energyLevel: 7,
    sleepHours: 7.5,
    note: 'เตรียมเสื้อผ้าสำหรับสัปดาห์หน้า เขียนเป้าหมาย 3 ข้อ ยิ้มให้ตัวเองในกระจก',
    aiDailyInsight: 'การวางแผนวันพรุ่งนี้ก่อนนอนช่วยลดภาวะ Sunday Scaries และช่วยให้นอนหลับได้สนิทขึ้น',
    syncedToGAS: true,
    syncedAt: '2026-08-09T21:00:15.000Z'
  }
];

export const INITIAL_WEEKLY_ANALYSIS: WeeklyAnalysis = {
  id: 'weekly-analysis-001',
  weekStartDate: '2026-08-04',
  weekEndDate: '2026-08-09',
  generatedAt: '2026-08-10T00:00:00.000Z',
  resilienceIndex: 78,
  dominantEmotions: ['ผ่อนคลายสบายใจ', 'ตึงเครียดกังวล', 'มีความสุขสงบ'],
  keyTriggers: [
    { name: 'เดดไลน์งาน / งานเร่ง', impact: 'negative', frequency: 3 },
    { name: 'นอนน้อย / เพลียสะสม', impact: 'negative', frequency: 2 },
    { name: 'สัมผัสธรรมชาติ / เดินสวน', impact: 'positive', frequency: 2 },
    { name: 'พูดคุยครอบครัว/เพื่อน', impact: 'positive', frequency: 2 }
  ],
  somaticCorrelations: [
    'อาการแน่นหน้าอก co-occur กับเดดไลน์งานและการประชุมติดกัน 85%',
    'อาการปวดตึงขมับสัมพันธ์อย่างมีนัยสำคัญกับเวลานอนต่ำกว่า 6 ชั่วโมง + กาแฟ > 2 แก้ว',
    'ภาวะเบาสบายช่วงอกสัมพันธ์กับการออกกำลังกายเช้าและการงดเปิดไลน์งานช่วงวันหยุด'
  ],
  summaryTh: 'ในสัปดาห์ที่ผ่านมา สุขภาพจิตของคุณมีความยืดหยุ่น (Resilience) อยู่ในเกณฑ์ดีมาก (78/100) แม้จะเจอกับมรสุมงานเร่งและการนอนน้อยช่วงกลางสัปดาห์ แต่คุณมีกลไกเยียวยาตัวเองที่ได้ผลดีเยี่ยมจากการออกกำลังกาย การสัมผัสธรรมชาติ และเวลาเงียบส่วนตัว',
  psychologicalAnalysisTh: 'พบรูปแบบ "Mid-Week Dip" ในช่วงวันพุธ-พฤหัสบดี เกิดจากแรงบีบคั้นของงาน ร่วมกับการสะสมกาเฟอีนเมื่อนอนน้อย ซึ่งส่งสัญญาณทางกายภาพออกมาทางอาการแน่นหน้าอกและเกร็งกราม อย่างไรก็ตาม ความเร็วในการฟื้นตัว (Emotional Recovery Speed) ทำได้รวดเร็วทันทีที่คุณก้าวเข้าสู่สภาพแวดล้อมธรรมชาติและตัดขาดจากไลน์งานในวันเสาร์',
  cbtExperimentsTh: [
    'ทดลองเทคนิค "Caffeine Cutoff": สัปดาห์นี้ให้หยุดดื่มกาแฟหลังเวลา 13:00 น. เพื่อรักษาระดับการนอนหลับสม่ำเสมอ',
    'ทดลองเทคนิค "Jaw & Shoulder Check": ตั้งนาฬิกาเตือนทุก 2 ชั่วโมงในวันทำงาน เพื่อเช็กว่ากำลังขบฟันหรือยกไหล่ตึงหรือไม่ แล้วทำการผ่อนคลาย 10 วินาที',
    'ทดลองเทคนิค "Micro-Break in Green": วันไหนที่มีประชุมยาว ให้ก้าวออกไปยืนรับแสงแดดหรือมองต้นไม้ 3 นาทีหลังจบประชุม'
  ],
  recommendedActionsTh: [
    'แชร์รายงานสัปดาห์นี้ไปยัง Google Sheets ของคุณ เพื่อเก็บบันทึกประวัติระยะยาว',
    'คงตารางเดินสวนและงดเช็กไลน์งานวันเสาร์ไว้ เพราะเป็นกันชนจิตวิทยาหลักของคุณ',
    'ปรับเป้าหมายเวลานอนเฉลี่ยให้อยู่ที่ 7.5 ชั่วโมงในวันธรรมดา'
  ]
};
