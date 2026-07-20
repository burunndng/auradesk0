import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MerkabaIcon } from '../shared/MerkabaIcon.tsx';
import { modules, Tool, ModuleId } from '../../data/toolsData';
import { getIconComponent } from '../../.claude/lib/iconMap';
import FilterButtons, { FilterOption } from '../shared/FilterButtons';
import ModuleCircle from '../shared/ModuleCircle';
import ToolDetailCard from '../shared/ToolDetailCard';

interface ToolGuideTabProps {
  setActiveWizard: (wizardName: string | null, linkedInsightId?: string) => void;
}

export default function ToolGuideTab({ setActiveWizard }: ToolGuideTabProps) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [expandedModule, setExpandedModule] = useState<ModuleId | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredModules =
    filter === 'all'
      ? modules
      : modules.filter(m => m.id === filter);

  const expandedModuleData = expandedModule
    ? modules.find(m => m.id === expandedModule)
    : null;

  const handleModuleExpand = (moduleId: ModuleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleClose = () => {
    setSelectedTool(null);
  };

  const handleLaunch = (wizardId: string) => {
    setActiveWizard(wizardId);
  };

  return (
    <div className="relative min-h-[100dvh] bg-stone-950 overflow-hidden pb-32 lg:pb-8">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-12 p-6 md:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <MerkabaIcon className="text-slate-300" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light italic text-stone-100" style={{ letterSpacing: '0.01em' }}>
              Tool Guide Hub
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover your practice path across the four integral domains of transformation
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <FilterButtons active={filter} onSelect={setFilter} />

        {/* Module Circles Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredModules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                layout
              >
                <ModuleCircle
                  module={module}
                  isExpanded={expandedModule === module.id}
                  onExpand={() => handleModuleExpand(module.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Expanded Tools List */}
        <AnimatePresence>
          {expandedModuleData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-serif font-light text-stone-100 mb-1 flex items-center gap-3">
                    {expandedModuleData.label}
                  </h2>
                  <p className="text-stone-400 text-sm">
                    {expandedModuleData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {expandedModuleData.tools.map((tool, idx) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      onClick={() => handleToolSelect(tool)}
                      className={`text-left p-4 rounded-xl border transition-all group ${tool.id === 'axis'
                        ? 'bg-stone-900/60 border-red-800/40 shadow-[0_0_16px_rgba(108,36,36,0.3)] hover:border-red-700/60'
                        : 'bg-stone-900/50 border-stone-800/60 hover:bg-stone-800/60 hover:border-stone-700'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-stone-400 group-hover:text-stone-200 transition-colors flex-shrink-0 mt-0.5">
                          {React.createElement(getIconComponent(tool.iconName) || 'div', { size: 18 })}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-stone-200 text-sm leading-snug group-hover:text-stone-100 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!expandedModuleData && filter !== 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-300 text-lg">
              Click a module above to explore its tools
            </p>
          </motion.div>
        )}

        {/* Info Section */}
        {!expandedModuleData && filter === 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto bg-stone-900/30 border border-stone-800/50 rounded-2xl p-8 text-center space-y-4"
          >
            <h3 className="text-xl font-serif font-light text-stone-100">
              Explore the Four Domains of Integral Development
            </h3>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Click any module above to see all available tools. Each tool is designed to support specific growth
              edges and transformation goals across mind, shadow, body, and spirit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {modules.map(m => (
                <div key={m.id} className="space-y-1">
                  <p className={`font-semibold ${m.color === 'blue' ? 'text-blue-400' : m.color === 'purple' ? 'text-purple-400' : m.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>{m.label.replace(' Tools', '')}</p>
                  <p className="text-slate-500 text-sm">{m.tools.length} tools</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tool Detail Card Modal */}
      <ToolDetailCard
        tool={selectedTool}
        module={expandedModuleData}
        isOpen={selectedTool !== null}
        onClose={handleClose}
        onLaunch={handleLaunch}
      />
    </div>
  );
}
