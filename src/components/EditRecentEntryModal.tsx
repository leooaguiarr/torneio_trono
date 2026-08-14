import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { EFFORT_LEVELS, EffortLevel, LOCATIONS, LocationType, Participant, PoopEntry } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/soundEffects';

interface EditRecentEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: PoopEntry[];
  participant: Participant | null;
  onUpdateEntry: (entry: PoopEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const EditRecentEntryModal: React.FC<EditRecentEntryModalProps> = ({
  isOpen,
  onClose,
  entries,
  participant,
  onUpdateEntry,
  onDeleteEntry,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<PoopEntry | null>(null);
  const [location, setLocation] = useState<LocationType>('casa');
  const [effortLevel, setEffortLevel] = useState<EffortLevel>(3);
  const [notes, setNotes] = useState<string>('');

  // User's entries sorted newest first
  const userEntries = entries
    .filter((e) => participant && e.participantId === participant.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    if (isOpen && userEntries.length > 0) {
      const latest = userEntries[0];
      setSelectedEntry(latest);
      setLocation(latest.location || 'casa');
      setEffortLevel(latest.effortLevel);
      setNotes(latest.notes || '');
    } else {
      setSelectedEntry(null);
    }
  }, [isOpen, entries, participant]);

  const handleSelectEntry = (entry: PoopEntry) => {
    triggerHaptic(10);
    setSelectedEntry(entry);
    setLocation(entry.location || 'casa');
    setEffortLevel(entry.effortLevel);
    setNotes(entry.notes || '');
  };

  if (!isOpen || !participant) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    triggerHaptic(25);
    onUpdateEntry({
      ...selectedEntry,
      location,
      effortLevel,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = (id: string) => {
    triggerHaptic(30);
    if (window.confirm('Tem certeza que deseja cancelar e apagar esta ida ao banheiro?')) {
      onDeleteEntry(id);
      onClose();
    }
  };

  const effortList = Object.values(EFFORT_LEVELS);
  const locationList = Object.values(LOCATIONS);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900 leading-tight">
                Corrigir Ida (Corrigir a Cagada) 🛠️
              </h2>
              <p className="text-xs text-stone-600 font-semibold">
                Altere o local, esforço ou apague uma ida registrada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {userEntries.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <span className="text-4xl">🚽</span>
            <h3 className="font-black text-base text-stone-900">Você ainda não tem idas registradas!</h3>
            <p className="text-xs text-stone-600 font-medium">
              Registre uma nova ida pelo botão principal para poder pontuar ou corrigir depois.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Choose Which Entry to Correct if multiple */}
            {userEntries.length > 1 && (
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  1. Qual registro você quer corrigir?
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {userEntries.slice(0, 5).map((entry) => {
                    const isSelected = selectedEntry?.id === entry.id;
                    const { relative, exactTime } = formatFriendlyDate(entry.timestamp);
                    const loc = LOCATIONS[entry.location || 'casa'];
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleSelectEntry(entry)}
                        className={`w-full p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 font-black text-stone-950 ring-1 ring-amber-400'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{loc?.emoji || '🚽'}</span>
                          <span className="truncate">{loc?.label || 'Em Casa'}</span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            ({relative} às {exactTime})
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-900 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedEntry && (
              <>
                {/* Location Selection */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    2. Corrigir Local:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
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
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 border-amber-500 text-stone-950 font-black ring-1 ring-amber-400'
                              : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-700'
                          }`}
                        >
                          <span className="text-base">{loc.emoji}</span>
                          <span className="truncate flex-1">{loc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Effort Selection */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    3. Corrigir Nível de Esforço:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
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
                              ? 'bg-stone-900 text-white border-stone-900 font-black ring-2 ring-amber-400'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="text-lg">{lvl.emoji}</span>
                          <span className="text-[10px] truncate max-w-full text-center">
                            {lvl.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>SALVAR CORREÇÃO DA CAGADA</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Apagar este registro por engano"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Apagar Registro</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
