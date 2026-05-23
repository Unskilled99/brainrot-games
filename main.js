window.GameModules = {};
window.EndGameCallback = null;

// Global Settings State
window.GlobalSettings = {
    volume: 50,
    brightness: 100
};

document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        menu: document.getElementById('main-menu'),
        game: document.getElementById('game-screen'),
        editor: document.getElementById('editor-screen'),
        settlement: document.getElementById('settlement-screen')
    };

    const overlays = {
        settings: document.getElementById('settings-overlay'),
        achievements: document.getElementById('achievements-overlay'),
        pause: document.getElementById('pause-overlay')
    };

    // UI Buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const startBtn = document.getElementById('start-btn');
    const editorBtn = document.getElementById('editor-btn');
    const surrenderBtn = document.getElementById('surrender-btn');
    const pauseSurrenderBtn = document.getElementById('pause-surrender-btn');
    const winCheatBtn = document.getElementById('win-cheat-btn');
    const loseCheatBtn = document.getElementById('lose-cheat-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    // Top Bar Buttons
    const settingsBtn = document.getElementById('settings-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const closeAchievementsBtn = document.getElementById('close-achievements-btn');
    const resumeBtn = document.getElementById('resume-btn');

    // Settings Sliders
    const volumeSlider = document.getElementById('volume-slider');
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessFilter = document.getElementById('brightness-filter');

    // State
    let currentGameIndex = 0;
    const gameCards = document.querySelectorAll('.game-card');
    
    const gameModes = [
        { id: 'tower', name: '數字爬塔 (Tower 67)' },
        { id: 'pin', name: '拔插銷 (消除版)' },
        { id: 'spelling', name: 'Spelling' },
        { id: 'shooter', name: '腦殘射擊遊戲' }
    ];

    window.switchScreen = function(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    };

    function updateCarousel() {
        gameCards.forEach((card, index) => {
            if (index === currentGameIndex) card.classList.add('active');
            else card.classList.remove('active');
        });
    }

    // Settings Logic
    volumeSlider.addEventListener('input', (e) => {
        window.GlobalSettings.volume = e.target.value;
    });

    brightnessSlider.addEventListener('input', (e) => {
        window.GlobalSettings.brightness = e.target.value;
        const b = e.target.value; 
        if (b < 100) {
            const alpha = (100 - b) / 100;
            brightnessFilter.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
        } else {
            const alpha = (b - 100) / 100;
            brightnessFilter.style.backgroundColor = `rgba(255, 255, 255, ${alpha})`;
        }
    });

    // Overlay Handlers
    settingsBtn.addEventListener('click', () => overlays.settings.classList.add('active'));
    closeSettingsBtn.addEventListener('click', () => overlays.settings.classList.remove('active'));
    
    achievementsBtn.addEventListener('click', () => overlays.achievements.classList.add('active'));
    closeAchievementsBtn.addEventListener('click', () => overlays.achievements.classList.remove('active'));

    pauseBtn.addEventListener('click', () => overlays.pause.classList.add('active'));
    resumeBtn.addEventListener('click', () => overlays.pause.classList.remove('active'));

    // Achievement Unlocks
    window.UnlockAchievement = function(id) {
        const ach = document.getElementById('ach-' + id);
        if (ach) {
            ach.classList.remove('locked');
            ach.classList.add('unlocked');
            const realName = ach.getAttribute('data-name');
            ach.innerHTML = '✅ ' + realName;
        }
    };

    // Game Logic
    window.EndGameCallback = function(isWin) {
        endGame(isWin);
    };

    function startGame() {
        const game = gameModes[currentGameIndex];
        document.getElementById('current-game-name').textContent = game.name;
        document.getElementById('current-iq').textContent = `IQ: 15`;
        
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = '';

        if (window.GameModules[game.id] && typeof window.GameModules[game.id].init === 'function') {
            window.GameModules[game.id].init(gameContainer);
        } else {
            gameContainer.innerHTML = `<div class="placeholder-text">遊戲模組 ${game.id} 尚未實作...</div>`;
        }
        window.switchScreen('game');
    }

    editorBtn.addEventListener('click', () => {
        if (window.initEditor) window.initEditor();
        window.switchScreen('editor');
    });

    function endGame(isWin) {
        const game = gameModes[currentGameIndex];
        if (window.GameModules[game.id] && typeof window.GameModules[game.id].cleanup === 'function') {
            window.GameModules[game.id].cleanup();
        }
        if (window.PlayEngine && typeof window.PlayEngine.cleanup === 'function') {
            window.PlayEngine.cleanup();
        }
        document.getElementById('game-container').innerHTML = '';

        const resultTitleEl = document.getElementById('result-title');
        if (isWin) {
            resultTitleEl.textContent = 'WIN!!!';
            resultTitleEl.className = 'win';
            document.getElementById('final-iq').textContent = Math.floor(Math.random() * 50000) + 100000;
        } else {
            resultTitleEl.textContent = 'LOSE!!!';
            resultTitleEl.className = 'lose';
            document.getElementById('final-iq').textContent = Math.floor(Math.random() * 10);
        }
        
        document.getElementById('percentile').textContent = isWin ? (Math.random() * 5 + 94).toFixed(1) : (Math.random() * 60 + 10).toFixed(1);
        overlays.pause.classList.remove('active');
        window.switchScreen('settlement');
    }

    prevBtn.addEventListener('click', () => {
        currentGameIndex = (currentGameIndex - 1 + gameCards.length) % gameCards.length;
        updateCarousel();
    });
    nextBtn.addEventListener('click', () => {
        currentGameIndex = (currentGameIndex + 1) % gameCards.length;
        updateCarousel();
    });

    startBtn.addEventListener('click', startGame);
    winCheatBtn.addEventListener('click', () => endGame(true));
    loseCheatBtn.addEventListener('click', () => endGame(false));
    pauseSurrenderBtn.addEventListener('click', () => endGame(false));
    retryBtn.addEventListener('click', startGame);
    backToMenuBtn.addEventListener('click', () => window.switchScreen('menu'));

    updateCarousel();
});
