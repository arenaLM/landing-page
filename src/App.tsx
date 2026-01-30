import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Challenges from './Challenges';
import RallyGame from './RallyGame';
import MazeChallenge from './MazeChallenge';
import Profile from './Profile';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b-4 border-cyan-400"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
          boxShadow: '0 0 20px rgba(0,255,255,0.3)'
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <Gamepad2 className="w-8 h-8 text-cyan-400" strokeWidth={3} />
              <span className="text-2xl font-bold text-white tracking-wider" style={{
                textShadow: '2px 2px 0 #00ffff, 4px 4px 0 rgba(0,255,255,0.3)',
                fontFamily: 'monospace'
              }}>
                AI QUESTS
              </span>
            </motion.div>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/challenges">
              <motion.button
                className="px-6 py-2 bg-cyan-400 text-black font-bold border-4 border-white"
                whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(0,255,255,0.8)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                  fontFamily: 'monospace'
                }}
              >
                ENTER GAME
              </motion.button>
            </Link>
            <Link to="/profile">
              <motion.div
                className="w-10 h-10 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(0,255,255,0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenge/rally" element={<RallyGame />} />
        <Route path="/challenge/maze" element={<MazeChallenge />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
