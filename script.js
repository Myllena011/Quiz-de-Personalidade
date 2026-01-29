const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos UI
const loginScreen = document.getElementById('login-screen');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const characterResult = document.getElementById('character-result');
const characterDesc = document.getElementById('character-desc');
const playerNameInput = document.getElementById('player-name');
const loginUserInput = document.getElementById('login-user');
const loginPassInput = document.getElementById('login-pass');
const loginMsg = document.getElementById('login-msg');
const userBadge = document.getElementById('user-badge');
const displayUsername = document.getElementById('display-username');
const logoutBtn = document.getElementById('logout-btn');

// Estado do Jogo
let gameState = 'LOGIN';
let currentQuestionIndex = 0;
let scores = { analista: 0, criativo: 0, lider: 0, apoiador: 0 };
let playerName = "";
let currentUser = null;

const profiles = {
    analista: {
        name: "O Analista",
        desc: "Sua mente é uma ferramenta de precisão. Você encontra beleza na ordem, nos dados e na verdade objetiva. Sua capacidade de desvendar complexidades é o seu superpoder."
    },
    criativo: {
        name: "O Criativo",
        desc: "Você não apenas vê o mundo, você o reimagina. Sua alma vibra com a inovação e a expressão. Onde outros veem limites, você vê uma tela em branco esperando por cores."
    },
    lider: {
        name: "O Líder",
        desc: "Você nasceu para guiar. Sua determinação é contagiante e sua visão é clara. Você não espera pelo futuro, você o constrói com coragem e estratégia."
    },
    apoiador: {
        name: "O Apoiador",
        desc: "Você é o coração de qualquer grupo. Sua empatia cria pontes e sua presença traz harmonia. Sua força reside na conexão humana e na bondade genuína."
    }
};

const questions = [
    {
        question: "Como você prefere passar seu tempo livre?",
        options: [
            { text: "Explorando novos conhecimentos ou hobbies técnicos.", weights: { analista: 2 } },
            { text: "Expressando-se através de algo artístico ou manual.", weights: { criativo: 2 } },
            { text: "Liderando projetos ou organizando eventos sociais.", weights: { lider: 2 } },
            { text: "Conectando-se profundamente com amigos e família.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Diante de um problema inesperado, você:",
        options: [
            { text: "Analisa friamente todas as variáveis envolvidas.", weights: { analista: 2 } },
            { text: "Busca uma solução que ninguém mais pensou.", weights: { criativo: 2 } },
            { text: "Assume o controle e delega ações imediatas.", weights: { lider: 2 } },
            { text: "Ouve as preocupações de todos antes de agir.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "O que mais te motiva em um projeto?",
        options: [
            { text: "A precisão e a qualidade do resultado final.", weights: { analista: 2 } },
            { text: "A originalidade e o impacto visual/emocional.", weights: { criativo: 2 } },
            { text: "O sucesso, o reconhecimento e a eficiência.", weights: { lider: 2 } },
            { text: "O bem-estar da equipe e a colaboração.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Em um grupo, você costuma ser a pessoa que:",
        options: [
            { text: "Fornece os fatos e a lógica necessária.", weights: { analista: 2 } },
            { text: "Traz as ideias mais inusitadas e divertidas.", weights: { criativo: 2 } },
            { text: "Toma as decisões difíceis quando ninguém quer.", weights: { lider: 2 } },
            { text: "Mantém todos unidos e resolve conflitos.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Qual sua visão sobre o futuro?",
        options: [
            { text: "Um quebra-cabeça que pode ser previsto com dados.", weights: { analista: 2 } },
            { text: "Um vasto campo de possibilidades infinitas.", weights: { criativo: 2 } },
            { text: "Um território a ser conquistado com esforço.", weights: { lider: 2 } },
            { text: "Um lugar onde a cooperação humana será essencial.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Como você lida com críticas?",
        options: [
            { text: "Avalio se elas fazem sentido logicamente.", weights: { analista: 2 } },
            { text: "Uso-as como combustível para minha evolução.", weights: { criativo: 2 } },
            { text: "Foco em como melhorar para atingir o objetivo.", weights: { lider: 2 } },
            { text: "Tento entender o sentimento por trás da crítica.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Qual ambiente de trabalho você prefere?",
        options: [
            { text: "Silencioso, organizado e focado em tarefas.", weights: { analista: 2 } },
            { text: "Dinâmico, colorido e sem muitas regras rígidas.", weights: { criativo: 2 } },
            { text: "Competitivo, rápido e com metas claras.", weights: { lider: 2 } },
            { text: "Acolhedor, amigável e baseado em equipe.", weights: { apoiador: 2 } }
        ]
    },
    {
        question: "Ao aprender algo novo, você foca em:",
        options: [
            { text: "Entender o 'como' e o 'porquê' detalhadamente.", weights: { analista: 2 } },
            { text: "Descobrir como aplicar de forma inovadora.", weights: { criativo: 2 } },
            { text: "Como isso pode me tornar mais eficiente.", weights: { lider: 2 } },
            { text: "Como isso pode ajudar as pessoas ao meu redor.", weights: { apoiador: 2 } }
        ]
    }
];

// Partículas de fundo no Canvas
let particles = [];
function createParticles() {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
}

function resize() {
    const container = document.getElementById('game-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    createParticles();
}

window.addEventListener('resize', resize);
resize();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles();
    if (gameState === 'QUESTION') drawQuestion();
    requestAnimationFrame(draw);
}

function drawQuestion() {
    const q = questions[currentQuestionIndex];

    // Pergunta
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 210, 255, 0.5)';
    wrapText(ctx, q.question, canvas.width / 2, 140, canvas.width - 160, 40);
    ctx.shadowBlur = 0;

    // Opções
    q.options.forEach((opt, i) => {
        const y = 300 + (i * 80);
        const width = canvas.width - 200;
        const x = (canvas.width - width) / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        roundRect(ctx, x, y, width, 60, 15, true, true);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 18px Inter';
        ctx.fillText(opt.text, canvas.width / 2, y + 36);
    });
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

canvas.addEventListener('click', (e) => {
    if (gameState !== 'QUESTION') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    questions[currentQuestionIndex].options.forEach((opt, i) => {
        const y = 300 + (i * 80);
        const width = canvas.width - 200;
        const x = (canvas.width - width) / 2;
        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + 60) {
            selectOption(opt);
        }
    });
});

function selectOption(opt) {
    for (const profile in opt.weights) scores[profile] += opt.weights[profile];
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) showResult();
}

async function showResult() {
    gameState = 'RESULT';
    let winner = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const profileData = profiles[winner];

    characterResult.innerText = profileData.name;
    characterDesc.innerText = profileData.desc;
    resultScreen.classList.add('active');

    // Enviar para o backend
    try {
        const response = await fetch('http://localhost:3001/api/save-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: playerName || "Anônimo",
                profile: profileData.name,
                userId: currentUser ? currentUser.id : null
            })
        });
        const data = await response.json();
        console.log('Resultado salvo:', data);
    } catch (error) {
        console.error('Erro ao salvar resultado:', error);
    }
}

startBtn.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Por favor, digite seu nome para começar!");
        return;
    }
    startScreen.classList.remove('active');
    gameState = 'QUESTION';
});

// Lógica de Login e Registro
loginBtn.addEventListener('click', async () => {
    const username = loginUserInput.value.trim();
    const password = loginPassInput.value.trim();
    if (!username || !password) return loginMsg.innerText = "Preencha todos os campos.";

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = { id: data.userId, username: data.username };
            playerNameInput.value = data.username;
            displayUsername.innerText = data.username;
            userBadge.classList.remove('hidden');
            loginScreen.classList.remove('active');
            startScreen.classList.add('active');
            gameState = 'START';
        } else {
            loginMsg.innerText = data.error;
        }
    } catch (err) {
        loginMsg.innerText = "Erro ao conectar ao servidor.";
    }
});

registerBtn.addEventListener('click', async () => {
    const username = loginUserInput.value.trim();
    const password = loginPassInput.value.trim();
    if (!username || !password) return loginMsg.innerText = "Preencha todos os campos.";

    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            loginMsg.innerText = "Registrado com sucesso! Agora clique em Entrar.";
            loginMsg.style.color = "var(--primary-glow)";
        } else {
            loginMsg.innerText = data.error;
        }
    } catch (err) {
        loginMsg.innerText = "Erro ao conectar ao servidor.";
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    userBadge.classList.add('hidden');
    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    loginScreen.classList.add('active');
    gameState = 'LOGIN';
    loginUserInput.value = '';
    loginPassInput.value = '';
    loginMsg.innerText = '';
});

restartBtn.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active'); // Volta para a tela inicial
    currentQuestionIndex = 0;
    Object.keys(scores).forEach(k => scores[k] = 0);
    gameState = 'START'; // Muda o estado para START
});

draw();
