import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, CheckCircle, Sparkles, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EFFORT_LEVELS, EffortLevel, LOCATIONS, LocationType, Participant, PoopEntry } from '../types';
import { formatToDateTimeLocal } from '../utils/dateUtils';
import { playFlushSound, playSuccessSound, playPopSound, triggerHaptic } from '../utils/soundEffects';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PoopEntry, 'id'>, existingId?: string) => void;
  participants: Participant[];
  initialParticipantId?: string;
  editingEntry?: PoopEntry | null;
  soundMuted: boolean;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  participants,
  initialParticipantId,
  editingEntry,
  soundMuted,
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    initialParticipantId || participants[0]?.id || ''
  );
  const [timestamp, setTimestamp] = useState<string>(formatToDateTimeLocal());
  const [effortLevel, setEffortLevel] = useState<EffortLevel>(3);
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(8);
  const [location, setLocation] = useState<LocationType>('casa');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingEntry) {
      setSelectedParticipantId(editingEntry.participantId);
      setTimestamp(formatToDateTimeLocal(new Date(editingEntry.timestamp)));
      setEffortLevel(editingEntry.effortLevel);
      setDurationMinutes(editingEntry.durationMinutes || 8);
      setLocation(editingEntry.location || 'casa');
      setNotes(editingEntry.notes || '');
    } else {
      setSelectedParticipantId(initialParticipantId || participants[0]?.id || '');
      setTimestamp(formatToDateTimeLocal());
      setEffortLevel(3);
      setDurationMinutes(8);
      setLocation('casa');
      setNotes('');
    }
  }, [editingEntry, initialParticipantId, isOpen, participants]);

  if (!isOpen) return null;

  const handleSetNow = () => {
    triggerHaptic(15);
    playPopSound(soundMuted);
    setTimestamp(formatToDateTimeLocal(new Date()));
  };

  const handleSelectParticipant = (id: string) => {
    triggerHaptic(15);
    playPopSound(soundMuted);
    setSelectedParticipantId(id);
  };

  const handleSelectEffort = (level: EffortLevel) => {
    triggerHaptic(20);
    playPopSound(soundMuted);
    setEffortLevel(level);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId) return;

    triggerHaptic([30, 40, 50]);

    // Convert local datetime input string to ISO
    const dateObj = new Date(timestamp);
    const isoString = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();

    onSave(
      {
        participantId: selectedParticipantId,
        timestamp: isoString,
        effortLevel,
        durationMinutes: durationMinutes && durationMinutes > 0 ? durationMinutes : undefined,
        location,
        notes: notes.trim() || undefined,
      },
      editingEntry?.id
    );

    // Audio & Confetti
    if (!soundMuted) {
      if (effortLevel >= 4) {
        playFlushSound(false);
      } else {
        playSuccessSound(false);
      }
    }

    try {
      confetti({
        particleCount: effortLevel >= 4 ? 80 : 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#d97706', '#10b981', '#6366f1', '#ec4899', '#FFD93D'],
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const selectedEffortInfo = EFFORT_LEVELS[effortLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-t-3 border-x-3 sm:border-3 border-stone-900 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="bg-[#FF6B6B] p-4 sm:p-5 text-white flex items-center justify-between border-b-3 border-stone-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🚽</span>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-black">
                {editingEntry ? 'Editar Ida ao Trono' : 'Registrar Ida ao Trono'}
              </h2>
              <p className="text-white/90 text-xs font-bold">
                {editingEntry ? 'Atualize os dados desta entrada' : 'Marque o momento, esforço e detalhes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white border-2 border-stone-900 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Participant Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-900 mb-2">
              Quem foi ao Trono?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {participants.map((p) => {
                const isSelected = p.id === selectedParticipantId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectParticipant(p.id)}
                    className={`min-h-[54px] p-2.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-stone-900 bg-[#FFD93D] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black scale-102'
                        : 'border-stone-900 bg-white hover:bg-stone-100 text-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                    }`}
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="font-black text-xs truncate max-w-full text-stone-950">{p.name}</span>
                    {isSelected && (
                      <span className="inline-block w-2 h-2 rounded-full bg-stone-950"></span>
                    )}
                  </button>
                );
              })}
            </div>
            {participants.length === 0 && (
              <p className="text-xs text-rose-700 font-bold mt-1">
                Nenhum participante cadastrado. Adicione amigos primeiro!
              </p>
            )}
          </div>

          {/* Exact Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-900" />
                Horário Exato
              </label>
              <button
                type="button"
                onClick={handleSetNow}
                className="text-xs font-black text-stone-950 bg-[#FFD93D] hover:bg-[#ffe270] px-2.5 py-1 rounded-lg border-2 border-stone-900 transition-colors cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Sparkles className="w-3 h-3 text-stone-950 stroke-[2.5]" />
                Agora mesmo
              </button>
            </div>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border-2 border-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FFD93D] text-stone-950 text-sm font-bold bg-stone-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              required
            />
          </div>

          {/* Effort Level (1 to 5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-900">
                Nível de Esforço ({effortLevel}/5)
              </label>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border-2 border-stone-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${selectedEffortInfo.color}`}>
                {selectedEffortInfo.emoji} {selectedEffortInfo.shortLabel}
              </span>
            </div>

            {/* 5-Step Button Selector */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {([1, 2, 3, 4, 5] as EffortLevel[]).map((level) => {
                const info = EFFORT_LEVELS[level];
                const isSelected = effortLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleSelectEffort(level)}
                    className={`min-h-[58px] py-2 px-1 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isSelected
                        ? `${info.badgeBg} text-white font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105 border-stone-900`
                        : 'bg-stone-50 border-stone-900 hover:bg-stone-100 text-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{info.emoji}</span>
                    <span className="text-[11px] font-black leading-tight">Nvl {level}</span>
                  </button>
                );
              })}
            </div>

            {/* Description box */}
            <div className="mt-2.5 p-3 rounded-xl bg-stone-100 border-2 border-stone-900 text-xs text-stone-900 flex items-start gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-base">{selectedEffortInfo.emoji}</span>
              <div>
                <p className="font-black text-stone-950">{selectedEffortInfo.label}</p>
                <p className="text-stone-700 font-bold mt-0.5">{selectedEffortInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Duration in minutes */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
              Duração Estimada (minutos)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[3, 5, 8, 12, 20, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setDurationMinutes(dur);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer min-h-[40px] ${
                    durationMinutes === dur
                      ? 'bg-[#FFD93D] text-stone-950 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-stone-900 text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {dur} min
                </button>
              ))}
              <div className="relative inline-flex items-center">
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Outro"
                  value={durationMinutes || ''}
                  onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-20 px-2 py-2 text-xs font-black text-stone-950 border-2 border-stone-900 rounded-xl bg-white focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
              Localização / Cenário
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(LOCATIONS) as LocationType[]).map((locKey) => {
                const locInfo = LOCATIONS[locKey];
                const isSelected = location === locKey;
                return (
                  <button
                    key={locKey}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setLocation(locKey);
                    }}
                    className={`p-2.5 rounded-xl text-left border-2 text-xs font-black transition-all flex items-center gap-2 cursor-pointer truncate min-h-[44px] ${
                      isSelected
                        ? 'bg-[#4D96FF] text-white border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-stone-900 text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span className="text-lg">{locInfo.emoji}</span>
                    <span className="truncate">{locInfo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-stone-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
              Notas ou Contexto (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Café da manhã bateu forte, pré-treino com aveia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={120}
              className="w-full px-3.5 py-3 rounded-xl border-2 border-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FFD93D] text-stone-950 text-sm placeholder:text-stone-400 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-semibold"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 pb-safe flex items-center justify-end gap-3 border-t-2 border-stone-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-xs font-black text-stone-800 hover:bg-stone-100 border-2 border-transparent hover:border-stone-900 transition-colors cursor-pointer min-h-[48px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedParticipantId}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <CheckCircle className="w-4 h-4 stroke-[2.5]" />
              {editingEntry ? 'Salvar Alterações' : 'Confirmar no Ranking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
