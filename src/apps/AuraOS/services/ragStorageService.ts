/**
 * RAG Storage Service
 *
 * Handles file uploads/downloads for the AI Coach knowledge base (RAG).
 * All S3 operations are proxied through /api/rag-storage (server-side credentials).
 * Requires an authenticated Supabase session — JWT is forwarded to the proxy.
 */

import { supabase } from './supabaseClient';

const PROXY_URL = '/api/rag-storage';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export interface FileMetadata {
  fileName: string;
  filePath: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

async function getAuthHeader(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? `Bearer ${token}` : null;
}

async function callProxy(body: object): Promise<any> {
  const auth = await getAuthHeader();
  if (!auth) throw new Error('Not authenticated');

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Storage error: ${res.status}`);
  }

  return res.json();
}

/** Upload a file to the user's knowledge base */
export async function uploadFile(file: File): Promise<UploadResult> {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const data = await callProxy({
      action: 'upload',
      fileName: file.name,
      fileData: base64,
      contentType: file.type || 'application/octet-stream',
    });

    return { success: true, filePath: data.filePath, fileName: data.fileName };
  } catch (error: any) {
    console.error('[RAG Storage] Upload failed:', error);
    return { success: false, error: error.message || 'Failed to upload file' };
  }
}

/** Download a file from the user's knowledge base */
export async function downloadFile(fileName: string): Promise<Blob | null> {
  try {
    const data = await callProxy({ action: 'download', fileName });
    const binary = atob(data.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: data.contentType });
  } catch (error: any) {
    console.error('[RAG Storage] Download failed:', error);
    return null;
  }
}

/** List all files in the user's knowledge base */
export async function listFiles(): Promise<FileMetadata[]> {
  try {
    const data = await callProxy({ action: 'list' });
    return (data.files || []).map((f: any) => ({
      ...f,
      lastModified: new Date(f.lastModified),
    }));
  } catch (error: any) {
    console.error('[RAG Storage] List files failed:', error);
    return [];
  }
}

/** Delete a file from the user's knowledge base */
export async function deleteFile(fileName: string): Promise<boolean> {
  try {
    await callProxy({ action: 'delete', fileName });
    return true;
  } catch (error: any) {
    console.error('[RAG Storage] Delete failed:', error);
    return false;
  }
}

/** Get the text content of a file */
export async function getFileText(fileName: string): Promise<string | null> {
  try {
    const blob = await downloadFile(fileName);
    if (!blob) return null;
    return blob.text();
  } catch (error: any) {
    console.error('[RAG Storage] Get file text failed:', error);
    return null;
  }
}

/** Check if S3 storage is configured (server-side check) */
export async function isConfigured(): Promise<boolean> {
  try {
    const data = await callProxy({ action: 'check' });
    return data.configured === true;
  } catch {
    return false;
  }
}

export const ragStorageService = {
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile,
  getFileText,
  isConfigured,
};

export default ragStorageService;
