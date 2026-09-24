export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type UserRole = 'User' | 'Admin';
export type ProjectStatus = 'Draft' | 'InProgress' | 'Completed' | 'Archived';
export type TestStatus = 'Pending' | 'Passed' | 'Failed' | 'Skipped';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface User {
  id: string;
  name: string;
  email: string;
  role: number | string; // 1 = User, 2 = Admin
  experienceLevel: number | string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  difficulty: number | string;
  estimatedCost: number;
  estimatedBuildTime: string;
  controller: string;
  connectivity: string;
  status: number | string;
  safetyReviewRequired: boolean;
  version: number;
  componentCount: number;
  stepCount: number;
  passedCount: number;
  totalTestCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectComponent {
  id: string;
  componentId?: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  verifiedPrice?: number;
  vendorName?: string;
  purchaseUrl?: string;
  specificationsJson?: string;
  pinoutJson?: string;
  datasheetUrl?: string;
  compatibilityNotes?: string;
}

export interface Connection {
  id: string;
  fromComponent: string;
  fromPin: string;
  toComponent: string;
  toPin: string;
  signal: string;
  wireColor: string;
  voltage: string;
  description: string;
}

export interface ArchNode {
  id: string;
  label: string;
  type: string;
  layer: string;
  description: string;
  x: number;
  y: number;
}

export interface ArchEdge {
  from: string;
  to: string;
  protocol: string;
  description: string;
}

export interface ArchitectureSpec {
  nodes: ArchNode[];
  connections: ArchEdge[];
}

export interface InfrastructureSpec {
  hardware: string;
  network: string;
  cloud: string;
  backend: string;
  database: string;
  security: string;
  monitoring: string;
  backups: string;
}

export interface CodeArtifact {
  id: string;
  targetStack: string; // Firmware, Backend, Frontend, Database
  subCategory: string; // Arduino, ESP-IDF, PlatformIO, ASPNET, NodeJS, Python, React, SQL
  fileName: string;
  language: string;
  codeContent: string;
  description: string;
}

export interface BuildStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  requiredComponents: string[];
  diagramHint?: string;
  warnings?: string;
  expectedResult: string;
  isCompleted: boolean;
}

export interface TestCase {
  id: string;
  category: string;
  title: string;
  description: string;
  status: TestStatus | number;
  notes?: string;
}

export interface SafetyWarning {
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  warning: string;
  remedy: string;
}

export interface ProjectMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ProjectVersion {
  id: string;
  versionNumber: number;
  changeNotes: string;
  createdAt: string;
}

export interface ProjectDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: number | string;
  estimatedCost: number;
  estimatedBuildTime: string;
  controller: string;
  connectivity: string;
  powerSource: string;
  status: number | string;
  safetyReviewRequired: boolean;
  safetyReviewReason?: string;
  version: number;
  requirements: string[];
  components: ProjectComponent[];
  connections: Connection[];
  architecture: ArchitectureSpec;
  infrastructure: InfrastructureSpec;
  codeArtifacts: CodeArtifact[];
  buildSteps: BuildStep[];
  testCases: TestCase[];
  safetyWarnings: SafetyWarning[];
  messages: ProjectMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BomItem {
  id: string;
  componentName: string;
  category: string;
  quantity: number;
  estimatedUnitPrice: number;
  verifiedUnitPrice?: number;
  totalEstimated: number;
  vendorName?: string;
  purchaseUrl?: string;
  isVerifiedPrice: boolean;
  inStock: boolean;
}

export interface BomSummary {
  items: BomItem[];
  subtotal: number;
  estimatedShipping: number;
  estimatedTotal: number;
  totalItems: number;
}

export interface MasterComponent {
  id: string;
  name: string;
  category: number | string;
  description: string;
  imageUrl: string;
  estimatedPrice: number;
  specificationsJson: string;
  pinoutJson: string;
  datasheetUrl?: string;
  compatibilityNotes?: string;
  defaultQuantity: number;
  isActive: boolean;
  purchaseLinks: VendorPurchaseLink[];
}

export interface VendorPurchaseLink {
  id: string;
  vendorName: string;
  vendorWebsite: string;
  url: string;
  currentPrice?: number;
  inStock: boolean;
  lastCheckedAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  website: string;
  apiUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  activeLinksCount: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number | string;
  estimatedCost: number;
  controller: string;
  connectivity: string;
  promptText: string;
  iconName: string;
  isFeatured: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalComponents: number;
  totalGenerations: number;
  totalEstimatedHardwareValue: number;
  activeProjectsToday: number;
}

export interface AiUsageStats {
  totalRequests: number;
  successfulGenerations: number;
  clarificationsTriggered: number;
  averageGenerationTimeSeconds: number;
  activeProvider: string;
  activeModel: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: number | string;
  experienceLevel: number | string;
  projectCount: number;
  isActive: boolean;
  createdAt: string;
}
