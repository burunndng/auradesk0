import { LucideIcon } from 'lucide-react';
import type { IconName } from '../../data/toolsData';
export type { IconName };

// Import all our custom Sacred Geometry / Cyber-Sigil icons
// Path assumes: /src/components/visualizations/SacredGeometryIcons/index.ts
import * as SacredIcons from '../../components/visualizations/SacredGeometryIcons';

/**
 * iconComponentMap
 * Links the 'iconName' string from toolsData.ts to the custom SVG components.
 */
export const iconComponentMap: Record<IconName, any> = {
  // === AOS FOUNDATION ICONS ===
  AOSClock: SacredIcons.AOSClockIcon,
  AOSBrain: SacredIcons.AOSBrainIcon,
  AOSArrow: SacredIcons.AOSArrowIcon,
  AOSReject: SacredIcons.AOSRejectIcon,
  AOSConfirm: SacredIcons.AOSConfirmIcon,

  // === NEW CYBER-SIGIL ICONS (SET 3) ===
  WorldEngine: SacredIcons.WorldEngineIcon,
  VectorGate: SacredIcons.VectorGateIcon,
  Algorithm: SacredIcons.AlgorithmIcon,
  Chronolith: SacredIcons.ChronolithIcon,
  Crucible: SacredIcons.CrucibleIcon,
  Aegis: SacredIcons.AegisIcon,
  VesselFrame: SacredIcons.VesselFrameIcon,
  PulseMatrix: SacredIcons.PulseMatrixIcon,
  SenseMandala: SacredIcons.SenseMandalaIcon,
  SynapseNetwork: SacredIcons.SynapseNetworkIcon,
  EngramArchive: SacredIcons.EngramArchiveIcon,
  FocusAperture: SacredIcons.FocusApertureIcon,
  AscensionFlame: SacredIcons.AscensionFlameIcon,
  InfiniteBridge: SacredIcons.InfiniteBridgeIcon,
  VoidEclipse: SacredIcons.VoidEclipseIcon,
  UmbraFragment: SacredIcons.UmbraFragmentIcon,

  // === SENSEMAKING LAB ICONS (SET 4) ===
  InquiryVortex: SacredIcons.InquiryVortexIcon,
  PatternMandala: SacredIcons.PatternMandalaIcon,
  StructuralLattice: SacredIcons.StructuralLatticeIcon,
  TransformativeArc: SacredIcons.TransformativeArcIcon,
  EvolutionaryUnfolding: SacredIcons.EvolutionaryUnfoldingIcon,
  ConsciousNode: SacredIcons.ConsciousNodeIcon,

  // === TRANSCENDENT ICONS (SET 5) ===
  RecursionWell: SacredIcons.RecursionWellIcon,
  AetherBreath: SacredIcons.AetherBreathIcon,
  ParadoxGate: SacredIcons.ParadoxGateIcon,
  RosaCrucis: SacredIcons.RosaCrucisIcon,
  TwinPillars: SacredIcons.TwinPillarsIcon,
  LightningPath: SacredIcons.LightningPathIcon,

  // === INTELLIGENCE & WISDOM ICONS (SET 6) ===
  NoosphereNode: SacredIcons.NoosphereNodeIcon,

  // === AETHON ICONS (SET 14) ===
  AethonGateway: SacredIcons.AethonGatewayIcon,
  AethonBloom: SacredIcons.AethonBloomIcon,

  // === ORIGINAL TRANSCENDENT ICONS (SET 7) ===
  VoidBloom: SacredIcons.VoidBloomIcon,
  EchoSphere: SacredIcons.EchoSphereIcon,
  OuroborosKey: SacredIcons.OuroborosKeyIcon,

  // === DIMENSIONAL ALIGNMENT ICONS (SET 8) ===
  HyperTesseract: SacredIcons.HyperTesseractIcon,
  OrbitEclipse: SacredIcons.OrbitEclipseIcon,
  CipherWeave: SacredIcons.CipherWeaveIcon,

  // === SYNTHESIS & ENTANGLEMENT ICONS (SET 9) ===
  NeuralConvergence: SacredIcons.NeuralConvergenceIcon,
  QuantumEntanglement: SacredIcons.QuantumEntanglementIcon,

  // === PSYCHEDELIC & SACRED EMERGENCE ICONS (SET 10) ===
  Merkaba: SacredIcons.MerkabaIcon,
  SeedOfLife: SacredIcons.SeedOfLifeIcon,

  // === UNIVERSAL & ESOTERIC ICONS (SET 11) ===
  OuroborosGate: SacredIcons.OuroborosGateIcon,
  CrystalLattice: SacredIcons.CrystalLatticeIcon,
  AstralCompass: SacredIcons.AstralCompassIcon,

  // === THE LUMINOUS TRIAD (SET 12) ===
  VesicaSacra: SacredIcons.VesicaSacraIcon,
  EnsoTriunity: SacredIcons.EnsoTriunityIcon,

  // === THE EMBODIED TRIAD (SET 13) ===
  ResonanceField: SacredIcons.ResonanceFieldIcon,
  DyadBridge: SacredIcons.DyadBridgeIcon,
  SomaticPillar: SacredIcons.SomaticPillarIcon,

  // === VALUES & COHERENCE ICONS (SET 17) ===
  CelticContinuum: SacredIcons.CelticContinuumIcon,
  DharmaLotus: SacredIcons.DharmaLotusIcon,

  // === SPIRIT MODULE ADDITIONS ===
  Abrahadabra: SacredIcons.AbrahadabraIcon,
  ApophaticFrame: SacredIcons.ApophaticFrameIcon,
  CelestialRose: SacredIcons.CelestialRoseIcon,
  HermeticVessel: SacredIcons.HermeticVesselIcon,
  PsychopompLantern: SacredIcons.PsychopompLanternIcon,
  Tesseract: SacredIcons.TesseractIcon,
  ThirdEye: SacredIcons.ThirdEyeIcon,
  Sushumna: SacredIcons.SushumnaIcon,
  Nigredo: SacredIcons.NigredoIcon,
  Resonator: SacredIcons.ResonatorIcon,

  // === SEMANTIC PRECISION ICONS (SET 18) ===
  PolarityScale: SacredIcons.PolarityScaleIcon,
  MoralCompass: SacredIcons.MoralCompassIcon,
  IdentityPrism: SacredIcons.IdentityPrismIcon,
  DecisionFork: SacredIcons.DecisionForkIcon,
  SomaThread: SacredIcons.SomaThreadIcon,
  StackArchitect: SacredIcons.StackArchitectIcon,
  PhaseWheel: SacredIcons.PhaseWheelIcon,
  DefusionPrism: SacredIcons.DefusionPrismIcon,
  RelationalWeb: SacredIcons.RelationalWebIcon,
  NonDualEye: SacredIcons.NonDualEyeIcon,

  // === ALCHEMICAL TRINITY (SET 20) ===
  DescentChalice: SacredIcons.DescentChaliceIcon,
  SingularityOrb: SacredIcons.SingularityOrbIcon,
  SovereignTriskelion: SacredIcons.SovereignTriskelionIcon,

  // === DARK FORCE TRINITY (SET 21) ===
  KalachakraMaw: SacredIcons.KalachakraMawIcon,
  QliphothicPillar: SacredIcons.QliphothicPillarIcon,
  MahakalaSeal: SacredIcons.MahakalaSealIcon,

  // === LEGACY MAPPINGS ===
  // These act as "Redirects" so the app doesn't break while you 
  // transition from old Lucide names to the new Sacred names.
  Heart: SacredIcons.PulseMatrixIcon,
  TrendingUp: SacredIcons.ChronolithIcon,
  Unlock: SacredIcons.VectorGateIcon,
  BrainCircuit: SacredIcons.SynapseNetworkIcon,
  Compass: SacredIcons.SenseMandalaIcon,
  SearchCode: SacredIcons.AlgorithmIcon,
  GitCompareArrows: SacredIcons.CrucibleIcon,
  Shuffle: SacredIcons.CrucibleIcon,
  Layers: SacredIcons.EngramArchiveIcon,
  Target: SacredIcons.FocusApertureIcon,
  RefreshCw: SacredIcons.CrucibleIcon,
  GraduationCap: SacredIcons.EngramArchiveIcon,
  Zap: SacredIcons.AscensionFlameIcon,
  Signpost: SacredIcons.VectorGateIcon,
  Shield: SacredIcons.AegisIcon,
  Brain: SacredIcons.SynapseNetworkIcon,
  Microscope: SacredIcons.AlgorithmIcon,
  // Additional icon aliases (no dedicated icon, map to similar)
  CircadianWave: SacredIcons.ChronolithIcon,
  FlowerOfLife: SacredIcons.SeedOfLifeIcon,
  TriangleInversion: SacredIcons.VoidEclipseIcon,
};

/**
 * Helper to get the Icon component by its name string.
 * We cast to 'any' to bridge the gap between custom SVGs and Lucide types.
 */
export function getIconComponent(iconName: IconName): LucideIcon | null {
  return (iconComponentMap[iconName] as any) || null;
}
