import React, { useEffect, useState, useMemo } from 'react';
import { IntegratedInsight, AllPractice } from '../../types';
import { insightTrackingService, InsightTracking } from '../../services/insightTrackingService';
import { CheckCircle, Archive, Calendar, Brain } from 'lucide-react';
import { getIconComponent } from '../../.claude/lib/iconMap';

interface MyInsightsTabProps {
  integratedInsights: IntegratedInsight[];
  userId: string;
  allPractices: AllPractice[];
}

export default function MyInsightsTab({
  integratedInsights,
  userId,
  allPractices,
}: MyInsightsTabProps) {
  const [tracking, setTracking] = useState<Map<string, InsightTracking>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load tracking status on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const trackingMap = await insightTrackingService.getTracking(userId);
      setTracking(trackingMap);
      setIsLoading(false);
    })();
  }, [userId, refreshKey]);

  // Filter: only show pending + addressed (hide archived)
  const visibleInsights = useMemo(() => {
    return integratedInsights.filter(insight => {
      const track = tracking.get(insight.id);
      return !track || track.status !== 'archived';
    });
  }, [integratedInsights, tracking]);

  // Sort: pending first, then by date
  const sortedInsights = useMemo(() => {
    return [...visibleInsights].sort((a, b) => {
      const aTrack = tracking.get(a.id);
      const bTrack = tracking.get(b.id);

      // Pending before addressed
      if ((aTrack?.status ?? 'pending') === 'pending' && bTrack?.status === 'addressed') return -1;
      if (aTrack?.status === 'addressed' && (bTrack?.status ?? 'pending') === 'pending') return 1;

      // Then by date (newest first)
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    });
  }, [visibleInsights, tracking]);

  // Priority coloring (simple)
  const getPriorityColor = (insight: IntegratedInsight, index: number) => {
    const track = tracking.get(insight.id);
    if (track?.status === 'addressed') return 'border-green-600 bg-green-950/30';
    if (index < 3) return 'border-red-600 bg-red-950/30'; // Top 3 = red
    return 'border-amber-600 bg-amber-950/30';
  };

  const getPriorityBadge = (index: number, status?: string) => {
    if (status === 'addressed') {
      return <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Addressed</span>;
    }
    if (index < 3) {
      return <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Critical</span>;
    }
    return <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">Monitor</span>;
  };

  const handleMarkAddressed = async (insightId: string) => {
    await insightTrackingService.markAsAddressed(userId, insightId);
    setRefreshKey(prev => prev + 1); // Trigger refetch
  };

  const handleArchive = async (insightId: string) => {
    await insightTrackingService.archiveInsight(userId, insightId);
    setRefreshKey(prev => prev + 1);
  };

  const metrics = useMemo(() => {
    // Count pending: insights without tracking records (default) OR explicit 'pending' status
    const pending = visibleInsights.filter(insight => {
      const track = tracking.get(insight.id);
      return !track || track.status === 'pending';
    }).length;

    // Count addressed: insights with 'addressed' status
    const addressed = visibleInsights.filter(insight => {
      const track = tracking.get(insight.id);
      return track?.status === 'addressed';
    }).length;

    return { pending, addressed };
  }, [visibleInsights, tracking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 lg:pb-8 space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          {React.createElement(getIconComponent('PatternMandala') || 'div', { size: 32, className: 'text-amber-400' })}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100">My Insights</h1>
        </div>
        <p className="text-slate-300">Track patterns from your practice and mark them as addressed</p>
      </header>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-4">
          <p className="text-sm text-stone-400 mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{metrics.pending}</p>
        </div>
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-4">
          <p className="text-sm text-stone-400 mb-1">Addressed</p>
          <p className="text-3xl font-bold text-green-400">{metrics.addressed}</p>
        </div>
      </div>

      {/* Insights List */}
      {sortedInsights.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-700 rounded-lg">
          <Brain className="w-12 h-12 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-400">No insights yet. Complete more wizards to generate insights.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedInsights.map((insight, index) => {
            const track = tracking.get(insight.id);
            const isAddressed = track?.status === 'addressed';

            return (
              <div
                key={insight.id}
                className={`border-l-4 rounded-lg p-4 transition-all ${getPriorityColor(insight, index)} ${
                  isAddressed ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + Badge */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3
                        className={`text-lg font-semibold ${
                          isAddressed ? 'text-stone-400 line-through' : 'text-slate-100'
                        }`}
                      >
                        {insight.detectedPattern}
                      </h3>
                      {getPriorityBadge(index, track?.status)}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-stone-400 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Brain size={14} /> {insight.mindToolName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(insight.dateCreated).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Pattern Summary */}
                    <p className="text-sm text-stone-300 mb-3">{insight.mindToolShortSummary}</p>

                    {/* Suggested Next Steps (if available) */}
                    {insight.suggestedNextSteps && insight.suggestedNextSteps.length > 0 && (
                      <div className="text-xs text-amber-200 bg-amber-950/30 border border-amber-700/30 rounded p-2 mb-3">
                        <strong>Next Step:</strong>{' '}
                        {insight.suggestedNextSteps[0].practiceName && insight.suggestedNextSteps[0].rationale
                          ? `${insight.suggestedNextSteps[0].practiceName}: ${insight.suggestedNextSteps[0].rationale.slice(0, 80)}...`
                          : 'See recommendations tab for details'}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0 min-w-fit">
                    {!isAddressed && (
                      <button
                        onClick={async () => {
                          await handleMarkAddressed(insight.id);
                        }}
                        className="bg-green-700 hover:bg-green-600 text-green-50 text-sm px-3 py-1 rounded transition whitespace-nowrap flex items-center gap-1"
                        aria-label={`Mark ${insight.detectedPattern} as addressed`}
                      >
                        <CheckCircle size={14} />
                        Done
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await handleArchive(insight.id);
                      }}
                      className="bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm px-3 py-1 rounded transition whitespace-nowrap flex items-center gap-1"
                      aria-label={`${isAddressed ? 'Delete' : 'Hide'} ${insight.detectedPattern}`}
                    >
                      <Archive size={14} />
                      {isAddressed ? 'Delete' : 'Hide'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
