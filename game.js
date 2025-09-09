/* Vanilla JS Snake with canvas, keyboard + touch, localStorage high score */
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('high');
  const speedSlider = document.getElementById('speed');
  const speedDisplay = document.getElementById('speedDisplay');
  const gridSlider = document.getElementById('grid');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayMsg = document.getElementById('overlayMsg');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const pauseBtn = document.getElementById('pause');

  const btnUp = document.getElementById('up');
  const btnDown = document.getElementById('down');
  const btnLeft = document.getElementById('left');
  const btnRight = document.getElementById('right');

  const LS_KEY = 'snake.highscore.v1';

  let gridSize = parseInt(gridSlider.value, 10);
  let cellSize = canvas.width / gridSize;

  let snake = [{x: 10, y: 10}];
  let direction = {x: 1, y: 0};
  let queuedDir = null;
  let food = {x: 15, y: 10};
  let score = 0;
  let high = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
  let lastTime = 0;
  let tickInterval = 160; // ms per step; lower is faster
  let paused = false;
  let dead = false;

  function resizeGrid(size){
    gridSize = size;
    cellSize = canvas.width / gridSize;
    resetGame();
  }

  function randomFood(){
    // ensure not on snake
    while(true){
      const fx = Math.floor(Math.random() * gridSize);
      const fy = Math.floor(Math.random() * gridSize);
      if(!snake.some(seg => seg.x === fx && seg.y === fy)){
        return {x: fx, y: fy};
      }
    }
  }

  function resetGame(){
    const start = Math.floor(gridSize/2);
    snake = [{x:start, y:start}];
    direction = {x:1, y:0};
    queuedDir = null;
    food = randomFood();
    score = 0;
    dead = false;
    updateUI();
    hideOverlay();
  }

  function updateUI(){
    scoreEl.textContent = score;
    highEl.textContent = high;
    speedDisplay.textContent = `${speedSlider.value}x`;
  }

  function setPaused(v){
    paused = v;
    if(paused){
      showOverlay('Game Paused', 'Press Space or Tap ▶ to resume');
    } else {
      hideOverlay();
    }
  }

  function showOverlay(title, msg){
    overlayTitle.textContent = title;
    overlayMsg.textContent = msg;
    overlay.removeAttribute('hidden');
  }
  function hideOverlay(){ overlay.setAttribute('hidden',''); }

  function setSpeed(mult){
    // base 160ms → 1x; faster when slider increases
    const clamp = n => Math.max(1, Math.min(5, n|0));
    const m = clamp(mult);
    tickInterval = 160 / m;
    updateUI();
  }

  function setDir(nx, ny){
    // prevent reversing directly
    if((nx === -direction.x && ny === -direction.y)) return;
    queuedDir = {x: nx, y: ny};
  }

  function step(){
    if(queuedDir){ direction = queuedDir; queuedDir = null; }
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // wrap around (torus) or change to clamp for walls
    head.x = (head.x + gridSize) % gridSize;
    head.y = (head.y + gridSize) % gridSize;

    // collision with self
    if(snake.some(seg => seg.x === head.x && seg.y === head.y)){
      dead = true;
      high = Math.max(high, score);
      localStorage.setItem(LS_KEY, String(high));
      updateUI();
      showOverlay('Game Over', 'Press Enter or ⟲ to restart');
      return;
    }

    snake.unshift(head);

    // food?
    if(head.x === food.x && head.y === food.y){
      score += 1;
      food = randomFood();
      if(score > high){ high = score; localStorage.setItem(LS_KEY, String(high)); }
    } else {
      snake.pop();
    }
    updateUI();
  }

  function draw(){
    // background/grid
    ctx.fillStyle = '#0a0f15';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // grid lines
    ctx.strokeStyle = '#152232';
    ctx.lineWidth = 1;
    for(let i=1;i<gridSize;i++){
      const p = i * cellSize;
      ctx.beginPath(); ctx.moveTo(p,0); ctx.lineTo(p, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,p); ctx.lineTo(canvas.width, p); ctx.stroke();
    }

    // food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    const fx = (food.x + 0.5) * cellSize;
    const fy = (food.y + 0.5) * cellSize;
    ctx.arc(fx, fy, Math.max(5, cellSize*0.35), 0, Math.PI*2);
    ctx.fill();

    // snake
    for(let i=0;i<snake.length;i++){
      const seg = snake[i];
      const x = seg.x * cellSize;
      const y = seg.y * cellSize;
      const r = 8;
      // rounded rect
      ctx.fillStyle = i === 0 ? '#58d68d' : '#2ecc71';
      roundRect(ctx, x+1, y+1, cellSize-2, cellSize-2, r);
      ctx.fill();
    }
  }

  function roundRect(ctx, x, y, w, h, r){
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  function loop(ts){
    if(paused || dead){
      lastTime = ts;
      requestAnimationFrame(loop);
      return;
    }
    if(ts - lastTime >= tickInterval){
      step();
      lastTime = ts;
    }
    draw();
    requestAnimationFrame(loop);
  }

  // input
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if(k === ' ' || k === 'escape'){ paused = !paused; paused ? showOverlay('Game Paused','Press Space, Esc or Tap ▶ to resume') : hideOverlay(); }
    else if(k === 'enter'){ resetGame(); }
    else if(k === 'arrowup' || k === 'w'){ setDir(0,-1); }
    else if(k === 'arrowdown' || k === 's'){ setDir(0,1); }
    else if(k === 'arrowleft' || k === 'a'){ setDir(-1,0); }
    else if(k === 'arrowright' || k === 'd'){ setDir(1,0); }
  });

  // buttons
  btnUp.addEventListener('click', () => setDir(0,-1));
  btnDown.addEventListener('click', () => setDir(0,1));
  btnLeft.addEventListener('click', () => setDir(-1,0));
  btnRight.addEventListener('click', () => setDir(1,0));
  pauseBtn.addEventListener('click', () => { paused = !paused; paused ? showOverlay('Game Paused','Press Space, Esc or Tap ▶ to resume') : hideOverlay(); });
  resumeBtn.addEventListener('click', () => { paused=false; hideOverlay(); });
  restartBtn.addEventListener('click', () => { resetGame(); setPaused(false); });

  // touch swipe
  (function enableSwipe(el){
    let sx=0, sy=0, tracking=false;
    el.addEventListener('touchstart', (e) => {
      if(e.touches.length!==1) return;
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY; tracking = true;
    }, {passive:true});
    el.addEventListener('touchmove', (e) => {}, {passive:true});
    el.addEventListener('touchend', (e) => {
      if(!tracking) return;
      tracking=false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if(Math.max(ax, ay) < 24) return; // ignore tiny swipes
      if(ax > ay){
        setDir(dx > 0 ? 1 : -1, 0);
      } else {
        setDir(0, dy > 0 ? 1 : -1);
      }
    }, {passive:true});
  })(canvas);

  // sliders
  speedSlider.addEventListener('input', () => setSpeed(parseInt(speedSlider.value,10)));
  gridSlider.addEventListener('input', () => resizeGrid(parseInt(gridSlider.value,10)));

  // initial
  function fitCanvas(){
    // keep square, based on wrapper size (CSS handles responsiveness)
    const rect = canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    canvas.width = size;
    canvas.height = size;
    cellSize = canvas.width / gridSize;
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();
  setSpeed(parseInt(speedSlider.value,10));
  resetGame();
  requestAnimationFrame(loop);
})();
