import React, { useRef, useEffect, useState } from 'react';
import { patchGraph } from '../audio/patchgraph';
import { useDaw } from '../context/DawContext';
import { Activity, BarChart2 } from 'lucide-react';

export const AudioVisualizer: React.FC = () => {
  const { audioStatus, playing } = useDaw();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visMode, setVisMode] = useState<'waveform' | 'spectrum'>('waveform');

  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 512;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);

      const analyser = patchGraph.analyser;
      if (!analyser || audioStatus !== 'running') {
        // Draw elegant empty background state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#09090b'; // zinc-950
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Horizontal centerline
        ctx.strokeStyle = '#27272a'; // zinc-800
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#09090b'; // zinc-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visMode === 'waveform') {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 1.5;
        
        // Creative gradient for the oscilloscope wave
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#f43f5e');   // rose-500
        gradient.addColorStop(0.5, '#f59e0b'); // amber-500
        gradient.addColorStop(1, '#f43f5e');   // rose-500

        ctx.strokeStyle = gradient;
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / (bufferLength / 2)) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength / 2; i++) {
          barHeight = dataArray[i] / 1.5;

          // Compute color based on intensity
          const red = Math.min(255, 120 + barHeight);
          const green = Math.min(255, barHeight * 1.5);
          const blue = 40;

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

          x += barWidth + 1;
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [audioStatus, visMode]);

  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 h-10 select-none">
      <div className="flex flex-col gap-0.5 border-r border-zinc-800 pr-1.5">
        <button
          onClick={() => setVisMode('waveform')}
          className={`p-1 rounded transition-colors cursor-pointer ${visMode === 'waveform' ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Oscilloscope Mode"
        >
          <Activity className="w-3 h-3" />
        </button>
        <button
          onClick={() => setVisMode('spectrum')}
          className={`p-1 rounded transition-colors cursor-pointer ${visMode === 'spectrum' ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Spectrum Analyzer Mode"
        >
          <BarChart2 className="w-3 h-3" />
        </button>
      </div>

      <div className="relative w-28 h-7 bg-zinc-950 rounded border border-zinc-950 overflow-hidden">
        <canvas ref={canvasRef} width={112} height={28} className="w-full h-full" />
      </div>
    </div>
  );
};
