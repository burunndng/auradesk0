import { getContext } from './context';

export type StepCallback = (step: number, audioTime: number) => void;

const LOOKAHEAD_MS = 100;    // How far ahead to schedule
const INTERVAL_MS = 25;      // How often to run the scheduling tick

export class Clock {
  public bpm = 120;
  public stepsPerBeat = 4;   // 16th notes (4 steps per quarter note)
  public swing = 0.0;        // 0.0 to 1.0 (0.0 is straight, 1.0 is full swing)
  public humanizeTime = 0.0; // 0.0 to 1.0 (timing humanization ratio)
  public humanizeVelocity = 0.0; // 0.0 to 1.0 (velocity humanization ratio)

  private _running = false;
  private _step = 0;
  private _nextStepTime = 0;
  private _intervalId: any = null;
  private _callbacks: Set<StepCallback> = new Set();

  get running() {
    return this._running;
  }

  get currentStep() {
    return this._step;
  }

  onStep(cb: StepCallback): () => void {
    this._callbacks.add(cb);
    return () => {
      this._callbacks.delete(cb);
    };
  }

  start() {
    if (this._running) return;

    const ctx = getContext();
    this._running = true;
    this._step = 0;
    // Introduce a tiny offset (50ms) to ensure the very first step schedules ahead of current audio time
    this._nextStepTime = ctx.currentTime + 0.05;

    this._intervalId = setInterval(() => this.tick(), INTERVAL_MS);
  }

  stop() {
    if (!this._running) return;

    this._running = false;
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._step = 0;
  }

  private tick() {
    let ctx;
    try {
      ctx = getContext();
    } catch (e) {
      return; // Not initialized yet
    }

    const lookaheadTime = ctx.currentTime + LOOKAHEAD_MS / 1000;

    // While there are steps to schedule before our lookahead window
    while (this._nextStepTime < lookaheadTime) {
      const stepToSchedule = this._step;
      const timeToSchedule = this._nextStepTime;

      // Dispatch callbacks
      this._callbacks.forEach((cb) => {
        try {
          cb(stepToSchedule, timeToSchedule);
        } catch (err) {
          console.error('Error in clock onStep callback:', err);
        }
      });

      this.advance();
    }
  }

  private advance() {
    const secondsPerStep = 60.0 / this.bpm / this.stepsPerBeat;
    this._nextStepTime += secondsPerStep;
    // Reset back to 0 on bar boundary (16 steps = 1 bar in 4/4 time)
    this._step = (this._step + 1) % 16;
  }
}

export const clock = new Clock();
