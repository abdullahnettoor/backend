'use client'

import { useState, useEffect, useRef } from 'react'
import {  Terminal, Download, ChevronRight, Bot, Keyboard, Users, UserPlus2, Brain, Globe} from "lucide-react"
import Link from "next/link"
import { FaApple, FaWindows, FaLinux, FaGithub } from 'react-icons/fa';

export default function Landing() {
  const version = 'v1.0.0';

  const [playerCount, setPlayerCount] = useState(0)
  const [wsStatus, setWsStatus] = useState('connecting')
  const wsRef = useRef(null)
  const canvasRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [osInfo, setOsInfo] = useState({
    name: 'Mac',
    icon: <FaApple className="w-6 h-6" />,
    url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-darwin-amd64`
  });

  useEffect(() => {
    const detectOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('mac') || userAgent.includes('darwin')) {
        return {
          name: 'Mac',
          icon: <FaApple className="w-6 h-6" />,
          url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-darwin-amd64`
        };
      } else if (userAgent.includes('win')) {
        return {
          name: 'Windows',
          icon: <FaWindows className="w-6 h-6" />,
          url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-windows-amd64.exe`
        };
      }
      return {
        name: 'Linux',
        icon: <FaLinux className="w-6 h-6" />,
        url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-linux-amd64`
      };
    };

    setOsInfo(detectOS());
  }, [version]);

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

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsStatus('connected');
          console.log('WebSocket connected');
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setWsStatus('disconnected');
          const timeoutId = setTimeout(connectWebSocket, 5000);
          return () => clearTimeout(timeoutId);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error details:', {
            error,
            readyState: ws.readyState,
            url: wsUrl
          });
          setWsStatus('error');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'playerCount') {
              setPlayerCount(data.count);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setWsStatus('error');
        const timeoutId = setTimeout(connectWebSocket, 5000);
        return () => clearTimeout(timeoutId);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = 100 - ((e.clientX / window.innerWidth) * 100);
      const y = 100 - ((e.clientY / window.innerHeight) * 100);
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.download-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-hidden flex flex-col relative z-10">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ opacity: 0.4 }}
      />
      <div
        className="fixed inset-0 -z-20 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15), rgba(30, 64, 175, 0.15), transparent 50%)`
        }}
      />
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            <span className="font-mono font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              TicTacToe CLI
            </span>
          </div>
          {playerCount > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} animate-ping`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${wsStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="font-medium">{playerCount} {playerCount === 1 ? 'Player' : 'Players'} Online</span>
            </div>
          )}
          <Link
            href="https://github.com/abdullahnettoor/tictactoe"
            className="flex items-center gap-2 hover:text-purple-500 transition-colors"
          >
            <FaGithub className="w-5 h-5" />
            <span className="hidden sm:inline">View on GitHub</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 pt-[73px]">
        <div className="min-h-[calc(100vh-73px)] flex items-center">
          <div className="max-w-4xl mx-auto text-center space-y-12 py-24 px-4">
            <div className="space-y-6">
              <h1 className="space-y-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
                <div className="flex items-center justify-center gap-4">
                  <span className="font-mono text-primary/80 text-2xl sm:text-3xl md:text-4xl">$</span>
                  <span className="font-mono text-white/60 text-2xl sm:text-3xl md:text-4xl">./play</span>
                </div>
                <div className="px-4">
                  <span className="bg-gradient-to-r from-primary via-primary-light to-secondary text-transparent bg-clip-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                    TicTacToe
                  </span>
                </div>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-[700px] mx-auto">
                A developer-friendly game that runs in your terminal. Take a break from coding without leaving your development environment.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <pre className="w-full sm:w-auto font-mono text-sm bg-terminal-default p-4 rounded-lg overflow-x-auto shadow-xl border border-secondary/20">
                <code className="text-primary">go install github.com/abdullahnettoor/tictactoe@{version}</code>
              </pre>

              <div className="flex flex-col items-center gap-2">
                <Link
                  href={osInfo.url}
                  className="group inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-8 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  <Download className="w-6 h-6 mr-3 text-black/70 group-hover:text-black transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-bold text-lg text-black/70 group-hover:text-black flex items-center">
                    Download for {osInfo.name} <span className="mx-1 pb-1">{osInfo.icon}</span>
                  </span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Download for other platforms
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-terminal-default rounded-lg shadow-xl border border-secondary/20 z-50">
                      {[
                        { os: 'Windows', icon: <FaWindows className="w-4 h-4" />, url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-windows-amd64.exe` },
                        { os: 'Mac', icon: <FaApple className="w-4 h-4" />, url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-darwin-amd64` },
                        { os: 'Linux', icon: <FaLinux className="w-4 h-4" />, url: `https://github.com/abdullahnettoor/tictactoe/releases/download/${version}/tictactoe-linux-amd64` }
                      ].filter(option => option.os !== osInfo.name).map((option) => (
                        <Link
                          key={option.os}
                          href={option.url}
                          className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download for <span className="mx-2">{option.icon}</span> {option.os}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <section id="features" className="max-w-4xl mx-auto space-y-24 py-24 px-4">
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Features
            </h2>
            <ul className="grid sm:grid-cols-2 gap-8">
              {[
                {
                  icon: <Terminal className="w-12 h-12 text-primary" />,
                  title: 'Terminal-based',
                  description: 'Play directly in your command line interface'
                },
                {
                  icon: <Bot className="w-12 h-12 text-primary" />,
                  title: 'AI Opponent',
                  description: 'Challenge our unbeatable artificial intelligence'
                },
                {
                  icon: <Keyboard className="w-12 h-12 text-primary" />,
                  title: 'Vim-style Navigation',
                  description: 'Use familiar keybindings for seamless gameplay'
                },
                {
                  icon: <Users className="w-12 h-12 text-primary" />,
                  title: 'Multiple Game Modes',
                  description: 'Enjoy local multiplayer or online battles'
                },
              ].map((feature, index) => (
                <li key={index} className="flex flex-col items-center text-center p-6 bg-terminal-default rounded-xl shadow-lg border border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                  <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              How to Play
            </h2>
            <div className="space-y-8 text-white/80">
              <div className="space-y-4">
                <h3 className="text-2xl text-primary font-semibold">Select Game Mode</h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <UserPlus2 className="w-10 h-10 text-primary" />,
                      title: 'Local Multiplayer',
                      description: 'Challenge a friend on the same computer'
                    },
                    {
                      icon: <Brain className="w-10 h-10 text-primary" />,
                      title: 'VS Computer',
                      description: 'Test your skills against an unbeatable AI'
                    },
                    {
                      icon: <Globe className="w-10 h-10 text-primary" />,
                      title: 'Online Mode',
                      description: 'Play against other players online',
                      comingSoon: true
                    },
                  ].map((mode, index) => (
                    <div key={index} className="relative flex flex-col items-center text-center p-6 bg-terminal-default rounded-xl shadow-lg border border-secondary/20 hover:border-secondary/40 transition-all duration-300">
                      {mode.comingSoon && (
                        <span className="absolute -top-3 right-4 px-2 py-1 text-xs font-semibold bg-[#1a1a1a] text-primary rounded-full border border-primary/30">
                          Coming Soon
                        </span>
                      )}
                      <div className="mb-3 transform transition-transform duration-300 hover:scale-110">
                        {mode.icon}
                      </div>
                      <h4 className="font-medium text-primary mb-2">{mode.title}</h4>
                      <p className="text-sm text-white/70">{mode.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="text-center text-white/60 py-8 border-t border-white/10">
        <p className="text-sm">
          Made with ❤️ by{' '}
          <a href="https://github.com/abdullahnettoor" className="text-secondary hover:text-secondary-light transition-colors">
            Abdullah Nettoor
          </a>
        </p>
      </footer>
    </div>
  )
}