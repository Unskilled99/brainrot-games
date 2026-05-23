document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const screens = {
        menu: document.getElementById('main-menu'),
        game: document.getElementById('game-screen'),
        settlement: document.getElementById('settlement-screen')
    };

    // Carousel Elements
    const gameCards = document.querySelectorAll('.game-card');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // UI Elements
    const startBtn = document.getElementById('start-btn');
    const surrenderBtn = document.getElementById('surrender-btn');
    const winCheatBtn = document.getElementById('win-cheat-btn');
    const loseCheatBtn = document.getElementById('lose-cheat-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    const currentGameNameEl = document.getElementById('current-game-name');
    const currentIqEl = document.getElementById('current-iq');
    const resultTitleEl = document.getElementById('result-title');
    const finalIqEl = document.getElementById('final-iq');
    const percentileEl = document.getElementById('percentile');

    // State
    let currentGameIndex = 0;
    let currentIq = 15;
    
    const gameModes = [
        { id: 'tower', name: '數字爬塔 (Tower 67)' },
        { id: 'shooter', name: '腦殘射擊遊戲' },
        { id: 'path', name: '選擇路線' }
    ];

    // Functions
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    function updateCarousel() {
        gameCards.forEach((card, index) => {
            if (index === currentGameIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    function startGame() {
        const game = gameModes[currentGameIndex];
        currentGameNameEl.textContent = game.name;
        currentIq = 15; // 初始 IQ
        updateIqDisplay();
        
        console.log(`Starting game mode: ${game.id}`);
        switchScreen('game');
    }

    function updateIqDisplay() {
        currentIqEl.textContent = `IQ: ${currentIq}`;
    }

    function endGame(isWin) {
        if (isWin) {
            resultTitleEl.textContent = 'WIN!!!';
            resultTitleEl.className = 'win';
            currentIq = Math.floor(Math.random() * 50000) + 100000; // Fake high IQ
        } else {
            resultTitleEl.textContent = 'LOSE!!!';
            resultTitleEl.className = 'lose';
            currentIq = Math.floor(Math.random() * 10); // Fake low IQ
        }

        finalIqEl.textContent = currentIq;
        
        // Random fake percentile
        const percentile = isWin ? (Math.random() * 5 + 94).toFixed(1) : (Math.random() * 60 + 10).toFixed(1);
        percentileEl.textContent = percentile;

        switchScreen('settlement');
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        currentGameIndex = (currentGameIndex - 1 + gameCards.length) % gameCards.length;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentGameIndex = (currentGameIndex + 1) % gameCards.length;
        updateCarousel();
    });

    startBtn.addEventListener('click', startGame);

    surrenderBtn.addEventListener('click', () => {
        endGame(false);
    });

    winCheatBtn.addEventListener('click', () => {
        endGame(true);
    });

    loseCheatBtn.addEventListener('click', () => {
        endGame(false);
    });

    retryBtn.addEventListener('click', startGame);
    
    backToMenuBtn.addEventListener('click', () => {
        switchScreen('menu');
    });

    // Initialize
    updateCarousel();
});
