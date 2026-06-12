/* Сустав+ v2.4 — нативный цифровой проводник до/после эндопротезирования */
(function () {
  const VERSION = '2.4-native-guide-game';
  const TRACK_API = '/api/track';
  const TRACKER_URL = 'https://docs.google.com/spreadsheets/d/1fCEnLH6RYQptTf2zvlrjX6J5LDGTehjXg6TU6X_6lbU/copy';
  const TELEGRAM_URL = 'https://t.me/newsustav';
  const VITALIY_WA = 'https://wa.me/79163847070?text=';

  const STORAGE = {
    stage: 'splus_v24_stage',
    done: 'splus_v24_done',
    tracker: 'splus_v24_tracker',
    fear: 'splus_v24_fear'
  };

  const state = {
    stage: localStorage.getItem(STORAGE.stage) || '',
    fear: localStorage.getItem(STORAGE.fear) || '',
    done: readJson(STORAGE.done, {}),
    tracker: readJson(STORAGE.tracker, {})
  };

  const stages = [
    { id: 'diagnosis', title: 'Мне только сказали, что нужна операция', text: 'Сейчас важно не принимать решение в панике. Начните с вопросов врачу, снимков и понятного маршрута.', first: 'Соберите документы, заключения и вопросы врачу. Не решайте всё за один вечер.' },
    { id: 'save_joint', title: 'Я пока пытаюсь сохранить сустав', text: 'Важно понять стадию, риски, варианты и где уже нужен хирургический взгляд.', first: 'Соберите второе мнение и список вопросов: что реально можно сохранить, а где вы теряете время.' },
    { id: 'doctor', title: 'Я выбираю врача', text: 'Выбор врача — это не поиск волшебника, а сбор критериев и правильных вопросов.', first: 'Откройте чек-лист вопросов хирургу и не сравнивайте врачей только по слухам.' },
    { id: 'preop', title: 'Я готовлюсь к операции', text: 'Фокус — дом, вещи, вопросы хирургу, близкие и первые дни после выписки.', first: 'Подготовьте дом: ковры, проходы, кровать, туалет, душ, костыли или ходунки.' },
    { id: 'first14', title: 'Я первые 14 дней после операции', text: 'Фокус — безопасность, мягкое движение, красные флаги и спокойный режим.', first: 'Не геройствуйте. Отметьте боль, сделайте дыхание и насос стопами, если это разрешено.' },
    { id: 'day15_30', title: 'Я восстанавливаюсь 15–30 дней', text: 'Фокус — трекер, ходьба, ЛФК и мягкое увеличение активности.', first: 'Откройте трекер и смотрите динамику, а не только эмоции одного дня.' },
    { id: 'family', title: 'Я помогаю близкому', text: 'Самая важная помощь — безопасность, спокойствие и уважение к темпу восстановления.', first: 'Подготовьте дом и договоритесь, как помогать без давления и паники.' },
    { id: 'longlife', title: 'Я живу с протезом, но есть вопросы', text: 'Фокус — активность, вес, уверенность, спорт и контроль непонятных ощущений.', first: 'Не сравнивайте себя с чужими историями. Соберите свои вопросы и проверьте контрольные точки.' }
  ];

  const tasks = [
    { id: 'pain', title: 'Отметить боль', text: 'Оцените боль по шкале 0–10. Это помогает видеть динамику.' },
    { id: 'breath', title: 'Сделать дыхание', text: '5–8 спокойных циклов. Спокойное дыхание — тоже часть восстановления.' },
    { id: 'feet', title: 'Сделать насос стопами', text: '10–20 повторений, если это разрешено врачом или реабилитологом.' },
    { id: 'walk', title: 'Отметить ходьбу', text: 'Не рекорд, а безопасная дистанция и уверенность.' },
    { id: 'question', title: 'Записать вопрос врачу', text: 'Не держите вопросы в голове. Сохраните один важный вопрос.' }
  ];

  const warmups = [
    { id: 'bed3', title: '3 минуты в кровати', for: 'Для первых дней и тревожных моментов', items: ['дыхание', 'насос стопами', 'круги стопами', 'сжатие ягодиц', 'мягкое напряжение бедра'], response: 'Отлично. Это не спортзал, это тихая работа на восстановление.' },
    { id: 'support5', title: '5 минут у опоры', for: 'Когда врач разрешил стоять у устойчивой опоры', items: ['перенос веса', 'подъём на носочки', 'отведение ноги', 'шаги на месте', 'спокойное дыхание'], response: 'Красиво. Протез не любит драму, он любит режим.' },
    { id: 'blood', title: 'Разогнать кровь', for: 'Когда долго сидели или лежали', items: ['насос стопами', 'круги стопами', 'сжатие ягодиц', 'короткая ходьба по разрешению врача'], response: 'Кровь пошла по маршруту. Маленькая победа засчитана.' },
    { id: 'fear_move', title: 'Я боюсь двигаться', for: 'Для тревожных пациентов', items: ['дыхание', '2 самых безопасных упражнения', 'проверка красных флагов', 'кнопка “Виталий поможет”'], response: 'Страх движения нормален. Мы не ломаем страх, мы приручаем его маленькими шагами.' },
    { id: 'office', title: 'Мини-разминка для офиса / дома', for: 'Для дальнего восстановления', items: ['стопы', 'плечи', 'дыхание', 'короткая ходьба', 'мягкая осанка'], response: 'Хорошая работа. Тело любит спокойную повторяемость.' }
  ];

  const questionCategories = [
    { id: 'operation', title: 'Мне сказали менять сустав', intro: 'Это один из самых тревожных этапов. Не принимайте решение по форумам или одному ролику.', questions: ['Это точно операция?', 'Можно ли ещё сохранить сустав?', 'Что будет, если тянуть?', 'Как понять стадию коксартроза?', 'Что такое АНГБК?', 'Почему один врач говорит одно, другой другое?', 'Когда нужно второе мнение?', 'Какие снимки нужны врачу?'], actions: ['Открыть вопросы врачу', 'Выбрать этап “только сказали”', 'Разобрать ситуацию с Виталием'] },
    { id: 'doctor', title: 'Я выбираю врача', intro: 'Выбор врача — это не поиск “самого лучшего вообще”, а сбор понятных критериев.', questions: ['Как выбрать хирурга?', 'Что спросить на консультации?', 'Как понять, что врачу можно доверять?', 'Что важнее: доступ, опыт, клиника или цена?', 'Нужен ли передний доступ?', 'Что спросить про имплант?', 'Что спросить про осложнения?', 'Стоит ли ехать в другой город?'], actions: ['Чек-лист вопросов хирургу', 'Сохранить вопрос', 'Разобрать выбор врача с Виталием'] },
    { id: 'fear', title: 'Я боюсь операции', intro: 'Страх перед операцией нормален. Мозг пытается защитить вас от неизвестности.', questions: ['Боюсь наркоза', 'Боюсь боли после операции', 'Боюсь осложнений', 'Боюсь остаться инвалидом', 'Боюсь, что жизнь закончится', 'Боюсь больницы', 'Боюсь, что родные не справятся'], actions: ['Открыть маршрут подготовки', 'Посмотреть историю Виталия', 'Поговорить с Виталием'] },
    { id: 'home', title: 'Подготовка дома', intro: 'Дом после операции должен быть не красивым, а безопасным.', questions: ['Что убрать дома?', 'Какая кровать нужна?', 'Нужна ли насадка на унитаз?', 'Как подготовить душ?', 'Какие костыли выбрать?', 'Как подготовить лестницу?', 'Что купить заранее, а что лишнее?'], actions: ['Открыть чек-лист дома', 'Список вещей', 'Виталий поможет подготовить дом'] },
    { id: 'firstdays', title: 'Первые дни после операции', intro: 'Первые дни пугают не потому, что всё плохо, а потому что всё новое.', questions: ['Что нормально в первые дни?', 'Почему болит?', 'Почему отёк?', 'Как спать?', 'Как вставать с кровати?', 'Как ходить с костылями?', 'Когда срочно к врачу?'], actions: ['Открыть первые 14 дней', 'Открыть красные флаги', 'Записать вопрос врачу'] },
    { id: 'lfk', title: 'ЛФК и упражнения', intro: 'Главная цель — не рекорд, а безопасная регулярность. Ограничения врача важнее приложения.', questions: ['Какие упражнения можно?', 'Как понять, что я перегрузился?', 'Можно ли поднимать ногу?', 'Можно ли делать подъём на носочки?', 'Когда можно лестницу?', 'Почему мышцы не слушаются?', 'Что делать, если страшно двигаться?'], actions: ['Открыть упражнения по этапам', 'Открыть лёгкую разминку', 'Спросить Виталия'] },
    { id: 'redflags', title: 'Боль, отёк и красные флаги', intro: 'Если есть тревожные симптомы, не ждите ответа в приложении. Свяжитесь с врачом.', questions: ['Где нормальная боль, а где опасная?', 'Почему отекает нога?', 'Что делать, если боль усилилась?', 'Что делать при температуре?', 'Что делать, если болит икра?', 'Когда нельзя ждать?'], actions: ['Открыть красные флаги', 'Записать вопрос врачу', 'Мне нужна помощь'] },
    { id: 'family', title: 'Близкие', intro: 'Близкие часто хотят помочь, но не знают как. Самая важная помощь — спокойствие и безопасность.', questions: ['Как помочь человеку после операции?', 'Что нельзя говорить пациенту?', 'Как подготовить дом?', 'Как не паниковать рядом?', 'Как поддержать, если человек раздражается?', 'Когда звать врача?'], actions: ['Открыть раздел для близких', 'Чек-лист помощника', 'Задать вопрос Виталию'] }
  ];

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; }
  }

  function save() {
    localStorage.setItem(STORAGE.stage, state.stage || '');
    localStorage.setItem(STORAGE.fear, state.fear || '');
    localStorage.setItem(STORAGE.done, JSON.stringify(state.done || {}));
    localStorage.setItem(STORAGE.tracker, JSON.stringify(state.tracker || {}));
  }

  function h(text) {
    return String(text || '').replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[c];
    });
  }

  function track(eventName, data) {
    try {
      fetch(TRACK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          source: 'miniapp_v2_4_native_guide',
          appVersion: VERSION,
          ts: new Date().toISOString(),
          data: data || {},
          url: location.href,
          userAgent: navigator.userAgent
        })
      }).catch(function () {});
    } catch (_) {}
  }

  function openUrl(url) {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
        window.Telegram.WebApp.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener');
      }
    } catch (_) {
      window.open(url, '_blank', 'noopener');
    }
  }

  function haptic() {
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch (_) {}
  }

  function selectedStage() { return stages.find(s => s.id === state.stage); }

  function createMarkup() {
    return `
      <section class="splus-v24" id="splusV24">
        <div class="splus-v24-hero">
          <div class="splus-v24-badge">Сустав+ 2.4 · эндопротезирование без хаоса</div>
          <h1>Сегодня ваш шаг</h1>
          <p class="splus-v24-lead">Не нужно делать всё сразу. В восстановлении выигрывает не герой, а человек, который спокойно повторяет маленькие действия.</p>
          <div class="splus-v24-focus" id="splusTodayFocus"><b>Ваш фокус сегодня:</b><span>выбрать этап, понять первый шаг и не тонуть в хаосе.</span></div>
          <div class="splus-v24-main-actions">
            <button type="button" class="splus-v24-btn primary" data-v24-action="start-onboarding">Начать мой маршрут</button>
            <button type="button" class="splus-v24-btn secondary" data-v24-action="after-operation">Я уже после операции</button>
            <button type="button" class="splus-v24-btn ghost" data-v24-action="anxiety">Мне страшно, я не знаю с чего начать</button>
          </div>
          <button type="button" class="splus-v24-vitaliy" data-v24-action="vitaliy-help">Не разобрались? Виталий поможет</button>
        </div>

        <div class="splus-v24-progress">
          <div><span>Сегодня выполнено</span><strong id="splusDoneCount">0 из 5</strong></div>
          <div><span>Серия</span><strong id="splusStreak">0 дней</strong></div>
          <div><span>Уровень</span><strong id="splusLevel">Я начал маршрут</strong></div>
        </div>

        <div class="splus-v24-tabs">
          <button type="button" class="is-active" data-v24-tab="today">Сегодня</button>
          <button type="button" data-v24-tab="route">Маршрут</button>
          <button type="button" data-v24-tab="warmup">Разминка</button>
          <button type="button" data-v24-tab="questions">Вопросы</button>
          <button type="button" data-v24-tab="tracker">Трекер</button>
          <button type="button" data-v24-tab="help">Помощь</button>
        </div>

        <div class="splus-v24-panel is-active" data-v24-panel="today">
          <div class="splus-v24-section-head"><h2>Ваши задачи на сегодня</h2><p>Сегодня без подвигов. Суставу нужен ритм, а не драматический сериал.</p></div>
          <div class="splus-v24-tasks" id="splusTodayTasks"></div>
        </div>

        <div class="splus-v24-panel" data-v24-panel="route">
          <div class="splus-v24-section-head"><h2>Где вы сейчас?</h2><p>Выберите этап — приложение запомнит его и соберёт первый шаг.</p></div>
          <div class="splus-v24-grid" id="splusStageGrid"></div>
          <div class="splus-v24-route-result" id="splusRouteResult">Выберите этап, и здесь появится ваш ближайший маршрут.</div>
        </div>

        <div class="splus-v24-panel" data-v24-panel="warmup">
          <div class="splus-v24-section-head"><h2>Лёгкая разминка</h2><p>Мягкие движения, чтобы разогнать кровь, включить мышцы и вернуть ощущение контроля. Делайте только то, что разрешил врач или реабилитолог.</p></div>
          <div class="splus-v24-grid" id="splusWarmupGrid"></div>
          <div class="splus-v24-exercise-box" id="splusExerciseBox">Выберите комплекс или упражнение.</div>
        </div>

        <div class="splus-v24-panel" data-v24-panel="questions">
          <div class="splus-v24-section-head"><h2>Найдите свой вопрос</h2><p>Здесь собраны частые боли и вопросы до и после эндопротезирования. Выберите то, что беспокоит сейчас.</p></div>
          <div class="splus-v24-question-layout"><div class="splus-v24-question-cats" id="splusQuestionCats"></div><div class="splus-v24-question-result" id="splusQuestionResult">Выберите категорию вопроса.</div></div>
        </div>

        <div class="splus-v24-panel" data-v24-panel="tracker">
          <div class="splus-v24-section-head"><h2>Трекер восстановления</h2><p>Отмечайте боль, отёк, ходьбу, ЛФК, сон, воду, настроение и вопросы врачу. Это способ меньше паниковать.</p></div>
          <div class="splus-v24-tracker">
            <label>Боль сегодня, 0–10 <input type="range" min="0" max="10" value="0" id="splusPainRange"><strong id="splusPainValue">0</strong></label>
            <label>Отёк сегодня, 0–10 <input type="range" min="0" max="10" value="0" id="splusSwellingRange"><strong id="splusSwellingValue">0</strong></label>
            <label>Вопрос врачу <textarea id="splusDoctorQuestion" placeholder="Например: когда можно увеличивать ходьбу?"></textarea></label>
            <button type="button" class="splus-v24-btn primary" data-v24-action="save-tracker">Сохранить самочувствие</button>
            <a class="splus-v24-btn secondary" href="${TRACKER_URL}" target="_blank" rel="noopener" data-v24-link="tracker_google">Открыть Google-трекер 30 дней</a>
          </div>
          <div class="splus-v24-warning">Если есть резкое усиление боли, температура, выраженный отёк, покраснение, одышка, боль в груди, кровотечение или сильное ухудшение самочувствия — не ждите ответа в приложении, свяжитесь с врачом или обратитесь за медицинской помощью.</div>
        </div>

        <div class="splus-v24-panel" data-v24-panel="help">
          <div class="splus-v24-section-head"><h2>Помощь и следующий шаг</h2><p>Можно идти самостоятельно. А можно попросить опору. Это не слабость — это нормальный маршрут.</p></div>
          <div class="splus-v24-products">
            <article><span>Бесплатно</span><h3>Самостоятельный маршрут Сустав+</h3><p>Этап, упражнения, трекер, вопросы врачу, красные флаги и подсказки для близких.</p><button type="button" class="splus-v24-btn secondary" data-v24-tab-open="route">Продолжить бесплатно</button></article>
            <article class="hot"><span>4 900 ₽</span><h3>Личный маршрутный разбор</h3><p>30–45 минут: ваш этап, вопросы врачу, подготовка дома и ближайшие шаги.</p><button type="button" class="splus-v24-btn primary" data-v24-action="review">Разобрать мою ситуацию</button></article>
            <article><span>15 000–25 000 ₽</span><h3>Индивидуальная маршрут-карта</h3><p>Созвон + письменный план: что делать, что уточнить и какие контрольные точки держать.</p><button type="button" class="splus-v24-btn dark" data-v24-action="route-map">Хочу маршрут-карту</button></article>
            <article><span>35 000–50 000 ₽</span><h3>Сопровождение 30 дней</h3><p>Чат, навигация, контроль маршрута, поддержка и подключение специалистов по необходимости.</p><button type="button" class="splus-v24-btn dark" data-v24-action="support30">Хочу сопровождение</button></article>
          </div>
        </div>

        <div class="splus-v24-note">Сустав+ не заменяет врача, хирурга или реабилитолога. Это цифровой проводник, который помогает снять хаос, собрать вопросы и понять следующий шаг.</div>
      </section>
      <div class="splus-v24-modal" id="splusV24Modal" aria-hidden="true"><div class="splus-v24-modal-card"><button type="button" class="splus-v24-close" data-v24-action="close-modal">×</button><div id="splusV24ModalContent"></div></div></div>
    `;
  }

  function setTab(tab) {
    document.querySelectorAll('.splus-v24-tabs button').forEach(btn => btn.classList.toggle('is-active', btn.dataset.v24Tab === tab));
    document.querySelectorAll('.splus-v24-panel').forEach(panel => panel.classList.toggle('is-active', panel.dataset.v24Panel === tab));
    track('screen_view', { screen: tab });
  }

  function updateFocus() {
    const focus = document.getElementById('splusTodayFocus');
    const stage = selectedStage();
    if (focus && stage) focus.innerHTML = `<b>Ваш этап:</b><span>${h(stage.title)}. ${h(stage.first)}</span>`;
  }

  function renderTasks() {
    const box = document.getElementById('splusTodayTasks');
    if (!box) return;
    box.innerHTML = tasks.map(task => {
      const done = !!state.done[task.id];
      return `<div class="splus-v24-task ${done ? 'is-done' : ''}"><button type="button" data-v24-task="${task.id}">${done ? '✓' : '+'}</button><div><h3>${h(task.title)}</h3><p>${h(task.text)}</p></div></div>`;
    }).join('');
    updateProgress();
  }

  function updateProgress() {
    const count = Object.keys(state.done || {}).filter(k => !!state.done[k]).length;
    setText('splusDoneCount', `${Math.min(count, 5)} из 5`);
    setText('splusStreak', count > 0 ? '1 день' : '0 дней');
    let level = 'Я начал маршрут';
    if (state.stage) level = 'Я не иду вслепую';
    if (state.done.feet || state.done.breath) level = 'Кровь пошла';
    if (state.done.question) level = 'Вопрос врачу готов';
    if (count >= 5) level = 'Маршрут собран';
    setText('splusLevel', level);
  }

  function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

  function renderStages() {
    const grid = document.getElementById('splusStageGrid');
    const result = document.getElementById('splusRouteResult');
    if (!grid) return;
    grid.innerHTML = stages.map(stage => `<article class="splus-v24-card"><small>${state.stage === stage.id ? 'Выбрано' : 'Этап'}</small><h3>${h(stage.title)}</h3><p>${h(stage.text)}</p><button type="button" class="splus-v24-btn secondary" data-v24-stage="${stage.id}">Выбрать этап</button></article>`).join('');
    const selected = selectedStage();
    if (selected && result) {
      result.innerHTML = `<b>Ваш этап:</b> ${h(selected.title)}<br><br><b>Первый шаг:</b> ${h(selected.first)}<br><br><button type="button" class="splus-v24-btn primary" data-v24-action="vitaliy-help">Не разобрались? Виталий поможет</button>`;
    }
  }

  function renderWarmups() {
    const grid = document.getElementById('splusWarmupGrid');
    if (!grid) return;
    grid.innerHTML = warmups.map(item => `<article class="splus-v24-card"><small>Лёгкая разминка</small><h3>${h(item.title)}</h3><p>${h(item.for)}</p><button type="button" class="splus-v24-btn secondary" data-v24-warmup="${item.id}">Открыть комплекс</button></article>`).join('');
  }

  function showWarmup(id) {
    const item = warmups.find(w => w.id === id);
    const box = document.getElementById('splusExerciseBox');
    if (!item || !box) return;
    box.innerHTML = `<b>${h(item.title)}</b><br><br><b>Для кого:</b> ${h(item.for)}<br><br><b>Что внутри:</b><ul>${item.items.map(x => `<li>${h(x)}</li>`).join('')}</ul><b>Важно:</b> делайте только то, что разрешил врач или реабилитолог. Без резкой боли и без героизма.<div style="display:grid;gap:10px;margin-top:14px;"><button type="button" class="splus-v24-btn primary" data-v24-done-warmup="${item.id}">Сделал</button><button type="button" class="splus-v24-btn secondary" data-v24-action="vitaliy-help">Не понял технику</button></div>`;
    track('warmup_open', { id });
  }

  function renderQuestions() {
    const cats = document.getElementById('splusQuestionCats');
    if (!cats) return;
    cats.innerHTML = questionCategories.map(cat => `<button type="button" data-v24-question-cat="${cat.id}">${h(cat.title)}</button>`).join('');
  }

  function showQuestionCategory(id) {
    const cat = questionCategories.find(c => c.id === id);
    const result = document.getElementById('splusQuestionResult');
    if (!cat || !result) return;
    document.querySelectorAll('[data-v24-question-cat]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.v24QuestionCat === id));
    result.innerHTML = `<b>${h(cat.title)}</b><p>${h(cat.intro)}</p><div class="splus-v24-question-list">${cat.questions.map(q => `<button type="button" data-v24-save-question="${encodeURIComponent(q)}">${h(q)}</button>`).join('')}</div><div style="display:grid;gap:10px;margin-top:14px;">${cat.actions.map((a,i) => `<button type="button" class="splus-v24-btn ${i === 2 ? 'primary' : 'secondary'}" data-v24-action="${i === 2 ? 'vitaliy-help' : 'save-question-generic'}">${h(a)}</button>`).join('')}</div>`;
    track('question_category_open', { id });
  }

  function modal(html) {
    const modalEl = document.getElementById('splusV24Modal');
    const content = document.getElementById('splusV24ModalContent');
    if (!modalEl || !content) return;
    content.innerHTML = html;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    const modalEl = document.getElementById('splusV24Modal');
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function vitaliyModal(reason) {
    track('vitaliy_help_open', { reason: reason || 'common' });
    modal(`<h2>Разобрать ситуацию с Виталием</h2><p>Я сам прошёл замену двух тазобедренных суставов и понимаю, как легко потеряться: врачи, снимки, операция, дом, боль, восстановление и разные мнения.</p><p>На личном разборе мы спокойно разложим ваш путь:</p><ul><li>где вы сейчас;</li><li>какие вопросы задать врачу;</li><li>как подготовить дом;</li><li>что делать в ближайшие дни;</li><li>где не надо паниковать;</li><li>где обязательно нужен специалист.</li></ul><p><b>Цена: 4 900 ₽.</b><br>Я не врач и не назначаю лечение. Я помогаю собрать маршрут и не идти вслепую.</p><div class="splus-v24-modal-actions"><button class="splus-v24-btn primary" data-v24-action="review">Личный разбор 4 900 ₽</button><button class="splus-v24-btn secondary" data-v24-action="close-modal">Сначала продолжу бесплатно</button></div>`);
  }

  function onboarding() {
    modal(`<h2>Начнём спокойно</h2><p>Понимаю. В этой теме легко запутаться: врачи, операция, боль, деньги, дом, костыли и восстановление. Давайте разложим всё по шагам.</p><div class="splus-v24-modal-actions"><button class="splus-v24-btn primary" data-v24-action="modal-to-route">Показать первый шаг</button><button class="splus-v24-btn secondary" data-v24-action="anxiety">Мне тревожно</button></div>`);
  }

  function anxiety() {
    track('anxiety_open', {});
    modal(`<h2>Понимаю, вам тревожно</h2><p>В этот момент у многих в голове хаос: врач, операция, боль, деньги, дом, костыли, восстановление. Это не слабость — это нормальная реакция на неизвестность.</p><p>Сейчас не надо решать всё сразу. Начните с ближайшего шага.</p><div class="splus-v24-modal-actions"><button class="splus-v24-btn primary" data-v24-action="modal-to-route">Показать первый шаг</button><button class="splus-v24-btn secondary" data-v24-action="vitaliy-help">Хочу поговорить с Виталием</button></div>`);
  }

  function saveQuestion(q) {
    state.done.question = true;
    save(); renderTasks();
    modal(`<h2>Вопрос сохранён</h2><p>Отлично. Не держите это в голове. Вопрос врачу готов — это уже шаг к спокойствию.</p><p><b>Ваш вопрос:</b><br>${h(q)}</p><div class="splus-v24-modal-actions"><button class="splus-v24-btn primary" data-v24-action="vitaliy-help">Разобрать с Виталием</button><button class="splus-v24-btn secondary" data-v24-action="close-modal">Вернуться</button></div>`);
    track('question_saved', { question: q });
  }

  function saveTracker() {
    const pain = document.getElementById('splusPainRange')?.value || '0';
    const swelling = document.getElementById('splusSwellingRange')?.value || '0';
    const question = (document.getElementById('splusDoctorQuestion')?.value || '').trim();
    state.tracker = { pain, swelling, question, date: new Date().toISOString() };
    state.done.pain = true;
    if (question) state.done.question = true;
    save(); renderTasks();
    const extra = Number(pain) >= 7 ? '<p><b>Боль высокая.</b> Не геройствуйте. Проверьте красные флаги и при необходимости свяжитесь со специалистом.</p>' : '';
    modal(`<h2>Самочувствие сохранено</h2><p>Хорошо. Трекер нужен не для контроля ради контроля. Он помогает видеть динамику и меньше паниковать.</p>${extra}<div class="splus-v24-modal-actions"><button class="splus-v24-btn primary" data-v24-action="vitaliy-help">Не понимаю динамику</button><button class="splus-v24-btn secondary" data-v24-action="close-modal">Вернуться</button></div>`);
    track('tracker_save', state.tracker);
  }

  function init() {
    try { window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand(); } catch (_) {}
    if (document.getElementById('splusV24')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = createMarkup();
    const app = document.getElementById('app');
    if (app && app.parentNode) app.parentNode.insertBefore(wrap, app);
    else document.body.insertBefore(wrap, document.body.firstChild);

    renderTasks(); renderStages(); renderWarmups(); renderQuestions(); updateFocus();
    const painRange = document.getElementById('splusPainRange');
    const swellingRange = document.getElementById('splusSwellingRange');
    if (state.tracker.pain && painRange) painRange.value = state.tracker.pain;
    if (state.tracker.swelling && swellingRange) swellingRange.value = state.tracker.swelling;
    setText('splusPainValue', painRange ? painRange.value : '0');
    setText('splusSwellingValue', swellingRange ? swellingRange.value : '0');
    track('screen_view', { screen: 'splus_v24_home' });
  }

  document.addEventListener('input', function (e) {
    if (e.target.id === 'splusPainRange') setText('splusPainValue', e.target.value);
    if (e.target.id === 'splusSwellingRange') setText('splusSwellingValue', e.target.value);
  });

  document.addEventListener('click', function (e) {
    const target = e.target.closest('button, a');
    if (!target) return;
    if (target.dataset.v24Link) track('external_click', { key: target.dataset.v24Link, href: target.href });

    const tab = target.dataset.v24Tab;
    const tabOpen = target.dataset.v24TabOpen;
    const action = target.dataset.v24Action;
    const stage = target.dataset.v24Stage;
    const task = target.dataset.v24Task;
    const warmup = target.dataset.v24Warmup;
    const doneWarmup = target.dataset.v24DoneWarmup;
    const questionCat = target.dataset.v24QuestionCat;
    const saveQ = target.dataset.v24SaveQuestion;

    if (tab) { haptic(); setTab(tab); }
    if (tabOpen) { haptic(); setTab(tabOpen); }
    if (stage) { haptic(); state.stage = stage; save(); renderStages(); updateFocus(); track('stage_selected', { stage }); }
    if (task) { haptic(); state.done[task] = !state.done[task]; save(); renderTasks(); if (state.done[task]) track('task_done', { task }); }
    if (warmup) { haptic(); showWarmup(warmup); }
    if (doneWarmup) {
      haptic(); state.done.breath = true; if (doneWarmup === 'blood' || doneWarmup === 'bed3') state.done.feet = true; save(); renderTasks();
      const item = warmups.find(w => w.id === doneWarmup);
      modal(`<h2>Маленький шаг засчитан</h2><p>${h(item ? item.response : 'Отлично. Восстановление любит регулярность, а не подвиги.')}</p><div class="splus-v24-modal-actions"><button class="splus-v24-btn secondary" data-v24-action="close-modal">Вернуться</button></div>`);
      track('exercise_done', { id: doneWarmup });
    }
    if (questionCat) { haptic(); showQuestionCategory(questionCat); }
    if (saveQ) { haptic(); saveQuestion(decodeURIComponent(saveQ)); }

    if (action === 'start-onboarding') { haptic(); onboarding(); }
    if (action === 'after-operation') { haptic(); state.stage = 'first14'; save(); setTab('route'); renderStages(); updateFocus(); track('quick_after_operation', {}); }
    if (action === 'anxiety') { haptic(); anxiety(); }
    if (action === 'modal-to-route') { haptic(); closeModal(); setTab('route'); }
    if (action === 'vitaliy-help') { haptic(); vitaliyModal('button'); }
    if (action === 'review') { haptic(); track('review_click', { price: 4900 }); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу личный разбор Сустав+ за 4900 ₽.')); }
    if (action === 'route-map') { haptic(); track('route_map_click', {}); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу индивидуальную маршрут-карту Сустав+.')); }
    if (action === 'support30') { haptic(); track('support30_click', {}); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу обсудить сопровождение Сустав+ на 30 дней.')); }
    if (action === 'save-tracker') { haptic(); saveTracker(); }
    if (action === 'save-question-generic') { haptic(); saveQuestion('Хочу уточнить этот вопрос у врача'); }
    if (action === 'close-modal') { haptic(); closeModal(); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
