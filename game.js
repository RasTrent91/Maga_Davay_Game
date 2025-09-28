"use strict";

/**
 * Игра "Борец против бандитов"
 * Версия 1.0
 * Автор: [Ваше имя]
 * Описание: Игра-реакция с различными типами врагов и боссами
 */

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
    if (!canvas.getContext) {
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

// Инициализация перед загрузкой спрайтов
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM загружен, начинаем инициализацию игры');
    
    if (!checkCanvasSupport()) {
        return;
    }
    
    if (!checkAudioSupport()) {
        console.warn('Браузер имеет ограниченную поддержку аудио');
    }
    
    // Показываем сообщение о загрузке
    const loadingText = document.createElement('div');
    loadingText.id = 'loadingText';
    loadingText.innerHTML = 'Загрузка игры...';
    loadingText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 24px;
        z-index: 1000;
    `;
    document.body.appendChild(loadingText);
});

// Глобальные переменные для отслеживания состояния игры
let gameInitialized = false;
let assetsLoaded = 0;
let totalAssets = 0;
let waitingForRestart = false;

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

// Загрузка спрайтов с обработкой ошибок
const playerSprite = new Image();
const playerShotSprite = new Image();
const playerWrestleSprite = new Image();
const playerWrestleAttackSprite = new Image();
const enemyBoxerSprite = new Image();
const enemyBoxer2Sprite = new Image(); // Второй боксер
const enemyWrestler1Sprite = new Image();
const enemyWrestler2Sprite = new Image();
const boss1Sprite = new Image();
const boss2Sprite = new Image();

// Загрузка фоновых изображений
const skyBg = new Image();
const rocksBg = new Image();
const forestBg = new Image();
const fieldsBg = new Image();
const grassBg = new Image(); // Новый фон травы

playerSprite.src = 'images/player.png';
playerShotSprite.src = 'images/player_shot_lil.png';
playerWrestleSprite.src = 'images/player_wrestle_lil.png';
playerWrestleAttackSprite.src = 'images/player_wrestle_attack_lil.png';
enemyBoxerSprite.src = 'images/enemy_boxer1_lil.png';
enemyBoxer2Sprite.src = 'images/enemy_boxer2_lil.png'; // Второй боксер
enemyWrestler1Sprite.src = 'images/enemy_wrestler1_lil.png';
enemyWrestler2Sprite.src = 'images/enemy_wrestler2_lil.png';
boss1Sprite.src = 'images/boss1_lil.png';
boss2Sprite.src = 'images/boss2_lil.png';

// Фоновые изображения
skyBg.src = 'images/parallax/sky.png';
rocksBg.src = 'images/parallax/rocks.png';
forestBg.src = 'images/parallax/forest.png';
fieldsBg.src = 'images/parallax/fields.png';
grassBg.src = 'images/parallax/grass.png'; // Новый фон травы

// Обработка ошибок загрузки спрайтов
playerSprite.onerror = () => console.error('Ошибка загрузки спрайта игрока');
playerShotSprite.onerror = () => console.error('Ошибка загрузки спрайта атаки игрока');
playerWrestleSprite.onerror = () => console.error('Ошибка загрузки спрайта стойки борца');
playerWrestleAttackSprite.onerror = () => console.error('Ошибка загрузки спрайта атаки борца');
enemyBoxerSprite.onerror = () => console.error('Ошибка загрузки спрайта боксера');
enemyBoxer2Sprite.onerror = () => console.error('Ошибка загрузки спрайта боксера 2'); // Второй боксер
enemyWrestler1Sprite.onerror = () => console.error('Ошибка загрузки спрайта борца 1');
enemyWrestler2Sprite.onerror = () => console.error('Ошибка загрузки спрайта борца 2');
boss1Sprite.onerror = () => console.error('Ошибка загрузки спрайта босса 1');
boss2Sprite.onerror = () => console.error('Ошибка загрузки спрайта босса 2');

// Обработка ошибок загрузки фонов
skyBg.onerror = () => console.error('Ошибка загрузки фона неба');
rocksBg.onerror = () => console.error('Ошибка загрузки фона гор');
forestBg.onerror = () => console.error('Ошибка загрузки фона леса');
fieldsBg.onerror = () => console.error('Ошибка загрузки фона поля');
grassBg.onerror = () => console.error('Ошибка загрузки фона травы'); // Новый фон травы

const checkAllSpritesLoaded = function() {
    spritesLoaded++;
    console.log(`Загружен спрайт ${spritesLoaded}/${totalSprites}`);
    
    if (spritesLoaded === totalSprites) {
        console.log('Все основные спрайты загружены, запускаем игру');
        initGame();
    }
};

// Переменная для отслеживания загрузки
let spritesLoaded = 0;
const totalSprites = 10; // было 9, теперь 10

skyBg.onload = checkAllSpritesLoaded;
rocksBg.onload = checkAllSpritesLoaded;
forestBg.onload = checkAllSpritesLoaded;
fieldsBg.onload = checkAllSpritesLoaded;



// Фоны загружаются отдельно, не блокируют запуск игры
let backgroundsLoaded = 0;
const totalBackgrounds = 4;
const checkBackgroundLoaded = function() {
    backgroundsLoaded++;
    console.log(`Загружен фон ${backgroundsLoaded}/${totalBackgrounds}`);
};


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

// Фоны
skyBg.onload = checkBackgroundLoaded;
rocksBg.onload = checkBackgroundLoaded;
forestBg.onload = checkBackgroundLoaded;
fieldsBg.onload = checkBackgroundLoaded;
grassBg.onload = checkBackgroundLoaded; // Новый фон травы

// Константы игры
const TOTAL_PARTS = 36;
const PLAYER_POSITION = 6; // Игрок на 6-й части от левого края
const ENEMY_POSITIONS = [11, 16, 21, 26, 31]; // Фиксированные позиции врагов
const BASE_REACTION_TIME = 1000; // 1 секунда
const REACTION_DECREASE = 0.05; // Уменьшение времени на 0.05 секунды
const BOSS_INTERVAL = 30; // Босс каждые 30 врагов

// Размеры спрайтов
const PLAYER_WIDTH = 85;
const PLAYER_HEIGHT = 107;

const PLAYER_WRESTLE_WIDTH = 85;
const PLAYER_WRESTLE_HEIGHT = 92;

const PLAYER_WRESTLE_ATTACK_WIDTH = 115;
const PLAYER_WRESTLE_ATTACK_HEIGHT = 92;

const ENEMY_BOXER_WIDTH = 67;
const ENEMY_BOXER_HEIGHT = 105;

const ENEMY_BOXER2_WIDTH = 57;  // Размеры второго боксера
const ENEMY_BOXER2_HEIGHT = 102;

const ENEMY_WRESTLER1_WIDTH = 80;
const ENEMY_WRESTLER1_HEIGHT = 80;

const ENEMY_WRESTLER2_WIDTH = 80;
const ENEMY_WRESTLER2_HEIGHT = 78;

const BOSS1_WIDTH = 75;
const BOSS1_HEIGHT = 94;

const BOSS2_WIDTH = 82;
const BOSS2_HEIGHT = 110;

// Элементы DOM
const canvas = document.getElementById('gameCanvas');
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

// Функция безопасного воспроизведения звука
function playSound(soundElement) {
    try {
        if (soundElement && typeof soundElement.play === 'function') {
            // Сбрасываем звук на начало перед воспроизведением
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
    constructor(type, position) {
        this.type = type; // 1 - боксер, 2 - борец, 3 - босс
        this.position = position; // Позиция в частях (0-36)
        this.defeated = false;
        this.defeatAnimationProgress = 0;
        this.isBoss = type === 3;
        this.wrestlerType = Math.random() > 0.5 ? 1 : 2; // Для борцов: 1 или 2 тип
        
        // Для босса случайно выбираем тип (1 или 2)
        if (this.isBoss) {
            this.bossType = Math.random() > 0.5 ? 1 : 2; // 1 - boss1, 2 - boss2
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
    
    // Определяем размеры в зависимости от типа
    let width, height, sprite;
    
    if (this.isBoss) {
        if (this.bossType === 1) {
            width = BOSS1_WIDTH;
            height = BOSS1_HEIGHT;
            sprite = boss1Sprite;
        } else {
            width = BOSS2_WIDTH;
            height = BOSS2_HEIGHT;
            sprite = boss2Sprite;
        }
    } else if (this.type === 1) {
        // Для боксеров случайно выбираем между двумя типами
        this.boxerType = this.boxerType || (Math.random() > 0.5 ? 1 : 2);
        
        if (this.boxerType === 1) {
            width = ENEMY_BOXER_WIDTH;
            height = ENEMY_BOXER_HEIGHT;
            sprite = enemyBoxerSprite;
        } else {
            width = ENEMY_BOXER2_WIDTH;
            height = ENEMY_BOXER2_HEIGHT;
            sprite = enemyBoxer2Sprite;
        }
    } else {
        width = this.wrestlerType === 1 ? ENEMY_WRESTLER1_WIDTH : ENEMY_WRESTLER2_WIDTH;
        height = this.wrestlerType === 1 ? ENEMY_WRESTLER1_HEIGHT : ENEMY_WRESTLER2_HEIGHT;
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
            ctx.fillText(`Здоровье: ${this.health}`, pixelPosition, pixelY - 10);
        }
    }
}

}

// Функция инициализации игры
function initGame() {
    console.log('Игра инициализируется');
    
    // Сбрасываем позиции фонов (ДОБАВЬТЕ ЭТОТ КОД)
    skyX = 0;
    rocksX = 0;
    forestX = 0;
    fieldsX = 0;
    grassX = 0; // Новый фон травы
    
    // Существующий код продолжается здесь:
    score = 0;
    level = 1;
    enemyCounter = 0;
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
    enemyCounterElement.textContent = enemyCounter;
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

// Создание начальных врагов
function createInitialEnemies() {
    // Создаем 5 врагов на фиксированных позициях
    for (let i = 0; i < 5; i++) {
        const type = Math.random() > 0.5 ? 1 : 2;
        enemies.push(new Enemy(type, ENEMY_POSITIONS[i]));
    }

    // Обновляем кнопки и спрайт игрока в зависимости от типа первого врага
    updateButtonsAndPlayerSprite();
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
            enemyCounterElement.textContent = enemyCounter;
            // Увеличиваем уровень и уменьшаем время реакции каждые 10 врагов
            if (enemyCounter % 10 === 0) {
                level++;
                levelValueElement.textContent = level;
                reactionTime = Math.max(300, reactionTime * (1 - REACTION_DECREASE)); // Минимум 300мс
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

// Завершение хода
function finishMove() {
    // Удаляем первого врага (он уже побежден)
    const defeatedEnemy = enemies.shift();
    if (defeatedEnemy) {
        defeatedEnemies.push(defeatedEnemy);
    }

    // Сдвигаем оставшихся врагов на фиксированные позиции
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].position = ENEMY_POSITIONS[i];
    }

    // Добавляем нового врага в конец очереди
    const type = (enemyCounter + 1) % BOSS_INTERVAL === 0 ? 3 : Math.random() > 0.5 ? 1 : 2;
    enemies.push(new Enemy(type, ENEMY_POSITIONS[enemies.length]));

    // Обновляем кнопки и спрайт игрока в зависимости от типа первого врага
    updateButtonsAndPlayerSprite();

    // Если игра не окончена, запускаем таймер для следующего врага
    if (!gameOver) {
        currentTimeLeft = reactionTime;
        startReactionTimer();
    }
}

// Завершение игры
function endGame(reason) {
    gameOver = true;
    clearInterval(currentTimer);
    playSound(gameOverSound);
    
    // Рисуем сообщение о конце игры
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(reason, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Счет: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Нажмите любую кнопку для перезапуска', canvas.width / 2, canvas.height / 2 + 100);
    
    // Устанавливаем флаг, что игра ожидает перезапуска
    waitingForRestart = true;
}

// Перезапуск игры
function restartGame() {
    waitingForRestart = false;
    initGame();
}

// Отрисовка игрока и таймера
function drawPlayer() {
    const playerPixelPosition = (PLAYER_POSITION / TOTAL_PARTS) * canvas.width;
    
    // Определяем размеры в зависимости от текущего спрайта
    let width, height;
    if (currentPlayerSprite === playerShotSprite) {
        width = PLAYER_WIDTH;
        height = PLAYER_HEIGHT;
    } else if (currentPlayerSprite === playerWrestleSprite) {
        width = PLAYER_WRESTLE_WIDTH;
        height = PLAYER_WRESTLE_HEIGHT;
    } else if (currentPlayerSprite === playerWrestleAttackSprite) {
        width = PLAYER_WRESTLE_ATTACK_WIDTH;
        height = PLAYER_WRESTLE_ATTACK_HEIGHT;
    } else {
        width = PLAYER_WIDTH; // для обычного спрайта игрока
        height = PLAYER_HEIGHT;
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

// Отрисовка параллакс-фона
function drawBackground() {
    // Заливаем верхнюю часть голубым цветом (небо)
    ctx.fillStyle = '#afd2e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Обновляем позиции фонов для эффекта параллакса
    skyX -= SKY_SPEED;
    rocksX -= ROCKS_SPEED;
    forestX -= FOREST_SPEED;
    fieldsX -= FIELDS_SPEED;
    
    // Высота фонов
    const BG_HEIGHT = 120;
    const GRASS_HEIGHT = 100; // Новая высота травы
    
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
    
    // Позиции по Y с наложением (каскадом)
    const fieldsY = canvas.height - BG_HEIGHT; // Поле - в самом низу
    const forestY = fieldsY - BG_HEIGHT / 2;   // Лес - на половине высоты поля
    const rocksY = forestY - BG_HEIGHT / 2;    // Горы - на половине высоты леса
    const skyY = rocksY - BG_HEIGHT / 2;       // Небо - на половине высоты гор
    
    // Функция для бесконечной прокрутки фона с перекрытием в 1 пиксель
    function drawParallaxLayer(bgImage, x, y, newWidth, bgHeight, speed) {
        // Рисуем столько копий фона, сколько нужно для покрытия всей ширины холста + запаса
        const numCopies = Math.ceil(canvas.width / newWidth) + 2;
        for (let i = 0; i < numCopies; i++) {
            const drawX = x + i * newWidth;
            // Рисуем только если изображение попадает в видимую область
            if (drawX + newWidth > 0 && drawX < canvas.width) {
                // Добавляем перекрытие в 1 пиксель для устранения полосок
                ctx.drawImage(bgImage, drawX - 1, y, newWidth + 2, bgHeight);
            }
        }
        
        // Сбрасываем позицию, когда она уходит за пределы
        if (x <= -newWidth) {
            return 0;
        }
        return x;
    }
    
    // Рисуем небо
    if (skyBg.complete) {
        skyX = drawParallaxLayer(skyBg, skyX, skyY, skyNewWidth, BG_HEIGHT, SKY_SPEED);
    }
    
    // Рисуем горы
    if (rocksBg.complete) {
        rocksX = drawParallaxLayer(rocksBg, rocksX, rocksY, rocksNewWidth, BG_HEIGHT, ROCKS_SPEED);
    }
    
    // Рисуем лес
    if (forestBg.complete) {
        forestX = drawParallaxLayer(forestBg, forestX, forestY, forestNewWidth, BG_HEIGHT, FOREST_SPEED);
    }
    
    // Рисуем поле
    if (fieldsBg.complete) {
        fieldsX = drawParallaxLayer(fieldsBg, fieldsX, fieldsY, fieldsNewWidth, BG_HEIGHT, FIELDS_SPEED);
    }

    
    // Рисуем пол поверх фонов
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// Отрисовка травы поверх игрока и обычных врагов
function drawGrass() {
    const GRASS_HEIGHT = 100; // Высота травы 100 пикселей
    const grassRatio = grassBg.width / grassBg.height;
    const grassNewWidth = GRASS_HEIGHT * grassRatio;
    const grassY = canvas.height - GRASS_HEIGHT;
    
    // Обновляем позицию травы
    grassX -= GRASS_SPEED;
    
    // Функция для бесконечной прокрутки травы
    function drawGrassLayer(x, y, newWidth, bgHeight) {
        const numCopies = Math.ceil(canvas.width / newWidth) + 2;
        for (let i = 0; i < numCopies; i++) {
            const drawX = x + i * newWidth;
            if (drawX + newWidth > 0 && drawX < canvas.width) {
                // Добавляем перекрытие в 1 пиксель для устранения полосок
                ctx.drawImage(grassBg, drawX - 1, y, newWidth + 2, bgHeight);
            }
        }
        
        if (x <= -newWidth) {
            return 0;
        }
        return x;
    }
    
    // Рисуем траву
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
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        playSound(startSound);
        startReactionTimer();
    }
}
