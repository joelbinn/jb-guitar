import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { GitHubSyncSettings } from '../models';

const SETTINGS_KEY = 'jbguitar:github-settings';

const DEFAULT_SETTINGS: GitHubSyncSettings = {
    enabled: false,
    repo: '',
    token: '',
    branch: 'main',
    filePath: 'jb-guitar-data.json'
};

@Injectable({ providedIn: 'root' })
export class GitHubSyncService {
    private readonly http = inject(HttpClient);
    
    // Config settings signal
    settings = signal<GitHubSyncSettings>(this.loadSettings());

    private loadSettings(): GitHubSyncSettings {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
            } catch {
                return { ...DEFAULT_SETTINGS };
            }
        }
        return { ...DEFAULT_SETTINGS };
    }

    saveSettings(newSettings: GitHubSyncSettings): void {
        this.settings.set({ ...newSettings });
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }

    private getHeaders(token: string): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        });
    }

    /**
     * Test connection to GitHub repository
     */
    async testConnection(settings: GitHubSyncSettings): Promise<boolean> {
        if (!settings.repo || !settings.token) return false;
        
        try {
            const headers = this.getHeaders(settings.token);
            // 1. Verify Repository exists and token is valid
            const repoUrl = `https://api.github.com/repos/${settings.repo}`;
            await firstValueFrom(this.http.get(repoUrl, { headers }));
            
            // 2. Verify Branch exists
            const branchUrl = `https://api.github.com/repos/${settings.repo}/branches/${settings.branch}`;
            await firstValueFrom(this.http.get(branchUrl, { headers }));
            
            return true;
        } catch (error) {
            console.error('GitHub connection test failed:', error);
            return false;
        }
    }

    /**
     * Fetch file contents and SHA from GitHub
     */
    async getFile(settings: GitHubSyncSettings): Promise<{ data: any | null; sha?: string }> {
        const headers = this.getHeaders(settings.token);
        const url = `https://api.github.com/repos/${settings.repo}/contents/${settings.filePath}?ref=${settings.branch}`;
        
        try {
            const response = await firstValueFrom(
                this.http.get<{ content: string; sha: string }>(url, { headers })
            );
            
            // Base64 decode taking care of UTF-8 characters (Swedish Å, Ä, Ö)
            const cleanedContent = response.content.replace(/\s/g, '');
            const decodedJson = decodeURIComponent(
                escape(window.atob(cleanedContent))
            );
            
            return {
                data: JSON.parse(decodedJson),
                sha: response.sha
            };
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                // File does not exist yet
                return { data: null, sha: undefined };
            }
            throw error;
        }
    }

    /**
     * Create or update file on GitHub
     */
    async updateFile(
        settings: GitHubSyncSettings,
        data: any,
        sha?: string
    ): Promise<string> {
        const headers = this.getHeaders(settings.token);
        const url = `https://api.github.com/repos/${settings.repo}/contents/${settings.filePath}`;
        
        // Base64 encode taking care of UTF-8 characters (Swedish Å, Ä, Ö)
        const jsonStr = JSON.stringify(data, null, 2);
        const base64Content = window.btoa(
            unescape(encodeURIComponent(jsonStr))
        );
        
        const body: any = {
            message: 'Synkroniserar övningsdata från JB Guitar 🎸',
            content: base64Content,
            branch: settings.branch
        };
        
        if (sha) {
            body.sha = sha;
        }
        
        const response = await firstValueFrom(
            this.http.put<{ content: { sha: string } }>(url, body, { headers })
        );
        
        return response.content.sha;
    }
}
