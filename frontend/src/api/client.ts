import type {
  AdminStats,
  AdminUser,
  AiUsageStats,
  AuthResponse,
  BomSummary,
  BuildStep,
  CodeArtifact,
  Connection,
  MasterComponent,
  ProjectDetail,
  ProjectSummary,
  ProjectVersion,
  Template,
  TestCase,
  User,
  Vendor
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('iotforge_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      // If unauthorized, clear token if expired
      const isAuthRoute = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('iotforge_token');
        localStorage.removeItem('iotforge_user');
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || response.statusText;
      } catch {
        errorMessage = response.statusText || `Request failed with code ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // For file downloads or raw text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/')) {
      return (await response.text()) as unknown as T;
    }
    if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
      return (await response.blob()) as unknown as T;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  // Auth Endpoints
  async register(data: { name: string; email: string; password: string; confirmPassword: string; experienceLevel?: number }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        experienceLevel: data.experienceLevel ?? 1
      })
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('iotforge_token');
      localStorage.removeItem('iotforge_user');
    }
  }

  // Projects Endpoints
  async getProjects(): Promise<ProjectSummary[]> {
    return this.request<ProjectSummary[]>('/projects');
  }

  async getProjectById(id: string): Promise<ProjectDetail> {
    return this.request<ProjectDetail>(`/projects/${id}`);
  }

  async createProject(data: { title: string; description: string; controller?: string; connectivity?: string }): Promise<ProjectDetail> {
    return this.request<ProjectDetail>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async generateProject(data: { prompt: string; experienceLevel?: number; preferredController?: string; connectivityPreference?: string }): Promise<ProjectDetail> {
    return this.request<ProjectDetail>('/projects/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: string, data: { title?: string; description?: string; difficulty?: number; status?: number }): Promise<ProjectDetail> {
    return this.request<ProjectDetail>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async chatWithProject(id: string, message: string): Promise<{ reply: string; suggestedUpdate: boolean }> {
    return this.request<{ reply: string; suggestedUpdate: boolean }>(`/projects/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async getVersions(id: string): Promise<ProjectVersion[]> {
    return this.request<ProjectVersion[]>(`/projects/${id}/versions`);
  }

  async createVersion(id: string, notes: string): Promise<ProjectVersion> {
    return this.request<ProjectVersion>(`/projects/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify(notes)
    });
  }

  async restoreVersion(id: string, versionId: string): Promise<ProjectDetail> {
    return this.request<ProjectDetail>(`/projects/${id}/versions/${versionId}/restore`, {
      method: 'POST'
    });
  }

  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/projects/templates');
  }

  // BOM Endpoints
  async getBom(projectId: string): Promise<BomSummary> {
    return this.request<BomSummary>(`/projects/${projectId}/bom`);
  }

  // Wiring Endpoints
  async getConnections(projectId: string): Promise<Connection[]> {
    return this.request<Connection[]>(`/projects/${projectId}/connections`);
  }

  async updateConnections(projectId: string, connections: Partial<Connection>[]): Promise<Connection[]> {
    return this.request<Connection[]>(`/projects/${projectId}/connections`, {
      method: 'PUT',
      body: JSON.stringify(connections)
    });
  }

  // Code Endpoints
  async getCode(projectId: string): Promise<CodeArtifact[]> {
    return this.request<CodeArtifact[]>(`/projects/${projectId}/code`);
  }

  async regenerateCode(projectId: string, targetStack: string, subCategory: string): Promise<CodeArtifact> {
    return this.request<CodeArtifact>(`/projects/${projectId}/code/generate?targetStack=${encodeURIComponent(targetStack)}&subCategory=${encodeURIComponent(subCategory)}`, {
      method: 'POST'
    });
  }

  // Build Guide Endpoints
  async getBuildGuide(projectId: string): Promise<BuildStep[]> {
    return this.request<BuildStep[]>(`/projects/${projectId}/build-guide`);
  }

  async toggleBuildStep(projectId: string, stepId: string, isCompleted: boolean): Promise<BuildStep> {
    return this.request<BuildStep>(`/projects/${projectId}/build-guide/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted })
    });
  }

  // Tests Endpoints
  async getTests(projectId: string): Promise<TestCase[]> {
    return this.request<TestCase[]>(`/projects/${projectId}/tests`);
  }

  async updateTest(projectId: string, testId: string, status: number, notes?: string): Promise<TestCase> {
    return this.request<TestCase>(`/projects/${projectId}/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  // Components Master Endpoints
  async getComponents(category?: string, search?: string): Promise<MasterComponent[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return this.request<MasterComponent[]>(`/components?${params.toString()}`);
  }

  async getVendors(): Promise<Vendor[]> {
    return this.request<Vendor[]>('/components/vendors');
  }

  async createComponent(data: any): Promise<MasterComponent> {
    return this.request<MasterComponent>('/components', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteComponent(id: string): Promise<void> {
    return this.request<void>(`/components/${id}`, {
      method: 'DELETE'
    });
  }

  // Export Endpoints
  async exportBomCsv(projectId: string): Promise<Blob> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/projects/${projectId}/export/bom-csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to export BOM CSV');
    return await res.blob();
  }

  async exportDocumentation(projectId: string): Promise<string> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/projects/${projectId}/export/documentation`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to export documentation');
    return await res.text();
  }

  // Admin Endpoints
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats');
  }

  async getAiUsage(): Promise<AiUsageStats> {
    return this.request<AiUsageStats>('/admin/ai-usage');
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/admin/users');
  }

  async toggleUserStatus(userId: string): Promise<void> {
    return this.request<void>(`/admin/users/${userId}/toggle-status`, {
      method: 'POST'
    });
  }
}

export const api = new ApiClient();
