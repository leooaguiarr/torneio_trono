import { EffortLevel, LocationType, Participant, ParticipantRankingStats, PoopEntry, Timeframe } from '../types';
import { isWithinTimeframe } from './dateUtils';
import { getLocationRoast, getDeterministicFunnyNickname } from './funnyTitles';

export function computeRankings(
  participants: Participant[],
  entries: PoopEntry[],
  timeframe: Timeframe,
  referenceDate: Date = new Date()
): ParticipantRankingStats[] {
  // Filter entries in timeframe
  const filteredEntries = entries.filter((e) => isWithinTimeframe(e.timestamp, timeframe, referenceDate));

  // Compute stats per participant
  const statsList: ParticipantRankingStats[] = participants.map((p) => {
    const pEntries = filteredEntries.filter((e) => e.participantId === p.id);
    const totalCount = pEntries.length;

    let totalEffort = 0;
    let totalDuration = 0;
    let durationCount = 0;
    let hardestCount = 0;
    let fastestCount = 0;

    const effortBreakdown: Record<EffortLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const locationBreakdown: Record<LocationType, number> = {
      casa: 0,
      trabalho: 0,
      academia: 0,
      role: 0,
      viagem: 0,
      publico: 0,
      outro: 0,
    };

    const daysSet = new Set<string>();

    pEntries.forEach((e) => {
      totalEffort += e.effortLevel;
      effortBreakdown[e.effortLevel] = (effortBreakdown[e.effortLevel] || 0) + 1;

      if (e.location) {
        locationBreakdown[e.location] = (locationBreakdown[e.location] || 0) + 1;
      }

      if (e.durationMinutes && e.durationMinutes > 0) {
        totalDuration += e.durationMinutes;
        durationCount += 1;
      }

      if (e.effortLevel >= 4) {
        hardestCount += 1;
      }
      if (e.effortLevel === 1) {
        fastestCount += 1;
      }

      const dateStr = new Date(e.timestamp).toDateString();
      daysSet.add(dateStr);
    });

    const avgEffort = totalCount > 0 ? Number((totalEffort / totalCount).toFixed(1)) : 0;
    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    const daysActive = daysSet.size;

    // Approximate days in timeframe
    let timeframeDaySpan = 7;
    if (timeframe === 'this_month' || timeframe === 'last_month') {
      timeframeDaySpan = 30;
    } else if (timeframe === 'all_time') {
      timeframeDaySpan = Math.max(1, daysActive || 1);
    }
    const dailyAverage = Number((totalCount / Math.max(1, Math.min(timeframeDaySpan, 7))).toFixed(1));

    return {
      participant: p,
      totalCount,
      avgEffort,
      totalEffortScore: totalEffort,
      avgDuration,
      dailyAverage,
      effortBreakdown,
      locationBreakdown,
      daysActive,
      rank: 0,
      hardestEntryCount: hardestCount,
      fastestEntryCount: fastestCount,
      titles: [],
    };
  });

  // Sort primarily by totalCount desc, then by totalEffortScore desc
  statsList.sort((a, b) => {
    if (b.totalCount !== a.totalCount) {
      return b.totalCount - a.totalCount;
    }
    return b.totalEffortScore - a.totalEffortScore;
  });

  // Assign ranks
  statsList.forEach((stat, idx) => {
    stat.rank = idx + 1;
  });

  // Assign fun titles/badges
  if (statsList.length > 0) {
    const maxCount = Math.max(...statsList.map((s) => s.totalCount));
    if (maxCount > 0) {
      statsList.forEach((s) => {
        if (s.totalCount === maxCount) {
          s.titles.push('👑 Rei do Trono');
        }
      });
    }

    // Most hardest entries (effort 4 or 5)
    const maxHardest = Math.max(...statsList.map((s) => s.hardestEntryCount));
    if (maxHardest > 1) {
      const warrior = statsList.find((s) => s.hardestEntryCount === maxHardest);
      if (warrior && !warrior.titles.includes('👑 Rei do Trono')) {
        warrior.titles.push('🌋 Sobrevivente do Ano');
      }
    }

    // Fastest / Effort 1 champion
    const maxFast = Math.max(...statsList.map((s) => s.fastestEntryCount));
    if (maxFast > 1) {
      const speedster = statsList.find((s) => s.fastestEntryCount === maxFast);
      if (speedster && !speedster.titles.includes('👑 Rei do Trono')) {
        speedster.titles.push('⚡ Relâmpago McQueen');
      }
    }

    // Work bathroom champion
    let maxWorkCount = 0;
    let workChamp: ParticipantRankingStats | null = null;
    statsList.forEach((s) => {
      const workCount = s.locationBreakdown.trabalho || 0;
      if (workCount > maxWorkCount && workCount >= 2) {
        maxWorkCount = workCount;
        workChamp = s;
      }
    });
    if (workChamp) {
      (workChamp as ParticipantRankingStats).titles.push('💼 Cagada Remunerada');
    }
  }

  return statsList;
}

export function generateWhatsAppSummary(
  stats: ParticipantRankingStats[],
  timeframeLabel: { title: string; subtitle: string }
): string {
  if (stats.length === 0) {
    return 'Nenhum registro ainda no Torneio do Trono! 🚽';
  }

  const medals = ['🥇', '🥈', '🥉'];
  let message = `🚽👑 *TORNEIO DO TRONO - PLACAR DOS CAGÕES* 👑🚽\n`;
  message += `📅 *${timeframeLabel.title}* (${timeframeLabel.subtitle})\n\n`;
  message += `*CLASSIFICAÇÃO GERAL:*\n`;

  stats.forEach((s, idx) => {
    const medal = idx < 3 ? medals[idx] : `*${idx + 1}º*`;
    const nickname = s.participant.nickname || getDeterministicFunnyNickname(s.participant.id);
    const roastInfo = getLocationRoast(s.locationBreakdown, s.totalCount);

    message += `${medal} *"${nickname}"* - ${s.participant.name}: ${s.totalCount} idas\n`;
    message += `   ↳ ${roastInfo.emoji} ${roastInfo.roast}\n`;
  });

  const leader = stats[0];
  if (leader && leader.totalCount > 0) {
    message += `\n👑 *Dono do Trono Atual:* ${leader.participant.name} com ${leader.totalCount} idas!\n`;
  }

  message += `\n_Acesse o app e registre sua ida agora! 💩🚀_`;
  return message;
}
