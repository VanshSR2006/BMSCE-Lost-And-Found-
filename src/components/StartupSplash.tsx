import { motion } from "framer-motion";

const StartupSplash = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#16052a]"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6200EE]/20 rounded-full blur-[100px]" />

      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: 1
        }}
        transition={{ 
          duration: 1.5,
          times: [0, 0.6, 1],
          ease: "easeOut"
        }}
        className="relative flex flex-col items-center"
      >
        <div className="bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-6 rounded-3xl shadow-[0_0_50px_rgba(255,46,151,0.3)] mb-8">
          <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            explore
          </span>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl font-black tracking-tighter text-white font-['Plus_Jakarta_Sans']"
        >
          BMSCE <span className="text-[#4af8e3] italic">Reconnect.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-purple-200 uppercase tracking-[0.3em] text-[10px] font-bold"
        >
          Initializing Campus Net...
        </motion.p>
      </motion.div>

      {/* Loading Bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-full h-full bg-gradient-to-r from-[#6200EE] to-[#4af8e3]"
        />
      </div>
    </motion.div>
  );
};

export default StartupSplash;
