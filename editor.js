window.initEditor = function() {
    const canvas = document.getElementById('editor-canvas');
    const tools = document.querySelectorAll('.tool-item');
    const propPanel = document.getElementById('prop-panel-content');
    const exitBtn = document.getElementById('editor-exit-btn');
    const saveBtn = document.getElementById('editor-save-btn');
    const loadBtn = document.getElementById('editor-load-btn');
    const playBtn = document.getElementById('editor-play-btn');

    let elements = [];
    let selectedElement = null;
    let dragType = null;
    let idCounter = 0;

    // 清空舊的
    canvas.innerHTML = '';
    elements = [];
    selectElement(null);

    // Setup Toolbar Drag
    tools.forEach(tool => {
        tool.addEventListener('dragstart', (e) => {
            dragType = e.target.dataset.type;
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!dragType) return;

        const rect = canvas.getBoundingClientRect();
        // snap to grid (50px)
        const x = Math.floor((e.clientX - rect.left) / 50) * 50;
        const y = Math.floor((e.clientY - rect.top) / 50) * 50;

        createElement(dragType, x, y);
        dragType = null;
    });

    // Deselect if clicking canvas background
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) {
            selectElement(null);
        }
    });

    function getEmoji(type) {
        if (type === 'player') return '👦';
        if (type === 'enemy') return '👹';
        if (type === 'goal') return '🏁';
        if (type === 'text') return 'Txt';
        if (type === 'number') return '123';
        return '';
    }

    function createElement(type, x, y, id=null, width=50, height=50, props={}) {
        const el = document.createElement('div');
        el.className = `canvas-element ce-${type}`;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.textContent = getEmoji(type);

        const newId = id || `el_${idCounter++}`;
        el.id = newId;

        const data = {
            id: newId, type, x, y, width, height, 
            props: Object.assign({ value: 1 }, props)
        };
        elements.push(data);

        // Make draggable
        let isDragging = false;
        let startX, startY;

        el.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - data.x;
            startY = e.clientY - data.y;
            selectElement(data.id);
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let nx = e.clientX - startX;
            let ny = e.clientY - startY;
            // Snap to grid
            nx = Math.round(nx / 50) * 50;
            ny = Math.round(ny / 50) * 50;
            if (nx < 0) nx = 0;
            if (ny < 0) ny = 0;
            
            el.style.left = nx + 'px';
            el.style.top = ny + 'px';
            data.x = nx;
            data.y = ny;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        canvas.appendChild(el);
        return data;
    }

    function selectElement(id) {
        selectedElement = id;
        document.querySelectorAll('.canvas-element').forEach(el => el.classList.remove('selected'));
        if (!id) {
            propPanel.innerHTML = '<p style="color:#666; font-size:0.9rem;">請點選畫布上的元件</p>';
            return;
        }

        const elDiv = document.getElementById(id);
        if(elDiv) elDiv.classList.add('selected');
        const data = elements.find(e => e.id === id);

        renderProps(data);
    }

    function renderProps(data) {
        propPanel.innerHTML = `
            <div><strong>ID:</strong> ${data.id}</div>
            <div><strong>類型:</strong> ${data.type}</div>
            <hr style="margin:10px 0;">
            <div style="margin-bottom:5px;">
                <label>X:</label> <input type="number" id="prop-x" value="${data.x}" step="50" style="width:60px;">
                <label>Y:</label> <input type="number" id="prop-y" value="${data.y}" step="50" style="width:60px;">
            </div>
            <div style="margin-bottom:5px;">
                <label>寬:</label> <input type="number" id="prop-w" value="${data.width}" step="50" style="width:60px;">
                <label>高:</label> <input type="number" id="prop-h" value="${data.height}" step="50" style="width:60px;">
            </div>
            <div style="margin-bottom:5px;">
                <label>屬性值:</label> 
                <input type="text" id="prop-val" value="${data.props.value}" style="width:100%;">
            </div>
            <button id="prop-del" class="danger-btn small" style="margin-top:10px; width:100%;">刪除元件</button>
        `;

        const updateData = () => {
            data.x = parseInt(document.getElementById('prop-x').value);
            data.y = parseInt(document.getElementById('prop-y').value);
            data.width = parseInt(document.getElementById('prop-w').value);
            data.height = parseInt(document.getElementById('prop-h').value);
            data.props.value = document.getElementById('prop-val').value;

            const el = document.getElementById(data.id);
            el.style.left = data.x + 'px';
            el.style.top = data.y + 'px';
            el.style.width = data.width + 'px';
            el.style.height = data.height + 'px';
            
            if (data.type === 'text' || data.type === 'number') {
                el.textContent = data.props.value;
            }
        };

        document.getElementById('prop-x').addEventListener('change', updateData);
        document.getElementById('prop-y').addEventListener('change', updateData);
        document.getElementById('prop-w').addEventListener('change', updateData);
        document.getElementById('prop-h').addEventListener('change', updateData);
        document.getElementById('prop-val').addEventListener('input', updateData);

        document.getElementById('prop-del').addEventListener('click', () => {
            document.getElementById(data.id).remove();
            elements = elements.filter(e => e.id !== data.id);
            selectElement(null);
        });
    }

    saveBtn.addEventListener('click', () => {
        const mapData = JSON.stringify(elements);
        localStorage.setItem('customMap', mapData);
        alert('地圖已儲存！時間: ' + new Date().toLocaleTimeString());
    });

    loadBtn.addEventListener('click', () => {
        const mapData = localStorage.getItem('customMap');
        if (mapData) {
            elements = [];
            canvas.innerHTML = '';
            idCounter = 0;
            const parsed = JSON.parse(mapData);
            parsed.forEach(d => {
                createElement(d.type, d.x, d.y, d.id, d.width, d.height, d.props);
            });
            alert('地圖載入成功！');
        } else {
            alert('沒有找到存檔。');
        }
    });

    playBtn.addEventListener('click', () => {
        const mapData = localStorage.getItem('customMap');
        if (!mapData) {
            alert('請先點擊「存檔」再進行試玩！');
            return;
        }
        window.switchScreen('game');
        document.getElementById('current-game-name').textContent = "自定義模式試玩";
        
        if (window.PlayEngine) {
            window.PlayEngine.init(document.getElementById('game-container'), JSON.parse(mapData));
        }
    });

    exitBtn.onclick = () => window.switchScreen('menu');
};
