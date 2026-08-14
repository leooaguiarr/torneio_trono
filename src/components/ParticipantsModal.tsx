import React, { useState } from 'react';
import { X, UserPlus, Trash2, Edit2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Participant } from '../types';
import { triggerHaptic, playPopSound } from '../utils/soundEffects';

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onAddParticipant: (participant: Omit<Participant, 'id' | 'createdAt'>) => void;
  onUpdateParticipant: (participant: Participant) => void;
  onDeleteParticipant: (id: string) => void;
  soundMuted?: boolean;
}

const AVAILABLE_AVATARS = ['👑', '⚡', '🛡️', '🧘', '🚀', '🔥', '🥷', '🦁', '🦖', '🤠', '🎩', '👾', '🎯', '🥑', '🌮', '☕'];
const AVAILABLE_COLORS = ['amber', 'emerald', 'blue', 'purple', 'rose', 'indigo', 'teal', 'orange'];

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  isOpen,
  onClose,
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onDeleteParticipant,
  soundMuted = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('👑');
  const [color, setColor] = useState('amber');

  if (!isOpen) return null;

  const handleStartEdit = (p: Participant) => {
    triggerHaptic(15);
    playPopSound(soundMuted);
    setEditingId(p.id);
    setName(p.name);
    setNickname(p.nickname || '');
    setAvatar(p.avatar);
    setColor(p.color);
  };

  const handleCancelEdit = () => {
    triggerHaptic(10);
    setEditingId(null);
    setName('');
    setNickname('');
    setAvatar('👑');
    setColor('amber');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic(25);
    playPopSound(soundMuted);

    if (editingId) {
      const existing = participants.find((p) => p.id === editingId);
      if (existing) {
        onUpdateParticipant({
          ...existing,
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          avatar,
          color,
        });
      }
      handleCancelEdit();
    } else {
      onAddParticipant({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        avatar,
        color,
      });
      setName('');
      setNickname('');
      // Cycle avatar
      const nextIdx = (AVAILABLE_AVATARS.indexOf(avatar) + 1) % AVAILABLE_AVATARS.length;
      setAvatar(AVAILABLE_AVATARS[nextIdx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-t-3 border-x-3 sm:border-3 border-stone-900 overflow-hidden my-0 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="bg-stone-950 p-4 sm:p-5 text-white flex items-center justify-between border-b-3 border-stone-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">👥</span>
            <div>
              <h2 className="font-['Outfit',sans-serif] text-lg sm:text-xl font-black text-[#FFD93D]">
                Participantes do Campeonato
              </h2>
              <p className="text-stone-300 text-xs font-bold">
                Adicione e gerencie os competidores da liga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white border-2 border-stone-700 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Add / Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-2xl bg-[#FFF9E6] border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-950 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                {editingId ? 'Editar Participante' : 'Adicionar Novo Amigo'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-stone-700 hover:text-stone-950 font-black underline cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-stone-900 mb-1">Nome *</label>
                <input
                  type="text"
                  placeholder="Ex: Leo, Bruno, Gui..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-900 mb-1">Apelido (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: O Estrategista"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 border-stone-900 bg-white focus:ring-2 focus:ring-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-black text-stone-900 mb-1.5">
                Escolha o Emoji do Competidor
              </label>
              <div className="grid grid-cols-8 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                {AVAILABLE_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setAvatar(emoji);
                    }}
                    className={`h-10 rounded-xl text-lg flex items-center justify-center border-2 transition-all cursor-pointer ${
                      avatar === emoji
                        ? 'bg-[#FFD93D] border-stone-900 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-stone-900 hover:bg-stone-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                {editingId ? <Check className="w-4 h-4 stroke-[2.5]" /> : <UserPlus className="w-4 h-4 stroke-[2.5]" />}
                <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Amigo'}</span>
              </button>
            </div>
          </form>

          {/* Current list */}
          <div className="space-y-3">
            <h3 className="font-['Outfit',sans-serif] font-black text-sm text-stone-950">
              Amigos Inscritos ({participants.length})
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl border-2 border-stone-900 bg-white hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 border-2 border-stone-900 flex items-center justify-center text-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {p.avatar}
                    </div>
                    <div>
                      <p className="font-black text-xs sm:text-sm text-stone-950">{p.name}</p>
                      {p.nickname && (
                        <p className="text-[11px] text-stone-600 font-bold italic">"{p.nickname}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="p-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 border-2 border-stone-900 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic(20);
                        if (participants.length <= 1) {
                          alert('O campeonato precisa de pelo menos 1 participante!');
                          return;
                        }
                        if (window.confirm(`Remover "${p.name}" do campeonato?`)) {
                          onDeleteParticipant(p.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-rose-400 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t-2 border-stone-900 flex justify-end pb-safe">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black bg-stone-950 hover:bg-stone-800 text-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer min-h-[44px]"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
