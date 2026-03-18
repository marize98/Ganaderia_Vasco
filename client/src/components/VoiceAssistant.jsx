import React, { useState, useEffect, useRef } from 'react';
import { Mic, Check, Loader2, Volume2, History, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceAssistant = ({ onActionComplete }) => {
  const [status, setStatus] = useState('idle'); // idle, listening, processing, confirming, success
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const scrollRef = useRef(null);

  const statusMap = {
    idle: { text: 'Pulsa eta hitz egin', subtext: 'Esaidazu "La Pinta erditu da" edo "Mugimendu-gida eskatzen dut"', color: 'bg-baserri-green' },
    listening: { text: 'Entzuten...', subtext: 'Hitz egin garbi. Entzuten zaitut...', color: 'bg-baserri-green animate-pulse' },
    processing: { text: 'Prozesatzen...', subtext: 'Zure ahotsa testura bihurtzen...', color: 'bg-baserri-gold' },
    searching: { text: 'MUGIDE-n bilatzen...', subtext: 'MUGIDE-n datuak bilatzen...', color: 'bg-baserri-accent' },
    confirming: { text: 'Baieztatu?', subtext: 'Berrikusi datuak eta sakatu berriro baieztatzeko', color: 'bg-baserri-green' },
    success: { text: 'Eginda!', subtext: 'Tramitea ondo bidali da', color: 'bg-baserri-green' },
  };

  const currentStatus = statusMap[status] || statusMap.idle;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleMicClick = async () => {
    if (status === 'idle') {
      setStatus('listening');
      // Simulate real voice capture with Web Speech API or timer
      setTimeout(async () => {
        setStatus('processing');
        const text = 'La Pinta ha parido una hembra esta mañana';
        
        try {
          const response = await fetch('http://localhost:5000/api/voice/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          const data = await response.json();
          
          setTranscript(text);
          setConversation(prev => [...prev, { type: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          
          setStatus('searching');
          setTimeout(() => {
            setStatus('confirming');
            setConversation(prev => [...prev, { 
              type: 'ai', 
              text: `Egun on. He registrado que la vaca ${data.nlp.animal_id} (${data.nlp.type}) ha tenido un evento de ${data.nlp.action}. ¿Confirmas el trámite en MUGIDE?`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
          }, 1500);
        } catch (error) {
          console.error("API Error:", error);
          setStatus('idle');
        }
      }, 3000);
    } else if (status === 'confirming') {
      setStatus('success');
      setConversation(prev => [...prev, { 
        type: 'ai', 
        text: '✓ Trámite completado y enviado a MUGIDE. JSON generado.',
        time: '15:19' 
      }]);
      setTimeout(() => {
        setStatus('idle');
        if (onActionComplete) onActionComplete();
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-baserri-dark text-white p-6 safe-top">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="status-indicator">
          <div className="online-pulse"></div>
          <span className="opacity-70">ONLINE</span>
          <span className="text-[10px] opacity-40 italic">MUGIDE-rekin sinkronizatuta</span>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-bold tracking-tight">BASERRI-ADITU</h1>
          <p className="text-[10px] text-baserri-green font-medium uppercase tracking-widest">Mayoral Digital</p>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <AnimatePresence mode='wait'>
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-10"
            >
              <button
                onClick={handleMicClick}
                className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${currentStatus.color}`}
              >
                {status === 'idle' && <Mic size={64} className="text-white" />}
                {status === 'listening' && <Mic size={64} className="text-white" />}
                {status === 'processing' && <Loader2 size={64} className="text-white animate-spin" />}
                {status === 'searching' && <Loader2 size={64} className="text-white animate-spin" />}
                {status === 'confirming' && <Check size={80} className="text-white" />}
                {status === 'success' && <Check size={80} className="text-white" />}
              </button>
            </motion.div>
          </AnimatePresence>
          
          {status === 'listening' && (
             <div className="absolute inset-0 bg-baserri-green rounded-full animate-ripple z-0"></div>
          )}
        </div>

        <div className="text-center space-y-2 max-w-xs">
          <h2 className="text-2xl font-bold">{currentStatus.text}</h2>
          <p className="text-sm opacity-60 px-4 leading-relaxed">{currentStatus.subtext}</p>
        </div>
      </div>

      {/* Conversation Log */}
      <div className="glass-card mt-auto flex flex-col h-1/3 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-baserri-green">
             <History size={14} />
             ELKARRIZKETA
          </div>
          <button className="text-[10px] bg-white/10 px-2 py-1 rounded-md flex items-center gap-1 opacity-70 hover:opacity-100">
            <RotateCcw size={10} /> Kontsulta berria
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-sm">
              Sakatu mikrofonoa eta hitz egin...
              <span className="text-[10px] mt-1">Adibidea: "La Pinta erditu da"</span>
            </div>
          ) : (
            conversation.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-baserri-green/20 text-baserri-green border border-baserri-green/30' 
                    : 'bg-white/5 text-white/90 border border-white/10'
                }`}>
                  {msg.type === 'ai' && <div className="text-[9px] font-bold text-baserri-green mb-1">BASERRI-ADITU</div>}
                  {msg.text}
                  <div className="text-[8px] opacity-40 mt-1 text-right">{msg.time}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex flex-col items-center gap-2 pb-2">
         <div className="text-[10px] font-bold tracking-widest opacity-40">
           BASERRI-ADITU · Ganaduentzako laguntzailea
         </div>
         <div className="text-[9px] text-baserri-green font-bold">HodeiCloud</div>
         <div className="flex gap-4 mt-1">
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-baserri-green"></div>
             <span className="text-[8px] opacity-60">MUGIDE konektatuta</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-baserri-accent"></div>
             <span className="text-[8px] opacity-60">v1.1.0 MVP</span>
           </div>
         </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
