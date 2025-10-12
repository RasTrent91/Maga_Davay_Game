// Экран загрузки
function showLoadingScreen() {
    return new Promise((resolve) => {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingSubtext = document.getElementById('loadingSubtext');

        if (!loadingScreen || !loadingProgress) {
            resolve();
            return;
        }

        let progress = 0;
        const duration = 700; // 0,7 секунды
        const interval = 30; // обновление каждые 30ms
        const increment = (interval / duration) * 100;

        // Массив сообщений для загрузки
        const loadingMessages = [
            "Подготовка ресурсов",
            "Загрузка спрайтов",
            "Инициализация игры",
            "Почти готово..."
        ];

        const loadingInterval = setInterval(() => {
            progress += increment;
            loadingProgress.style.width = Math.min(progress, 100) + '%';

            // Обновляем сообщение в зависимости от прогресса
            if (loadingSubtext) {
                if (progress < 25) {
                    loadingSubtext.textContent = loadingMessages[0];
                } else if (progress < 50) {
                    loadingSubtext.textContent = loadingMessages[1];
                } else if (progress < 75) {
                    loadingSubtext.textContent = loadingMessages[2];
                } else {
                    loadingSubtext.textContent = loadingMessages[3];
                }
            }

            if (progress >= 100) {
                clearInterval(loadingInterval);
                // Плавное исчезновение экрана загрузки
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        resolve();
                    }, 500);
                }, 300);
            }
        }, interval);
    });
}

// Объявление всех глобальных переменных ДО их использования
let tg = null;
let spritesLoaded = 0;
const totalSprites = 10;

// Объявление всех спрайтов
const playerSprite = new Image();
const playerShotSprite = new Image();
const playerWrestleSprite = new Image();
const playerWrestleAttackSprite = new Image();
const enemyBoxerSprite = new Image();
const enemyBoxer2Sprite = new Image();
const enemyWrestler1Sprite = new Image();
const enemyWrestler2Sprite = new Image();
const boss1Sprite = new Image();
const boss2Sprite = new Image();

// Фоновые изображения
const skyBg = new Image();
const rocksBg = new Image();
const forestBg = new Image();
const fieldsBg = new Image();
const grassBg = new Image();

// Игровые переменные
let gameInitialized = false;
let assetsLoaded = 0;
let totalAssets = 0;
let waitingForRestart = false;
let spriteSizes = {};
let bossesDefeated = 0;
let musicPlaying = false;
let soundEnabled = true;

// Конфигурация игры
const GAME_CONFIG = {
    VERSION: "1.0",
    DEBUG_MODE: false
};

// Логирование для отладки
function debugLog(message) {
    if (GAME_CONFIG.DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`);
    }
}

// Проверка поддержки Canvas
function checkCanvasSupport() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas || !canvas.getContext) {
        alert('Ваш браузер не поддерживает Canvas. Пожалуйста, обновите браузер.');
        return false;
    }
    return true;
}

// Проверка поддержки аудио
function checkAudioSupport() {
    const audio = document.createElement('audio');
    return !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, ''));
}

// Функция для обновления прогресса загрузки
function updateLoadingProgress() {
    assetsLoaded++;
    const progress = Math.round((assetsLoaded / totalAssets) * 100);
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.innerHTML = `Загрузка игры... ${progress}%`;
    }
    if (assetsLoaded === totalAssets && loadingText) {
        loadingText.remove();
    }
}

function calculateSpriteSizes() {
    const canvas = document.getElementById('gameCanvas');
    // Защита от нулевых размеров
    const canvasHeight = Math.max(canvas.height, 300);
    const canvasWidth = Math.max(canvas.width, 300);
    
    // Минимальные размеры для очень маленьких экранов
    const minSize = 10;
    
    return {
        // Игрок
        playerHeight: Math.max(canvasHeight * 0.140, minSize),
        playerWidth: Math.max((115 / 150) * (canvasHeight * 0.140), minSize),
        
        // Игрок в борцовской стойке
        playerWrestleHeight: Math.max(canvasHeight * 0.1, minSize),
        playerWrestleWidth: Math.max((119 / 129) * (canvasHeight * 0.1), minSize),
        
        // Атака игрока в борцовской стойке
        playerWrestleAttackHeight: Math.max(canvasHeight * 0.1, minSize),
        playerWrestleAttackWidth: Math.max((161 / 129) * (canvasHeight * 0.1), minSize),
        
        // Боксеры
        enemyBoxerHeight: Math.max(canvasHeight * 0.140, minSize),
        enemyBoxerWidth: Math.max((94 / 147) * (canvasHeight * 0.140), minSize),
        
        enemyBoxer2Height: Math.max(canvasHeight * 0.140, minSize),
        enemyBoxer2Width: Math.max((80 / 143) * (canvasHeight * 0.140), minSize),
        
        // Борцы
        enemyWrestler1Height: Math.max(canvasHeight * 0.1, minSize),
        enemyWrestler1Width: Math.max((112 / 112) * (canvasHeight * 0.1), minSize),
        
        enemyWrestler2Height: Math.max(canvasHeight * 0.1, minSize),
        enemyWrestler2Width: Math.max((112 / 110) * (canvasHeight * 0.1), minSize),
        
        // Боссы
        boss1Height: Math.max(canvasHeight * 0.15, minSize),
        boss1Width: Math.max((105 / 132) * (canvasHeight * 0.15), minSize),
        
        boss2Height: Math.max(canvasHeight * 0.15, minSize),
        boss2Width: Math.max((115 / 154) * (canvasHeight * 0.15), minSize)
    };
}

// Ожидание загрузки всех ресурсов
function waitForResources() {
    return new Promise((resolve) => {
        const checkResources = () => {
            // Проверяем, загружены ли все основные спрайты
            if (spritesLoaded >= totalSprites) {
                resolve();
            } else {
                setTimeout(checkResources, 100);
            }
        };
        checkResources();
    });
}

// Функция проверки загрузки спрайтов
const checkAllSpritesLoaded = function() {
    spritesLoaded++;
    console.log(`Загружен спрайт ${spritesLoaded}/${totalSprites}`);
    
    if (spritesLoaded === totalSprites) {
        console.log('Все основные спрайты загружены');
    }
};

// Загрузка всех спрайтов
function loadSprites() {
    // Устанавливаем источники для спрайтов
    playerSprite.src = 'images/player.png';
    playerShotSprite.src = 'images/player_shot_lil.png';
    playerWrestleSprite.src = 'images/player_wrestle_lil.png';
    playerWrestleAttackSprite.src = 'images/player_wrestle_attack_lil.png';
    enemyBoxerSprite.src = 'images/enemy_boxer1_lil.png';
    enemyBoxer2Sprite.src = 'images/enemy_boxer2_lil.png';
    enemyWrestler1Sprite.src = 'images/enemy_wrestler1_lil.png';
    enemyWrestler2Sprite.src = 'images/enemy_wrestler2_lil.png';
    boss1Sprite.src = 'images/boss1_lil.png';
    boss2Sprite.src = 'images/boss2_lil.png';

    // Фоновые изображения
    skyBg.src = 'images/parallax/sky.png';
    rocksBg.src = 'images/parallax/rocks.png';
    forestBg.src = 'images/parallax/forest.png';
    fieldsBg.src = 'images/parallax/fields.png';
    grassBg.src = 'images/parallax/grass.png';

    // Обработчики загрузки для всех спрайтов
    playerSprite.onload = checkAllSpritesLoaded;
    playerShotSprite.onload = checkAllSpritesLoaded;
    playerWrestleSprite.onload = checkAllSpritesLoaded;
    playerWrestleAttackSprite.onload = checkAllSpritesLoaded;
    enemyBoxerSprite.onload = checkAllSpritesLoaded;
    enemyBoxer2Sprite.onload = checkAllSpritesLoaded;
    enemyWrestler1Sprite.onload = checkAllSpritesLoaded;
    enemyWrestler2Sprite.onload = checkAllSpritesLoaded;
    boss1Sprite.onload = checkAllSpritesLoaded;
    boss2Sprite.onload = checkAllSpritesLoaded;

    // Обработчики ошибок
    playerSprite.onerror = () => console.error('Ошибка загрузки спрайта игрока');
    playerShotSprite.onerror = () => console.error('Ошибка загрузки спрайта атаки игрока');
    playerWrestleSprite.onerror = () => console.error('Ошибка загрузки спрайта борцовской стойки игрока');
    playerWrestleAttackSprite.onerror = () => console.error('Ошибка загрузки спрайта борцовской атаки игрока');
    enemyBoxerSprite.onerror = () => console.error('Ошибка загрузки спрайта боксера 1');
    enemyBoxer2Sprite.onerror = () => console.error('Ошибка загрузки спрайта боксера 2');
    enemyWrestler1Sprite.onerror = () => console.error('Ошибка загрузки спрайта борца 1');
    enemyWrestler2Sprite.onerror = () => console.error('Ошибка загрузки спрайта борца 2');
    boss1Sprite.onerror = () => console.error('Ошибка загрузки спрайта босса 1');
    boss2Sprite.onerror = () => console.error('Ошибка загрузки спрайта атаки босса 2');

    // Обработка ошибок загрузки фонов
    skyBg.onerror = () => console.error('Ошибка загрузки фона неба');
    rocksBg.onerror = () => console.error('Ошибка загрузки фона гор');
    forestBg.onerror = () => console.error('Ошибка загрузки фона леса');
    fieldsBg.onerror = () => console.error('Ошибка загрузки фона поля');
    grassBg.onerror = () => console.error('Ошибка загрузки фона травы');
}

// Запуск игры после загрузки
async function initializeGame() {
    // Сначала загружаем все спрайты
    loadSprites();
    
    // Показываем экран загрузки (минимум 2 секунды)
    await showLoadingScreen();

    // Ждем загрузки ресурсов (но не более 5 секунд)
    await Promise.race([
        waitForResources(),
        new Promise(resolve => setTimeout(resolve, 5000)) // Таймаут 5 секунд
    ]);

    // Дополнительная короткая задержка для плавного перехода
    await new Promise(resolve => setTimeout(resolve, 500));

    // Инициализируем игру после загрузки
    initGame();
}

// Инициализация Telegram Web App
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        // Только базовые функции
        if (tg.expand) {
            tg.expand(); // Развернуть на весь экран
        }
        console.log('Telegram Web App initialized');
        console.log('WebApp version:', tg.version);
        console.log('Telegram user:', tg.initDataUnsafe?.user);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM загружен, начинаем инициализацию игры');
    
    if (!checkCanvasSupport()) {
        return;
    }

    if (!checkAudioSupport()) {
        console.warn('Браузер имеет ограниченную поддержку аудио');
    }

    // Инициализируем Telegram Web App
    initTelegramWebApp();
    
    // Запускаем инициализацию игры
    initializeGame();
});

"use strict";

/**
 * Игра "Борец против бандитов"
 * Версия 1.0
 * Автор: [Ваше имя]
 * Описание: Игра-реакция с различными типами врагов и боссами
 */

// Элементы экрана завершения игры
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const finalEnemiesElement = document.getElementById('finalEnemies');
const finalBossesElement = document.getElementById('finalBosses');
const finalLevelElement = document.getElementById('finalLevel');
const restartButton = document.getElementById('restartButton');

// Фоновая музыка
const bgMusic = document.getElementById('bgMusic');

// Элемент кнопки звука
const soundToggle = document.getElementById('soundToggle');

// Константы игры
const BASE_REACTION_TIME = 1000; // 1 секунда
const REACTION_DECREASE = 0.05; // Уменьшение времени на 0.05 секунды
const BOSS_INTERVAL = 30; // Босс каждые 30 врагов

// Элементы DOM
const canvas = document.getElementById('gameCanvas');

function setupCanvas() {
    const container = document.querySelector('.game-area');
    const maxWidth = Math.min(window.innerWidth - 30, window.innerHeight - 30);

    // Устанавливаем квадратный размер
    canvas.width = maxWidth;
    canvas.height = maxWidth;

    // Пересчитываем размеры спрайтов
    spriteSizes = calculateSpriteSizes();

    console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
    console.log('Sprite sizes recalculated:', spriteSizes);
}

// Пересчитанные константы для квадратного экрана
const TOTAL_PARTS = 20; // Уменьшили для большего расстояния между врагами
const PLAYER_POSITION = 3;
const ENEMY_POSITIONS = [8, 13, 18, 23]; // 4 врага с увеличенным расстоянием 1.25x

const ctx = canvas.getContext('2d');
const btnPunch = document.getElementById('btnPunch');
const btnTakedown = document.getElementById('btnTakedown');
const btnBoss = document.getElementById('btnBoss');
const scoreValueElement = document.getElementById('scoreValue');
const levelValueElement = document.getElementById('levelValue');
const enemyCounterElement = document.getElementById('enemyCounter');
const timerValueElement = document.getElementById('timerValue');
const timerFillElement = document.getElementById('timerFill');

// Звуковые элементы
const punchSound = document.getElementById('punchSound');
const takedownSound = document.getElementById('takedownSound');
const bossSound = document.getElementById('bossSound');
const gameOverSound = document.getElementById('gameOverSound');
const victorySound = document.getElementById('victorySound');
const startSound = document.getElementById('startSound');

// Скорости движения фонов
const SKY_SPEED = 0.1;
const ROCKS_SPEED = 0.25;
const FOREST_SPEED = 0.5;
const FIELDS_SPEED = 0.8;
const GRASS_SPEED = 0.9;

// Обработка ошибок загрузки звуков
punchSound.onerror = () => console.error('Ошибка загрузки звука удара');
takedownSound.onerror = () => console.error('Ошибка загрузки звука захвата');
bossSound.onerror = () => console.error('Ошибка загрузки звука босса');
gameOverSound.onerror = () => console.error('Ошибка загрузки звука завершения игры');
victorySound.onerror = () => console.error('Ошибка загрузки звука победы');
startSound.onerror = () => console.error('Ошибка загрузки звука начала игры');
bgMusic.onerror = () => console.error('Ошибка загрузки фоновой музыки');

// Функция безопасного воспроизведения звука
function playSound(soundElement) {
    if (!soundEnabled) return;

    try {
        if (soundElement && typeof soundElement.play === 'function') {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => {
                console.log("Не удалось воспроизвести звук");
            });
        }
    } catch (e) {
        console.log("Ошибка воспроизведения звука");
    }
}

// Игровые переменные
let score = 0;
let level = 1;
let enemyCounter = 0;
let reactionTime = BASE_REACTION_TIME;
let gameOver = false;
let gameStarted = false;
let currentTimer = null;
let enemies = [];
let defeatedEnemies = [];
let currentTimeLeft = 0;
let currentPlayerSprite = playerSprite;
let isPunchButtonPressed = false;
let isTakedownButtonPressed = false;
let isBossButtonPressed = false;
let attackType = 0; // 0 - нет атаки, 1 - удар, 2 - захват, 3 - босс
let attackInProgress = false;

// Переменные для параллакс-фона
let skyX = 0;
let rocksX = 0;
let forestX = 0;
let fieldsX = 0;
let grassX = 0; // Новый фон травы

// Класс для врагов
class Enemy {
    constructor(type, position, fixedBossType = null) {
        this.type = type; // 1 - боксер, 2 - борец, 3 - босс
        this.position = position; // Позиция в частях (0-36)
        this.defeated = false;
        this.defeatAnimationProgress = 0;
        this.isBoss = type === 3;
        this.wrestlerType = Math.random() > 0.5 ? 1 : 2; // Для борцов: 1 или 2 тип

        // Для босса выбираем тип в зависимости от номера врага
        if (this.isBoss) {
            if (fixedBossType !== null) {
                // Используем фиксированный тип босса
                this.bossType = fixedBossType;
            } else {
                // Случайный тип для обратной совместимости
                this.bossType = Math.random() > 0.5 ? 1 : 2;
            }
            this.health = 2;
        }
    }

    update() {
        if (this.defeated) {
            this.defeatAnimationProgress += 0.05;
        }
    }

    draw() {
        const pixelPosition = (this.position / TOTAL_PARTS) * canvas.width;

        // Используем динамические размеры
        let width, height, sprite;

        if (this.isBoss) {
            if (this.bossType === 1) {
                width = spriteSizes.boss1Width;
                height = spriteSizes.boss1Height;
                sprite = boss1Sprite;
            } else {
                width = spriteSizes.boss2Width;
                height = spriteSizes.boss2Height;
                sprite = boss2Sprite;
            }
        } else if (this.type === 1) {
            this.boxerType = this.boxerType || (Math.random() > 0.5 ? 1 : 2);
            if (this.boxerType === 1) {
                width = spriteSizes.enemyBoxerWidth;
                height = spriteSizes.enemyBoxerHeight;
                sprite = enemyBoxerSprite;
            } else {
                width = spriteSizes.enemyBoxer2Width;
                height = spriteSizes.enemyBoxer2Height;
                sprite = enemyBoxer2Sprite;
            }
        } else {
            width = this.wrestlerType === 1 ? spriteSizes.enemyWrestler1Width : spriteSizes.enemyWrestler2Width;
            height = this.wrestlerType === 1 ? spriteSizes.enemyWrestler1Height : spriteSizes.enemyWrestler2Height;
            sprite = this.wrestlerType === 1 ? enemyWrestler1Sprite : enemyWrestler2Sprite;
        }

        const groundLevel = canvas.height - 20; // Уровень пола
        const pixelY = groundLevel - height;

        if (this.defeated) {
            // Анимация поражения - враг улетает вниз и вправо
            const offsetX = this.defeatAnimationProgress * 100;
            const offsetY = this.defeatAnimationProgress * 200;
            ctx.globalAlpha = 1 - this.defeatAnimationProgress;

            if (sprite.complete && sprite.naturalHeight !== 0) {
                ctx.drawImage(sprite, pixelPosition + offsetX, pixelY + offsetY, width, height);
            } else {
                // Запасной вариант - цветной прямоугольник
                ctx.fillStyle = this.isBoss ? '#f1c40f' : (this.type === 1 ? '#e74c3c' : '#3498db');
                ctx.fillRect(pixelPosition + offsetX, pixelY + offsetY, width, height);
                ctx.fillStyle = 'white';
                ctx.fillText(this.isBoss ? 'БОСС' : (this.type === 1 ? 'Боксер' : 'Борец'),
                    pixelPosition + offsetX + 5, pixelY + offsetY + height/2);
            }
            ctx.globalAlpha = 1;
        } else {
            // Отрисовка активного врага
            if (sprite.complete && sprite.naturalHeight !== 0) {
                ctx.drawImage(sprite, pixelPosition, pixelY, width, height);
            } else {
                // Запасной вариант
                ctx.fillStyle = this.isBoss ? '#f1c40f' : (this.type === 1 ? '#e74c3c' : '#3498db');
                ctx.fillRect(pixelPosition, pixelY, width, height);
                ctx.fillStyle = 'white';
                ctx.fillText(this.isBoss ? 'БОСС' : (this.type === 1 ? 'Боксер' : 'Борец'),
                    pixelPosition + 5, pixelY + height/2);
            }

            // Отрисовка здоровья босса
            if (this.isBoss) {
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Босс${this.bossType} - Здоровье: ${this.health}`, pixelPosition + width/2, pixelY - 15);
                ctx.textAlign = 'left'; // Возвращаем выравнивание по умолчанию
            }
        }
    }
}

// Создание начальных врагов
function createInitialEnemies() {
    // Очищаем массив врагов
    enemies = [];

    // Создаем 4 врага на фиксированных позициях
    for (let i = 0; i < 4; i++) {
        // ТОЛЬКО обычные враги, никаких боссов в начале
        const type = Math.random() > 0.5 ? 1 : 2;
        enemies.push(new Enemy(type, ENEMY_POSITIONS[i]));
    }

    // Обновляем кнопки и спрайт игрока в зависимости от типа первого врага
    updateButtonsAndPlayerSprite();

    console.log("Созданы начальные враги:", enemies.map(e => e.type === 3 ? `Босс${e.bossType}` : e.type === 1 ? 'Боксер' : 'Борец'));
}

// Функция инициализации игры
function initGame() {
    // Скрываем экран загрузки если он еще виден
    const loadingScreen = document.getElementById('loadingScreen');

    // Устанавливаем громкость звуков
    updateVolume();

    if (loadingScreen && loadingScreen.style.display !== 'none') {
        loadingScreen.style.display = 'none';
    }

    // Устанавливаем размер canvas перед началом игры
    setupCanvas();

    console.log('Игра инициализируется');

    // Сбрасываем позиции фонов
    skyX = 0;
    rocksX = 0;
    forestX = 0;
    fieldsX = 0;
    grassX = 0;

    bossesDefeated = 0; // Сбрасываем счетчик боссов

    // Существующий код продолжается здесь:
    score = 0;
    level = 1;
    enemyCounter = 0; // Начинаем с 0
    reactionTime = BASE_REACTION_TIME;
    gameOver = false;
    gameStarted = true;
    waitingForRestart = false;
    enemies = [];
    defeatedEnemies = [];
    currentTimeLeft = reactionTime;
    currentPlayerSprite = playerSprite;
    isPunchButtonPressed = false;
    isTakedownButtonPressed = false;
    isBossButtonPressed = false;
    attackType = 0;
    attackInProgress = false;

    // Очищаем таймеры
    if (currentTimer) clearInterval(currentTimer);

    // Обновляем интерфейс
    scoreValueElement.textContent = score;
    levelValueElement.textContent = level;
    enemyCounterElement.textContent = enemyCounter; // Убедимся, что отображается 0
    timerValueElement.textContent = (reactionTime / 1000).toFixed(2);
    timerFillElement.style.width = '100%';
    timerFillElement.style.backgroundColor = '#2ecc71';

    // Показываем кнопки по умолчанию
    btnPunch.style.display = 'block';
    btnTakedown.style.display = 'block';
    btnBoss.style.display = 'none';

    // Создаем начальных врагов на фиксированных позициях
    createInitialEnemies();

    // Запускаем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Обновление кнопок и спрайта игрока
function updateButtonsAndPlayerSprite() {
    if (enemies.length > 0 && !enemies[0].defeated) {
        if (enemies[0].type === 3) {
            // Босс - показываем специальную кнопку
            btnPunch.style.display = 'none';
            btnTakedown.style.display = 'none';
            btnBoss.style.display = 'block';
            currentPlayerSprite = playerSprite;
            console.log("Следующий враг - БОСС! Готовьтесь к битве!");
        } else if (enemies[0].type === 1) {
            // Боксер - показываем обычные кнопки, игрок в обычной стойке
            btnPunch.style.display = 'block';
            btnTakedown.style.display = 'block';
            btnBoss.style.display = 'none';
            currentPlayerSprite = playerSprite;
        } else {
            // Борец - показываем обычные кнопки, игрок в стойке борца
            btnPunch.style.display = 'block';
            btnTakedown.style.display = 'block';
            btnBoss.style.display = 'none';
            currentPlayerSprite = playerWrestleSprite;
        }
    }
}

// Запуск таймера реакции для текущего врага
function startReactionTimer() {
    if (currentTimer) {
        clearInterval(currentTimer);
    }

    // Убедимся, что currentTimeLeft установлен правильно
    if (currentTimeLeft <= 0) {
        currentTimeLeft = reactionTime;
    }

    timerValueElement.textContent = (reactionTime / 1000).toFixed(2);

    currentTimer = setInterval(() => {
        currentTimeLeft -= 50;
        const percentage = currentTimeLeft / reactionTime;

        // Обновляем визуальный таймер в HUD
        if (timerFillElement) {
            timerFillElement.style.width = `${percentage * 100}%`;
            if (percentage < 0.3) {
                timerFillElement.style.backgroundColor = '#e74c3c';
            } else if (percentage < 0.6) {
                timerFillElement.style.backgroundColor = '#f1c40f';
            } else {
                timerFillElement.style.backgroundColor = '#2ecc71';
            }
        }

        if (currentTimeLeft <= 0) {
            clearInterval(currentTimer);
            endGame("Время вышло! Враг атаковал!");
        }
    }, 50);
}

// Обработка начала атаки
function startAttack(type) {
    // Если игра окончена и ожидает перезапуска
    if (waitingForRestart) {
        restartGame();
        return;
    }

    // Запускаем музыку при первом действии игрока (если еще не играет)
    if (!musicPlaying && soundEnabled) {
        console.log("Запускаем музыку при первом действии игрока");
        playBackgroundMusic();
    }

    if (gameOver || !gameStarted || attackInProgress) return;

    // Остальная часть функции без изменений
    attackInProgress = true;
    attackType = type;

    // Меняем спрайт игрока в зависимости от типа атаки
    if (type === 1) {
        currentPlayerSprite = playerShotSprite;
        isPunchButtonPressed = true;
    } else if (type === 2) {
        currentPlayerSprite = playerWrestleAttackSprite;
        isTakedownButtonPressed = true;
    } else if (type === 3) {
        isBossButtonPressed = true;
    }
}

// Обработка окончания атаки
function endAttack() {
    if (!attackInProgress) return;

    attackInProgress = false;

    // Проверяем босса
    if (enemies.length > 0 && enemies[0].type === 3 && !enemies[0].defeated) {
        if (attackType === 3) {
            // Правильная атака на босса
            enemies[0].health--;
            if (enemies[0].health <= 0) {
                // Босс побежден
                enemies[0].defeated = true;
                clearInterval(currentTimer);
                score += 50;
                scoreValueElement.textContent = score;
                // Увеличиваем счетчик побежденных боссов
                bossesDefeated++;
                playSound(victorySound);
                // Увеличиваем счетчик врагов
                enemyCounter++;
                enemyCounterElement.textContent = enemyCounter;
                // Завершаем ход
                finishMove();
            }
        } else {
            // Неправильная атака на босса
            endGame("Неверный тип атаки против босса!");
        }
    }
    // Проверяем обычных врагов
    else if (enemies.length > 0 && !enemies[0].defeated) {
        if (enemies[0].type === attackType) {
            // Правильная атака!
            enemies[0].defeated = true;
            clearInterval(currentTimer);
            // Воспроизводим звук в зависимости от типа атаки
            if (attackType === 1) {
                playSound(punchSound);
            } else {
                playSound(takedownSound);
            }
            // Увеличиваем счет
            score += 10;
            scoreValueElement.textContent = score;
            // Увеличиваем счетчик врагов
            enemyCounter++;
            // ВАЖНО: Обновляем счетчик врагов в интерфейсе сразу после увеличения
            enemyCounterElement.textContent = enemyCounter;

            console.log(`Побежден враг №${enemyCounter}, тип: ${enemies[0]?.type}, следующий будет №${enemyCounter + 1}`);
            enemyCounterElement.textContent = enemyCounter;

            // Увеличиваем уровень и уменьшаем время реакции каждые 10 врагов
            if (enemyCounter % 10 === 0) {
                level++;
                levelValueElement.textContent = level;
                reactionTime = Math.max(300, reactionTime * (1 - REACTION_DECREASE)); // Минимум 300мс
                console.log(`Новый уровень: ${level}, время реакции: ${reactionTime}мс`);
            }

            // Завершаем ход
            finishMove();
        } else {
            // Неправильная атака!
            endGame("Неверный тип атаки!");
        }
    }

    // Сбрасываем состояние кнопок
    isPunchButtonPressed = false;
    isTakedownButtonPressed = false;
    isBossButtonPressed = false;
    attackType = 0;

    // Возвращаем игрока к соответствующей стойке
    if (enemies.length > 0 && !enemies[0].defeated) {
        if (enemies[0].type === 2) {
            currentPlayerSprite = playerWrestleSprite;
        } else {
            currentPlayerSprite = playerSprite;
        }
    }
}

function updateBossInfo(currentEnemyNumber) {
    const nextBossNumber = Math.ceil(currentEnemyNumber / BOSS_INTERVAL) * BOSS_INTERVAL;
    const bossSequence = Math.floor(nextBossNumber / BOSS_INTERVAL);
    const nextBossType = (bossSequence % 2 === 1) ? 1 : 2;

    // Можно добавить отображение этой информации в HUD, если нужно
    if (nextBossNumber - currentEnemyNumber <= 5 && nextBossNumber - currentEnemyNumber > 0) {
        console.log(`Следующий босс (Босс${nextBossType}) через ${nextBossNumber - currentEnemyNumber} врагов`);
    }
}

// Завершение хода
function finishMove() {
    // Удаляем первого врага (он уже побежден)
    const defeatedEnemy = enemies.shift();
    if (defeatedEnemy) {
        defeatedEnemies.push(defeatedEnemy);
    }

    // Сдвигаем оставшихся врагов на фиксированные позиции
    for (let i = 0; i < enemies.length; i++) {
        if (i < ENEMY_POSITIONS.length) {
            enemies[i].position = ENEMY_POSITIONS[i];
        }
    }

    // Добавляем нового врага в конец очереди
    const nextEnemyNumber = enemyCounter + 1;
    const shouldSpawnBoss = nextEnemyNumber % BOSS_INTERVAL === 0;

    let type;
    let fixedBossType = null;

    if (shouldSpawnBoss) {
        type = 3;
        const bossSequence = Math.floor(nextEnemyNumber / BOSS_INTERVAL);
        fixedBossType = (bossSequence % 2 === 1) ? 1 : 2;
        console.log(`🎉 БОСС БУДЕТ СЛЕДУЮЩИМ! Враг №${nextEnemyNumber}, тип босса: ${fixedBossType}`);
    } else {
        type = Math.random() > 0.5 ? 1 : 2;
    }

    // Если это босс, он должен быть следующим врагом для атаки
    if (shouldSpawnBoss) {
        // Создаем босса с фиксированным типом
        const boss = new Enemy(type, ENEMY_POSITIONS[0], fixedBossType);
        // ВАЖНО: Удаляем ВСЕХ текущих врагов перед добавлением босса
        enemies = [];
        // Добавляем босса как первого врага
        enemies.push(boss);
        // Добавляем обычных врагов на оставшиеся позиции
        for (let i = 1; i < 4; i++) {
            const regularType = Math.random() > 0.5 ? 1 : 2;
            enemies.push(new Enemy(regularType, ENEMY_POSITIONS[i]));
        }
    } else {
        // Обычный враг добавляется в конец
        enemies.push(new Enemy(type, ENEMY_POSITIONS[enemies.length]));
        // Убедимся, что у нас не больше 4 врагов
        if (enemies.length > 4) {
            enemies = enemies.slice(0, 4);
        }
    }

    // Отладочная информация
    console.log(`Создан враг №${nextEnemyNumber}, тип: ${type === 3 ? `БОСС${fixedBossType}` : type === 1 ? 'Боксер' : 'Борец'}`);
    console.log(`Очередь врагов: ${enemies.map(e => e.type === 3 ? `Босс${e.bossType}` : e.type === 1 ? 'Боксер' : 'Борец').join(', ')}`);

    // Обновляем кнопки и спрайт игрока в зависимости от типа первого врага
    updateButtonsAndPlayerSprite();

    // Если игра не окончена, запускаем таймер для следующего врага
    if (!gameOver) {
        currentTimeLeft = reactionTime;
        startReactionTimer();
    }

    updateBossInfo(nextEnemyNumber);
}

// Завершение игры
function endGame(reason) {
    gameOver = true;
    clearInterval(currentTimer);
    playSound(gameOverSound);

    // Останавливаем фоновую музыку
    stopBackgroundMusic();

    // Подсчитываем статистику
    const totalBossesDefeated = bossesDefeated;

    // Показываем экран завершения через 0.1 секунды
    setTimeout(() => {
        showGameOverScreen(score, enemyCounter, totalBossesDefeated, level);
    }, 100);
}

// Показ экрана завершения игры
function showGameOverScreen(finalScore, finalEnemies, finalBosses, finalLevel) {
    // Заполняем статистику
    finalScoreElement.textContent = finalScore;
    finalEnemiesElement.textContent = finalEnemies;
    finalBossesElement.textContent = finalBosses;
    finalLevelElement.textContent = finalLevel;

    // Показываем экран
    gameOverScreen.style.display = 'flex';
    gameOverScreen.classList.add('show'); // Добавляем класс для анимации

    setTimeout(() => {
        gameOverScreen.style.opacity = '1';
    }, 10);
}

// Скрытие экрана завершения игры
function hideGameOverScreen() {
    gameOverScreen.style.opacity = '0';
    gameOverScreen.classList.remove('show'); // Убираем класс анимации
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
    }, 300);
}

// Перезапуск игры
function restartGame() {
    // Скрываем экран завершения игры
    hideGameOverScreen();

    // Сбрасываем статистику боссов
    bossesDefeated = 0;
    waitingForRestart = false;

    // Запускаем фоновую музыку при перезапуске
    setTimeout(() => {
        playBackgroundMusic();
    }, 300);

    initGame();
}

// Отрисовка игрока и таймера
function drawPlayer() {
    const playerPixelPosition = (PLAYER_POSITION / TOTAL_PARTS) * canvas.width;

    // Используем динамические размеры
    let width, height;

    if (currentPlayerSprite === playerShotSprite) {
        width = spriteSizes.playerWidth;
        height = spriteSizes.playerHeight;
    } else if (currentPlayerSprite === playerWrestleSprite) {
        width = spriteSizes.playerWrestleWidth;
        height = spriteSizes.playerWrestleHeight;
    } else if (currentPlayerSprite === playerWrestleAttackSprite) {
        width = spriteSizes.playerWrestleAttackWidth;
        height = spriteSizes.playerWrestleAttackHeight;
    } else {
        width = spriteSizes.playerWidth;
        height = spriteSizes.playerHeight;
    }

    // Исправленная позиция игрока - убрано двойное объявление playerY
    const groundLevel = canvas.height - 20; // Уровень пола
    const playerY = groundLevel - height; // Для игрока

    // Рисуем спрайт игрока
    if (currentPlayerSprite.complete && currentPlayerSprite.naturalHeight !== 0) {
        ctx.drawImage(currentPlayerSprite, playerPixelPosition, playerY, width, height);
    } else {
        // Запасной вариант - прямоугольник, если спрайт не загрузился
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(playerPixelPosition, playerY, width, height);
        ctx.fillStyle = 'white';
        ctx.fillText('Борец', playerPixelPosition + 10, playerY + 40);
    }

    // Рисуем таймер реакции над игроком (полный дубликат HUD таймера)
    if (gameStarted && !gameOver) {
        const timerWidth = width * 2;
        const timerHeight = 15;
        const timerX = playerPixelPosition - (timerWidth - width) / 2;
        const timerY = playerY - 40;

        // Фон таймера
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.strokeRect(timerX, timerY, timerWidth, timerHeight);

        // Заполнение таймера (синхронизировано с HUD таймером)
        const percentage = currentTimeLeft / reactionTime;
        const fillWidth = timerWidth * percentage;

        // Цвет заполнения (как в HUD)
        if (percentage < 0.3) {
            ctx.fillStyle = '#e74c3c'; // Красный когда мало времени
        } else if (percentage < 0.6) {
            ctx.fillStyle = '#f1c40f'; // Желтый
        } else {
            ctx.fillStyle = '#2ecc71'; // Зеленый когда много времени
        }

        ctx.fillRect(timerX, timerY, fillWidth, timerHeight);

        // Текст с оставшимся временем
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${(currentTimeLeft / 1000).toFixed(2)}s`, timerX + timerWidth / 2, timerY - 5);

        // Сбрасываем выравнивание текста
        ctx.textAlign = 'left';
    }
}

// Отрисовка параллакс-фона для квадратного экрана
function drawBackground() {
    // Заливаем верхнюю часть голубым цветом (небо)
    ctx.fillStyle = '#afd2e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Высота фонов - адаптивная к размеру canvas
    const BG_HEIGHT = canvas.height * 0.3;
    const GRASS_HEIGHT = canvas.height * 0.1;

    // Рассчитываем новые ширины с сохранением пропорций
    const skyRatio = skyBg.width / skyBg.height;
    const rocksRatio = rocksBg.width / rocksBg.height;
    const forestRatio = forestBg.width / forestBg.height;
    const fieldsRatio = fieldsBg.width / fieldsBg.height;
    const grassRatio = grassBg.width / grassBg.height;

    const skyNewWidth = BG_HEIGHT * skyRatio;
    const rocksNewWidth = BG_HEIGHT * rocksRatio;
    const forestNewWidth = BG_HEIGHT * forestRatio;
    const fieldsNewWidth = BG_HEIGHT * fieldsRatio;
    const grassNewWidth = GRASS_HEIGHT * grassRatio;

    // Позиции по Y с наложением
    const fieldsY = canvas.height - BG_HEIGHT;
    const forestY = fieldsY - BG_HEIGHT / 2;
    const rocksY = forestY - BG_HEIGHT / 2;
    const skyY = rocksY - BG_HEIGHT / 2;

    // Функция для бесконечной прокрутки фона
    function drawParallaxLayer(bgImage, x, y, newWidth, bgHeight, speed) {
        const numCopies = Math.ceil(canvas.width / newWidth) + 2;
        for (let i = 0; i < numCopies; i++) {
            const drawX = x + i * newWidth;
            if (drawX + newWidth > 0 && drawX < canvas.width) {
                ctx.drawImage(bgImage, drawX - 1, y, newWidth + 2, bgHeight);
            }
        }
        if (x <= -newWidth) return 0;
        return x;
    }

    // Обновляем позиции фонов
    skyX -= SKY_SPEED;
    rocksX -= ROCKS_SPEED;
    forestX -= FOREST_SPEED;
    fieldsX -= FIELDS_SPEED;
    grassX -= GRASS_SPEED;

    // Рисуем слои фона
    if (skyBg.complete) {
        skyX = drawParallaxLayer(skyBg, skyX, skyY, skyNewWidth, BG_HEIGHT, SKY_SPEED);
    }

    if (rocksBg.complete) {
        rocksX = drawParallaxLayer(rocksBg, rocksX, rocksY, rocksNewWidth, BG_HEIGHT, ROCKS_SPEED);
    }

    if (forestBg.complete) {
        forestX = drawParallaxLayer(forestBg, forestX, forestY, forestNewWidth, BG_HEIGHT, FOREST_SPEED);
    }

    // Рисуем поле
    if (fieldsBg.complete) {
        // Сохраняем текущее состояние контекста
        ctx.save();
        // Устанавливаем фильтр для уменьшения контрастности
        ctx.filter = 'contrast(0.85)';
        // Рисуем поле с фильтром
        fieldsX = drawParallaxLayer(fieldsBg, fieldsX, fieldsY, fieldsNewWidth, BG_HEIGHT, FIELDS_SPEED);
        // Восстанавливаем состояние контекста
        ctx.restore();
        // Добавляем легкое затемнение поверх поля
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Черный с 20% непрозрачности
        ctx.fillRect(0, fieldsY, canvas.width, BG_HEIGHT);
    }

    // Рисуем пол
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// Отрисовка травы для квадратного экрана
function drawGrass() {
    const GRASS_HEIGHT = canvas.height * 0.2;
    const grassRatio = grassBg.width / grassBg.height;
    const grassNewWidth = GRASS_HEIGHT * grassRatio;
    const grassY = canvas.height - GRASS_HEIGHT;

    function drawGrassLayer(x, y, newWidth, bgHeight) {
        const numCopies = Math.ceil(canvas.width / newWidth) + 2;
        for (let i = 0; i < numCopies; i++) {
            const drawX = x + i * newWidth;
            if (drawX + newWidth > 0 && drawX < canvas.width) {
                ctx.drawImage(grassBg, drawX - 1, y, newWidth + 2, bgHeight);
            }
        }
        if (x <= -newWidth) return 0;
        return x;
    }

    if (grassBg.complete) {
        grassX = drawGrassLayer(grassX, grassY, grassNewWidth, GRASS_HEIGHT);
    }
}

// Отрисовка переднего плана (поверх всего)
function drawForeground() {
    // Здесь можно добавить дополнительные эффекты поверх всего
    // Например, частицы, эффекты и т.д.
}

// Главный игровой цикл
function gameLoop() {
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (enemyCounter % 10 === 0) { // Выводим каждые 10 врагов чтобы не засорять консоль
        console.log(`Текущий счетчик: ${enemyCounter}, следующий босс будет на враге №${Math.ceil(enemyCounter / BOSS_INTERVAL) * BOSS_INTERVAL}`);
    }

    // Рисуем фон (включая зеленый цвет под травой)
    drawBackground();

    // Рисуем игрока и таймер
    drawPlayer();

    // Обновляем и рисуем обычных врагов
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
    }

    // Рисуем траву поверх игрока и обычных врагов
    drawGrass();

    // Обновляем и рисуем побежденных врагов (поверх травы)
    for (let i = defeatedEnemies.length - 1; i >= 0; i--) {
        defeatedEnemies[i].update();
        defeatedEnemies[i].draw();
        // Удаляем врагов, которые улетели за экран
        if (defeatedEnemies[i].defeatAnimationProgress > 1) {
            defeatedEnemies.splice(i, 1);
        }
    }

    // Если игра не окончена, продолжаем цикл
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Управление фоновой музыкой
function playBackgroundMusic() {
    try {
        if (bgMusic && !musicPlaying && soundEnabled) {
            bgMusic.volume = 0.5;
            // Сбрасываем на начало на случай если трек уже играл
            bgMusic.currentTime = 0;
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    musicPlaying = true;
                    console.log("Фоновая музыка запущена");
                }).catch(error => {
                    console.log("Не удалось воспроизвести фоновую музыку:", error);
                    // Не помечаем musicPlaying как true если воспроизведение не удалось
                });
            }
        }
    } catch (error) {
        console.log("Ошибка воспроизведения музыки:", error);
    }
}

function updateVolume() {
    const volume = soundEnabled ? 0.5 : 0.0; // 30% тише
    punchSound.volume = volume;
    takedownSound.volume = volume;
    bossSound.volume = volume;
    gameOverSound.volume = volume;
    victorySound.volume = volume;
    startSound.volume = volume;
    bgMusic.volume = volume;
}

function pauseBackgroundMusic() {
    try {
        if (bgMusic && musicPlaying) {
            bgMusic.pause();
            musicPlaying = false;
            console.log("Фоновая музыка приостановлена");
        }
    } catch (error) {
        console.log("Ошибка приостановки музыки:", error);
    }
}

function stopBackgroundMusic() {
    try {
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0; // Перематываем в начало
            musicPlaying = false;
            console.log("Фоновая музыка остановлена");
        }
    } catch (error) {
        console.log("Ошибка остановки музыки:", error);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundToggle) {
        if (soundEnabled) {
            soundToggle.textContent = '🔊';
            soundToggle.classList.remove('muted');
            // Возобновляем музыку если игра активна
            if (gameStarted && !gameOver) {
                playBackgroundMusic();
            }
        } else {
            soundToggle.textContent = '🔇';
            soundToggle.classList.add('muted');
            // Останавливаем музыку
            pauseBackgroundMusic();
        }
    }
    // Обновляем громкость всех звуков
    updateVolume(); // Используем единую функцию для обновления громкости
}

// Функция для запуска музыки после пользовательского взаимодействия
function enableAudio() {
    console.log("enableAudio called");
    // Создаем и воспроизводим пустой звук для разблокировки аудио
    const unlockAudio = () => {
        console.log("unlockAudio called");
        const silentAudio = document.createElement('audio');
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        silentAudio.volume = 0;
        silentAudio.play().then(() => {
            console.log("Аудио разблокировано");
            silentAudio.remove();
            // Сразу запускаем фоновую музыку после разблокировки
            if (soundEnabled && !musicPlaying) {
                console.log("Запускаем фоновую музыку после разблокировки");
                playBackgroundMusic();
            }
        }).catch(e => {
            console.log("Не удалось разблокировать аудио:", e);
        });
    };

    // Добавляем обработчики для пользовательского взаимодействия
    const initAudio = () => {
        console.log("Пользовательское взаимодействие detected");
        unlockAudio();
        // Убираем обработчики после первого взаимодействия
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
        // Запускаем фоновую музыку если игра активна
        if (gameStarted && !gameOver && !musicPlaying && soundEnabled) {
            console.log("Запускаем музыку после пользовательского действия");
            playBackgroundMusic();
        }
    };

    // Добавляем несколько типов обработчиков
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('keydown', initAudio);

    // Также запускаем при загрузке (на случай если autoplay разрешен)
    setTimeout(() => {
        if (soundEnabled && !musicPlaying) {
            console.log("Пытаемся запустить музыку при загрузке");
            playBackgroundMusic().catch(e => {
                console.log("Autoplay заблокирован, ждем пользовательского действия");
            });
        }
    }, 1000);
}

// Обработчик кнопки звука
if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
    soundToggle.addEventListener('touchend', function(e) {
        e.preventDefault();
        toggleSound();
    });
}

// Обработчики кнопок для нажатия
btnPunch.addEventListener('mousedown', (e) => {
    startAttack(1);
});

btnPunch.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startAttack(1);
});

btnTakedown.addEventListener('mousedown', (e) => {
    startAttack(2);
});

btnTakedown.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startAttack(2);
});

btnBoss.addEventListener('mousedown', (e) => {
    startAttack(3);
});

btnBoss.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startAttack(3);
});

// Обработчики кнопок для отпускания
btnPunch.addEventListener('mouseup', () => endAttack());
btnPunch.addEventListener('touchend', (e) => {
    e.preventDefault();
    endAttack();
});

btnTakedown.addEventListener('mouseup', () => endAttack());
btnTakedown.addEventListener('touchend', (e) => {
    e.preventDefault();
    endAttack();
});

btnBoss.addEventListener('mouseup', () => endAttack());
btnBoss.addEventListener('touchend', (e) => {
    e.preventDefault();
    endAttack();
});

// Обработчики для случаев, когда палец/мышь уходит за пределы кнопки
btnPunch.addEventListener('mouseleave', () => {
    if (isPunchButtonPressed) endAttack();
});

btnTakedown.addEventListener('mouseleave', () => {
    if (isTakedownButtonPressed) endAttack();
});

btnBoss.addEventListener('mouseleave', () => {
    if (isBossButtonPressed) endAttack();
});

// Начало игры
window.addEventListener('resize', function() {
    if (gameStarted && !gameOver) {
        setupCanvas(); // Это вызовет calculateSpriteSizes()
        // Принудительно перерисовываем сцену
        if (typeof gameLoop === 'function') {
            gameLoop();
        }
    }
});

// Обработчик кнопки перезапуска
restartButton.addEventListener('click', function() {
    restartGame();
});

// Также добавляем обработчики для сенсорных устройств
restartButton.addEventListener('touchend', function(e) {
    e.preventDefault();
    restartGame();
});

// Завершение функции startGame (если она не закрыта)
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        playSound(startSound);
        startReactionTimer();
    }
}