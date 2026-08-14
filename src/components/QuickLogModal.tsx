import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, CheckCircle, Sparkles, Plus } from 'lucide-react';
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
  const [location, setLocation] = useState<LocationType>('casa');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingEntry) {
      setSelectedParticipantId(editingEntry.participantId);
      setTimestamp(formatToDateTimeLocal(new Date(editingEntry.timestamp)));
      setEffortLevel(editingEntry.effortLevel);
      setLocation(editingEntry.location || 'casa');
      setNotes(editingEntry.notes || '');
    } else {
      setSelectedParticipantId(initialParticipantId || participants[0]?.id || '');
      setTimestamp(formatToDateTimeLocal());
      setEffortLevel(3);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId) return;

    triggerHaptic(30);

    const dateObj = new Date(timestamp);
    const isoString = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();

    onSave(
      {
        participantId: selectedParticipantId,
        timestamp: isoString,
        effortLevel,
        location,
        notes: notes.trim() || undefined,
      },
      editingEntry?.id
    );

    if (!soundMuted) {
      playSuccessSound(false);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-t-3 border-x-3 sm:border-3 border-stone-900 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#FFD93D] p-4 text-stone-950 flex items-center justify-between border-b-3 border-stone-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚽</span>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-lg font-black text-stone-950">
                {editingEntry ? 'Editar Ida ao Trono' : 'Registrar Ida ao Trono'}
              </h2>
              <p className="text-stone-800 text-xs font-bold">
                {editingEntry ? 'Modifique os detalhes da visita' : 'Quem foi ao banheiro e como foi?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-900 transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Select Friend */}
          <div>
            <label className="block text-xs font-black text-stone-950 uppercase tracking-wider mb-1.5">
              1. Quem pontuou? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => {
                const isSelected = selectedParticipantId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedParticipantId(p.id);
                    }}
                    className={`p-2.5 rounded-xl border-2 font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD93D] border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-[1.02]'
                        : 'bg-white border-stone-300 hover:border-stone-900 text-stone-800'
                    }`}
                  >
                    <span className="text-lg">{p.avatar}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Effort Level */}
          <div>
            <label className="block text-xs font-black text-stone-950 uppercase tracking-wider mb-1.5">
              2. Nível de Esforço (1 a 5)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as EffortLevel[]).map((level) => {
                const isSelected = effortLevel === level;
                const info = EFFORT_LEVELS[level];
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setEffortLevel(level);
                    }}
                    className={`py-2 px-1 rounded-xl border-2 font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF6B6B] text-white border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105'
                        : 'bg-stone-50 border-stone-300 hover:border-stone-900 text-stone-800'
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span className="text-[10px] font-black">{level}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-600 font-bold text-center mt-1">
              {EFFORT_LEVELS[effortLevel].label} — {EFFORT_LEVELS[effortLevel].description}
            </p>
          </div>

          {/* Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-stone-950 uppercase tracking-wider">
                3. Horário
              </label>
              <button
                type="button"
                onClick={handleSetNow}
                className="text-[11px] font-black text-[#4D96FF] hover:underline cursor-pointer"
              >
                Agora mesmo ⚡
              </button>
            </div>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              required
            />
          </div>

          {/* Location & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-black text-stone-950 uppercase tracking-wider mb-1">
                Local
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationType)}
                className="w-full px-3 py-2 text-xs font-black rounded-xl border-2 border-stone-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                {Object.values(LOCATIONS).map((loc) => (
                  <option key={loc.type} value={loc.type}>
                    {loc.emoji} {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-950 uppercase tracking-wider mb-1">
                Nota Rápida (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Café bateu forte"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-black text-sm bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{editingEntry ? 'Salvar Alterações' : 'Confirmar Ida ao Trono 🚽'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
