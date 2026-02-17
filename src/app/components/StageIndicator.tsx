import { Droplet, Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface StageIndicatorProps {
  systemActive: boolean;
}

export function StageIndicator({ systemActive }: StageIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {/* Stage 1 */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
          systemActive 
            ? 'bg-blue-900/30 border-blue-500' 
            : 'bg-gray-800 border-gray-600'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            systemActive ? 'bg-blue-500/20' : 'bg-gray-700'
          }`}>
            <Droplet className={`w-4 h-4 ${systemActive ? 'text-blue-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-left">
            <div className={`text-xs font-semibold ${systemActive ? 'text-blue-400' : 'text-gray-500'}`}>
              Stage 1
            </div>
            <div className="text-xs text-gray-400">Pre-treatment</div>
          </div>
        </div>
        
        <ArrowRight className={`w-5 h-5 ${systemActive ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} />
      </div>

      {/* Stage 2 */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
          systemActive 
            ? 'bg-purple-900/30 border-purple-500' 
            : 'bg-gray-800 border-gray-600'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            systemActive ? 'bg-purple-500/20' : 'bg-gray-700'
          }`}>
            <Zap className={`w-4 h-4 ${systemActive ? 'text-purple-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-left">
            <div className={`text-xs font-semibold ${systemActive ? 'text-purple-400' : 'text-gray-500'}`}>
              Stage 2
            </div>
            <div className="text-xs text-gray-400">Treatment</div>
          </div>
        </div>
        
        <ArrowRight className={`w-5 h-5 ${systemActive ? 'text-purple-400 animate-pulse' : 'text-gray-600'}`} />
      </div>

      {/* Stage 3 */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
        systemActive 
          ? 'bg-green-900/30 border-green-500' 
          : 'bg-gray-800 border-gray-600'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          systemActive ? 'bg-green-500/20' : 'bg-gray-700'
        }`}>
          <CheckCircle className={`w-4 h-4 ${systemActive ? 'text-green-400' : 'text-gray-500'}`} />
        </div>
        <div className="text-left">
          <div className={`text-xs font-semibold ${systemActive ? 'text-green-400' : 'text-gray-500'}`}>
            Stage 3
          </div>
          <div className="text-xs text-gray-400">Post-treatment</div>
        </div>
      </div>
    </div>
  );
}
