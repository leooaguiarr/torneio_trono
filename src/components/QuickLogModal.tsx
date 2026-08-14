import React, { useState, useEffect } from 'react';
import { X, Check, UserPlus, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EFFORT_LEVELS, EffortLevel, LOCATIONS, LocationType, Participant, PoopEntry } from '../types';
import { formatToDateTimeLocal } from '../utils/dateUtils';
import { playSuccessSound, triggerHaptic } from '../utils/soundEffects';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PoopEntry, 'id'>, existingId?: string) => void;
  participants: Participant[];
  initialParticipantId?: string;
  editingEntry?: PoopEntry | null;
  soundMuted: boolean;
  onOpenAddParticipant: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  participants,
  initialParticipantId,
  editingEntry,
  soundMuted,
  onOpenAddParticipant,
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
      alert('Selecione ou adicione quem foi ao banheiro!');
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
      playSuccessSound(false);
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
              <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center space-y-2">
                <p className="text-xs text-stone-600 font-medium">Nenhum participante ainda!</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddParticipant();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 font-black text-xs text-stone-950 inline-flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Primeiro Nome</span>
                </button>
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

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddParticipant();
                  }}
                  className="p-2.5 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Outro amigo</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Effort (Optional quick emojis) */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
              Nível de Esforço
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as EffortLevel[]).map((lvl) => {
                const isSelected = effortLevel === lvl;
                const info = EFFORT_LEVELS[lvl];
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setEffortLevel(lvl);
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="text-base block">{info.emoji}</span>
                    <span className="text-[10px] font-bold block">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Location */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              Local
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(LOCATIONS).map((loc) => {
                const isSelected = location === loc.type;
                return (
                  <button
                    key={loc.type}
                    type="button"
                    onClick={() => setLocation(loc.type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {loc.emoji} {loc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Optional Note */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              Comentário rápido (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Café bateu na hora"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-black text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{editingEntry ? 'Salvar Alterações' : 'Confirmar Ida (+1) 💩'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
