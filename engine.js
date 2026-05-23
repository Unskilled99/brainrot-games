window.PlayEngine = {
    container: null,
    elements: [],
    player: null,
    
    init: function(container, mapData) {
        this.container = container;
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'hidden';
        wrapper.style.backgroundColor = '#fafafa';
        
        this.elements = [];
        this.player = null;

        // Render map elements based on editor data
        mapData.forEach(d => {
            const el = document.createElement('div');
            el.className = `canvas-element ce-${d.type}`;
            el.style.left = d.x + 'px';
            el.style.top = d.y + 'px';
            el.style.width = d.width + 'px';
            el.style.height = d.height + 'px';
            
            if (d.type === 'player') el.textContent = '👦';
            if (d.type === 'enemy') el.textContent = '👹';
            if (d.type === 'goal') el.textContent = '🏁';
            if (d.type === 'text' || d.type === 'number') el.textContent = d.props.value || '...';
            
            wrapper.appendChild(el);
            
            const obj = { dom: el, data: d };
            this.elements.push(obj);
            if (d.type === 'player') this.player = obj;
        });
        
        this.container.appendChild(wrapper);

        // Bind WASD Event
        this.handleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
    },

    cleanup: function() {
        document.removeEventListener('keydown', this.handleKeyDown);
    },

    handleKeyDown: function(e) {
        if (!this.player) return;
        
        // Don't process input if a modal is active
        if (document.querySelector('.overlay.active')) return;

        let dx = 0, dy = 0;
        const speed = 50; // Map grid size
        
        if (e.key === 'w' || e.key === 'W') dy = -speed;
        if (e.key === 's' || e.key === 'S') dy = speed;
        if (e.key === 'a' || e.key === 'A') dx = -speed;
        if (e.key === 'd' || e.key === 'D') dx = speed;

        if (dx !== 0 || dy !== 0) {
            this.player.data.x += dx;
            this.player.data.y += dy;
            
            // Boundary checks
            const rect = this.container.getBoundingClientRect();
            if (this.player.data.x < 0) this.player.data.x = 0;
            if (this.player.data.y < 0) this.player.data.y = 0;

            this.player.dom.style.left = this.player.data.x + 'px';
            this.player.dom.style.top = this.player.data.y + 'px';

            this.checkCollisions();
        }
    },

    checkCollisions: function() {
        const p = this.player.data;
        const pRect = { left: p.x, right: p.x + p.width, top: p.y, bottom: p.y + p.height };

        for (let i = 0; i < this.elements.length; i++) {
            const obj = this.elements[i];
            if (obj === this.player) continue;

            const t = obj.data;
            const tRect = { left: t.x, right: t.x + t.width, top: t.y, bottom: t.y + t.height };

            // Simple AABB Collision
            if (pRect.left < tRect.right && pRect.right > tRect.left &&
                pRect.top < tRect.bottom && pRect.bottom > tRect.top) {
                
                if (t.type === 'goal') {
                    if (window.EndGameCallback) window.EndGameCallback(true);
                    return;
                } else if (t.type === 'enemy') {
                    if (window.EndGameCallback) window.EndGameCallback(false);
                    return;
                }
            }
        }
    }
};
