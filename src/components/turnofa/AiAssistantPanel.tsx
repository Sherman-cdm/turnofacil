'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el Asistente IA de TURNOFA para la recepción de estética de pies y podología. Puedo ayudarte a consultar la disponibilidad, revisar datos de clientes (DNI, Gmail, teléfonos), coordinar turnos o redactar recordatorios cordiales. ¿En qué te ayudo?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMsgs, { role: 'assistant', content: 'Disculpa, no pude procesar la consulta en este momento.' }]);
      }
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Error de conexión con el Asistente IA.' }]);
    } finally {
      setLoading(false);
    }
  }

  const sugerencias = [
    '¿Qué turnos tenemos agendados hoy?',
    '¿Qué recordatorios de 24h faltan enviar?',
    'Precios y detalles de estética de pies',
    'Redactar recordatorio cordial para Gmail',
    'Consejos para talones agrietados'
  ];

  return (
    <div className="bg-white rounded-3xl border border-teal-100 shadow-xs overflow-hidden flex flex-col h-[650px]">
      
      {/* Cabecera del Asistente */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              Asistente IA · TURNOFA
              <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-mono">Gemini 3.8</span>
            </h4>
            <p className="text-[11px] text-teal-100">Especialista en recepción podológica y gestión de citas</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{
            role: 'assistant',
            content: '¡Conversación reiniciada! ¿Qué consulta tenés sobre los turnos, clientes o servicios de estética de pies?'
          }])}
          className="p-1.5 text-teal-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Reiniciar chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sugerencias Rápidas */}
      <div className="p-3 bg-teal-50/50 border-b border-teal-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-teal-800 shrink-0">Consultas rápidas:</span>
        {sugerencias.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            className="shrink-0 px-3 py-1 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-full font-medium transition-colors"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              m.role === 'user'
                ? 'bg-slate-800 text-white'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs'
            }`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none'
                : 'bg-white border border-teal-100 text-slate-800 rounded-tl-none shadow-xs'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-white border border-teal-100 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-150"></div>
              <span>Consultando agenda y servicios de TURNOFA...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input de consulta */}
      <div className="p-3 sm:p-4 bg-white border-t border-teal-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Preguntale a la IA sobre turnos, clientes o recordatorios..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xs disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
