import { motion } from 'framer-motion';
import { X, Star, Flame, Trophy, Zap, ArrowRight, Users, MessageSquare, MapPin, Code2, Github, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock Data
const mockAchievements = [
  { icon: '🏎️', title: 'Speed Demon', desc: 'Top 10% in Rally' },
  { icon: '🤖', title: 'Bot Master', desc: 'Deployed 5 autonomous bots' },
  { icon: '🧠', title: 'Big Brain', desc: 'Solved 3 hard algorithms' },
  { icon: '🔥', title: 'On Fire', desc: '7 day streak' },
  { icon: '🎓', title: 'Scholar', desc: 'Represented Stanford' },
  { icon: '🛡️', title: 'Defender', desc: 'Won 10 defenses' },
  null,
  null
];

const mockActivity = Array.from({ length: 52 }, (_, i) => ({
  date: `2025-03-${i + 1}`,
  count: Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0
}));

const mockFollowers = [
  { name: 'Sarah Chen', school: 'MIT', avatar: 'SC' },
  { name: 'David Kim', school: 'Berkeley', avatar: 'DK' },
  { name: 'Raj Patel', school: 'CMU', avatar: 'RP' },
  { name: 'Emily Zhang', school: 'Stanford', avatar: 'EZ' },
  { name: 'Michael Ross', school: 'Harvard', avatar: 'MR' },
];

const mockMessages = [
  { from: 'Sarah Chen', school: 'MIT', text: 'Your rally bot code is insane! How did you optimize the drift?', time: '2h ago' },
  { from: 'David Kim', school: 'Berkeley', text: 'Challenge accepted on the Drone Swarm map.', time: '5h ago' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function Profile() {
  const lumoLevel = 12;
  const zonesCompleted = 5;
  const totalZones = 8;
  const dayStreak = 14;
  const badgesCount = 6;
  const totalBadges = 20;
  
  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Mobile Only */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <h1 className="text-2xl font-black text-cyan-400 tracking-wider" style={{ fontFamily: 'monospace' }}>
            PLAYER PROFILE
          </h1>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Left Sidebar (Profile Info) */}
          <motion.div 
            className="md:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="md:sticky md:top-24 space-y-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-full aspect-square bg-slate-800 rounded-full border-4 border-cyan-400 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                   <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                   />
                </div>
                <div className="absolute bottom-4 right-4 bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-full border-2 border-black shadow-lg">
                  LVL {lumoLevel}
                </div>
              </div>

              {/* Names & Bio */}
              <div>
                <h2 className="text-3xl font-black text-white font-mono mb-1">ALEX CHEN</h2>
                <div className="text-xl text-slate-400 font-mono mb-4">alex_c</div>
                
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  AI enthusiast and full-stack engineer. Optimizing neural nets for fun. Representing Stanford in the Engineer Cup.
                </p>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 py-2 rounded-md font-bold text-sm transition-colors mb-4">
                  Edit Profile
                </button>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-white font-bold">1.2k</span> followers · <span className="text-white font-bold">84</span> following
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Stanford University
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <a href="#" className="hover:text-cyan-400 hover:underline">alexchen.dev</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="w-4 h-4 text-slate-500" />
                    <a href="#" className="hover:text-cyan-400 hover:underline">github.com/alex_c</a>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Achievements</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{dayStreak} Day Streak</div>
                    <div className="text-slate-500 text-xs">Personal Best: 21</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{badgesCount}/{totalBadges} Badges</div>
                    <div className="text-slate-500 text-xs">Top 5% of Players</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="md:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Desktop Nav (Fake Tabs) */}
            <div className="hidden md:flex items-center gap-8 border-b border-slate-800 mb-8">
              <button className="pb-3 border-b-2 border-cyan-400 text-cyan-400 font-bold text-sm gap-2 flex items-center">
                <Code2 className="w-4 h-4" /> Overview
              </button>
              <button className="pb-3 border-b-2 border-transparent text-slate-400 hover:text-white font-bold text-sm gap-2 flex items-center transition-colors">
                <Trophy className="w-4 h-4" /> Challenges
              </button>
              <button className="pb-3 border-b-2 border-transparent text-slate-400 hover:text-white font-bold text-sm gap-2 flex items-center transition-colors">
                <Star className="w-4 h-4" /> Badges
              </button>
            </div>

            {/* Highlighted Projects / Current Activity */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-white">Current Training</h3>
                <Link to="/challenges" className="text-cyan-400 text-sm hover:underline">View all challenges</Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 hover:border-cyan-400/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-cyan-400 font-mono text-sm font-bold">Rally Optimization</div>
                    <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded border border-green-500/20">Active</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Optimizing vehicle dynamics for mixed terrain tracks using reinforcement learning.</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-cyan-400 w-[65%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>65% Complete</span>
                    <span className="group-hover:text-cyan-400 transition-colors">Continue &rarr;</span>
                  </div>
                </Card>
                
                <Card className="p-4 border-dashed border-slate-700 bg-transparent flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 hover:bg-slate-900/30 transition-all cursor-pointer">
                  <div className="text-center">
                    <div className="mx-auto w-8 h-8 rounded-full border border-current flex items-center justify-center mb-2">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Start New Challenge</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contribution Graph */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Activity (Last 30 Days)</h3>
              <Card className="p-6">
                <div className="flex gap-1 h-32 items-end">
                  {mockActivity.map((day, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-sm bg-slate-800 hover:bg-green-400 transition-colors relative group"
                      style={{ 
                        height: `${Math.max(10, day.count * 20)}%`,
                        backgroundColor: day.count > 0 ? `rgba(74, 222, 128, ${Math.min(1, 0.2 + day.count * 0.2)})` : ''
                      }}
                    >
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 border border-slate-700 shadow-xl">
                          {day.count} contributions on {day.date}
                       </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                  <span>Learn how we count contributions</span>
                  <div className="flex items-center gap-2">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Activity / Messages */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Discussions</h3>
                <Card className="divide-y divide-slate-800 overflow-hidden">
                  {mockMessages.map((msg, i) => (
                    <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm hover:text-blue-400 cursor-pointer">{msg.from}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{msg.school}</span>
                        </div>
                        <span className="text-xs text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-slate-300">{msg.text}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <button className="hover:text-white flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Reply</button>
                        <button className="hover:text-white">Like</button>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 text-center">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold py-2 w-full">View all discussions</button>
                  </div>
                </Card>
              </div>

              {/* Network / Followers */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Network</h3>
                <Card className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mockFollowers.map((follower, i) => (
                      <div key={i} className="group relative" title={`${follower.name} (${follower.school})`}>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 hover:border-cyan-400 hover:text-white transition-colors cursor-pointer">
                          {follower.avatar}
                        </div>
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 border-dashed flex items-center justify-center text-xs text-slate-500 hover:text-white hover:border-slate-500 cursor-pointer transition-colors">
                      +1k
                    </div>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Suggested Connections</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Dr. Albus', school: 'AI Institute', role: 'Professor' },
                      { name: 'Elena R.', school: 'MIT', role: 'Student' }
                    ].map((person, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                            {person.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{person.name}</div>
                            <div className="text-xs text-slate-500">{person.role} • {person.school}</div>
                          </div>
                        </div>
                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded border border-slate-700 transition font-bold">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
