window.GameModules['tower'] = {
    container: null,
    playerPower: 1,
    playerPos: { x: 0, y: 4 },
    gridSize: 5,
    mapData: [],
    
    init: function(container) {
        this.container = container;
        this.playerPower = 1;
        this.playerPos = { x: 0, y: 4 };
        
        // Map elements: type (empty, weapon, enemy, boss, player), value, operation
        this.mapData = [
            [{t:'empty'}, {t:'empty'}, {t:'empty'}, {t:'enemy', v:200}, {t:'boss', v:67}],
            [{t:'empty'}, {t:'empty'}, {t:'enemy', v:50}, {t:'weapon', op:'+', v:10}, {t:'enemy', v:3}],
            [{t:'empty'}, {t:'empty'}, {t:'weapon', op:'*', v:3}, {t:'empty'}, {t:'weapon', op:'*', v:2}],
            [{t:'enemy', v:10}, {t:'weapon', op:'+', v:10}, {t:'enemy', v:10}, {t:'empty'}, {t:'empty'}],
            [{t:'player'}, {t:'weapon', op:'+', v:5}, {t:'weapon', op:'*', v:2}, {t:'empty'}, {t:'empty'}]
        ];
        
        // 確保初始玩家位置
        this.mapData[this.playerPos.y][this.playerPos.x] = {t:'player'};
        
        this.render();
    },
    
    cleanup: function() {
        this.container.innerHTML = '';
    },
    
    render: function() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'tower-wrapper';
        
        const powerDisplay = document.createElement('div');
        powerDisplay.className = 'tower-power';
        powerDisplay.textContent = `您的戰力: ${this.playerPower}`;
        wrapper.appendChild(powerDisplay);
        
        const grid = document.createElement('div');
        grid.className = 'tower-grid';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cellData = this.mapData[y][x];
                const cell = document.createElement('div');
                cell.className = `tower-cell ${cellData.t}`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (cellData.t === 'player') {
                    cell.innerHTML = `<div>👦</div><div class="val">${this.playerPower}</div>`;
                } else if (cellData.t === 'weapon') {
                    cell.innerHTML = `<div>⚔️</div><div class="val">${cellData.op}${cellData.v}</div>`;
                } else if (cellData.t === 'enemy' || cellData.t === 'boss') {
                    cell.innerHTML = `<div>👹</div><div class="val">${cellData.v}</div>`;
                }
                
                // 點擊移動
                cell.addEventListener('click', () => this.tryMove(x, y));
                
                grid.appendChild(cell);
            }
        }
        
        wrapper.appendChild(grid);
        this.container.appendChild(wrapper);
    },
    
    tryMove: function(x, y) {
        // 檢查是否相鄰
        const dx = Math.abs(this.playerPos.x - x);
        const dy = Math.abs(this.playerPos.y - y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.interact(x, y);
        }
    },
    
    interact: function(x, y) {
        const target = this.mapData[y][x];
        
        if (target.t === 'empty') {
            this.moveTo(x, y);
        } else if (target.t === 'weapon') {
            if (target.op === '+') this.playerPower += target.v;
            if (target.op === '*') this.playerPower *= target.v;
            this.moveTo(x, y);
        } else if (target.t === 'enemy' || target.t === 'boss') {
            if (this.playerPower >= target.v) {
                // 勝
                this.playerPower += target.v;
                
                if (target.t === 'boss') {
                    // 通關檢查彩蛋
                    if (target.v === 67 && (this.playerPower - target.v) === 67) {
                        alert("彩蛋觸發！以數值67通關，獲得物品: 一個金色人型上半身雕像 (左手高右手低，手上兩座小塔，數值分別是6跟7)");
                    }
                    if (window.EndGameCallback) window.EndGameCallback(true);
                } else {
                    this.moveTo(x, y);
                }
            } else {
                // 敗
                if (window.EndGameCallback) window.EndGameCallback(false);
            }
        }
    },
    
    moveTo: function(x, y) {
        this.mapData[this.playerPos.y][this.playerPos.x] = {t:'empty'};
        this.playerPos = { x, y };
        this.mapData[y][x] = {t:'player'};
        this.render();
    }
};
