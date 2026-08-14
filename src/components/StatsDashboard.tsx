import React from 'react';
import { BarChart3, Clock, Flame, MapPin, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { EFFORT_LEVELS, LOCATIONS, Participant, PoopEntry, Timeframe } from '../types';
import { getTimeframeLabel, isWithinTimeframe } from '../utils/dateUtils';

interface StatsDashboardProps {
  entries: PoopEntry[];
  participants: Participant[];
  timeframe: Timeframe;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  entries,
  participants,
  timeframe,
}) => {
  const timeframeLabel = getTimeframeLabel(timeframe);
  const filteredEntries = entries.filter((e) => isWithinTimeframe(e.timestamp, timeframe));

  // Compute metrics
  const totalCount = filteredEntries.length;
  const totalEffort = filteredEntries.reduce((acc, e) => acc + e.effortLevel, 0);
  const avgEffort = totalCount > 0 ? (totalEffort / totalCount).toFixed(1) : '0.0';

  const totalMinutes = filteredEntries.reduce((acc, e) => acc + (e.durationMinutes || 8), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Time-of-day buckets
  const timeBuckets = {
    madrugada: 0, // 00h - 06h
    manha: 0,     // 06h - 12h
    tarde: 0,     // 12h - 18h
    noite: 0,     // 18h - 00h
  };

  filteredEntries.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    if (hour >= 0 && hour < 6) timeBuckets.madrugada += 1;
    else if (hour >= 6 && hour < 12) timeBuckets.manha += 1;
    else if (hour >= 12 && hour < 18) timeBuckets.tarde += 1;
    else timeBuckets.noite += 1;
  });

  // Effort buckets
  const effortBuckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  filteredEntries.forEach((e) => {
    effortBuckets[e.effortLevel] = (effortBuckets[e.effortLevel] || 0) + 1;
  });

  // Location counts
  const locationCounts: Record<string, number> = {};
  filteredEntries.forEach((e) => {
    const loc = e.location || 'casa';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  // Per participant counts
  const participantCounts = participants.map((p) => {
    const count = filteredEntries.filter((e) => e.participantId === p.id).length;
    return {
      participant: p,
      count,
      pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  const maxParticipantCount = Math.max(1, ...participantCounts.map((p) => p.count));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['Outfit',sans-serif] font-black text-xl text-stone-950 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-stone-900 stroke-[2.5]" />
              Estatísticas & Raio-X da Liga
            </h3>
            <p className="text-xs text-stone-700 font-bold mt-0.5">
              Análise detalhada de volume, horários de pico e esforço ({timeframeLabel.title})
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Group Poops */}
        <div className="bg-[#FFD93D] p-4 sm:p-5 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-stone-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900">Total do Grupo</span>
            <span className="text-2xl">🚽</span>
          </div>
          <p className="font-['Outfit',sans-serif] text-3xl font-black text-stone-950">
            {totalCount}
          </p>
          <p className="text-[11px] text-stone-900 font-bold mt-1">
            {timeframeLabel.subtitle}
          </p>
        </div>

        {/* Avg Effort */}
        <div className="bg-[#FF6B6B] p-4 sm:p-5 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/90">Esforço Médio</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="font-['Outfit',sans-serif] text-3xl font-black text-white">
            {avgEffort} <span className="text-base text-white/70 font-black">/ 5</span>
          </p>
          <p className="text-[11px] text-white/90 font-bold mt-1">
            Índice de intensidade coletiva
          </p>
        </div>

        {/* Total Time on Throne */}
        <div className="bg-[#4D96FF] p-4 sm:p-5 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white/90">Tempo no Trono</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="font-['Outfit',sans-serif] text-3xl font-black text-white">
            ~{totalHours}h
          </p>
          <p className="text-[11px] text-white/90 font-bold mt-1">
            {totalMinutes} min acumulados
          </p>
        </div>

        {/* Peak Hour */}
        <div className="bg-[#6BCB77] p-4 sm:p-5 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-stone-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900">Horário Nobre</span>
            <span className="text-2xl">☀️</span>
          </div>
          <p className="font-['Outfit',sans-serif] text-xl sm:text-2xl font-black text-stone-950">
            {timeBuckets.manha >= timeBuckets.tarde && timeBuckets.manha >= timeBuckets.noite
              ? 'Manhã (06h-12h)'
              : timeBuckets.tarde >= timeBuckets.noite
              ? 'Tarde (12h-18h)'
              : 'Noite (18h-00h)'}
          </p>
          <p className="text-[11px] text-stone-900 font-bold mt-1">
            Maior pico de atividade
          </p>
        </div>
      </div>

      {/* Two Columns: Comparative Bar Chart & Effort Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comparative by Participant */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-['Outfit',sans-serif] font-black text-base text-stone-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-900 stroke-[2.5]" />
              Comparativo de Volume por Amigo
            </h4>
            <span className="text-xs font-bold text-stone-600">% da liga</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {participantCounts.map((item) => (
              <div key={item.participant.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="flex items-center gap-1.5 text-stone-950">
                    <span>{item.participant.avatar}</span>
                    <span>{item.participant.name}</span>
                  </span>
                  <span className="text-stone-700">
                    <strong className="text-stone-950">{item.count}</strong> idas ({item.pct}%)
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-900">
                  <div
                    className="h-full rounded-full bg-[#FFD93D] transition-all duration-500"
                    style={{ width: `${(item.count / maxParticipantCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Effort Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-['Outfit',sans-serif] font-black text-base text-stone-950 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF6B6B] stroke-[2.5]" />
              Distribuição por Nível de Esforço
            </h4>
            <span className="text-xs font-bold text-stone-600">1 a 5</span>
          </div>

          <div className="space-y-3 pt-2">
            {([1, 2, 3, 4, 5] as (1 | 2 | 3 | 4 | 5)[]).map((level) => {
              const info = EFFORT_LEVELS[level];
              const count = effortBuckets[level] || 0;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-1.5 text-stone-950">
                      <span>{info.emoji}</span>
                      <span>Nível {level} - {info.shortLabel}</span>
                    </span>
                    <span className="text-stone-700 font-extrabold">
                      {count}x ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-900">
                    <div
                      className={`h-full rounded-full ${info.badgeBg} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly and Location Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time of Day */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h4 className="font-['Outfit',sans-serif] font-black text-base text-stone-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4D96FF] stroke-[2.5]" />
            Divisão por Turno do Dia
          </h4>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#FFD93D]/30 border-2 border-stone-900 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">🌅</span>
              <p className="font-black text-xs text-stone-950 mt-1">Manhã (06h-12h)</p>
              <p className="font-['Outfit',sans-serif] font-black text-2xl text-stone-950 mt-0.5">
                {timeBuckets.manha}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FF6B6B]/20 border-2 border-stone-900 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">☀️</span>
              <p className="font-black text-xs text-stone-950 mt-1">Tarde (12h-18h)</p>
              <p className="font-['Outfit',sans-serif] font-black text-2xl text-stone-950 mt-0.5">
                {timeBuckets.tarde}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#4D96FF]/20 border-2 border-stone-900 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">🌙</span>
              <p className="font-black text-xs text-stone-950 mt-1">Noite (18h-00h)</p>
              <p className="font-['Outfit',sans-serif] font-black text-2xl text-stone-950 mt-0.5">
                {timeBuckets.noite}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-100 border-2 border-stone-900 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl">🦉</span>
              <p className="font-black text-xs text-stone-950 mt-1">Madrugada (00h-06h)</p>
              <p className="font-['Outfit',sans-serif] font-black text-2xl text-stone-950 mt-0.5">
                {timeBuckets.madrugada}
              </p>
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h4 className="font-['Outfit',sans-serif] font-black text-base text-stone-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#6BCB77] stroke-[2.5]" />
            Locais Mais Frequentes
          </h4>

          <div className="space-y-2.5 pt-1">
            {Object.keys(LOCATIONS).map((locKey) => {
              const loc = LOCATIONS[locKey as keyof typeof LOCATIONS];
              const count = locationCounts[locKey] || 0;
              if (count === 0) return null;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

              return (
                <div key={locKey} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border-2 border-stone-900 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black text-stone-950 flex items-center gap-2">
                    <span>{loc.emoji}</span>
                    <span>{loc.label}</span>
                  </span>
                  <span className="font-black text-stone-950 bg-[#FFD93D] px-2 py-0.5 rounded-md border border-stone-900">
                    {count}x ({pct}%)
                  </span>
                </div>
              );
            })}
            {Object.keys(locationCounts).length === 0 && (
              <p className="text-xs text-stone-500 italic text-center py-6">
                Nenhum local registrado ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
