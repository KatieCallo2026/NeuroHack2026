import React, { useState, useMemo, useEffect } from 'react';
import { 
  Droplets, 
  AlertCircle, 
  User, 
  TrendingUp, 
  Clock, 
  Zap, 
  Cpu,
  Settings,
  Activity,
  Plus,
  Moon,
  Thermometer,
  FileText,
  Send,
  Brain,
  ShieldAlert,
  BarChart3,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

const App = () => {
  // --- Static Mock Data (30 Days backward) ---
  const generateHistory = () => {
    const data: Record<string, any> = {};
    // Set "today" as April 21, 2026 (Tuesday)
    const today = new Date('2026-04-21');
    
    // Static seed data for consistent results
    const staticSeeds = [
      { sips: 11, flags: [9, 15], sleepHours: 7.5 },           // Tue Apr 21 (today)
      { sips: 12, flags: [8, 14, 19], sleepHours: 7.2 },       // Mon Apr 20
      { sips: 9, flags: [10, 16], sleepHours: 6.5 },           // Sun Apr 19
      { sips: 14, flags: [15], sleepHours: 8.1 },              // Sat Apr 18
      { sips: 11, flags: [9, 13, 18, 22], sleepHours: 6.0 },   // Fri Apr 17
      { sips: 13, flags: [7, 12, 17, 21], sleepHours: 8.5 },   // Thu Apr 16 - 4 flags
      { sips: 10, flags: [11, 17], sleepHours: 7.0 },          // Wed Apr 15
      { sips: 15, flags: [14], sleepHours: 7.8 },              // Tue Apr 14
      { sips: 8, flags: [7, 12, 15, 20], sleepHours: 5.5 },    // Mon Apr 13
      { sips: 12, flags: [16], sleepHours: 7.5 },              // Sun Apr 12
      { sips: 11, flags: [9, 14, 19], sleepHours: 6.8 },       // Sat Apr 11
      { sips: 13, flags: [13], sleepHours: 7.9 },              // Fri Apr 10
      { sips: 10, flags: [10, 15, 21], sleepHours: 6.2 },      // Thu Apr 9
      { sips: 14, flags: [], sleepHours: 8.3 },                // Wed Apr 8
      { sips: 9, flags: [8, 13, 18], sleepHours: 6.5 },        // Tue Apr 7
      { sips: 12, flags: [11, 16], sleepHours: 7.4 },          // Mon Apr 6
      { sips: 11, flags: [14, 19], sleepHours: 7.1 },          // Sun Apr 5
      { sips: 15, flags: [9], sleepHours: 8.0 },               // Sat Apr 4
      { sips: 10, flags: [12, 17, 22], sleepHours: 6.3 },      // Fri Apr 3
      { sips: 13, flags: [15], sleepHours: 7.6 },              // Thu Apr 2
      { sips: 12, flags: [10, 14], sleepHours: 7.2 },          // Wed Apr 1
      { sips: 14, flags: [], sleepHours: 8.4 },                // Tue Mar 31
      { sips: 9, flags: [8, 13, 18, 21], sleepHours: 5.8 },    // Mon Mar 30
      { sips: 11, flags: [16], sleepHours: 7.3 },              // Sun Mar 29
      { sips: 13, flags: [11, 15], sleepHours: 7.5 },          // Sat Mar 28
      { sips: 10, flags: [9, 14, 19], sleepHours: 6.4 },       // Fri Mar 27
      { sips: 12, flags: [13], sleepHours: 7.7 },              // Thu Mar 26
      { sips: 15, flags: [10], sleepHours: 8.2 },              // Wed Mar 25
      { sips: 11, flags: [12, 17], sleepHours: 6.9 },          // Tue Mar 24
      { sips: 14, flags: [14], sleepHours: 7.8 },              // Mon Mar 23
      { sips: 13, flags: [9, 16], sleepHours: 7.4 }            // Sun Mar 22
    ];
    
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const seed = staticSeeds[i % staticSeeds.length];

      const sleepQuality = Math.min(100, (seed.sleepHours * 10) + (10 - seed.flags.length * 2));

      data[dateStr] = {
        sips: seed.sips,
        flags: seed.flags,
        sleep: [{ id: Date.now() + i, val: seed.sleepHours, score: sleepQuality, time: '06:30' }],
        injuries: i % 5 === 0 ? [{ id: Date.now() * 2, text: 'Muscle fatigue', time: '18:00' }] : [],
        notes: dayOfWeek === 1 ? [{ id: Date.now() * 3, text: 'DUTY CYCLE INITIALIZED: All systems nominal for weekly rotation.', time: '08:00' }] : []
      };
    }
    return data;
  };

  // --- State ---
  const [history, setHistory] = useState(generateHistory());
  const [view, setView] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState('2026-04-21'); // Tuesday April 21, 2026
  const [isSyncing, setIsSyncing] = useState(true);
  const [calendarOffset, setCalendarOffset] = useState(0); 
  
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [noteBuffer, setNoteBuffer] = useState('');
  const [injuryBuffer, setInjuryBuffer] = useState('');
  const [sleepBuffer, setSleepBuffer] = useState(8);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Katie Callo',
    occupation: 'Neural Systems Architect',
    age: '22',
    gender: 'Female',
    clearance: 'Level 4'
  });

  const [profileBuffer, setProfileBuffer] = useState(profile);

  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const currentData = history[selectedDate] || { sips: 0, flags: [], sleep: [], injuries: [], notes: [] };

  // --- Analytics Calculations ---
  const insightsData = useMemo(() => {
    const fatigueByDate: any[] = [];
    const correlation: any[] = [];
    const sleepVsFlagging: any[] = [];

    // Sort dates to ensure chronological order for charts
    const sortedDates = Object.keys(history).sort();

    sortedDates.forEach((date) => {
      const data = history[date];
      
      const dateObj = new Date(date);
      const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      
      // Fatigue by date (for Neural Fatigue Distribution)
      fatigueByDate.push({
        date: formattedDate,
        fullDate: date,
        count: data.flags.length,
        timestamp: new Date(date).getTime()
      });
      
      correlation.push({
        date: formattedDate,
        fullDate: date,
        hydration: data.sips * 10,
        cognitive: (5 - data.flags.length) * 20, // Cognitive functioning (inverse of flags)
        flags: (5 - data.flags.length) * 20, // Keep for backward compatibility
        threshold: 60, // Suboptimal attention threshold line at 60
        timestamp: new Date(date).getTime()
      });

      // Sleep vs Flagging correlation
      if (data.sleep[0]) {
        sleepVsFlagging.push({
          date: formattedDate,
          fullDate: date,
          sleepHours: Number(data.sleep[0].val.toFixed(1)),
          flagCount: data.flags.length,
          timestamp: new Date(date).getTime()
        });
      }
    });

    return {
      fatigueByDate: fatigueByDate.slice(-30), // Last 30 days
      correlation: correlation.slice(-14),
      sleepVsFlagging: sleepVsFlagging.slice(-14) // Last 14 days for better visualization
    };
  }, [history]);

  const dashboardChart = useMemo(() => {
    return Object.entries(history)
      .map(([date, data]) => {
        const dateObj = new Date(date);
        return {
          date: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
          fullDate: date,
          sips: data.sips,
          flags: data.flags.length,
          ts: new Date(date).getTime()
        };
      })
      .filter(item => item.ts <= new Date().getTime())
      .sort((a, b) => a.ts - b.ts)
      .slice(-10);
  }, [history]);

  // Daily attention chart - shows sips taken throughout the day with flags
  const dailyAttentionChart = useMemo(() => {
    const sipCount = currentData.sips;
    const flagCount = currentData.flags.length;
    
    // Create array of sips - first flagCount sips are flagged, rest are optimal
    const sipsData = Array.from({ length: sipCount }, (_, index) => {
      // Distribute sips across waking hours (7am to 10pm = 15 hours)
      const hourSpacing = 15 / sipCount;
      const hour = 7 + Math.floor(index * hourSpacing);
      const minute = Math.floor((index * hourSpacing % 1) * 60);
      
      // First flagCount sips are flagged (distributed throughout the day)
      const isFlagged = index < flagCount || (index % Math.ceil(sipCount / Math.max(flagCount, 1))) === 0 && index / sipCount < flagCount / sipCount;
      // Better distribution: mark sips as flagged if their index falls within flag distribution
      const shouldFlag = flagCount > 0 && index % Math.ceil(sipCount / flagCount) === 0 && index < flagCount * Math.ceil(sipCount / flagCount);
      
      return {
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        hour: hour,
        sipNumber: index + 1,
        status: shouldFlag ? 'flagged' : 'optimal',
        value: 1,
        color: shouldFlag ? '#d946ef' : '#3b82f6' // Pink for flagged, blue for optimal
      };
    });
    
    // Ensure exactly flagCount bars are pink - mark first flagCount bars
    let flaggedCount = 0;
    const correctedData = sipsData.map((sip, index) => {
      if (flaggedCount < flagCount) {
        // Distribute flags evenly across all sips
        const shouldBeFlag = Math.floor((index * flagCount) / sipCount) > Math.floor(((index - 1) * flagCount) / sipCount);
        if (shouldBeFlag) {
          flaggedCount++;
          return { ...sip, status: 'flagged', color: '#d946ef' };
        }
      }
      return { ...sip, status: 'optimal', color: '#3b82f6' };
    });
    
    return correctedData;
  }, [currentData.sips, currentData.flags]);

  const updateHistoryData = (updates: any) => {
    setHistory(prev => ({
      ...prev,
      [selectedDate]: { ...prev[selectedDate], ...updates }
    }));
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const MiniCalendar = () => {
    const dates = [];
    const today = new Date('2026-04-21'); // Tuesday April 21, 2026
    // Only allow navigation to past or today
    for (let i = -6; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i + (calendarOffset * 7));
      if (d <= today) dates.push(d.toISOString().split('T')[0]);
    }

    return (
      <div className="flex items-center gap-4">
        <button onClick={() => setCalendarOffset(prev => prev - 1)} className="p-2 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition">
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-1 gap-5 justify-between overflow-x-auto py-2 no-scrollbar">
          {dates.map((dateStr) => {
            const d = new Date(dateStr);
            const active = selectedDate === dateStr;
            const isMon = d.getDay() === 1;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 w-16 h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform border hover:scale-110 ${
                  active 
                  ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)] scale-105 z-10' 
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500'
                } ${isMon ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <span className={`text-[10px] uppercase font-bold mb-1 ${isMon ? 'text-blue-400' : 'text-slate-400'}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-lg font-black ${active ? 'text-blue-400' : 'text-white'}`}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button 
          onClick={() => setCalendarOffset(prev => Math.min(0, prev + 1))}
          disabled={calendarOffset === 0}
          className="p-2 bg-slate-800/50 rounded-xl hover:bg-slate-700 transition disabled:opacity-20"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const ChevronLeft = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  );
  const ChevronRight = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-mono selection:bg-fuchsia-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800/50 backdrop-blur-md bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">NeuroHack <span className="text-blue-500">26</span></h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400'}`}>
              <TrendingUp size={18} /><span className="text-xs font-bold uppercase">Core</span>
            </button>
            <button onClick={() => setView('insights')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'insights' ? 'bg-fuchsia-600/20 text-fuchsia-400' : 'text-slate-400'}`}>
              <Cpu size={18} /><span className="text-xs font-bold uppercase">Insights</span>
            </button>
            <button onClick={() => setView('profile')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
              <User size={18} /><span className="text-xs font-bold uppercase">Profile</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {view === 'dashboard' && (
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <section className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Clock size={12} /> System History
                  </h3>
                  <MiniCalendar />
                </section>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50">
                    <Droplets className="absolute -right-4 -top-4 text-blue-500/10 group-hover:text-blue-500/20 transition-all duration-300" size={120} />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-400/30 px-2 py-0.5 rounded">Bio-Hydration</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white">{currentData.sips}</span>
                      <span className="text-slate-500 text-sm font-bold uppercase">Sips</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:border-fuchsia-500/50">
                    <AlertCircle className="absolute -right-4 -top-4 text-fuchsia-500/10 group-hover:text-fuchsia-500/20 transition-all duration-300" size={120} />
                    <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest border border-fuchsia-400/30 px-2 py-0.5 rounded">Suboptimal Attention Flags</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-6xl font-black text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">{currentData.flags.length}</span>
                      <span className="text-slate-500 text-sm font-bold uppercase">Events</span>
                    </div>
                  </div>
                </div>

                {/* Daily Attention Analysis */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(217,70,239,0.25)] hover:border-fuchsia-500/40">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-fuchsia-500/20 rounded-lg text-fuchsia-500"><Activity size={20} /></div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase italic">Daily Attention Analysis</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentData.sips} Sips | {currentData.flags.length} Flags - {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><span className="text-[8px] font-bold uppercase">Optimal</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-fuchsia-500"></div><span className="text-[8px] font-bold uppercase">Flagged</span></div>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyAttentionChart}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#475569" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[0, 1]}
                          ticks={[0, 1]}
                          tickFormatter={(value) => value === 1 ? 'Sip' : ''}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          formatter={(value: any, name: string, props: any) => [
                            props.payload.status === 'flagged' ? 'ATTENTION FLAGGED' : 'ATTENTION OPTIMAL',
                            `Sip #${props.payload.sipNumber}`
                          ]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]}
                          fill="#3b82f6"
                        >
                          {dailyAttentionChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Hydration-to-Cognitive Health Mapping - MOVED FROM INSIGHTS */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:border-blue-500/40">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><BarChart3 size={20} /></div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase italic">Hydration-to-Cognitive Health Mapping</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cross-system correlation tracking</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><span className="text-[8px] font-bold uppercase">Hydration</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-fuchsia-500"></div><span className="text-[8px] font-bold uppercase">Cognitive Functioning</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div><span className="text-[8px] font-bold uppercase">Attention Threshold</span></div>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insightsData.correlation}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line type="monotone" dataKey="hydration" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="cognitive" stroke="#d946ef" strokeWidth={3} dot={{ fill: '#d946ef', r: 4 }} activeDot={{ r: 6 }} />
                        <Line 
                          type="monotone" 
                          dataKey="threshold" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-6 space-y-6 backdrop-blur-xl">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Settings size={14} /> Local Modifiers
                  </h3>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Moon size={14} />
                        <span className="text-xs font-bold uppercase">Sleep Pulse</span>
                      </div>
                      <button onClick={() => setActiveEditor(activeEditor === 'sleep' ? null : 'sleep')} className="p-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/40 transition">
                        <Plus size={14} />
                      </button>
                    </div>
                    {activeEditor === 'sleep' && (
                      <div className="mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Hours:</span>
                          <span className="text-lg font-black text-blue-400">{sleepBuffer}h</span>
                        </div>
                        <input type="range" min="0" max="12" step="0.5" value={sleepBuffer} onChange={(e) => setSleepBuffer(Number(e.target.value))} className="w-full accent-blue-500" />
                        <button onClick={() => { 
                          const sleepScore = Math.min(100, (sleepBuffer * 10) + 20);
                          updateHistoryData({ sleep: [{id: Date.now(), val: sleepBuffer, score: sleepScore, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] }); 
                          setActiveEditor(null);
                        }} className="w-full py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition">Commit {sleepBuffer}h</button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {currentData.sleep.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-2">No sleep data logged</p>
                      ) : (
                        currentData.sleep.map((s: any) => (
                          <div key={s.id} className="flex justify-between p-2 bg-slate-900/50 rounded-lg text-[10px]">
                            <span className="text-blue-400 font-black">{s.val.toFixed(1)} HR</span>
                            <span className="text-slate-500">SCORE: {Math.round(s.score || 0)}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Thermometer size={14} />
                        <span className="text-xs font-bold uppercase">Injury Log</span>
                      </div>
                      <button onClick={() => setActiveEditor(activeEditor === 'injury' ? null : 'injury')} className="p-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/40 transition">
                        <Plus size={14} />
                      </button>
                    </div>
                    {activeEditor === 'injury' && (
                      <div className="mb-4 flex gap-2">
                        <input value={injuryBuffer} onChange={e => setInjuryBuffer(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md p-2 text-xs flex-1" placeholder="Describe issue..." />
                        <button onClick={() => { updateHistoryData({ injuries: [...currentData.injuries, {id: Date.now(), text: injuryBuffer, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] }); setInjuryBuffer(''); setActiveEditor(null); }} className="bg-blue-600 px-3 rounded-md hover:bg-blue-500 transition"><Send size={14} /></button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {currentData.injuries.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-2">No injuries logged</p>
                      ) : (
                        currentData.injuries.map((i: any) => (
                          <div key={i.id} className="p-2 bg-slate-900/50 rounded-lg text-[10px] flex justify-between">
                            <span className="uppercase font-bold text-fuchsia-400">{i.text}</span>
                            <span className="text-slate-600">{i.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                    <div className="flex items-center gap-2 text-slate-300 mb-4">
                      <FileText size={14} />
                      <span className="text-xs font-bold uppercase">System Notes</span>
                    </div>
                    <textarea value={noteBuffer} onChange={e => setNoteBuffer(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs h-20 outline-none" placeholder="Log system state..." />
                    <button onClick={() => { updateHistoryData({ notes: [...currentData.notes, {id: Date.now(), text: noteBuffer, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] }); setNoteBuffer(''); }} className="w-full mt-2 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600/40 transition">Sync Note</button>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Clock size={14} /> Performance Indicators
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <ShieldAlert className="text-blue-400" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase">Current Outlook</p>
                        <p className="text-xs text-white font-bold uppercase">Stable Operations</p>
                      </div>
                    </div>
                    <div className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:bg-fuchsia-500/10 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                      <Zap className="text-fuchsia-400" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-fuchsia-400 uppercase">Alert Threshold</p>
                        <p className="text-xs text-white font-bold uppercase">18:00 - 20:00 Window</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:bg-slate-800/60 hover:shadow-[0_0_20px_rgba(100,116,139,0.3)]">
                      <Droplets className="text-slate-400" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Target Intake</p>
                        <p className="text-xs text-white font-bold uppercase">14 Sips/Day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'insights' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sleep vs Flagging Correlation Chart */}
                <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] hover:border-blue-500/50">
                   <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                   <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Moon size={14} /> Sleep vs Cognitive Flagging
                   </h3>
                   <p className="text-[9px] text-slate-400 mb-6">14-Day Correlation Analysis</p>
                   
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={insightsData.sleepVsFlagging}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                         <XAxis 
                           dataKey="date" 
                           stroke="#475569" 
                           fontSize={8} 
                           tickLine={false} 
                           axisLine={false}
                           angle={-45}
                           textAnchor="end"
                           height={50}
                         />
                         <YAxis yAxisId="left" stroke="#3b82f6" fontSize={8} tickLine={false} axisLine={false} label={{ value: 'Sleep (hrs)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#3b82f6' } }} />
                         <YAxis yAxisId="right" orientation="right" stroke="#d946ef" fontSize={8} tickLine={false} axisLine={false} label={{ value: 'Flags', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#d946ef' } }} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                           labelFormatter={(value) => {
                             const item = insightsData.sleepVsFlagging.find((d: any) => d.date === value);
                             return item?.fullDate || value;
                           }}
                         />
                         <Line yAxisId="left" type="monotone" dataKey="sleepHours" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Sleep Hours" />
                         <Line yAxisId="right" type="monotone" dataKey="flagCount" stroke="#d946ef" strokeWidth={3} dot={{ fill: '#d946ef', r: 4 }} name="Flag Count" />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>

                   <div className="mt-6 space-y-2">
                     <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                         <span className="text-[9px] font-bold text-slate-300 uppercase">Sleep Hours</span>
                       </div>
                       <span className="text-[9px] text-blue-400 font-black">Target: 7-9h</span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-fuchsia-500/10 rounded-lg">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
                         <span className="text-[9px] font-bold text-slate-300 uppercase">Cognitive Flags</span>
                       </div>
                       <span className="text-[9px] text-fuchsia-400 font-black">Lower = Better</span>
                     </div>
                   </div>
                </div>

                {/* Fatigue Peak Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(217,70,239,0.25)] hover:border-fuchsia-500/40">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-fuchsia-500/20 rounded-lg text-fuchsia-500"><Brain size={20} /></div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase italic">Neural Fatigue Distribution</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">30-Day Historical Flag Concentration</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insightsData.fatigueByDate}>
                        <XAxis 
                          dataKey="date" 
                          stroke="#475569" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <Tooltip 
                          cursor={{ fill: '#1e293b' }} 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          labelFormatter={(label) => `Date: ${label}`}
                          formatter={(value: any) => [`${value} flags`, 'Count']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {insightsData.fatigueByDate.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.count > 3 ? '#d946ef' : '#334155'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Hydration Mapping - MOVED FROM DASHBOARD */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:border-blue-500/30">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-400 flex items-center gap-2">
                  <Activity size={16} /> Hydration Mapping
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardChart}>
                      <defs>
                        <linearGradient id="colorSips" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        labelFormatter={(value) => {
                          const item = dashboardChart.find((d: any) => d.date === value);
                          return item?.fullDate || value;
                        }}
                      />
                      <Area type="monotone" dataKey="sips" stroke="#3b82f6" fill="url(#colorSips)" strokeWidth={3} />
                      <Line type="monotone" dataKey="flags" stroke="#d946ef" strokeWidth={3} dot={{ fill: '#d946ef' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-[3rem] shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(59,130,246,0.4)]">
                <div className="bg-[#0f172a] rounded-[2.9rem] p-12 relative">
                  {/* Edit Toggle Button */}
                  <button 
                    onClick={() => {
                      if (isEditingProfile) {
                        setProfileBuffer(profile); // Reset buffer if canceling
                      }
                      setIsEditingProfile(!isEditingProfile);
                    }}
                    className="absolute top-8 right-8 p-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/40 transition-all duration-300 hover:scale-110"
                  >
                    {isEditingProfile ? <X size={20} /> : <Edit2 size={20} />}
                  </button>

                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-blue-500/10 rounded-full border-4 border-blue-500/50 flex items-center justify-center mb-8 relative transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/20">
                      <User size={64} className="text-blue-400" />
                      <div className="absolute -bottom-2 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0f172a] animate-pulse"></div>
                    </div>
                    
                    {!isEditingProfile ? (
                      <>
                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{profile.name}</h2>
                        <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.4em] mt-2">{profile.occupation}</p>
                        
                        <div className="grid grid-cols-2 gap-8 w-full mt-12 border-t border-slate-800 pt-12">
                          {Object.entries(profile).map(([key, val]) => (
                            <div key={key} className="transition-all duration-300 hover:scale-110">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{key}</label>
                              <p className="text-lg font-bold text-slate-200 mt-1 uppercase">{val}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full space-y-6">
                          <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-blue-400 uppercase tracking-wider">Edit Profile</h3>
                            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Update System Identity</p>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            {Object.entries(profileBuffer).map(([key, val]) => (
                              <div key={key} className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                  {key}
                                </label>
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => setProfileBuffer({...profileBuffer, [key]: e.target.value})}
                                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white font-bold text-lg uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                  placeholder={`Enter ${key}`}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4 mt-8 pt-8 border-t border-slate-800">
                            <button
                              onClick={() => {
                                setProfileBuffer(profile);
                                setIsEditingProfile(false);
                              }}
                              className="flex-1 py-3 px-6 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all duration-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setProfile(profileBuffer);
                                setIsEditingProfile(false);
                              }}
                              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Save size={16} />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
