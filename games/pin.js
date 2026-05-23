window.GameModules['pin'] = {
    container: null,
    gridWidth: 6,
    gridHeight: 8,
    mapData: [],
    playerPos: { x: 0, y: 0 },
    waterLevel: 8, // 水位起始在最底下 (大於 gridHeight)
    waterInterval: null,
    gravityInterval: null,
    selectedCell: null,
    colors: ['🔴', '🔵', '🟢', '🟡', '🟣'],
    
    init: function(container) {
        this.container = container;
        this.playerPos = { x: 0, y: 0 };
        this.waterLevel = 8;
        this.selectedCell = null;
        this.mapData = [];
        
        // 產生網格
        for (let y = 0; y < this.gridHeight; y++) {
            let row = [];
            for (let x = 0; x < this.gridWidth; x++) {
                row.push({
                    t: 'gem',
                    c: this.colors[Math.floor(Math.random() * this.colors.length)]
                });
            }
            this.mapData.push(row);
        }
        
        // 設定起點、終點與隱藏門
        this.mapData[0][0] = { t: 'player' };
        this.mapData[this.gridHeight - 1][this.gridWidth - 1] = { t: 'goal' };
        this.mapData[this.gridHeight - 1][0] = { t: 'door' }; // 隱藏門(彩蛋)
        
        this.render();
        
        // 水位上升計時器
        this.waterInterval = setInterval(() => {
            this.waterLevel -= 0.5; // 每秒上升半格
            this.checkCollision();
            this.updateWaterUI();
        }, 1000);
        
        // 重力與消除判定計時器
        this.gravityInterval = setInterval(() => {
            this.applyGravity();
            this.checkCollision();
        }, 300);
    },
    
    cleanup: function() {
        clearInterval(this.waterInterval);
        clearInterval(this.gravityInterval);
        this.container.innerHTML = '';
    },
    
    render: function() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'pin-wrapper';
        
        const grid = document.createElement('div');
        grid.className = 'pin-grid';
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cellData = this.mapData[y][x];
                const cell = document.createElement('div');
                cell.className = `pin-cell ${cellData.t}`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (this.selectedCell && this.selectedCell.x === x && this.selectedCell.y === y) {
                    cell.classList.add('selected');
                }
                
                if (cellData.t === 'gem') {
                    cell.textContent = cellData.c;
                } else if (cellData.t === 'player') {
                    cell.textContent = '👦';
                } else if (cellData.t === 'goal') {
                    cell.textContent = '🏁';
                } else if (cellData.t === 'door') {
                    // 隱藏門，看起來像一般方塊
                    cell.textContent = '🚪';
                    cell.classList.add('hidden-door');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(x, y));
                grid.appendChild(cell);
            }
        }
        
        const water = document.createElement('div');
        water.className = 'pin-water';
        water.id = 'pin-water';
        wrapper.appendChild(water);
        
        wrapper.appendChild(grid);
        this.container.appendChild(wrapper);
        this.updateWaterUI();
    },
    
    updateWaterUI: function() {
        const waterEl = document.getElementById('pin-water');
        if (waterEl) {
            // 計算水的高度百分比
            const percentage = Math.max(0, (this.gridHeight - this.waterLevel) / this.gridHeight * 100);
            waterEl.style.height = `${percentage}%`;
        }
    },
    
    handleCellClick: function(x, y) {
        // 只允許點擊 gem
        if (this.mapData[y][x].t !== 'gem') return;
        
        if (!this.selectedCell) {
            this.selectedCell = { x, y };
            this.render();
        } else {
            // 檢查是否相鄰
            const dx = Math.abs(this.selectedCell.x - x);
            const dy = Math.abs(this.selectedCell.y - y);
            
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                // 交換
                const temp = this.mapData[y][x];
                this.mapData[y][x] = this.mapData[this.selectedCell.y][this.selectedCell.x];
                this.mapData[this.selectedCell.y][this.selectedCell.x] = temp;
                
                // 檢查是否有消除 (簡單邏輯，暫時只檢查交換的兩格周圍)
                // 這裡為了簡化框架，我們直接掃描全圖消除
                this.checkMatches();
            }
            
            this.selectedCell = null;
            this.render();
        }
    },
    
    checkMatches: function() {
        let toRemove = [];
        // 橫向檢查
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth - 2; x++) {
                let c1 = this.mapData[y][x];
                let c2 = this.mapData[y][x+1];
                let c3 = this.mapData[y][x+2];
                if (c1.t === 'gem' && c2.t === 'gem' && c3.t === 'gem' && c1.c === c2.c && c2.c === c3.c) {
                    toRemove.push({x,y}, {x:x+1,y}, {x:x+2,y});
                }
            }
        }
        // 縱向檢查
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight - 2; y++) {
                let c1 = this.mapData[y][x];
                let c2 = this.mapData[y+1][x];
                let c3 = this.mapData[y+2][x];
                if (c1.t === 'gem' && c2.t === 'gem' && c3.t === 'gem' && c1.c === c2.c && c2.c === c3.c) {
                    toRemove.push({x,y}, {x,y:y+1}, {x,y:y+2});
                }
            }
        }
        
        // 執行消除
        if (toRemove.length > 0) {
            toRemove.forEach(pos => {
                this.mapData[pos.y][pos.x] = { t: 'empty' };
            });
            this.render();
        }
    },
    
    applyGravity: function() {
        let changed = false;
        
        // 方塊往下掉
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = this.gridHeight - 2; y >= 0; y--) {
                if (this.mapData[y][x].t === 'gem' || this.mapData[y][x].t === 'player') {
                    if (this.mapData[y+1][x].t === 'empty') {
                        // Swap down
                        this.mapData[y+1][x] = this.mapData[y][x];
                        this.mapData[y][x] = { t: 'empty' };
                        
                        if (this.mapData[y+1][x].t === 'player') {
                            this.playerPos = { x, y: y+1 };
                        }
                        changed = true;
                    } else if (this.mapData[y][x].t === 'player' && (this.mapData[y+1][x].t === 'goal' || this.mapData[y+1][x].t === 'door')) {
                        // 抵達終點
                        this.playerPos = { x, y: y+1 };
                        changed = true;
                    }
                }
            }
        }
        
        if (changed) {
            this.render();
        }
    },
    
    checkCollision: function() {
        // 檢查是否碰到終點
        if (this.playerPos.y === this.gridHeight - 1 && this.playerPos.x === this.gridWidth - 1) {
            clearInterval(this.waterInterval);
            clearInterval(this.gravityInterval);
            if (window.EndGameCallback) window.EndGameCallback(true);
            return;
        }
        
        // 檢查是否碰到隱藏門(彩蛋)
        if (this.playerPos.y === this.gridHeight - 1 && this.playerPos.x === 0) {
            clearInterval(this.waterInterval);
            clearInterval(this.gravityInterval);
            alert("彩蛋觸發！發現隱藏門，獲得物品: 一個金色插銷?(實際是鑰匙)");
            if (window.EndGameCallback) window.EndGameCallback(true);
            return;
        }
        
        // 檢查是否被水淹沒
        if (this.playerPos.y >= this.waterLevel) {
            clearInterval(this.waterInterval);
            clearInterval(this.gravityInterval);
            if (window.EndGameCallback) window.EndGameCallback(false);
        }
    }
};
