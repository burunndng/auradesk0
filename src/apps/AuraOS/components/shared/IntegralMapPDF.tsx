import React from 'react';

export default function IntegralMapPDF() {
  return (
    <div className="mt-16 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-100 mb-4">The Integral Map</h2>
        <p className="text-lg text-slate-400 mb-8">A Guide to Wholeness</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 space-y-6">
        {/* Mobile: Show download prompt */}
        <div className="sm:hidden mb-4 p-4 bg-accent/10 rounded-lg border border-accent/20 text-center space-y-4">
          <p className="text-sm text-slate-300">PDFs work best when downloaded on mobile</p>
          <a
            href="https://files.catbox.moe/6cmv57.pdf"
            download="The_Integral_Map.pdf"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            <span>Download PDF</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>

        {/* Desktop: Show iframe */}
        <div className="hidden sm:block aspect-[8.5/11] relative rounded-lg overflow-hidden border-2 border-slate-700/50 bg-slate-900">
          <iframe
            src="https://files.catbox.moe/6cmv57.pdf"
            className="w-full h-full"
            title="The Integral Map: A Guide to Wholeness"
            loading="lazy"
          />
        </div>

        <div className="space-y-4">
          <p className="text-slate-300 text-center">
            Explore the comprehensive framework for integral life practice
          </p>
          <div className="flex justify-center">
            <a
              href="https://files.catbox.moe/6cmv57.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              <span>Download PDF</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
