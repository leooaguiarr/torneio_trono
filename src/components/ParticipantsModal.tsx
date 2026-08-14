import React, { useState } from 'react';
import { X, UserPlus, Trash2, Edit2, Check, Sparkles } from 'lucide-react';
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

const AVAILABLE_AVATARS = ['👑', '⚡', '🦁', '🦖', '🤠', '🥷', '🚀', '🔥', '🧘', '🍕', '💩', '🥑', '🌮', '☕', '👾', '🎯'];

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

  if (!isOpen) return null;

  const handleStartEdit = (p: Participant) => {
    triggerHaptic(15);
    setEditingId(p.id);
    setName(p.name);
    setNickname(p.nickname || '');
    setAvatar(p.avatar);
  };

  const handleCancelEdit = () => {
    triggerHaptic(10);
    setEditingId(null);
    setName('');
    setNickname('');
    setAvatar('👑');
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
        });
      }
      handleCancelEdit();
    } else {
      onAddParticipant({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        avatar,
        color: 'amber',
      });
      setName('');
      setNickname('');
      const nextIdx = (AVAILABLE_AVATARS.indexOf(avatar) + 1) % AVAILABLE_AVATARS.length;
      setAvatar(AVAILABLE_AVATARS[nextIdx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden my-0 sm:my-6 max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h2 className="font-['Outfit',sans-serif] text-base sm:text-lg font-black text-stone-900">
              Amigos no Torneio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
            <span className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              {editingId ? 'Editar Amigo' : '+ Novo Amigo'}
            </span>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                Escolha o Emoji / Avatar
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {AVAILABLE_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setAvatar(emoji);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all cursor-pointer ${
                      avatar === emoji
                        ? 'bg-amber-400 text-stone-950 scale-110 border border-amber-500 shadow-xs'
                        : 'bg-white border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do amigo (ex: Leo)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={25}
                required
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-stone-950 transition-all cursor-pointer shadow-xs"
              >
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-bold text-stone-500 hover:underline cursor-pointer"
              >
                Cancelar edição
              </button>
            )}
          </form>

          {/* List of existing participants */}
          <div>
            <span className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-2">
              Participantes Cadastrados ({participants.length})
            </span>

            {participants.length === 0 ? (
              <p className="text-xs text-stone-500 font-medium py-3 text-center">
                Nenhum amigo cadastrado ainda. Use o campo acima para adicionar!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{p.avatar}</span>
                      <span className="font-bold text-xs text-stone-900 truncate">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remover ${p.name} do torneio?`)) {
                            onDeleteParticipant(p.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
