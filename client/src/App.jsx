import React, { useState } from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import Dashboard from './components/Dashboard';
import { Mic, LayoutDashboard } from 'lucide-react';

function App() {
  const [view, setView] = useState('voice'); // voice, dashboard

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative font-sans">
      {/* View Content */}
      <main className="flex-1 overflow-hidden">
        {view === 'voice' ? (
          <VoiceAssistant onActionComplete={() => setView('dashboard')} />
        ) : (
          <Dashboard />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-baserri-dark/80 backdrop-blur-xl border-t border-white/5 py-4 px-12 flex justify-between items-center z-50">
        <button 
          onClick={() => setView('voice')}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'voice' ? 'text-baserri-green scale-110' : 'text-white/40'}`}
        >
          <Mic size={24} />
          <span className="text-[10px] font-bold">ASISTENTE</span>
        </button>
        
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-baserri-green scale-110' : 'text-white/40'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold">GESTIÓN</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
