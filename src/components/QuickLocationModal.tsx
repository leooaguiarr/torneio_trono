import React, { useState } from 'react';
import { X, Check, Sparkles, MapPin, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LocationType, EffortLevel, Participant, EFFORT_LEVELS } from '../types';
import { triggerHaptic, playFartSound } from '../utils/soundEffects';

interface QuickLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  onConfirm: (location: LocationType, effortLevel: EffortLevel) => void;
  soundMuted: boolean;
}

interface LocationOption {
  type: LocationType;
  title: string;
  subtitle: string;
  emoji: string;
  highlight?: boolean;
}

const LOCATION_OPTIONS: LocationOption[] = [
  {
    type: 'casa',
    title: 'Em Casa',
    subtitle: 'No conforto do trono sagrado 🛋️',
    emoji: '🏠',
  },
  {
    type: 'trabalho',
    title: 'No Trabalho',
    subtitle: 'Cagada Remunerada 💸 (Recebendo pra cagar!)',
    emoji: '💼',
    highlight: true,
  },
  {
    type: 'role',
    title: 'Rolê / Bar',
    subtitle: 'Encarando o banheiro de boteco 🍺',
    emoji: '🍻',
  },
  {
    type: 'publico',
    title: 'Shopping / Público',
    subtitle: 'Sem frescura com a privada alheia 🛒',
    emoji: '🏢',
  },
  {
    type: 'academia',
    title: 'Academia',
    subtitle: 'O pré-treino cobrou a dívida ⚡',
    emoji: '💪',
  },
  {
    type: 'viagem',
    title: 'Viagem / Hotel',
    subtitle: 'Marcando território pelo mundo ✈️',
    emoji: '🗺️',
  },
  {
    type: 'outro',
    title: 'Outro Lugar',
    subtitle: 'Operação secreta e sigilosa 🕵️',
    emoji: '📍',
  },
];

export const QuickLocationModal: React.FC<QuickLocationModalProps> = ({
  isOpen,
  onClose,
  participant,
  onConfirm,
  soundMuted,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('casa');
  const [selectedEffort, setSelectedEffort] = useState<EffortLevel>(3);

  if (!isOpen || !participant) return null;

  const handleSelectAndConfirm = (loc: LocationType) => {
    setSelectedLocation(loc);
    triggerHaptic(20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic([20, 30, 40]);
    if (!soundMuted) {
      playFartSound(false, selectedEffort);
    }
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
    onConfirm(selectedLocation, selectedEffort);
    onClose();
  };

  const effortList = Object.values(EFFORT_LEVELS);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 transition-colors cursor-pointer"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900 leading-tight">
                Onde foi a obra de arte?
              </h2>
              <p className="text-xs text-stone-600 font-semibold">
                Registrando +1 para <strong className="text-stone-900">{participant.avatar} {participant.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Question: Location */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Escolha o Local:</span>
            </label>

            <div className="space-y-1.5">
              {LOCATION_OPTIONS.map((loc) => {
                const isSelected = selectedLocation === loc.type;
                return (
                  <button
                    key={loc.type}
                    type="button"
                    onClick={() => handleSelectAndConfirm(loc.type)}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 text-stone-950 font-black shadow-xs'
                        : 'bg-stone-50/80 border-stone-200 hover:border-stone-300 hover:bg-stone-100/80 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{loc.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black truncate">
                            {loc.title}
                          </h4>
                          {loc.highlight && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                              +Moral
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium truncate">
                          {loc.subtitle}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-500 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Effort Level (Optional) */}
          <div>
            <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
              Nível de Esforço
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {effortList.map((lvl) => {
                const isSelected = selectedEffort === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedEffort(lvl.level);
                    }}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-amber-400 font-black'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <span className="text-lg">{lvl.emoji}</span>
                    <span className="text-[10px] truncate max-w-full text-center px-0.5">
                      {lvl.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm sm:text-base border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONFIRMAR +1 IDA NO PLACAR! 🏆</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar sem salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
