/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Search, 
  PenTool, 
  Lightbulb, 
  Globe, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  ExternalLink,
  Award,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QUESTIONS, AREAS, getCategory, getAreaFeedback } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'intro' | 'assessment' | 'results';

const SCALE_LABELS = [
  'ไม่เห็นด้วยอย่างยิ่ง (1)',
  'ไม่เห็นด้วย (2)',
  'ปานกลาง / ปานกลาง (3)',
  'เห็นด้วย (4)',
  'เห็นด้วยอย่างยิ่ง (5)'
];

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    if (!currentQuestion || isTransitioning) return;

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setIsTransitioning(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
      } else {
        setStep('results');
        setIsTransitioning(false);
      }
    }, 280);
  };

  const handleBack = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsTransitioning(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('intro');
    }
  };

  const resetAssessment = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsTransitioning(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('intro');
  };

  const resultsData = useMemo(() => {
    const areaScores: Record<string, number> = {};
    AREAS.forEach(area => {
      const areaQuestions = QUESTIONS.filter(q => q.area === area.id);
      const score = areaQuestions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
      areaScores[area.id] = score;
    });

    const totalScore = Object.values(areaScores).reduce((a, b) => a + b, 0);
    const maxScore = QUESTIONS.length * 5; // 30 * 5 = 150
    const percentage = Math.round((totalScore / maxScore) * 100);
    const category = getCategory(totalScore);

    const chartData = AREAS.map(area => ({
      subject: area.shortName || area.name,
      fullName: area.name,
      score: areaScores[area.id] || 0,
      fullMark: 25,
    }));

    return { areaScores, totalScore, maxScore, percentage, category, chartData };
  }, [answers]);

  const handleCopySummary = () => {
    const text = `📊 ผลการประเมินความพร้อมด้านดิจิทัล (Digital Literacy Readiness Assessment)\n` +
      `🏆 ระดับ: ${resultsData.category.level}\n` +
      `⭐ คะแนนรวม: ${resultsData.totalScore}/${resultsData.maxScore} (${resultsData.percentage}%)\n\n` +
      `คะแนนรายด้าน:\n` +
      AREAS.map(a => `• ${a.name}: ${resultsData.areaScores[a.id] || 0}/25`).join('\n') +
      `\n\nอ้างอิงกรอบแนวคิด DigComp 2.2 & DQ Institute`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans app-bg-overlay text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10 py-3.5 px-4 sm:px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-violet-500/20">
              D
            </div>
            <div>
              <h1 className="font-bold text-white text-sm sm:text-base leading-tight">Digital Literacy Readiness Assessment</h1>
              <p className="text-[11px] text-slate-400 hidden md:block">แบบประเมินความพร้อมด้านดิจิทัล (DigComp 2.2)</p>
            </div>
          </div>

          {step === 'assessment' && (
            <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-sm">
              <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-semibold text-violet-300 font-mono whitespace-nowrap bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                {currentQuestionIndex + 1} / {QUESTIONS.length}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hidden sm:block">
              มาตรฐาน DigComp 2.2
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl w-full bg-black/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-white/10 text-center relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-white/10 mb-6 shadow-inner">
                <Globe size={32} />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight">
                Discover Your Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 italic">Readiness</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto">
                แบบประเมินนี้จะช่วยวัดระดับความเชี่ยวชาญใน 6 ด้านสำคัญตามกรอบแนวคิด 
                <strong className="text-white font-semibold"> DigComp 2.2</strong> และ <strong className="text-white font-semibold">DQ Institute</strong> 
                เพื่อให้คุณเข้าใจจุดแข็งและรับแนวทางการพัฒนาทักษะดิจิทัลที่เหมาะสม
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-8">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors">
                  <div className="mt-0.5 p-2 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">30 ข้อคำถาม (6 ด้าน)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">ใช้เวลาประมาณ 5-7 นาทีในการทำ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-fuchsia-500/30 transition-colors">
                  <div className="mt-0.5 p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">ผลลัพธ์แบบภาพรวม (Radar Chart)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">รับรายงานคะแนนและคำแนะนำเฉพาะบุคคล</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <button 
                  onClick={() => setStep('assessment')}
                  className="w-full py-4 px-8 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 active:scale-[0.99] group cursor-pointer"
                >
                  เริ่มทำแบบประเมิน
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-400">
                  อ้างอิง: สถาบัน DQ Institute & กรอบมาตรฐานสหภาพยุโรป EU DigComp 2.2
                </p>
              </div>
            </motion.div>
          )}

          {step === 'assessment' && currentQuestion && (
            <motion.div 
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl w-full"
            >
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-white/10 mb-6 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400" />
                
                {/* Area Tag & Question */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    {AREAS.find(a => a.id === currentQuestion.area)?.name}
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white leading-relaxed sm:leading-snug">
                    {currentQuestion.text}
                  </h3>
                </div>

                {/* Likert Scale */}
                <div className="flex flex-col items-center gap-6 my-auto pt-4">
                  <div className="flex items-center justify-between w-full max-w-md px-3 text-xs font-semibold">
                    <span className="text-rose-400/90 uppercase tracking-tight text-left">ไม่เห็นด้วยอย่างยิ่ง</span>
                    <span className="text-cyan-400/90 uppercase tracking-tight text-right">เห็นด้วยอย่างยิ่ง</span>
                  </div>

                  <div className="flex items-center justify-between w-full max-w-md px-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = answers[currentQuestion.id] === val;
                      // 1 & 5: 48px, 2 & 4: 40px, 3: 32px
                      const size = 32 + (Math.abs(val - 3) * 8);
                      
                      const colorClass = val <= 2 
                        ? 'border-rose-500/40 hover:bg-rose-500/20 hover:border-rose-400 text-rose-300' 
                        : val === 3 
                        ? 'border-slate-500/40 hover:bg-slate-500/20 hover:border-slate-300 text-slate-300' 
                        : 'border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300';
                      
                      const activeClass = val <= 2 
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20 scale-110' 
                        : val === 3 
                        ? 'bg-slate-400 border-slate-300 text-slate-950 shadow-lg shadow-slate-500/40 ring-4 ring-slate-500/20 scale-110' 
                        : 'bg-cyan-400 border-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/40 ring-4 ring-cyan-400/20 scale-110';

                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={isTransitioning}
                          title={SCALE_LABELS[val - 1]}
                          aria-label={SCALE_LABELS[val - 1]}
                          onClick={() => handleAnswer(val)}
                          className={cn(
                            "rounded-full border-2 transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                            isSelected ? activeClass : colorClass,
                            isTransitioning ? "cursor-wait opacity-80" : ""
                          )}
                          style={{ width: size, height: size }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
                  <span>ข้อที่ {currentQuestionIndex + 1} จาก {QUESTIONS.length}</span>
                  <span className="text-violet-300 font-medium">
                    {AREAS.find(a => a.id === currentQuestion.area)?.shortName}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center px-3">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <ChevronLeft size={18} />
                  ย้อนกลับ
                </button>
                <div className="text-slate-400 font-mono text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  ความคืบหน้า: {Math.round(progress)}%
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl w-full space-y-8 pb-12"
            >
              {/* Summary Card */}
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
                
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    <Award size={16} className="text-violet-400" />
                    ประเมินเสร็จสมบูรณ์
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                    ระดับความพร้อม: <span className={resultsData.category.color}>{resultsData.category.level}</span>
                  </h2>

                  <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                    {resultsData.category.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-2xl">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">คะแนนรวมทั้งหมด</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {resultsData.totalScore} <span className="text-slate-400 text-sm font-normal">/ {resultsData.maxScore}</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-semibold">
                      {resultsData.percentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-10 pt-8 border-t border-white/10">
                  {/* Radar Chart */}
                  <div className="h-[320px] sm:h-[360px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={resultsData.chartData}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 25]} 
                          tick={{ fill: '#64748b', fontSize: 10 }} 
                          axisLine={false} 
                        />
                        <Radar
                          name="คะแนนของคุณ"
                          dataKey="score"
                          stroke="#a855f7"
                          fill="#8b5cf6"
                          fillOpacity={0.45}
                          isAnimationActive={true}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900/95 backdrop-blur-md p-3 shadow-2xl rounded-xl border border-white/15 text-left">
                                  <p className="font-semibold text-white text-xs mb-1">{data.fullName}</p>
                                  <p className="text-violet-400 font-bold text-sm font-mono">
                                    {data.score} <span className="text-slate-400 text-xs font-normal">/ 25 คะแนน</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Area Progress Breakdown */}
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white flex items-center gap-2 text-base">
                        <Lightbulb className="text-amber-400" size={20} />
                        สรุปคะแนนรายด้าน (6 ด้าน)
                      </h4>
                      <button
                        onClick={handleCopySummary}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="คัดลอกผลสรุป"
                      >
                        {copied ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-medium">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>คัดลอกผลลัพธ์</span>
                          </>
                        )}
                      </button>
                    </div>

                    {resultsData.chartData.map((data, idx) => (
                      <div key={idx} className="space-y-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="font-medium text-slate-200">{data.fullName}</span>
                          <span className="font-bold text-white font-mono">{data.score}/25</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.score / 25) * 100}%` }}
                            transition={{ 
                              duration: 0.8, 
                              delay: 0.2 + (idx * 0.1),
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Plan Cards */}
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6 text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                  แผนพัฒนาทักษะเฉพาะด้าน (Personalized Action Plan)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {AREAS.map((area, idx) => (
                    <motion.div 
                      key={area.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.08) }}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
                            {area.id === 'D1' && <Search size={20} />}
                            {area.id === 'D2' && <Users size={20} />}
                            {area.id === 'D3' && <PenTool size={20} />}
                            {area.id === 'D4' && <ShieldCheck size={20} />}
                            {area.id === 'D5' && <Lightbulb size={20} />}
                            {area.id === 'D6' && <Globe size={20} />}
                          </div>
                          <h5 className="font-bold text-white text-sm leading-snug">{area.name}</h5>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                          "{getAreaFeedback(area.id, resultsData.areaScores[area.id] || 0)}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">คะแนนที่ได้</span>
                        <div className={cn(
                          "font-bold font-mono px-2 py-0.5 rounded-md",
                          (resultsData.areaScores[area.id] || 0) >= 20 ? "text-emerald-300 bg-emerald-500/10" : 
                          (resultsData.areaScores[area.id] || 0) >= 12 ? "text-amber-300 bg-amber-500/10" : "text-rose-300 bg-rose-500/10"
                        )}>
                          {resultsData.areaScores[area.id] || 0} / 25
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer / References & Actions */}
              <div className="bg-black/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 text-white text-center border border-white/10 space-y-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">เรียนรู้และพัฒนาทักษะดิจิทัลอย่างต่อเนื่อง</h3>
                
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <a 
                    href="https://www.dqinstitute.org/dq-framework/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <BookOpen size={16} className="text-violet-400" />
                    กรอบแนวคิด DQ Institute
                    <ExternalLink size={14} className="opacity-50" />
                  </a>

                  <a 
                    href="https://joint-research-centre.ec.europa.eu/digcomp_en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Globe size={16} className="text-fuchsia-400" />
                    กรอบมาตรฐาน EU DigComp 2.2
                    <ExternalLink size={14} className="opacity-50" />
                  </a>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={resetAssessment}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold text-sm transition-all shadow-lg cursor-pointer"
                  >
                    <RotateCcw size={18} />
                    ทำแบบประเมินใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-5 px-4 text-center text-slate-500 text-xs border-t border-white/5 bg-black/50 backdrop-blur-md">
        <p>© {new Date().getFullYear()} Digital Literacy Readiness Assessment. อ้างอิงตามกรอบมาตรฐาน DigComp 2.2 และ DQ Institute.</p>
      </footer>
    </div>
  );
}

