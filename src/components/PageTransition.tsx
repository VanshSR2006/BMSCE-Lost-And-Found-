import { motion } from "framer-motion";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.985,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.55,
          ease: "easeOut",
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.99,
        transition: {
          duration: 0.35,
          ease: "easeInOut",
        },
      }}
      className="min-h-screen w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
