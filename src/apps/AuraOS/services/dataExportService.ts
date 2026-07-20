
import { StorageManager } from '../.claude/lib/storageManager';

export interface ExportOptions {
    format: 'json' | 'csv' | 'txt';
    sections: {
        sessions: boolean;
        practices: boolean;
        insights: boolean;
        preferences: boolean;
    };
    includeTimestamps: boolean;
}

export interface ExportResult {
    blob: Blob;
    filename: string;
    size: number;
}

/**
 * Service to handle data export in multiple formats
 */
export const dataExportService = {
    /**
     * Export data based on options
     */
    exportData(options: ExportOptions): ExportResult {
        const allData = StorageManager.exportAll();
        const filteredData: Record<string, any> = {};

        // Filter by section
        if (options.sections.sessions) {
            Object.keys(allData).forEach(key => {
                if (key.includes('history') || key.includes('session') || key.includes('draft')) {
                    filteredData[key] = allData[key];
                }
            });
        }

        if (options.sections.practices) {
            filteredData['aura-practice-stack'] = allData['aura-practice-stack'];
            filteredData['aura-practice-notes'] = allData['aura-practice-notes'];
            filteredData['aura-completion-history'] = allData['aura-completion-history'];
        }

        if (options.sections.insights) {
            filteredData['aura-integrated-insights'] = allData['aura-integrated-insights'];
            filteredData['aura-aqal-report'] = allData['aura-aqal-report'];
        }

        if (options.sections.preferences) {
            filteredData['aura-preferences'] = allData['aura-preferences'];
            filteredData['aura-user-profile'] = allData['aura-user-profile'];
        }

        // Always include a bit of metadata
        filteredData['export-metadata'] = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            format: options.format
        };

        let content: string = '';
        let mimeType: string = '';
        let extension: string = '';

        switch (options.format) {
            case 'json':
                content = JSON.stringify(filteredData, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;
            case 'csv':
                content = this.convertToCsv(filteredData);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'txt':
                content = this.convertToSummary(filteredData);
                mimeType = 'text/plain';
                extension = 'txt';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const filename = `aura-export-${new Date().toISOString().split('T')[0]}.${extension}`;

        return {
            blob,
            filename,
            size: blob.size
        };
    },

    /**
     * Convert JSON data to CSV (best effort for flat structures like session logs)
     */
    convertToCsv(data: Record<string, any>): string {
        let csv = 'ID,Type,Date,Title,Description\n';

        // Attempt to extract sessions if available
        const sessionKeys = Object.keys(data).filter(k => k.includes('history'));

        sessionKeys.forEach(key => {
            const items = data[key];
            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    const id = item.id || item.sessionId || 'N/A';
                    const type = item.type || key.replace('aura-history-', '') || 'N/A';
                    const date = item.date || item.createdAt || 'N/A';
                    const title = (item.title || item.name || '').replace(/,/g, ';');
                    const desc = (item.description || item.content?.summary || '').replace(/,/g, ';').substring(0, 100);

                    csv += `${id},${type},${date},${title},${desc}\n`;
                });
            }
        });

        return csv;
    },

    /**
     * Convert JSON data to a readable TXT summary
     */
    convertToSummary(data: Record<string, any>): string {
        let summary = 'AURA OS - INTEGRAL LIFE PRACTICE SUMMARY\n';
        summary += '==========================================\n';
        summary += `Export Date: ${new Date().toLocaleString()}\n\n`;

        if (data['aura-integrated-insights']) {
            summary += 'LATEST INSIGHTS\n---------------\n';
            const insights = data['aura-integrated-insights'];
            if (Array.isArray(insights)) {
                insights.slice(0, 5).forEach((insight: any) => {
                    summary += `- [${insight.date}] ${insight.title}\n`;
                    summary += `  ${insight.shortSummary}\n\n`;
                });
            }
        }

        if (data['aura-practice-stack']) {
            summary += 'CURRENT PRACTICE STACK\n----------------------\n';
            const stack = data['aura-practice-stack'];
            if (Array.isArray(stack)) {
                stack.forEach((p: any) => {
                    summary += `- ${p.name} (${p.roi} ROI)\n`;
                });
            }
        }

        summary += '\n--- End of Summary ---';
        return summary;
    }
};
