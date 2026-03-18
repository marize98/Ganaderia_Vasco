import React from 'react';
import { AlertTriangle, Home, LayoutDashboard, Settings, ChevronRight, CheckCircle2, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const data = [
    { name: 'Bovino', value: 340, color: '#2D5A47' },
    { name: 'Ovino', value: 150, color: '#B19149' },
  ];

  const cards = [
    { 
      type: 'alert', 
      title: '¡ALERTA! Restricción de salida activa', 
      subtitle: '(Subexplotación A)', 
      icon: <AlertTriangle size={64} className="text-red-500" />,
      className: 'bg-red-50 border-red-100 text-red-900 col-span-2'
    },
    { 
      type: 'stats', 
      title: 'Censo: 490 animales en total', 
      content: (
        <div className="h-40 w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-[10px] space-y-1">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2D5A47]"></div> bovino</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#B19149]"></div> ovino</div>
          </div>
        </div>
      ),
      className: 'bg-white col-span-2'
    },
    { 
      type: 'list', 
      title: 'Guías: 3 Guías en curso', 
      content: (
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer group">
              <span className="text-xs font-medium">Guía {i}: Matadero X - Aprobada</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      ),
      className: 'bg-white col-span-2'
    },
    { 
        type: 'stats-mini', 
        title: 'Guías: 15 Guías emitidas', 
        icon: <Package size={48} className="text-gray-400" />,
        className: 'bg-white col-span-2'
    },
    { 
        type: 'list-check', 
        title: 'Guías: 3 Guías en curso', 
        content: (
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-medium">Guía {i}: Matadero X - Aprobada</span>
                {i < 3 ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300 animate-spin" />}
              </div>
            ))}
          </div>
        ),
        className: 'bg-white col-span-2'
    },
    { 
        type: 'crotales', 
        title: 'Crotales: 15 crotales disponibles', 
        content: <div className="text-7xl font-bold text-[#2D5A47] text-center mt-4">15</div>,
        className: 'bg-white col-span-2'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Desktop */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-8 space-y-8">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
           <CheckCircle2 size={24} />
        </div>
        <Home className="text-green-600 transition-colors" />
        <LayoutDashboard className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors" />
        <Settings className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 pb-20 overflow-y-auto">
        <header className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
             <CheckCircle2 size={32} />
           </div>
           <h1 className="text-4xl font-bold tracking-tight text-gray-800">Resumen de Explotación</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-[32px] border shadow-sm ${card.className}`}
            >
              <h3 className="text-xl font-bold mb-4">{card.title}</h3>
              {card.subtitle && <p className="text-sm opacity-80 mb-6">{card.subtitle}</p>}
              <div className="flex justify-center flex-col items-center">
                {card.icon}
                {card.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
