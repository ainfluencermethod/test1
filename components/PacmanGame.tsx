import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

// 1 = Wall, 0 = Dot, 2 = Empty, 9 = Pacman, 8 = Ghost
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,1,2,2,8,8,8,2,2,1,0,0,0,0,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,9,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const CELL_SIZE = 20;
const SPEED = 2; // Pixels per frame
const GHOST_SPEED = 1;

const PacmanGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  // Game State Refs (for loop performance)
  const gameState = useRef({
    map: JSON.parse(JSON.stringify(INITIAL_MAP)),
    pacman: { x: 0, y: 0, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouthOpen: 0 },
    ghosts: [
      { x: 0, y: 0, color: '#ff2a4d', dx: 0, dy: 0 },
      { x: 0, y: 0, color: '#ff8a2a', dx: 0, dy: 0 },
      { x: 0, y: 0, color: '#2affd5', dx: 0, dy: 0 }
    ],
    score: 0,
    frameCount: 0,
    animationId: 0
  });

  const initGame = useCallback(() => {
    const map = JSON.parse(JSON.stringify(INITIAL_MAP));
    let pacman = { x: 0, y: 0, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouthOpen: 0 };
    const ghosts: any[] = [];
    const ghostColors = ['#ff2a4d', '#ff8a2a', '#2affd5'];
    let ghostIndex = 0;

    // Find start positions
    for(let r=0; r<map.length; r++) {
      for(let c=0; c<map[r].length; c++) {
        if(map[r][c] === 9) {
          pacman.x = c * CELL_SIZE;
          pacman.y = r * CELL_SIZE;
          map[r][c] = 2; // clear tile
        } else if(map[r][c] === 8) {
          if (ghostIndex < 3) {
            ghosts.push({
              x: c * CELL_SIZE,
              y: r * CELL_SIZE,
              color: ghostColors[ghostIndex],
              dx: GHOST_SPEED, 
              dy: 0
            });
            ghostIndex++;
          }
          map[r][c] = 2;
        }
      }
    }

    gameState.current = {
      map,
      pacman,
      ghosts,
      score: 0,
      frameCount: 0,
      animationId: 0
    };
    
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setGameActive(true);
  }, []);

  useEffect(() => {
    initGame();
    // Game Loop
    const loop = () => {
      if (!gameActive) return;
      update();
      draw();
      gameState.current.animationId = requestAnimationFrame(loop);
    };
    gameState.current.animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [gameActive, initGame]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      
      const { pacman } = gameState.current;
      if (e.key === 'ArrowUp') { pacman.nextDx = 0; pacman.nextDy = -SPEED; }
      if (e.key === 'ArrowDown') { pacman.nextDx = 0; pacman.nextDy = SPEED; }
      if (e.key === 'ArrowLeft') { pacman.nextDx = -SPEED; pacman.nextDy = 0; }
      if (e.key === 'ArrowRight') { pacman.nextDx = SPEED; pacman.nextDy = 0; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const { pacman } = gameState.current;
    if (dir === 'UP') { pacman.nextDx = 0; pacman.nextDy = -SPEED; }
    if (dir === 'DOWN') { pacman.nextDx = 0; pacman.nextDy = SPEED; }
    if (dir === 'LEFT') { pacman.nextDx = -SPEED; pacman.nextDy = 0; }
    if (dir === 'RIGHT') { pacman.nextDx = SPEED; pacman.nextDy = 0; }
  };

  const update = () => {
    if (gameOver || gameWon) return;

    const { pacman, map, ghosts } = gameState.current;
    gameState.current.frameCount++;

    // PACMAN MOVEMENT
    // Only turn if perfectly aligned with grid
    if (pacman.x % CELL_SIZE === 0 && pacman.y % CELL_SIZE === 0) {
      const col = pacman.x / CELL_SIZE;
      const row = pacman.y / CELL_SIZE;

      // Try next direction
      if (pacman.nextDx !== 0 || pacman.nextDy !== 0) {
        const nextCol = col + Math.sign(pacman.nextDx);
        const nextRow = row + Math.sign(pacman.nextDy);
        if (map[nextRow] && map[nextRow][nextCol] !== 1) {
          pacman.dx = pacman.nextDx;
          pacman.dy = pacman.nextDy;
          pacman.nextDx = 0;
          pacman.nextDy = 0;
        }
      }

      // Check if current direction is blocked
      const nextCol = col + Math.sign(pacman.dx);
      const nextRow = row + Math.sign(pacman.dy);
      if (map[nextRow] && map[nextRow][nextCol] === 1) {
        pacman.dx = 0;
        pacman.dy = 0;
      }
    }

    pacman.x += pacman.dx;
    pacman.y += pacman.dy;

    // Eating Dots
    const centerX = pacman.x + CELL_SIZE / 2;
    const centerY = pacman.y + CELL_SIZE / 2;
    const col = Math.floor(centerX / CELL_SIZE);
    const row = Math.floor(centerY / CELL_SIZE);

    if (map[row][col] === 0) {
      map[row][col] = 2;
      gameState.current.score += 10;
      setScore(gameState.current.score);
      
      // Check Win
      let dotsLeft = false;
      for(let r=0; r<map.length; r++) {
        for(let c=0; c<map[r].length; c++) {
          if (map[r][c] === 0) dotsLeft = true;
        }
      }
      if (!dotsLeft) {
        setGameWon(true);
        setGameActive(false);
      }
    }

    // GHOST AI (Simple Random)
    ghosts.forEach((ghost: any) => {
      if (ghost.x % CELL_SIZE === 0 && ghost.y % CELL_SIZE === 0) {
        const gCol = ghost.x / CELL_SIZE;
        const gRow = ghost.y / CELL_SIZE;
        
        const possibleMoves = [];
        if (map[gRow-1] && map[gRow-1][gCol] !== 1) possibleMoves.push({dx:0, dy:-GHOST_SPEED});
        if (map[gRow+1] && map[gRow+1][gCol] !== 1) possibleMoves.push({dx:0, dy:GHOST_SPEED});
        if (map[gRow][gCol-1] !== 1) possibleMoves.push({dx:-GHOST_SPEED, dy:0});
        if (map[gRow][gCol+1] !== 1) possibleMoves.push({dx:GHOST_SPEED, dy:0});

        if (possibleMoves.length > 0) {
           // Don't reverse immediately if possible
           const forwardMoves = possibleMoves.filter(m => !(m.dx === -ghost.dx && m.dy === -ghost.dy));
           const validMoves = forwardMoves.length > 0 ? forwardMoves : possibleMoves;
           const move = validMoves[Math.floor(Math.random() * validMoves.length)];
           ghost.dx = move.dx;
           ghost.dy = move.dy;
        }
      }
      ghost.x += ghost.dx;
      ghost.y += ghost.dy;

      // Collision Check
      const dist = Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y);
      if (dist < CELL_SIZE - 5) {
        setGameOver(true);
        setGameActive(false);
      }
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { map, pacman, ghosts, frameCount } = gameState.current;

    // Clear
    ctx.fillStyle = '#0f0505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Map
    for(let r=0; r<map.length; r++) {
      for(let c=0; c<map[r].length; c++) {
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        if (map[r][c] === 1) {
          ctx.strokeStyle = '#2a1215';
          ctx.lineWidth = 2;
          ctx.strokeRect(x+2, y+2, CELL_SIZE-4, CELL_SIZE-4);
          ctx.shadowBlur = 0;
        } else if (map[r][c] === 0) {
          ctx.fillStyle = '#fdf2f4';
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw Pacman
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    const mouth = Math.abs(Math.sin(frameCount * 0.2)) * 0.2 * Math.PI;
    let rotation = 0;
    if (pacman.dx > 0) rotation = 0;
    if (pacman.dx < 0) rotation = Math.PI;
    if (pacman.dy < 0) rotation = -Math.PI/2;
    if (pacman.dy > 0) rotation = Math.PI/2;

    ctx.save();
    ctx.translate(pacman.x + CELL_SIZE/2, pacman.y + CELL_SIZE/2);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.arc(0, 0, CELL_SIZE/2 - 2, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();

    // Draw Ghosts
    ghosts.forEach((ghost: any) => {
       ctx.fillStyle = ghost.color;
       ctx.shadowColor = ghost.color;
       ctx.shadowBlur = 8;
       ctx.beginPath();
       ctx.arc(ghost.x + CELL_SIZE/2, ghost.y + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
       ctx.fill();
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full max-w-[380px] mb-2 font-mono text-xs">
         <span className="text-neutral-400">SCORE: <span className="text-white">{score}</span></span>
         <span className="text-cultured-accent animate-pulse">{gameOver ? 'GAME OVER' : gameWon ? 'VICTORY' : 'LIVE'}</span>
      </div>
      
      <div className="relative border border-white/10 p-1 bg-black/50 backdrop-blur-sm rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={19 * CELL_SIZE}
          height={15 * CELL_SIZE}
          className="block"
        />
        
        {(gameOver || gameWon) && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
              {gameWon ? <Trophy className="w-12 h-12 text-yellow-500 mb-4" /> : <div className="text-4xl mb-4">💀</div>}
              <h3 className="text-2xl font-black text-white uppercase mb-2">{gameWon ? 'YOU WON!' : 'GAME OVER'}</h3>
              <p className="text-neutral-400 font-mono text-xs mb-6">Score: {score}</p>
              <button 
                onClick={initGame}
                className="flex items-center gap-2 bg-cultured-accent hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
           </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6 md:hidden">
         <div></div>
         <button className="p-4 bg-white/10 rounded-lg active:bg-cultured-accent/50" onClick={() => setDirection('UP')}><ArrowUp className="w-6 h-6 text-white" /></button>
         <div></div>
         <button className="p-4 bg-white/10 rounded-lg active:bg-cultured-accent/50" onClick={() => setDirection('LEFT')}><ArrowLeft className="w-6 h-6 text-white" /></button>
         <button className="p-4 bg-white/10 rounded-lg active:bg-cultured-accent/50" onClick={() => setDirection('DOWN')}><ArrowDown className="w-6 h-6 text-white" /></button>
         <button className="p-4 bg-white/10 rounded-lg active:bg-cultured-accent/50" onClick={() => setDirection('RIGHT')}><ArrowRight className="w-6 h-6 text-white" /></button>
      </div>

      <p className="hidden md:block text-[10px] text-neutral-600 font-mono mt-4 uppercase tracking-widest">
         UPORABI PUŠČICE ZA PREMIKANJE
      </p>
    </div>
  );
};

export default PacmanGame;