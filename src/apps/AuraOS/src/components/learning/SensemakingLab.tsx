import React, { useState, Suspense, lazy } from 'react';
import { colors, spacing } from '../../../theme';
import { getIconComponent } from '../../../.claude/lib/iconMap';
import AethonBloomIcon from '../../../components/visualizations/SacredGeometryIcons/AethonBloomIcon';

// Lazy load heavy components
const FrameworkEncyclopedia = lazy(() => import('./FrameworkEncyclopedia'));
const PatternLibrary = lazy(() => import('./sensemaking/PatternLibrary'));
const SensemakingLabLegacy = lazy(() => import('./SensemakingLabLegacy'));

type TabKey = 'overview' | 'patterns' | 'frameworks' | 'lab' | 'progress';

interface SensemakingLabProps {
  onLaunchEightZonesWizard?: () => void;
}

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const tabs: Tab[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: React.createElement(getIconComponent('InquiryVortex') || 'div', { size: 20 }),
    color: '#3b82f6',
    description: 'Introduction to sensemaking',
  },
  {
    key: 'patterns',
    label: 'Patterns',
    icon: React.createElement(getIconComponent('PatternMandala') || 'div', { size: 20 }),
    color: '#a855f7',
    description: 'Common stuck-points',
  },
  {
    key: 'frameworks',
    label: 'Frameworks',
    icon: React.createElement(getIconComponent('StructuralLattice') || 'div', { size: 20 }),
    color: '#10b981',
    description: 'Research-backed approaches',
  },
  {
    key: 'lab',
    label: 'Practice Lab',
    icon: React.createElement(getIconComponent('TransformativeArc') || 'div', { size: 20 }),
    color: '#f59e0b',
    description: 'Work through questions',
  },
  {
    key: 'progress',
    label: 'Progress',
    icon: React.createElement(getIconComponent('EvolutionaryUnfolding') || 'div', { size: 20 }),
    color: '#ec4899',
    description: 'Track your growth',
  },
];

export default function SensemakingLab({ onLaunchEightZonesWizard }: SensemakingLabProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <div
      style={{
        minHeight: '100dvh',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 1) 0%, rgba(15, 15, 20, 1) 100%)',
      }}
    >

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: 'clamp(12px, 3vw, 32px)' }}>
        {/* Header */}
        <div
          style={{
            marginBottom: spacing.xl,
            padding: 'clamp(16px, 3vw, 32px)',
            background: 'rgba(20, 20, 25, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1px solid rgba(64, 64, 64, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* AethonBloom - decorative background element */}
          <div style={{
            position: 'absolute',
            right: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.06,
            pointerEvents: 'none',
          }}>
            <AethonBloomIcon size={280} color="#a855f7" />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#3b82f6',
              }}
            >
              {React.createElement(getIconComponent('ConsciousNode') || 'div', { size: 32 })}
            </div>
            <div>
              <h1
                style={{
                  fontSize: 'clamp(24px, 5vw, 42px)',
                  fontWeight: 700,
                  fontFamily: "'Cormorant Garamond', serif",
                  color: colors.neutral[100],
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Sensemaking Lab
              </h1>
              <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: colors.neutral[400], margin: 0, marginTop: 8, letterSpacing: '0.02em' }}>
                Transform confusion into clarity through structured inquiry and research-backed frameworks
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: spacing.sm,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch' as const,
              scrollbarWidth: 'none' as const,
              msOverflowStyle: 'none' as const,
              padding: spacing.sm,
              background: 'rgba(15, 15, 20, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(64, 64, 64, 0.3)',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: 'clamp(8px, 2vw, 14px) clamp(10px, 2.5vw, 20px)',
                    background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    border: '1px solid transparent',
                    borderBottom: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    borderRadius: 12,
                    color: isActive ? colors.neutral[100] : colors.neutral[400],
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = colors.neutral[200];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = colors.neutral[400];
                    }
                  }}
                >
                  <span style={{ color: isActive ? colors.neutral[300] : colors.neutral[500] }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          </div>{/* End z-index wrapper */}
        </div>

        {/* Tab Content */}
        <div
          style={{
            padding: 'clamp(16px, 3vw, 32px)',
            background: 'rgba(20, 20, 25, 0.4)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: '1px solid rgba(64, 64, 64, 0.3)',
            minHeight: 600,
          }}
        >
          <Suspense
            fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: colors.neutral[400] }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      border: `3px solid ${colors.neutral[700]}`,
                      borderTopColor: '#3b82f6',
                      borderRadius: '50%',
                      margin: '0 auto',
                      marginBottom: spacing.lg,
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <div style={{ fontSize: 15, color: colors.neutral[500] }}>Loading...</div>
                </div>
              </div>
            }
          >
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'patterns' && <PatternLibrary />}
            {activeTab === 'frameworks' && <FrameworkEncyclopedia />}
            {activeTab === 'lab' && <SensemakingLabLegacy />}
            {activeTab === 'progress' && <ProgressSection onGoToLab={() => setActiveTab('lab')} />}
          </Suspense>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

function OverviewSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      {/* Hero */}
      <div
        style={{
          padding: spacing.xl,
          background: 'rgba(59, 130, 246, 0.06)',
          borderRadius: 20,
          border: '1px solid rgba(59, 130, 246, 0.15)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 700, color: colors.neutral[100], margin: 0, marginBottom: spacing.md }}>
          What is Sensemaking?
        </h2>
        <p style={{ fontSize: 16, color: colors.neutral[300], lineHeight: 1.8, margin: 0 }}>
          <strong style={{ color: '#3b82f6' }}>Sensemaking</strong> is the deliberate process of turning ambiguity into
          actionable understanding. Unlike passive thinking, sensemaking is <em>active inquiry</em>—it transforms messy,
          confusing situations into clear questions and testable insights.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: spacing.lg }}>
        <FeatureCard
          icon={React.createElement(getIconComponent('PatternMandala') || 'div', { size: 24, color: '#a855f7' })}
          title="Recognize Patterns"
          description="Identify common stuck-points like binary thinking, blind spots, or inner conflict"
          color="#a855f7"
        />
        <FeatureCard
          icon={React.createElement(getIconComponent('StructuralLattice') || 'div', { size: 24, color: '#10b981' })}
          title="Learn Frameworks"
          description="Explore 17 research-backed frameworks from Weick, Cynefin, Systems Thinking, and more"
          color="#10b981"
        />
        <FeatureCard
          icon={React.createElement(getIconComponent('TransformativeArc') || 'div', { size: 24, color: '#f59e0b' })}
          title="Practice & Integrate"
          description="Work through your questions with AI insights, save sessions, and track progress"
          color="#f59e0b"
        />
      </div>

      {/* Quick Start */}
      <div
        style={{
          padding: spacing.xl,
          background: 'rgba(30, 30, 35, 0.6)',
          borderRadius: 16,
          border: '1px solid rgba(64, 64, 64, 0.3)',
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.neutral[100], margin: 0, marginBottom: spacing.lg }}>
          Quick Start Guide
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <Step number={1} text="Start with Patterns to identify what you're experiencing" />
          <Step number={2} text="Explore Frameworks to learn which approaches can help" />
          <Step number={3} text="Use the Practice Lab to work through your specific question" />
          <Step number={4} text="Track your Progress to see how your sensemaking skills develop" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div
      style={{
        padding: spacing.xl,
        background: `linear-gradient(145deg, ${color}08, rgba(20, 20, 25, 0.8))`,
        border: `1px solid ${color}30`,
        borderRadius: 16,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}30`;
      }}
    >
      <div style={{ marginBottom: spacing.md }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.neutral[100], margin: 0, marginBottom: spacing.sm }}>{title}</h3>
      <p style={{ fontSize: 14, color: colors.neutral[400], lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: colors.neutral[100],
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: 15, color: colors.neutral[300], lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function ProgressSection({ onGoToLab }: { onGoToLab: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
      <div
        style={{
          padding: spacing.xl,
          background: 'rgba(59, 130, 246, 0.06)',
          borderRadius: 20,
          border: '1px solid rgba(59, 130, 246, 0.15)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: spacing.lg, opacity: 0.4 }}>
          {React.createElement(getIconComponent('EvolutionaryUnfolding') || 'div', { size: 48, color: colors.neutral[300] })}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: colors.neutral[100], margin: 0, marginBottom: spacing.md }}>
          Progress Dashboard
        </h2>
        <p style={{ fontSize: 15, color: colors.neutral[400], margin: 0, lineHeight: 1.6, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Your first session will appear here. Complete a practice in the Lab to begin tracking your growth.
        </p>
        <button
          onClick={onGoToLab}
          style={{
            marginTop: spacing.xl,
            padding: `${spacing.md} ${spacing.xl}`,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10,
            color: colors.neutral[200],
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Go to Practice Lab
        </button>
      </div>
    </div>
  );
}
