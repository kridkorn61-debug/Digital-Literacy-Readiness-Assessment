/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
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
  ExternalLink
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QUESTIONS, AREAS, getCategory, getAreaFeedback } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'intro' | 'assessment' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      setStep('results');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('intro');
    }
  };

  const resetAssessment = () => {
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
    const category = getCategory(totalScore);

    const chartData = AREAS.map(area => ({
      subject: area.name.substring(0, 10) + '...', // Short name for radar
      fullName: area.name,
      score: areaScores[area.id],
      fullMark: 25,
    }));

    return { areaScores, totalScore, category, chartData };
  }, [answers]);

  return (
    <div className="min-h-screen flex flex-col font-sans app-bg-overlay text-slate-100">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold">D</div>
            <h1 className="font-bold text-white hidden sm:block">Digital Literacy Readiness Assessment</h1>
          </div>
          {step === 'assessment' && (
            <div className="flex items-center gap-4 flex-1 max-w-xs ml-8">
              <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-violet-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                {currentQuestionIndex + 1} / {QUESTIONS.length}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider hidden md:block">กรอบแนวคิด DigComp 2.2</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 text-violet-400 mb-6">
                <Globe size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Discover Your Digital <span className="text-violet-400 italic">Readiness</span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                แบบประเมินนี้จะช่วยวัดระดับความเชี่ยวชาญใน 6 ด้านสำคัญตามกรอบแนวคิด 
                <strong> DigComp 2.2</strong> และ <strong>DQ Institute</strong> 
                เพื่อให้คุณเข้าใจจุดแข็งและรับแผนการพัฒนาส่วนบุคคล
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="mt-1 text-violet-400"><ShieldCheck size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">30 ข้อคำถาม</h4>
                    <p className="text-xs text-slate-400">ใช้เวลาประมาณ 5-7 นาทีในการทำ</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="mt-1 text-fuchsia-400"><BarChart3 size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">ผลลัพธ์แบบภาพ</h4>
                    <p className="text-xs text-slate-400">รับแผนภูมิใยแมงมุมแสดงทักษะของคุณ</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setStep('assessment')}
                  className="w-full py-4 px-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg group"
                >
                  เริ่มทำแบบประเมิน
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-500 italic">
                  อ้างอิง: DQ Institute & EU DigComp 2.2 Framework
                </p>
              </div>
            </motion.div>
          )}

          {step === 'assessment' && (
            <motion.div 
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl w-full"
            >
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 mb-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400" />
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest mb-4">
                    {AREAS.find(a => a.id === currentQuestion.area)?.name}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white leading-tight">
                    {currentQuestion.text}
                  </h3>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center justify-between w-full max-w-md px-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter text-center w-16">ไม่เห็นด้วยอย่างยิ่ง</span>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter text-center w-16">เห็นด้วยอย่างยิ่ง</span>
                  </div>

                  <div className="flex items-center justify-between w-full max-w-md">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = answers[currentQuestion.id] === val;
                      const size = 24 + (Math.abs(val - 3) * 8);
                      const colorClass = val <= 2 ? 'border-rose-500/30 hover:bg-rose-500/10' : 
                                       val === 3 ? 'border-slate-500/30 hover:bg-slate-500/10' : 
                                       'border-cyan-500/30 hover:bg-cyan-500/10';
                      const activeClass = val <= 2 ? 'bg-rose-500 border-rose-500 text-white' : 
                                        val === 3 ? 'bg-slate-500 border-slate-500 text-white' : 
                                        'bg-cyan-500 border-cyan-500 text-white';

                      return (
                        <button
                          key={val}
                          onClick={() => handleAnswer(val)}
                          className={cn(
                            "rounded-full border-2 transition-all flex items-center justify-center font-bold text-sm",
                            isSelected ? activeClass : colorClass
                          )}
                          style={{ width: size, height: size }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-4">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium transition-colors"
                >
                  <ChevronLeft size={20} />
                  ย้อนกลับ
                </button>
                <div className="text-slate-500 font-mono text-sm">
                  {Math.round(progress)}%
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl w-full space-y-8 pb-12"
            >
              {/* Summary Card */}
              <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 text-center">
                <div className="mb-6">
                  <span className={cn(
                    "inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4",
                    resultsData.category.bg,
                    resultsData.category.color
                  )}>
                    ประเมินเสร็จสมบูรณ์
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                    ระดับของคุณ: <span className={resultsData.category.color}>{resultsData.category.level}</span>
                  </h2>
                  <p className="text-slate-400 max-w-xl mx-auto text-lg">
                    {resultsData.category.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resultsData.chartData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 25]} tick={false} axisLine={false} />
                        <Radar
                          name="คะแนน"
                          dataKey="score"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.4}
                          isAnimationActive={true}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 p-3 shadow-2xl rounded-xl border border-white/10">
                                  <p className="font-bold text-white text-xs">{data.fullName}</p>
                                  <p className="text-violet-400 font-bold">{data.score} / 25</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4 text-left">
                    <h4 className="font-bold text-white flex items-center gap-2 mb-4">
                      <Lightbulb className="text-amber-400" size={20} />
                      สรุปคะแนนแต่ละด้าน
                    </h4>
                    {resultsData.chartData.map((data, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-300">{data.fullName}</span>
                          <span className="font-bold text-white">{data.score}/25</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.score / 25) * 100}%` }}
                            transition={{ 
                              duration: 1, 
                              delay: 0.5 + (idx * 0.1),
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AREAS.map((area, idx) => (
                  <motion.div 
                    key={area.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + (idx * 0.1) }}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                        {area.id === 'D1' && <Search size={20} />}
                        {area.id === 'D2' && <Users size={20} />}
                        {area.id === 'D3' && <PenTool size={20} />}
                        {area.id === 'D4' && <ShieldCheck size={20} />}
                        {area.id === 'D5' && <Lightbulb size={20} />}
                        {area.id === 'D6' && <Globe size={20} />}
                      </div>
                      <h5 className="font-bold text-white text-sm leading-tight">{area.name}</h5>
                    </div>
                    <p className="text-sm text-slate-400 flex-1 mb-4 italic">
                      "{getAreaFeedback(area.id, resultsData.areaScores[area.id])}"
                    </p>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">แผนการพัฒนา</span>
                      <div className={cn(
                        "text-xs font-bold",
                        resultsData.areaScores[area.id] >= 20 ? "text-emerald-400" : 
                        resultsData.areaScores[area.id] >= 12 ? "text-amber-400" : "text-rose-400"
                      )}>
                        {resultsData.areaScores[area.id]}/25
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer / References */}
              <div className="bg-black/80 backdrop-blur-2xl rounded-3xl p-8 md:p-12 text-white text-center border border-white/10">
                <h3 className="text-2xl font-serif font-bold mb-6">เรียนรู้และพัฒนาอย่างต่อเนื่อง</h3>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  <a 
                    href="https://www.dqinstitute.org/dq-framework/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <BookOpen size={16} />
                    กรอบแนวคิด DQ Institute
                    <ExternalLink size={14} className="opacity-50" />
                  </a>
                  <a 
                    href="https://joint-research-centre.ec.europa.eu/digcomp_en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <Globe size={16} />
                    EU DigComp 2.2
                    <ExternalLink size={14} className="opacity-50" />
                  </a>
                </div>
                
                <button 
                  onClick={resetAssessment}
                  className="inline-flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors"
                >
                  <RotateCcw size={20} />
                  ทำแบบประเมินอีกครั้ง
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 px-6 text-center text-slate-500 text-xs border-t border-white/5 bg-black/40 backdrop-blur-md">
        <p>© {new Date().getFullYear()} แบบประเมินความพร้อมด้านดิจิทัล อ้างอิงจาก DigComp 2.2 และ DQ Institute</p>
      </footer>
    </div>
  );
}
