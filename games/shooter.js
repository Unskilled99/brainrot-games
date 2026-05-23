window.GameModules['shooter'] = {
    container: null,
    cloneCount: 1,
    timeElapsed: 0,
    timerInterval: null,
    
    init: function(container) {
        this.container = container;
        this.cloneCount = 1;
        this.timeElapsed = 0;
        this.render();
        
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerUI();
            
            // 彩蛋檢查: 時間超過4分鐘 (240秒) 且人數超過100
            if (this.timeElapsed > 240 && this.cloneCount > 100) {
                clearInterval(this.timerInterval);
                alert("無限模式彩蛋觸發！獲得物品: 當機的 CPU");
                if (window.EndGameCallback) window.EndGameCallback(true);
            }
        }, 1000);
    },
    
    cleanup: function() {
        clearInterval(this.timerInterval);
        this.container.innerHTML = '';
    },
    
    render: function() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'shooter-wrapper';
        
        wrapper.innerHTML = `
            <div class="shooter-hud">
                <div>存活時間: <span id="shooter-time">0</span>s</div>
                <div class="shooter-clones">目前分身數量: <span id="clone-count">${this.cloneCount}</span> 👦</div>
            </div>
            
            <div class="shooter-gates">
                <button id="gate-left" class="gate-btn gate-blue">+1 分身</button>
                <button id="gate-right" class="gate-btn gate-red">射擊敵人波浪</button>
            </div>
            
            <div class="shooter-action">
                不斷向前推進中... 假裝有偽3D效果 🛣️
            </div>
        `;
        
        this.container.appendChild(wrapper);
        
        document.getElementById('gate-left').addEventListener('click', () => {
            this.cloneCount++;
            document.getElementById('clone-count').textContent = this.cloneCount;
        });
        
        document.getElementById('gate-right').addEventListener('click', () => {
            // 打敵人，會死掉一些分身
            if (this.cloneCount > 5) {
                this.cloneCount -= 5;
                document.getElementById('clone-count').textContent = this.cloneCount;
                alert("擊退敵人！損失 5 個分身。");
            } else {
                alert("分身數量不足以擊退敵人波浪，挑戰失敗！");
                if (window.EndGameCallback) window.EndGameCallback(false);
            }
        });
    },
    
    updateTimerUI: function() {
        const timeEl = document.getElementById('shooter-time');
        if (timeEl) timeEl.textContent = this.timeElapsed;
    }
};
