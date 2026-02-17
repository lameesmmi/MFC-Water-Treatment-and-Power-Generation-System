import { Droplet, Zap, CheckCircle, ArrowRight, Clock, Loader2 } from 'lucide-react';

interface StageIndicatorProps {
  currentStage: number; // 0=off, 1-3=active stage
  stageElapsed: number[]; // seconds elapsed for each stage [s1, s2, s3]
  stageDurations: number[]; // target duration per stage in seconds
}

const stages = [
  { label: 'Stage 1', name: 'Pre-treatment', icon: Droplet, color: 'blue' },
  { label: 'Stage 2', name: 'Treatment', icon: Zap, color: 'purple' },
  { label: 'Stage 3', name: 'Post-treatment', icon: CheckCircle, color: 'green' },
] as const;

const colorMap = {
  blue: {
    activeBg: 'bg-blue-500/10',
    activeBorder: 'border-blue-500',
    activeText: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/20',
    progressBg: 'bg-blue-500',
  },
  purple: {
    activeBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500',
    activeText: 'text-purple-500 dark:text-purple-400',
    iconBg: 'bg-purple-500/20',
    progressBg: 'bg-purple-500',
  },
  green: {
    activeBg: 'bg-green-500/10',
    activeBorder: 'border-green-500',
    activeText: 'text-green-500 dark:text-green-400',
    iconBg: 'bg-green-500/20',
    progressBg: 'bg-green-500',
  },
} as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export function StageIndicator({ currentStage, stageElapsed, stageDurations }: StageIndicatorProps) {
  const systemActive = currentStage > 0;

  return (
    <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
      {stages.map((stage, idx) => {
        const stageNum = idx + 1;
        const Icon = stage.icon;
        const colors = colorMap[stage.color];
        const elapsed = stageElapsed[idx];
        const duration = stageDurations[idx];

        const isActive = currentStage === stageNum;
        const isCompleted = currentStage > stageNum;
        const isPending = currentStage < stageNum;
        const isOff = currentStage === 0;
        const progress = isActive ? Math.min((elapsed / duration) * 100, 100) : isCompleted ? 100 : 0;

        return (
          <div key={stageNum} className="flex items-center gap-2">
            <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all overflow-hidden ${
              isOff
                ? 'bg-muted border-border'
                : isActive
                ? `${colors.activeBg} ${colors.activeBorder}`
                : isCompleted
                ? `${colors.activeBg} ${colors.activeBorder} opacity-80`
                : 'bg-muted border-border'
            }`}>
              {/* Progress bar background */}
              {(isActive || isCompleted) && (
                <div
                  className={`absolute inset-0 ${colors.progressBg} opacity-[0.07] transition-all duration-1000`}
                  style={{ width: `${progress}%` }}
                />
              )}

              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                isOff || isPending ? 'bg-muted' : colors.iconBg
              }`}>
                {isCompleted ? (
                  <CheckCircle className={`w-4 h-4 ${colors.activeText}`} />
                ) : isActive ? (
                  <Icon className={`w-4 h-4 ${colors.activeText}`} />
                ) : (
                  <Icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="relative text-left">
                <div className={`text-xs font-semibold ${
                  isOff || isPending ? 'text-muted-foreground' : colors.activeText
                }`}>
                  {stage.label}
                </div>
                <div className="text-[10px] text-muted-foreground">{stage.name}</div>
              </div>

              {/* Timer display */}
              <div className="relative flex items-center gap-0.5 ml-1">
                {isActive && (
                  <>
                    <Loader2 className={`w-3 h-3 ${colors.activeText} animate-spin`} />
                    <span className={`text-[10px] font-mono font-semibold ${colors.activeText}`}>
                      {formatTime(elapsed)}
                    </span>
                  </>
                )}
                {isCompleted && (
                  <>
                    <Clock className={`w-3 h-3 ${colors.activeText}`} />
                    <span className={`text-[10px] font-mono ${colors.activeText}`}>
                      {formatTime(elapsed)}
                    </span>
                  </>
                )}
                {(isPending || isOff) && (
                  <span className="text-[10px] font-mono text-muted-foreground">--</span>
                )}
              </div>
            </div>

            {/* Arrow between stages */}
            {idx < 2 && (
              <ArrowRight className={`w-4 h-4 ${
                isCompleted
                  ? `${colors.activeText}`
                  : isActive
                  ? `${colors.activeText} animate-pulse`
                  : 'text-muted-foreground'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
