import React, { useState, useMemo } from 'react';
import { getIconComponent } from '../../../../.claude/lib/iconMap';
import { colors, spacing } from '../../../../theme';
import { sensemakingPatterns, searchPatterns, type SensemakingPattern } from '../../../data/sensemakingPatterns';

interface PatternLibraryProps {
  onLaunchFramework?: (frameworkId: string, pattern: SensemakingPattern) => void;
}

export default function PatternLibrary({ onLaunchFramework }: PatternLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<SensemakingPattern | null>(null);
  const [complexityFilter, setComplexityFilter] = useState<string[]>([]);

  const filteredPatterns = useMemo(() => {
    let patterns = searchQuery ? searchPatterns(searchQuery) : sensemakingPatterns;
    
    if (complexityFilter.length > 0) {
      patterns = patterns.filter(p => complexityFilter.includes(p.complexity));
    }
    
    return patterns;
  }, [searchQuery, complexityFilter]);

  const complexityColors = {
    common: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      {/* Header */}
      <div
        style={{
          padding: spacing.xl,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(168, 85, 247, 0.08))',
          borderRadius: 20,
          border: '1px solid rgba(64, 64, 64, 0.3)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, color: colors.neutral[100], margin: 0, marginBottom: spacing.sm, display: 'flex', alignItems: 'center', gap: spacing.md }}>
          {React.createElement(getIconComponent('QuantumEntanglement') || 'div', { size: 28, color: '#3b82f6' })}
          Pattern Library
        </h2>
        <p style={{ fontSize: 15, color: colors.neutral[400], margin: 0, lineHeight: 1.6 }}>
          Recognize common stuck-points and discover which frameworks can help you break through
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div style={{ position: 'absolute', left: spacing.md, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            {React.createElement(getIconComponent('FocusAperture') || 'div', { size: 16, color: colors.neutral[500] })}
          </div>
          <input
            type="text"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: `${spacing.md} ${spacing.md} ${spacing.md} 42px`, background: 'rgba(30, 30, 30, 0.6)', border: `1px solid ${colors.neutral[700]}`, borderRadius: 12, color: colors.neutral[100], fontSize: 14 }}
          />
          {searchQuery && (
            <div onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: spacing.md, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
              {React.createElement(getIconComponent('AOSReject') || 'div', { size: 16, color: colors.neutral[400] })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: spacing.sm }}>
          {(['common', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setComplexityFilter(complexityFilter.includes(level) ? complexityFilter.filter((l) => l !== level) : [...complexityFilter, level])}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                background: complexityFilter.includes(level) ? complexityColors[level] : 'rgba(45, 45, 45, 0.6)',
                border: `1px solid ${complexityFilter.includes(level) ? complexityColors[level] : colors.neutral[700]}`,
                borderRadius: 8,
                color: complexityFilter.includes(level) ? colors.neutral[900] : colors.neutral[300],
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns Grid */}
      {filteredPatterns.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: spacing.lg }}>
          {filteredPatterns.map((pattern) => (
            <div
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern.id === selectedPattern?.id ? null : pattern)}
              style={{
                padding: spacing.xl,
                background: `linear-gradient(145deg, ${pattern.colorBg}, rgba(20, 20, 25, 0.8))`,
                border: `1px solid ${selectedPattern?.id === pattern.id ? pattern.color : pattern.colorBorder}`,
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = pattern.color;
                e.currentTarget.style.boxShadow = `0 12px 32px ${pattern.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = selectedPattern?.id === pattern.id ? pattern.color : pattern.colorBorder;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
                <div style={{ display: 'flex' }}>
                  {React.createElement(getIconComponent(pattern.icon as any) || 'div', { size: 32, color: pattern.color })}
                </div>
                <span style={{ padding: '4px 10px', background: complexityColors[pattern.complexity], color: colors.neutral[900], borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                  {pattern.complexity}
                </span>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: pattern.color, margin: 0, marginBottom: spacing.sm }}>{pattern.name}</h3>
              <p style={{ fontSize: 14, color: colors.neutral[300], lineHeight: 1.6, margin: 0, marginBottom: spacing.md }}>{pattern.description}</p>

              <div style={{ marginBottom: spacing.md }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.neutral[500], marginBottom: spacing.sm, textTransform: 'uppercase' }}>Recognition Cues</div>
                <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: 13, color: colors.neutral[400], lineHeight: 1.7 }}>
                  {pattern.recognitionCues.slice(0, 2).map((cue, i) => (
                    <li key={i}>{cue}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.neutral[500], marginBottom: spacing.sm, textTransform: 'uppercase' }}>Recommended Frameworks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {pattern.recommendedFrameworks.slice(0, 2).map((fw) => (
                    <button
                      key={fw.frameworkId}
                      onClick={(e) => { e.stopPropagation(); onLaunchFramework?.(fw.frameworkId, pattern); }}
                      style={{
                        padding: spacing.sm,
                        background: 'rgba(30, 30, 35, 0.6)',
                        border: `1px solid ${colors.neutral[700]}`,
                        borderRadius: 8,
                        color: pattern.color,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = pattern.color; e.currentTarget.style.background = pattern.colorBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.neutral[700]; e.currentTarget.style.background = 'rgba(30, 30, 35, 0.6)'; }}
                    >
                      <span>{fw.frameworkName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        {React.createElement(getIconComponent('Chronolith') || 'div', { size: 12, color: pattern.color })}
                        <span style={{ fontSize: 11 }}>{fw.successRate}%</span>
                        {React.createElement(getIconComponent('AOSArrow') || 'div', { size: 14, color: pattern.color })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPattern?.id === pattern.id && (
                <div style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTop: `1px solid ${pattern.colorBorder}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.neutral[500], marginBottom: spacing.sm, textTransform: 'uppercase' }}>Example Scenarios</div>
                  {pattern.exampleScenarios.map((scenario, i) => (
                    <div key={i} style={{ padding: spacing.md, background: 'rgba(20, 20, 25, 0.6)', borderRadius: 8, marginBottom: spacing.sm }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: pattern.color, marginBottom: 4 }}>{scenario.situation}</div>
                      <div style={{ fontSize: 13, color: colors.neutral[300], lineHeight: 1.6, fontStyle: 'italic' }}>{scenario.whatItLooksLike}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: spacing['2xl'], background: 'rgba(20, 20, 25, 0.6)', borderRadius: 16, border: `1px solid ${colors.neutral[700]}` }}>
          <div style={{ marginBottom: spacing.lg, opacity: 0.4 }}>
            {React.createElement(getIconComponent('Algorithm') || 'div', { size: 48, color: colors.neutral[400] })}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.neutral[300], marginBottom: spacing.sm }}>No patterns found</div>
          <div style={{ fontSize: 14, color: colors.neutral[500] }}>Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  );
}
