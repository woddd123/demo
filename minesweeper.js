// 经典扫雷游戏 - JavaScript实现

class Minesweeper {
    constructor() {
        // 游戏配置
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 },
            expert: { rows: 20, cols: 24, mines: 130 }
        };
        
        // 当前游戏状态
        this.currentDifficulty = 'easy';
        this.gameState = 'ready'; // ready, playing, won, lost, paused
        this.board = [];
        this.revealedCells = 0;
        this.flaggedCells = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timer = null;
        
        // 统计数据
        this.stats = this.loadStats();
        
        // 成就系统
        this.achievements = [
            { id: 'first_win', name: '初次胜利', desc: '完成第一局游戏', unlocked: false },
            { id: 'speed_demon', name: '闪电之手', desc: '30秒内完成简单难度', unlocked: false },
            { id: 'perfectionist', name: '完美主义者', desc: '不使用旗帜完成游戏', unlocked: false },
            { id: 'lucky_seven', name: '幸运七', desc: '连胜7局', unlocked: false },
            { id: 'expert_master', name: '专家大师', desc: '完成专家难度', unlocked: false }
        ];
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.newGame();
    }
    
    setupEventListeners() {
        // 重新开始按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // 暂停/继续按钮
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // 难度选择
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.changeDifficulty(difficulty);
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.newGame();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Escape':
                    if (this.gameState === 'playing') {
                        this.togglePause();
                    }
                    break;
            }
        });
    }
    
    newGame() {
        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        
        // 重置游戏状态
        this.gameState = 'ready';
        this.board = [];
        this.revealedCells = 0;
        this.flaggedCells = 0;
        this.startTime = null;
        this.gameTime = 0;
        
        // 停止计时器
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 创建游戏板
        this.createBoard();
        this.renderBoard();
        this.updateDisplay();
        
        // 更新重置按钮表情
        document.getElementById('resetBtn').textContent = '😊';
        
        // 隐藏游戏消息
        this.hideGameMessage();
        
        console.log(`新游戏开始: ${this.currentDifficulty} - ${this.rows}x${this.cols}, ${this.totalMines}个地雷`);
    }
    
    createBoard() {
        // 初始化空白游戏板
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        const safeCells = this.getSafeCells(firstClickRow, firstClickCol);
        
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 确保不在安全区域且不重复放置
            if (!safeCells.some(cell => cell.row === row && cell.col === col) && 
                !this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // 计算每个格子周围的地雷数量
        this.calculateNeighborMines();
    }
    
    getSafeCells(clickRow, clickCol) {
        const safeCells = [];
        for (let row = clickRow - 1; row <= clickRow + 1; row++) {
            for (let col = clickCol - 1; col <= clickCol + 1; col++) {
                if (this.isValidCell(row, col)) {
                    safeCells.push({ row, col });
                }
            }
        }
        return safeCells;
    }
    
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (this.isValidCell(r, c) && this.board[r][c].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    renderBoard() {
        const minefield = document.getElementById('minefield');
        minefield.innerHTML = '';
        minefield.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加事件监听器
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                cell.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                cell.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                
                minefield.appendChild(cell);
            }
        }
    }
    
    handleCellClick(e, row, col) {
        e.preventDefault();
        if (this.gameState !== 'ready' && this.gameState !== 'playing') return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        // 第一次点击时放置地雷
        if (this.gameState === 'ready') {
            this.placeMines(row, col);
            this.gameState = 'playing';
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed) return;
        
        this.toggleFlag(row, col);
    }
    
    handleMouseDown(e) {
        if (e.button === 0 && this.gameState === 'playing') {
            document.getElementById('resetBtn').textContent = '😮';
        }
    }
    
    handleMouseUp(e) {
        if (this.gameState === 'playing') {
            document.getElementById('resetBtn').textContent = '😊';
        }
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCells++;
        
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('revealed', 'revealing');
        
        if (cell.isMine) {
            // 踩到地雷，游戏结束
            cellElement.classList.add('mine-hit');
            cellElement.textContent = '💣';
            this.gameOver(false);
        } else {
            // 显示数字或空白
            if (cell.neighborMines > 0) {
                cellElement.textContent = cell.neighborMines;
                cellElement.dataset.count = cell.neighborMines;
            }
            
            // 如果是空白格子，自动揭开周围格子
            if (cell.neighborMines === 0) {
                setTimeout(() => {
                    this.revealNeighbors(row, col);
                }, 100);
            }
            
            // 检查是否获胜
            this.checkWin();
        }
        
        this.updateCellDisplay(row, col);
    }
    
    revealNeighbors(row, col) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (this.isValidCell(r, c)) {
                    this.revealCell(r, c);
                }
            }
        }
    }
    
    toggleFlag(row, col) {
        const cell = this.board[row][col];
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        cell.isFlagged = !cell.isFlagged;
        
        if (cell.isFlagged) {
            this.flaggedCells++;
            cellElement.classList.add('flagged', 'flagging');
            cellElement.textContent = '🚩';
            this.createParticle(cellElement, '🚩');
        } else {
            this.flaggedCells--;
            cellElement.classList.remove('flagged', 'flagging');
            cellElement.textContent = '';
        }
        
        this.updateDisplay();
    }
    
    checkWin() {
        const totalCells = this.rows * this.cols;
        const nonMineCells = totalCells - this.totalMines;
        
        if (this.revealedCells === nonMineCells) {
            this.gameOver(true);
        }
    }
    
    gameOver(won) {
        this.gameState = won ? 'won' : 'lost';
        this.stopTimer();
        
        if (won) {
            // 获胜处理
            document.getElementById('resetBtn').textContent = '😎';
            this.showGameMessage('🎉 恭喜获胜！', 'win');
            this.updateStats(true);
            this.checkAchievements(true);
            
            // 自动标记所有地雷
            this.autoFlagMines();
            
        } else {
            // 失败处理
            document.getElementById('resetBtn').textContent = '😵';
            this.showGameMessage('💥 游戏失败！', 'lose');
            this.updateStats(false);
            this.checkAchievements(false);
            
            // 显示所有地雷
            this.revealAllMines();
        }
        
        this.updateStatsDisplay();
    }
    
    autoFlagMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    this.flaggedCells++;
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cellElement.classList.add('flagged');
                    cellElement.textContent = '🚩';
                }
            }
        }
        this.updateDisplay();
    }
    
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                if (cell.isMine && !cell.isRevealed) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '💣';
                } else if (cell.isFlagged && !cell.isMine) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '❌';
                }
            }
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = this.gameTime.toString().padStart(3, '0');
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
            document.getElementById('pauseOverlay').style.display = 'flex';
            document.getElementById('pauseBtn').textContent = '▶️ 继续';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTime = Date.now() - (this.gameTime * 1000);
            this.startTimer();
            document.getElementById('pauseOverlay').style.display = 'none';
            document.getElementById('pauseBtn').textContent = '⏸️ 暂停';
        }
    }
    
    changeDifficulty(difficulty) {
        if (difficulty === this.currentDifficulty) return;
        
        // 更新难度按钮状态
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        this.currentDifficulty = difficulty;
        this.newGame();
    }
    
    updateDisplay() {
        const remainingMines = this.totalMines - this.flaggedCells;
        document.getElementById('minesCount').textContent = remainingMines;
        document.getElementById('flagsCount').textContent = this.flaggedCells;
    }
    
    updateCellDisplay(row, col) {
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        setTimeout(() => {
            cellElement.classList.remove('revealing', 'flagging');
        }, 300);
    }
    
    showGameMessage(message, type) {
        const messageElement = document.getElementById('gameMessage');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type} show`;
    }
    
    hideGameMessage() {
        const messageElement = document.getElementById('gameMessage');
        messageElement.classList.remove('show');
    }
    
    // 统计系统
    loadStats() {
        const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null,
                expert: null
            }
        };
        
        const saved = localStorage.getItem('minesweeper_stats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }
    
    saveStats() {
        localStorage.setItem('minesweeper_stats', JSON.stringify(this.stats));
    }
    
    updateStats(won) {
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            
            // 更新最佳时间
            const currentBest = this.stats.bestTimes[this.currentDifficulty];
            if (!currentBest || this.gameTime < currentBest) {
                this.stats.bestTimes[this.currentDifficulty] = this.gameTime;
            }
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.saveStats();
    }
    
    updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        
        const winRate = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100)
            : 0;
        document.getElementById('winRate').textContent = winRate + '%';
        
        const bestTime = this.stats.bestTimes[this.currentDifficulty];
        document.getElementById('bestTime').textContent = bestTime 
            ? this.formatTime(bestTime)
            : '---';
        
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('maxStreak').textContent = this.stats.maxStreak;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    }
    
    // 成就系统
    checkAchievements(won) {
        if (won) {
            // 首次胜利
            if (!this.achievements[0].unlocked && this.stats.gamesWon === 1) {
                this.unlockAchievement(0);
            }
            
            // 闪电之手 (简单难度30秒内)
            if (!this.achievements[1].unlocked && 
                this.currentDifficulty === 'easy' && 
                this.gameTime <= 30) {
                this.unlockAchievement(1);
            }
            
            // 完美主义者 (不使用旗帜)
            if (!this.achievements[2].unlocked && this.flaggedCells === 0) {
                this.unlockAchievement(2);
            }
            
            // 幸运七 (连胜7局)
            if (!this.achievements[3].unlocked && this.stats.currentStreak >= 7) {
                this.unlockAchievement(3);
            }
            
            // 专家大师
            if (!this.achievements[4].unlocked && this.currentDifficulty === 'expert') {
                this.unlockAchievement(4);
            }
        }
    }
    
    unlockAchievement(index) {
        const achievement = this.achievements[index];
        achievement.unlocked = true;
        
        // 显示成就通知
        this.showAchievement(achievement.name, achievement.desc);
        
        // 保存成就状态
        localStorage.setItem('minesweeper_achievements', JSON.stringify(this.achievements));
    }
    
    showAchievement(title, desc) {
        const achievementElement = document.getElementById('achievement');
        document.getElementById('achievementTitle').textContent = title;
        document.getElementById('achievementDesc').textContent = desc;
        
        achievementElement.classList.add('show');
        
        setTimeout(() => {
            achievementElement.classList.remove('show');
        }, 4000);
    }
    
    // 粒子效果
    createParticle(element, emoji) {
        const particle = document.createElement('div');
        particle.className = 'particle float';
        particle.textContent = emoji;
        
        const rect = element.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
}); 