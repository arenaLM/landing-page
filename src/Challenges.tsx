import { motion } from 'framer-motion';
import { Car, Users, Trophy, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

function Challenges() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: 'monospace' }}>
            ACTIVE CHALLENGES
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto" style={{ fontFamily: 'monospace' }}>
            Compete in simulation challenges. Optimize via code. Represent your school.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Challenge 1: Rally */}
          <Link to="/challenge/rally">
            <motion.div
              className="group relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-800 hover:border-cyan-400 transition-all cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-48 bg-gradient-to-r from-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
                <Car className="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded font-mono">
                  LIVE
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors" style={{ fontFamily: 'monospace' }}>
                  01: MULTI-TERRAIN RALLY
                </h3>
                <p className="text-slate-400 mb-4 font-mono text-sm leading-relaxed">
                  Optimize suspension, gear ratios, and diff-lock for a circular track featuring Snow, Dirt, Gravel, and Sand. Use RL or heuristic prompting.
                </p>

                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-300 border border-slate-700 font-mono">Three.js</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-300 border border-slate-700 font-mono">Python/JS</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-300 border border-slate-700 font-mono">Controls</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Challenge 2: Maze Worker */}
          <Link to="/challenge/maze">
            <motion.div
              className="group relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-800 hover:border-green-400 transition-all cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="h-48 bg-gradient-to-r from-green-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
                <div className="grid grid-cols-3 gap-1 opacity-50 absolute right-10 top-10 rotate-12">
                  {[...Array(9)].map((_, i) => <div key={i} className="w-2 h-2 bg-green-400/50"></div>)}
                </div>
                <Users className="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute bottom-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded font-mono">
                  NEW
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors" style={{ fontFamily: 'monospace' }}>
                  02: MAZE WORKER
                </h3>
                <p className="text-slate-400 mb-4 font-mono text-sm leading-relaxed">
                  Navigate a 3D maze using logic. Program your bot to find the exit from Top Right to Bottom Left.
                </p>

                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-green-300 border border-slate-700 font-mono">Algorithms</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-green-300 border border-slate-700 font-mono">Logic</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-green-300 border border-slate-700 font-mono">Bot</span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Mini Leaderboard Preview */}
        <motion.div
          className="mt-16 grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-mono">
              <Trophy className="text-yellow-500 w-5 h-5" /> TOP SCHOOLS
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Stanford', score: 9842, color: 'text-yellow-400' },
                { name: 'UC Berkeley', score: 9720, color: 'text-slate-300' },
                { name: 'MIT', score: 9650, color: 'text-orange-400' },
              ].map((school, i) => (
                <div key={school.name} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-3 font-mono text-white">
                    <span className={`${school.color} font-bold`}>#{i + 1}</span>
                    {school.name}
                  </div>
                  <span className="text-green-400 font-mono text-sm">{school.score.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-mono">
              <Play className="text-blue-500 w-5 h-5" /> RECENT DEPLOYS
            </h3>
            <div className="space-y-3">
              {[
                { user: 'j_chen', school: 'mit.edu', algo: 'RL Algorithm', rank: 1 },
                { user: 's_gupta', school: 'cmu.edu', algo: 'PID Control', rank: 2 },
                { user: 'm_rossi', school: 'stanford.edu', algo: 'Genetic Algo', rank: 3 },
              ].map((deploy) => (
                <div key={deploy.user} className="flex justify-between items-center p-3 bg-slate-800/50 rounded border-l-2 border-blue-500">
                  <div>
                    <div className="font-bold text-white font-mono">{deploy.user}</div>
                    <div className="text-xs text-slate-500 font-mono">{deploy.school}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-cyan-400 font-mono">{deploy.algo}</div>
                    <div className="text-xs text-yellow-500 font-mono">Rank {deploy.rank}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Challenges;

