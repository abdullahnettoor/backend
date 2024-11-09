'use client'

import { useState, useEffect, useRef } from 'react'
import { Github, Terminal } from "lucide-react"
import Link from "next/link"

export default function Landing() {
  const [playerCount, setPlayerCount] = useState(0)
  const [wsStatus, setWsStatus] = useState('connecting')
  const wsRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        if (wsRef.current) {
          wsRef.current.close();
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = isProduction
          ? window.location.host
          : 'localhost:3000';
        const wsUrl = `${protocol}//${host}/ws`;

        console.log('Connecting to WebSocket:', wsUrl);

        const connect = () => {
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            setWsStatus('connected');
            console.log('WebSocket connected');
          };

          ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            setWsStatus('disconnected');
            setTimeout(connect, 5000);
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsStatus('error');
          };
        };

        connect();
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setWsStatus('error');
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles = []
    const createParticle = (x, y, type) => ({
      x,
      y,
      type,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    })

    for (let i = 0; i < 30; i++) {
      particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height, 'X'))
      particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height, 'O'))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      particles.forEach(particle => {
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)

        if (particle.type === 'X') {
          ctx.beginPath()
          ctx.moveTo(-5, -5)
          ctx.lineTo(5, 5)
          ctx.moveTo(5, -5)
          ctx.lineTo(-5, 5)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, 5, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.restore()

        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: 0.5 }}
      />
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            <span className="font-mono font-bold">TicTacToe CLI</span>
          </div>
          {playerCount > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="font-medium">{playerCount} {playerCount === 1 ? 'Player' : 'Players'} Online</span>
            </div>
          )}
          <Link
            href="https://github.com/abdullahnettoor/tictactoe"
            className="flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">View on GitHub</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 pt-[73px]">
        <div className="min-h-[calc(100vh-73px)] flex items-center">
          <div className="max-w-3xl mx-auto text-center space-y-8 py-24 px-4">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white">
                Terminal TicTacToe
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-[700px] mx-auto">
                A developer-friendly game that runs in your terminal. Take a break from coding without leaving your development environment.
              </p>
            </div>
            <pre className="font-mono text-sm sm:text-base bg-white/5 p-4 rounded-lg overflow-x-auto">
              <code>go install github.com/abdullahnettoor/tictactoe@v1.0.0</code>
            </pre>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://github.com/abdullahnettoor/tictactoe/releases"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black hover:bg-white/90 transition-colors"
              >
                Download v1.0.0
              </Link>
              <Link
                href="#features"
                className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        <section id="features" className="max-w-3xl mx-auto space-y-16 py-24 px-4">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Features</h2>
            <ul className="grid sm:grid-cols-2 gap-4 text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-white/80">🎯</span>
                Play directly in your terminal
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/80">🤖</span>
                Challenge the unbeatable AI
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/80">⌨️</span>
                Vim-style navigation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/80">👥</span>
                Multiple game modes
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How to Play</h2>
            <div className="space-y-8 text-white/60">
              <div className="space-y-3">
                <h3 className="text-xl text-white/80 font-semibold">1. Installation</h3>
                <pre className="font-mono text-sm bg-white/5 p-4 rounded-lg">
                  <code>go install github.com/abdullahnettoor/tictactoe@v1.0.0</code>
                </pre>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl text-white/80 font-semibold">2. Select Game Mode</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">👥 Local Multiplayer</h4>
                    <p className="text-sm">Challenge a friend on the same computer</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">🤖 VS Computer</h4>
                    <p className="text-sm">Test your skills against an unbeatable AI</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">🌐 Online Mode</h4>
                    <p className="text-sm">Play against other players online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="text-center text-white/60 py-4">
        <p className="text-sm">Made with ❤️ by <a href="https://github.com/abdullahnettoor" className="text-white/80 hover:text-white transition-colors">Abdullah Nettoor</a></p>
      </footer>
    </div>
  )
}

