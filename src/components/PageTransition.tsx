import { motion } from "framer-motion";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="min-h-screen w-full flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
