import { useEffect, useRef } from "react";

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let paused = false;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }[] = [];

    const mouse = { x: -9999, y: -9999 };

    // Fewer particles on mobile — keeps 60fps on low-end devices
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 14 : 28;

    let resizeScheduled = false;
    const resize = () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        resizeScheduled = false;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    };

    resize();
    window.addEventListener("resize", resize);

    // INIT PARTICLES
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    const draw = () => {
      if (paused) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const maxDistance = 100;
      const mouseRadius = 80;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (distToMouse < mouseRadius) {
          const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
          p.x += Math.cos(angle) * 2;
          p.y += Math.sin(angle) * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(184,159,255,0.25)";
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < maxDistance) {
            ctx.strokeStyle = `rgba(184,159,255,${(1 - dist / maxDistance) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    // Pause animation when tab is hidden — saves battery on mobile
    const handleVisibilityChange = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticlesBackground;
