/**
 * Core Type Definitions
 * Shared types for Database, API, and Services
 */

// ============================================
// DATABASE DOCUMENT TYPES
// ============================================

export interface PracticeDocument {
  id: string;
  name: string;
  description: string;
  why: string;
  how: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  roi?: string;

  // Optional fields for UI/Frontend compatibility
  category?: string;
  duration?: number; // minutes
  frameworks?: string[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FrameworkDocument {
  id: string;
  type: 'Kegan' | 'AQAL' | 'Attachment' | 'Biases' | 'IFS';
  title: string;
  description: string;
  stages?: string[];
  dimensions?: string[];
  content: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSessionDocument {
  sessionId: string;
  id?: string; // Backward compatibility
  userId: string;
  type: 
    | 'bias_detective' 
    | 'ifs_work' 
    | 'practice' 
    | 'framework_assessment'
    | 'attachment_assessment'
    | 'big_mind'
    | 'kegan_assessment'
    | 'perspective_shifter'
    | 'polarity_mapper'
    | 'subject_object'
    | 'bias_finder'
    | 'shadow_journaling'
    | 'eight_zones'
    | 'adaptive_cycle'
    | 'role_alignment'
    | 'bioenergetics'
    | 'jhana_guide'
    | string; // Fallback for extensibility
  content: Record<string, any>;
  insights?: string[];
  createdAt?: Date | string;
  completedAt?: Date | string;
}

// ============================================
// USER PROFILE & HISTORY
// ============================================

export interface UserPreferences {
  preferredDuration: 'short' | 'medium' | 'long';
  preferredModalities: string[];
  preferredFrameworks: string[];
  focusAreas: string[];
  avoidancePatterns?: string[];
}

export interface UserHistory {
  completedPractices: string[];
  currentStack: string[];
  preferences: UserPreferences;
  biases: string[];
  developmentalStage?: string;
  attachmentStyle?: string;
}

// ============================================
// VECTOR & SEARCH TYPES
// ============================================

export interface VectorMetadata {
  // Practice-specific metadata
  practiceId?: string;
  practiceTitle?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  roi?: string;
  frameworks?: string[];

  // Framework metadata
  frameworkId?: string;
  frameworkType?: 'Kegan' | 'AQAL' | 'Attachment' | 'Biases' | 'IFS';

  // User session metadata
  userId?: string;
  sessionId?: string;
  sessionType?: 'bias_detective' | 'ifs_work' | 'practice' | 'framework_assessment';
  completionDate?: string;

  // General metadata
  type: 'practice' | 'framework' | 'user_session' | 'insight' | 'user_profile';
  source?: string;
  description?: string;
  tags?: string[];
}

export interface Vector {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
  text?: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export interface GenerationResponse {
  type: string;
  content: string;
  sources: SearchResult[];
  confidence: number;
  metadata: Record<string, any>;
}

export interface PersonalizedRecommendation {
  id: string;
  practiceId: string;
  title: string;
  practiceTitle?: string; // Backward compatibility alias
  category: string;
  reason: string;
  reasoning?: string; // Backward compatibility alias
  confidence: number;
  relevanceScore?: number; // Backward compatibility alias
  personalizationNotes: string[];
  priority: number;
  duration: number;
  customSteps?: string[];
}

// ============================================
// SYNC TYPES
// ============================================

export interface SyncPayload {
  userId: string;
  sessionData: UserSessionDocument;
  userPreferences: UserPreferences;
  timestamp: Date;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  indexedSessionId?: string;
  updatedUserEmbedding?: number[];
}

// ============================================
// RAG & GENERATION TYPES (Legacy Support)
// ============================================

export interface GenerationRequest {
  userId: string;
  type: 'recommendation' | 'insight' | 'personalization' | 'prompt_generation';
  query?: string;
  filters?: {
    category?: string;
    difficulty?: string;
    frameworkType?: string;
  };
  topK?: number;
}

export interface RAGContext {
  userId: string;
  userHistory: UserHistory;
  retrievedPractices: SearchResult[];
  retrievedFrameworks: SearchResult[];
  userSessions: UserSessionDocument[];
  relevantInsights: string[];
}

// ============================================
// RECOMMENDATION RESPONSE TYPE
// ============================================

export interface RecommendationResponse {
  recommendations: PersonalizedRecommendation[];
  totalRecommendations: number;
  confidence: number;
  explanation: string;
  generatedAt: string;
}

// ============================================
// DEPRECATED ALIASES FOR BACKWARD COMPATIBILITY
// ============================================

/** @deprecated Use UserSessionDocument instead */
export type UserSession = UserSessionDocument;

/** @deprecated Use Vector instead */
export type PineconeVector = Vector;

/** @deprecated Use VectorMetadata instead */
export type PineconeVectorMetadata = VectorMetadata;

/** @deprecated Use SearchResult instead */
export type QueryResult = SearchResult;
