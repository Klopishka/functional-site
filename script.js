const nav = document.querySelector('.main-nav');
const menuToggle = document.querySelector('.menu-toggle');
menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const updateActiveNav = () => {
  const current = sections.reduce((visible, section) => {
    if (window.scrollY + 120 >= section.offsetTop) return section.id;
    return visible;
  }, 'home');
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', updateActiveNav, { passive: true });

const quizQuestions = [
  { text: 'Що називають областю визначення функції?', answers: ['Усі значення y', 'Усі допустимі значення x', 'Точки перетину з Oy', 'Найбільше значення функції'], correct: 1 },
  { text: 'Яка функція є парною?', answers: ['f(x) = x³ + x', 'f(x) = 2x − 1', 'f(x) = x² + 4', 'f(x) = x⁵'], correct: 2 },
  { text: 'Що є нулями функції?', answers: ['Значення x, для яких f(x) = 0', 'Вершина графіка', 'Значення y при x = 0', 'Усі від’ємні значення'], correct: 0 },
  { text: 'Яка вершина параболи y = (x − 3)² + 2?', answers: ['(−3; 2)', '(3; −2)', '(3; 2)', '(2; 3)'], correct: 2 },
  { text: 'Як змінюється графік y = f(x) + 4?', answers: ['Зсувається на 4 вправо', 'Зсувається на 4 вгору', 'Стискається у 4 рази', 'Відбивається відносно Ox'], correct: 1 }
];
let quizIndex = 0;
const quizChoices = Array(quizQuestions.length).fill(null);
const quizContent = document.getElementById('quiz-content');
const progressBar = document.getElementById('quiz-progress-bar');
const scoreNumber = document.getElementById('score-number');
const prevButton = document.getElementById('quiz-prev');
const nextButton = document.getElementById('quiz-next');
function renderQuestion() {
  const question = quizQuestions[quizIndex];
  progressBar.style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
  quizContent.innerHTML = `<div class="question-meta">Запитання ${String(quizIndex + 1).padStart(2, '0')} / ${quizQuestions.length}</div>
    <h3 class="quiz-question">${question.text}</h3>
    <div class="answers">${question.answers.map((answer, index) => `<label class="answer-option ${quizChoices[quizIndex] === index ? 'selected' : ''}"><input type="radio" name="quiz-answer" value="${index}" ${quizChoices[quizIndex] === index ? 'checked' : ''}> <span>${answer}</span></label>`).join('')}</div>`;
  quizContent.querySelectorAll('input').forEach((input) => input.addEventListener('change', () => {
    quizChoices[quizIndex] = Number(input.value);
    quizContent.querySelectorAll('.answer-option').forEach((option) => option.classList.remove('selected'));
    input.closest('.answer-option').classList.add('selected');
  }));
  prevButton.disabled = quizIndex === 0;
  nextButton.textContent = quizIndex === quizQuestions.length - 1 ? 'Завершити ✓' : 'Далі →';
}
function showResult() {
  const score = quizChoices.reduce((total, choice, index) => total + (choice === quizQuestions[index].correct ? 1 : 0), 0);
  scoreNumber.textContent = `${score}/${quizQuestions.length}`;
  const message = score === 5 ? 'Відмінно! Ти мислиш функціонально.' : score >= 3 ? 'Добре! Ще трохи практики — і буде впевнено.' : 'Це старт. Повернися до теорії та спробуй ще раз.';
  quizContent.innerHTML = `<div class="quiz-result"><div class="eyebrow coral">Результат готовий</div><h3>${message}</h3><p>Твій результат: <b>${score} з ${quizQuestions.length}</b>. Натисни «Спробувати ще», щоб повторити тест.</p><button class="button button-primary" id="quiz-restart" type="button">Спробувати ще ↻</button></div>`;
  document.querySelector('#quiz-restart').addEventListener('click', () => {
    quizIndex = 0; quizChoices.fill(null); scoreNumber.textContent = '—'; renderQuestion();
  });
  prevButton.style.visibility = 'hidden'; nextButton.style.visibility = 'hidden';
}
prevButton?.addEventListener('click', () => { if (quizIndex > 0) { quizIndex -= 1; renderQuestion(); } });
nextButton?.addEventListener('click', () => {
  if (quizIndex < quizQuestions.length - 1) { quizIndex += 1; renderQuestion(); } else showResult();
});
renderQuestion();

const canvas = document.getElementById('function-canvas');
const ctx = canvas.getContext('2d');
const ranges = { a: document.getElementById('a-range'), b: document.getElementById('b-range'), c: document.getElementById('c-range') };
const values = { a: document.getElementById('a-value'), b: document.getElementById('b-value'), c: document.getElementById('c-value') };
const labels = { a: document.getElementById('a-label'), b: document.getElementById('b-label'), c: document.getElementById('c-label') };
const insight = document.getElementById('calculator-insight');
let scale = 34;
const fmt = (number) => Number(number).toFixed(1).replace('.0', '');
function drawGraph() {
  if (!canvas || !ctx) return;
  const a = Number(ranges.a.value), b = Number(ranges.b.value), c = Number(ranges.c.value);
  Object.keys(values).forEach((key) => {
    values[key].value = fmt(ranges[key].value);
    labels[key].value = key === 'a'
      ? fmt(ranges[key].value)
      : `${Number(ranges[key].value) >= 0 ? '+' : '−'}${fmt(Math.abs(Number(ranges[key].value)))}`;
  });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const origin = { x: canvas.width / 2, y: canvas.height / 2 };
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e2ebf0'; ctx.lineWidth = 1;
  for (let x = origin.x % scale; x < canvas.width; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = origin.y % scale; y < canvas.height; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  ctx.strokeStyle = '#7b8ea1'; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height); ctx.stroke();
  ctx.fillStyle = '#7890a0'; ctx.font = '12px system-ui';
  for (let i = -10; i <= 10; i += 1) { if (i !== 0) { ctx.fillText(String(i), origin.x + i * scale - 4, origin.y + 17); ctx.fillText(String(-i), origin.x + 7, origin.y + i * scale + 4); } }
  const point = (x) => ({ x: origin.x + x * scale, y: origin.y - (a * x * x + b * x + c) * scale });
  ctx.beginPath();
  let started = false;
  for (let px = 0; px <= canvas.width; px += 2) {
    const x = (px - origin.x) / scale; const y = point(x);
    if (!Number.isFinite(y.y) || Math.abs(y.y) > canvas.height * 3) { started = false; continue; }
    if (!started) { ctx.moveTo(y.x, y.y); started = true; } else ctx.lineTo(y.x, y.y);
  }
  ctx.strokeStyle = '#ef765e'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
  const vertexX = a === 0 ? 0 : -b / (2 * a); const vertexY = a === 0 ? c : a * vertexX * vertexX + b * vertexX + c;
  if (a !== 0 && Math.abs(vertexX) < 10 && Math.abs(vertexY) < 6) { const vertex = point(vertexX); ctx.beginPath(); ctx.arc(vertex.x, vertex.y, 6, 0, Math.PI * 2); ctx.fillStyle = '#7963d6'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
  const direction = a > 0 ? 'вгору' : a < 0 ? 'вниз' : 'пряма';
  insight.textContent = a === 0 ? `Це лінійна функція: графік — пряма, напрям залежить від b = ${fmt(b)}.` : `Парабола відкривається ${direction}. Вершина: (${fmt(vertexX)}; ${fmt(vertexY)}).`;
}
Object.values(ranges).forEach((range) => range?.addEventListener('input', drawGraph));
document.querySelectorAll('.quick-presets button').forEach((button) => button.addEventListener('click', () => {
  button.dataset.values.split(',').forEach((value, index) => { ranges[['a', 'b', 'c'][index]].value = value; }); drawGraph();
}));
canvas?.addEventListener('wheel', (event) => {
  event.preventDefault(); scale = Math.max(20, Math.min(60, scale + (event.deltaY < 0 ? 3 : -3))); drawGraph();
}, { passive: false });
drawGraph();
