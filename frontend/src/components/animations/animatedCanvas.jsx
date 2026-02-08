// components/animations/AnimatedCanvas.jsx
import { useEffect, useRef } from 'react';

const AnimatedCanvas = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();

    // Particle system
    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
      }
      
      reset() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        
        // Theme-aware colors
        if (theme === 'dark') {
          this.color = Math.random() > 0.5 ? '#60a5fa' : '#3b82f6';
        } else {
          this.color = Math.random() > 0.5 ? '#2563eb' : '#1d4ed8';
        }
        
        this.opacity = Math.random() * 0.4 + 0.1;
        this.wander = 0;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        this.wander += 0.01;
        this.x += Math.sin(this.wander) * 0.2;
        this.y += Math.cos(this.wander) * 0.2;
        
        if (this.x < -20 || this.x > canvas.width / dpr + 20 || 
            this.y < -20 || this.y > canvas.height / dpr + 20) {
          this.reset();
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Geometric circles - EXACTLY like original Login.jsx
    class GeometricCircle {
      constructor() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.radius = Math.random() * 80 + 60; // Same as original
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.003 - 0.0015; // Same as original
        this.segments = Math.floor(Math.random() * 8) + 6; // Same as original
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.015 + 0.008; // Same as original
        
        // Theme-aware colors
        if (theme === 'dark') {
          this.color = Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 64, 175, 0.12)';
        } else {
          this.color = Math.random() > 0.5 ? 'rgba(37, 99, 235, 0.15)' : 'rgba(30, 64, 175, 0.2)';
        }
      }
      
      update() {
        this.rotation += this.rotationSpeed;
        this.pulse += this.pulseSpeed;
        const pulseEffect = Math.sin(this.pulse) * 0.2 + 0.8;
        this.currentRadius = this.radius * pulseEffect;
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5; // Same as original
        
        const segmentAngle = (Math.PI * 2) / this.segments;
        
        // Create geometric pattern - EXACTLY like original
        for (let i = 0; i < this.segments; i++) {
          const angle1 = i * segmentAngle;
          const angle2 = (i + 1) % this.segments * segmentAngle;
          
          const x1 = Math.cos(angle1) * this.currentRadius;
          const y1 = Math.sin(angle1) * this.currentRadius;
          const x2 = Math.cos(angle2) * this.currentRadius;
          const y2 = Math.sin(angle2) * this.currentRadius;
          
          ctx.moveTo(0, 0);
          ctx.lineTo(x1, y1);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        
        ctx.moveTo(this.currentRadius, 0);
        for (let i = 0; i <= this.segments; i++) {
          const angle = i * segmentAngle;
          const x = Math.cos(angle) * this.currentRadius;
          const y = Math.sin(angle) * this.currentRadius;
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connection lines
    class ConnectionLine {
      constructor(particle1, particle2) {
        this.p1 = particle1;
        this.p2 = particle2;
        this.opacity = 0;
      }
      
      update() {
        const dx = this.p1.x - this.p2.x;
        const dy = this.p1.y - this.p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) { // Same as original
          this.opacity = Math.min(this.opacity + 0.03, 0.25 * (1 - distance / 100));
        } else {
          this.opacity = Math.max(this.opacity - 0.03, 0);
        }
      }
      
      draw() {
        if (this.opacity > 0.01) {
          let lineColor;
          if (theme === 'dark') {
            lineColor = `rgba(96, 165, 250, ${this.opacity})`;
          } else {
            lineColor = `rgba(37, 99, 235, ${this.opacity})`;
          }
          
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.8; // Same as original
          ctx.moveTo(this.p1.x, this.p1.y);
          ctx.lineTo(this.p2.x, this.p2.y);
          ctx.stroke();
        }
      }
    }

    // Initialize with proper counts
    const particleCount = theme === 'dark' ? 120 : 100; // More particles for dark mode
    const particles = Array.from({ length: particleCount }, () => new Particle());
    const circles = Array.from({ length: 8 }, () => new GeometricCircle()); // Same count as original
    const connections = [];
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        connections.push(new ConnectionLine(particles[i], particles[j]));
      }
    }

    let animationId;
    
    const animate = () => {
      // Clear canvas with theme-specific background
      ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Circles
      circles.forEach(circle => {
        circle.update();
        circle.draw();
      });
      
      // Particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connections
      connections.forEach(connection => {
        connection.update();
        connection.draw();
      });
      
      // Theme-aware gradient overlay
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 600
      );
      
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(30, 64, 175, 0.2)');
        gradient.addColorStop(0.5, 'rgba(30, 64, 175, 0.08)');
        gradient.addColorStop(1, 'rgba(30, 64, 175, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default AnimatedCanvas;