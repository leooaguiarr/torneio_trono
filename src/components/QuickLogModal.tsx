import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EFFORT_LEVELS, EffortLevel, LOCATIONS, LocationType, Participant, PoopEntry } from '../types';
import { formatToDateTimeLocal } from '../utils/dateUtils';
import { playFartSound, triggerHaptic } from '../utils/soundEffects';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId) {
      alert('Selecione quem foi ao banheiro!');
      return;
    }

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
      playFartSound(false, effortLevel);
    }

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const effortList = Object.values(EFFORT_LEVELS);
  const locationList = Object.values(LOCATIONS);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚽</span>
            <h2 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900">
              {editingEntry ? 'Editar Ida ao Trono' : 'Registrar Ida ao Trono'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Step 1: Who went? */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
              Quem foi ao banheiro?
            </label>

            {participants.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center space-y-1">
                <p className="text-xs text-stone-600 font-medium">Nenhum participante conectado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
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
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400/40 text-stone-950 font-black'
                          : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700 font-bold'
                      }`}
                    >
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs truncate flex-1">{p.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-800" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Effort (Optional quick emojis) */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
              Nível de Esforço
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {effortList.map((lvl) => {
                const isSelected = effortLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setEffortLevel(lvl.level);
                    }}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-amber-400'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{lvl.emoji}</span>
                    <span className="text-[10px] font-bold truncate max-w-full text-center px-0.5">
                      {lvl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Location */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
              Local
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {locationList.map((loc) => {
                const isSelected = location === loc.type;
                return (
                  <button
                    key={loc.type}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setLocation(loc.type);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-stone-950 font-bold ring-1 ring-amber-400'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-medium'
                    }`}
                  >
                    <div className="text-base mb-0.5">{loc.emoji}</div>
                    <div className="text-[11px] font-bold truncate">{loc.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Time (Defaults to now) */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1.5">
              Horário da Ida
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Step 5: Optional Funny Notes */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1.5">
              Comentário / Zoação (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: 'Quase quebrei a porcelana', 'No horário de trabalho'..."
              value={notes}
              maxLength={80}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{editingEntry ? 'Salvar Alterações' : 'Confirmar Ida no Placar! 🏆'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
