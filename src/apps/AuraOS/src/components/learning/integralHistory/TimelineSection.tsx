import React, { useState, useMemo } from 'react';
import { typography, getButtonClass } from '../../../../theme';
import { getIconComponent } from '../../../../.claude/lib/iconMap';

export interface TimelineEvent {
  year: number;
  label: string;
  type: 'publication' | 'institution' | 'media' | 'event' | 'milestone' | 'essay' | 'movement';
  description: string;
}

interface TimelineProps {
  data: {
    title: string;
    subtitle: string;
    events: TimelineEvent[];
  };
}

const getEventIcon = (type: 'publication' | 'institution' | 'media' | 'event' | 'milestone' | 'essay' | 'movement') => {
  const iconMap: Record<'publication' | 'institution' | 'media' | 'event' | 'milestone' | 'essay' | 'movement', string> = {
    publication: 'EngramArchive',
    institution: 'RosaCrucis',
    media: 'AscensionFlame',
    event: 'Chronolith',
    milestone: 'InfiniteBridge',
    essay: 'StructuralLattice',
    movement: 'TransformativeArc'
  };
  return getIconComponent(iconMap[type]);
};

const EVENT_COLORS = {
  publication: 'from-blue-500 to-teal-600',
  institution: 'from-emerald-500 to-teal-600',
  media: 'from-purple-500 to-violet-600',
  event: 'from-amber-500 to-yellow-600',
  milestone: 'from-rose-500 to-pink-600',
  essay: 'from-teal-500 to-blue-600',
  movement: 'from-fuchsia-500 to-purple-600'
};

export function TimelineSection({ data }: TimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const eventTypes = useMemo(() => {
    const types = new Set(data.events.map(e => e.type));
    return ['all', ...Array.from(types)];
  }, [data.events]);

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    eventTypes.forEach(type => {
      if (type !== 'all') {
        counts[type] = data.events.filter(e => e.type === type).length;
      }
    });
    return counts;
  }, [data.events, eventTypes]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return data.events;
    return data.events.filter(e => e.type === filterType);
  }, [data.events, filterType]);

  const minYear = Math.min(...data.events.map(e => e.year));
  const maxYear = Math.max(...data.events.map(e => e.year));

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-10 pb-24">
      <div className="space-y-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-3">{data.subtitle}</p>
          <h2 className={typography.h2}>{data.title}</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {eventTypes.map(type => {
            const isActive = filterType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                aria-pressed={isActive}
                className={isActive ? `${getButtonClass('sm', 'primary')} rounded-full` : `${getButtonClass('sm', 'ghost')} rounded-full`}
              >
                {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
                {type !== 'all' && <span className="ml-2 opacity-70">({eventCounts[type]})</span>}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-6 md:p-10 shadow-xl">
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-teal-500 to-teal-500 -translate-x-1/2 rounded-full" />

            <div className="space-y-12">
              {filteredEvents.map((event, idx) => {
                const isSelected = selectedEvent?.year === event.year && selectedEvent?.label === event.label;
                const Icon = getEventIcon(event.type);
                const colorClass = EVENT_COLORS[event.type];
                const isLeft = idx % 2 === 0;

                return (
                  <div
                    key={`${event.year}-${idx}`}
                    className={`relative flex ${isLeft ? 'justify-end' : 'justify-start'} items-center`}
                  >
                    <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(isSelected ? null : event)}
                        aria-expanded={isSelected}
                        aria-label={`${event.year}: ${event.label}`}
                        className={`rounded-2xl border p-5 transition-all duration-300 w-full overflow-hidden ${
                          isSelected
                            ? 'border-white/40 bg-gradient-to-br shadow-2xl shadow-purple-500/30 scale-105'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        } ${colorClass}`}
                      >
                        <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                          {Icon ? React.createElement(Icon, { size: 20, className: "text-white" }) : null}
                          <span className="text-2xl font-bold text-white">{event.year}</span>
                        </div>
                        <p className={`${typography.h4} mb-2 break-words`}>{event.label}</p>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-white/20 transition-opacity duration-300">
                            <p className={`${typography.body} text-white/90`}>{event.description}</p>
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`rounded-full p-3 shadow-xl transition-all duration-300 bg-gradient-to-br ${colorClass} ${
                          isSelected ? 'scale-125 shadow-2xl shadow-purple-500/80' : 'scale-100 shadow-purple-500/60'
                        }`}
                      >
                        {Icon ? React.createElement(Icon, { size: 24, className: "text-white" }) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <p className={`${typography.body} text-slate-400`}>No events found for this filter.</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 text-center">
            <p className={`${typography.h1} mb-2`}>{data.events.length}</p>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total Milestones</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 text-center">
            <p className={`${typography.h1} mb-2`}>{maxYear - minYear}</p>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Years Spanned</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 text-center">
            <p className={`${typography.h1} mb-2`}>{data.events.filter(e => e.type === 'publication').length}</p>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Major Publications</p>
          </div>
        </div>

        <div className="rounded-2xl border border-teal-400/40 bg-teal-400/10 p-6 text-teal-100">
          <p className={`${typography.h4} text-white mb-2`}>An Evolving Theory</p>
          <p className={typography.body}>
            This timeline is not exhaustive—it highlights key moments in Integral Theory's public emergence. The theory continues to evolve through applications in education, therapy, organizational development, ecological design, and personal practice. You are part of this living tradition.
          </p>
        </div>
      </div>
    </section>
  );
}
