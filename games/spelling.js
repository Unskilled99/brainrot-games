window.GameModules['spelling'] = {
    container: null,
    gridSize: 20,
    gridData: [],
    dictionary: {
        'APPLE': '蘋果',
        'BANANA': '香蕉',
        'CAT': '貓',
        'DOG': '狗',
        'BRAINROT': '腦腐'
    },
    
    init: function(container) {
        this.container = container;
        this.gridData = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
        this.render();
    },
    
    cleanup: function() {
        this.container.innerHTML = '';
    },
    
    render: function() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'spelling-wrapper';
        
        const header = document.createElement('div');
        header.className = 'spelling-header';
        header.innerHTML = `
            <div>請在網格中輸入字母來拼字 (例如 APPLE, BANANA)</div>
            <div id="spelling-msg" class="spelling-msg"></div>
        `;
        wrapper.appendChild(header);
        
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'spelling-scroll';
        
        const grid = document.createElement('div');
        grid.className = 'spelling-grid';
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 40px)`;
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const input = document.createElement('input');
                input.className = 'spelling-cell';
                input.maxLength = 1;
                input.value = this.gridData[y][x];
                input.dataset.x = x;
                input.dataset.y = y;
                
                input.addEventListener('input', (e) => this.handleInput(e, x, y));
                grid.appendChild(input);
            }
        }
        
        scrollContainer.appendChild(grid);
        wrapper.appendChild(scrollContainer);
        this.container.appendChild(wrapper);
        
        // 預設捲動到中間
        scrollContainer.scrollTop = (scrollContainer.scrollHeight - scrollContainer.clientHeight) / 2;
        scrollContainer.scrollLeft = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;
    },
    
    handleInput: function(e, x, y) {
        let val = e.target.value.toUpperCase();
        if (!/^[A-Z]$/.test(val)) val = '';
        e.target.value = val;
        this.gridData[y][x] = val;
        
        this.checkWords();
    },
    
    checkWords: function() {
        let msgEl = document.getElementById('spelling-msg');
        let foundWord = '';
        let foundMeaning = '';
        
        // 簡單掃描橫向文字
        for (let y = 0; y < this.gridSize; y++) {
            let rowStr = this.gridData[y].join('');
            
            // 檢查彩蛋
            if (rowStr.includes('ANTIGRAVITY')) {
                alert("Bonus plan彩蛋觸發: \n「HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. THERE ARE...」\n...連線中斷...");
                // 開啟隱藏遊戲或結束
                if (window.EndGameCallback) window.EndGameCallback(true);
                return;
            }
            
            for (let word in this.dictionary) {
                if (rowStr.includes(word)) {
                    foundWord = word;
                    foundMeaning = this.dictionary[word];
                }
            }
        }
        
        // 簡單掃描縱向文字
        for (let x = 0; x < this.gridSize; x++) {
            let colStr = '';
            for (let y = 0; y < this.gridSize; y++) colStr += this.gridData[y][x];
            
            if (colStr.includes('ANTIGRAVITY')) {
                alert("Bonus plan彩蛋觸發: \n「HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. THERE ARE...」\n...連線中斷...");
                if (window.EndGameCallback) window.EndGameCallback(true);
                return;
            }
            
            for (let word in this.dictionary) {
                if (colStr.includes(word)) {
                    foundWord = word;
                    foundMeaning = this.dictionary[word];
                }
            }
        }
        
        if (foundWord) {
            msgEl.textContent = `找到單字: ${foundWord} (${foundMeaning})！+100 IQ`;
            msgEl.style.color = 'green';
        } else {
            msgEl.textContent = '';
        }
    }
};
