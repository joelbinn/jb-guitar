import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {GitHubSyncSettings} from '../models';

const SETTINGS_KEY = 'jbguitar:github-settings';

const DEFAULT_SETTINGS: GitHubSyncSettings = {
  enabled: false,
  repo: '',
  token: '',
  branch: 'main',
  filePath: 'jb-guitar-data.json'
};

@Injectable({providedIn: 'root'})
export class GitHubSyncService {
  // Config settings signal
  settings = signal<GitHubSyncSettings>(this.loadSettings());
  private readonly http = inject(HttpClient);

  saveSettings(newSettings: GitHubSyncSettings): void {
    this.settings.set({...newSettings});
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
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
      await firstValueFrom(this.http.get(repoUrl, {headers}));

      // 2. Verify Branch exists
      const branchUrl = `https://api.github.com/repos/${settings.repo}/branches/${settings.branch}`;
      await firstValueFrom(this.http.get(branchUrl, {headers}));

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
        this.http.get<{ content: string; sha: string }>(url, {headers})
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
        return {data: null, sha: undefined};
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
      this.http.put<{ content: { sha: string } }>(url, body, {headers})
    );

    return response.content.sha;
  }

  /**
   * Compacts history of the data branch to a single orphan commit.
   * DANGER: This deletes all previous commits on this branch!
   */
  async compactHistory(settings: GitHubSyncSettings): Promise<void> {
    if (!settings.repo || !settings.token) return;
    const headers = this.getHeaders(settings.token);

    // 1. Get the tree SHA of the latest commit on the branch
    const commitUrl = `https://api.github.com/repos/${settings.repo}/commits/${settings.branch}`;
    const commitObj = await firstValueFrom(
      this.http.get<{ commit: { tree: { sha: string } } }>(commitUrl, {headers})
    );
    const treeSha = commitObj.commit.tree.sha;

    // 2. Create a new orphan commit with no parents (parents: [])
    const createCommitUrl = `https://api.github.com/repos/${settings.repo}/git/commits`;
    const newCommitBody = {
      message: 'Kompakterad övningsdatahistorik 🎸',
      tree: treeSha,
      parents: []
    };
    const newCommitObj = await firstValueFrom(
      this.http.post<{ sha: string }>(createCommitUrl, newCommitBody, {headers})
    );
    const newCommitSha = newCommitObj.sha;

    // 3. Force-update the branch ref to point to the new orphan commit
    const refUrl = `https://api.github.com/repos/${settings.repo}/git/refs/heads/${settings.branch}`;
    const refBody = {
      sha: newCommitSha,
      force: true
    };
    await firstValueFrom(
      this.http.patch(refUrl, refBody, {headers})
    );
  }

  private loadSettings(): GitHubSyncSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        return {...DEFAULT_SETTINGS, ...JSON.parse(raw)};
      } catch {
        return {...DEFAULT_SETTINGS};
      }
    }
    return {...DEFAULT_SETTINGS};
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    });
  }
}

