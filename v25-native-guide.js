/* Сустав+ v2.5 — исправленная навигация: нижние кнопки работают, выбор этапа сразу ведёт в маршрут */
(function () {
  'use strict';

  const VERSION = '2.5-native-guide-fixed-nav';
  const TRACK_API = '/api/track';
  const TRACKER_URL = 'https://docs.google.com/spreadsheets/d/1fCEnLH6RYQptTf2zvlrjX6J5LDGTehjXg6TU6X_6lbU/copy';
  const TELEGRAM_URL = 'https://t.me/newsustav';
  const MINIAPP_URL = 'https://t.me/sustavplus_app_bot';
  const VITALIY_WA = 'https://wa.me/79163847070?text=';
  const VICTORIA_WA = 'https://wa.me/79057912775?text=';

  const STORAGE = {
    screen: 'splus_v25_screen',
    stage: 'splus_v25_stage',
    done: 'splus_v25_done',
    tracker: 'splus_v25_tracker',
    questions: 'splus_v25_questions',
    source: 'splus_v25_source'
  };

  const state = {
    screen: localStorage.getItem(STORAGE.screen) || 'home',
    stage: localStorage.getItem(STORAGE.stage) || '',
    done: readJson(STORAGE.done, {}),
    tracker: readJson(STORAGE.tracker, {}),
    questions: readJson(STORAGE.questions, [])
  };

  const stages = [
    {
      id: 'diagnosis',
      title: 'Мне только сказали, что нужна операция',
      short: 'Диагноз / решение',
      icon: '🧭',
      text: 'Сейчас важно не принимать решение в панике. Начните с документов, снимков и вопросов врачу.',
      focus: 'Не решить всё за один вечер, а спокойно собрать картину.',
      steps: [
        ['Собрать документы', 'Снимки, заключения, назначения, что уже сказали врачи.'],
        ['Записать вопросы врачу', 'Что уточнить по стадии, доступу, импланту, ограничениям и срокам.'],
        ['Не сравнивать себя с форумами', 'Чужая история — не ваш маршрут.'],
        ['Понять следующий шаг', 'Самостоятельно через Сустав+ или на личном разборе с Виталием.']
      ]
    },
    {
      id: 'save_joint',
      title: 'Я пока пытаюсь сохранить сустав',
      short: 'Сохранить сустав',
      icon: '🌿',
      text: 'Важно понять стадию, риски и где уже нужен хирургический взгляд.',
      focus: 'Не тянуть вслепую и не покупать чудо-обещания.',
      steps: [
        ['Собрать второе мнение', 'Попросить врача объяснить, что реально можно сохранить.'],
        ['Уточнить стадию', 'Коксартроз, АНГБК, снимки, динамика, боль и функция.'],
        ['Понять риски ожидания', 'Что будет, если тянуть 3–6 месяцев.'],
        ['Собрать план', 'Что делать сейчас и когда возвращаться к хирургу.']
      ]
    },
    {
      id: 'doctor',
      title: 'Я выбираю врача или клинику',
      short: 'Выбор врача',
      icon: '👨‍⚕️',
      text: 'Выбор врача — не поиск волшебника, а сбор понятных критериев и правильных вопросов.',
      focus: 'Выбрать не по панике, а по понятным критериям.',
      steps: [
        ['Составить список вопросов', 'Доступ, опыт, имплант, ограничения, осложнения, контроль.'],
        ['Сравнивать не только цену', 'Важны маршрут, коммуникация, опыт и послеоперационное ведение.'],
        ['Записать ответы', 'Чтобы потом не восстанавливать всё из памяти.'],
        ['Не принимать решение в стрессе', 'При сомнениях разберите маршрут отдельно.']
      ]
    },
    {
      id: 'preop',
      title: 'Я готовлюсь к операции',
      short: 'До операции',
      icon: '🏠',
      text: 'Фокус — дом, вещи, вопросы хирургу, близкие и первые дни после выписки.',
      focus: 'Сделать первые дни дома безопасными и понятными.',
      steps: [
        ['Подготовить дом', 'Убрать ковры, провода, низкие предметы, скользкие зоны.'],
        ['Проверить быт', 'Кровать, туалет, душ, стул, проходы, костыли или ходунки.'],
        ['Собрать вопросы врачу', 'Боль, отёк, ЛФК, лекарства, ограничения, контрольный осмотр.'],
        ['Подготовить близких', 'Кто поможет, что делать, где не паниковать.']
      ]
    },
    {
      id: 'first14',
      title: 'Я первые 14 дней после операции',
      short: 'Первые 14 дней',
      icon: '🚶',
      text: 'Фокус — безопасность, мягкое движение, красные флаги и спокойный режим.',
      focus: 'Не геройствовать. Режим, опора, дыхание, стопы, контроль самочувствия.',
      steps: [
        ['Отметить боль и отёк', 'Запишите состояние, чтобы видеть динамику.'],
        ['Сделать мягкую разминку', 'Дыхание, стопы, ягодицы, бедро — только если разрешено.'],
        ['Проверить красные флаги', 'При тревожных симптомах — врач, не приложение.'],
        ['Идти маленькими шагами', 'Лучше 2 минуты спокойно, чем 20 минут через страх.']
      ]
    },
    {
      id: 'day15_30',
      title: 'Я восстанавливаюсь 15–30 дней',
      short: '15–30 дней',
      icon: '📊',
      text: 'Фокус — трекер, ходьба, ЛФК и мягкое увеличение активности.',
      focus: 'Смотреть динамику, а не эмоции одного дня.',
      steps: [
        ['Открыть трекер', 'Боль, отёк, ходьба, ЛФК, сон и вопросы врачу.'],
        ['Проверить технику', 'Без рывков, без резкой боли, без отмены ограничений.'],
        ['Добавлять постепенно', 'Не всё сразу: один параметр нагрузки за раз.'],
        ['Если непонятно — спросить', 'Лучше уточнить, чем гадать по чатам.']
      ]
    },
    {
      id: 'family',
      title: 'Я помогаю близкому',
      short: 'Близким',
      icon: '🤝',
      text: 'Самая важная помощь — безопасность, спокойствие и уважение к темпу восстановления.',
      focus: 'Помогать без давления и без паники.',
      steps: [
        ['Подготовить дом', 'Проходы, ванная, туалет, кровать, всё нужное рядом.'],
        ['Не давить фразами', 'Не “соберись”, а “я рядом, идём по шагам”.'],
        ['Следить за красными флагами', 'При тревожных симптомах — врач.'],
        ['Беречь себя', 'Близкие тоже устают. Опора не должна превращаться в выгорание.']
      ]
    },
    {
      id: 'longlife',
      title: 'Я живу с протезом, но есть вопросы',
      short: '6+ месяцев',
      icon: '🏒',
      text: 'Фокус — активность, вес, уверенность, спорт и контроль непонятных ощущений.',
      focus: 'Вернуться к жизни без постоянного страха движения.',
      steps: [
        ['Отделить норму от тревоги', 'Что ощущается после нагрузки, что повторяется, что усиливается.'],
        ['Проверить активность', 'Ходьба, упражнения, вес, сон, восстановление.'],
        ['Собрать вопросы врачу', 'Что можно, чего избегать, какие контрольные точки.'],
        ['Не жить как хрустальная ваза', 'Протез — не конец жизни, но режим и техника важны.']
      ]
    }
  ];

  const tasks = [
    { id: 'pain', title: 'Отметить боль', text: 'Оцените боль по шкале 0–10. Это помогает видеть динамику.', screen: 'tracker' },
    { id: 'breath', title: 'Сделать дыхание', text: '5–8 спокойных циклов. Спокойное дыхание — тоже часть восстановления.', screen: 'warmup' },
    { id: 'feet', title: 'Сделать насос стопами', text: '10–20 повторений, если это разрешено врачом или реабилитологом.', screen: 'warmup' },
    { id: 'walk', title: 'Отметить ходьбу', text: 'Не рекорд, а безопасная дистанция и уверенность.', screen: 'tracker' },
    { id: 'question', title: 'Записать вопрос врачу', text: 'Не держите вопросы в голове. Сохраните один важный вопрос.', screen: 'questions' }
  ];

  const exercises = [
    {
      id: 'morning-breath',
      title: 'Утреннее дыхание',
      tag: '3–5 минут',
      img: 'assets/exercises/morning-breath.png',
      for: 'До операции, после операции, тревога, мягкий старт дня.',
      steps: ['Сядьте удобно', 'Сделайте спокойный вдох носом', 'Медленно выдохните', 'Повторите 5–8 циклов'],
      safety: 'Без задержки дыхания, без напряжения и без спешки.'
    },
    {
      id: 'evening-breath',
      title: 'Вечернее дыхание',
      tag: '5 минут',
      img: 'assets/exercises/evening-breath.png',
      for: 'Перед сном, при тревоге, после насыщенного дня.',
      steps: ['Лягте удобно', 'Спокойный вдох', 'Длинный выдох', 'Повторите 5–8 циклов'],
      safety: 'Дышите ровно, не задерживайте воздух.'
    },
    {
      id: 'ankle-pumps',
      title: 'Стопы и кровообращение',
      tag: '10–20 повторений',
      img: 'assets/exercises/ankle-pumps.png',
      for: 'Первые дни, долгое лежание или сидение.',
      steps: ['Лягте удобно', 'Потяните носки на себя', 'Потяните носки от себя', 'Сделайте круги стопами'],
      safety: 'Только мягко. Если врач запретил — не выполняйте.'
    },
    {
      id: 'quad-set',
      title: 'Напряжение бедра',
      tag: '8–10 повторений',
      img: 'assets/exercises/quad-set.png',
      for: 'Мягкое включение передней поверхности бедра.',
      steps: ['Лягте на спину', 'Напрягите бедро', 'Прижмите колено к поверхности', 'Удержите 3–5 сек и расслабьте'],
      safety: 'Без резкой боли. Не задерживайте дыхание.'
    },
    {
      id: 'glute-set',
      title: 'Сжатие ягодиц',
      tag: '8–10 повторений',
      img: 'assets/exercises/glute-set.png',
      for: 'Мягкое включение опоры и ягодичных мышц.',
      steps: ['Лягте удобно', 'Сожмите ягодицы', 'Удержите 3–5 секунд', 'Расслабьте и повторите'],
      safety: 'Без фанатизма. Мышцы просыпаются постепенно.'
    },
    {
      id: 'heel-slide',
      title: 'Скольжение пяткой',
      tag: '5–10 повторений',
      img: 'assets/exercises/heel-slide.png',
      for: 'После операции только по разрешению врача или реабилитолога.',
      steps: ['Лягте на спину', 'Медленно подтяните пятку', 'Согните ногу без рывка', 'Верните ногу обратно'],
      safety: 'Не заваливайте колено внутрь. Без резкой боли.'
    },
    {
      id: 'abduction-slide',
      title: 'Отведение ноги лёжа',
      tag: '5–10 повторений',
      img: 'assets/exercises/abduction-slide.png',
      for: 'Контроль движения, если специалист разрешил.',
      steps: ['Лягте на спину', 'Медленно отведите ногу', 'Не разворачивайте стопу и таз', 'Верните ногу обратно'],
      safety: 'Контроль важнее амплитуды. Лучше меньше, но ровно.'
    },
    {
      id: 'sit-stand',
      title: 'Встать и сесть безопасно',
      tag: 'стул + 2 костыля',
      img: 'assets/exercises/sit-stand.png',
      for: 'Бытовой навык после операции. Только если разрешено вставать.',
      steps: ['Сядьте ближе к краю стула', 'Оттолкнитесь руками от стула', 'Встаньте и возьмите костыли', 'Садитесь медленно и под контролем'],
      safety: 'Не тяните себя вверх за костыли.'
    },
    {
      id: 'walking',
      title: 'Ходьба с 2 локтевыми костылями',
      tag: 'маленькие шаги',
      img: 'assets/exercises/walking.png',
      for: 'Когда разрешена ходьба с опорой.',
      steps: ['Встаньте ровно с 2 костылями', 'Переставьте костыли вперёд', 'Шагните оперированной ногой', 'Подтяните вторую ногу'],
      safety: 'Спина прямая, взгляд вперёд, без спешки.'
    },
    {
      id: 'stairs-prep',
      title: 'Лестница с 2 локтевыми костылями',
      tag: 'подъём и спуск',
      img: 'assets/exercises/stairs-prep.png',
      for: 'Только если врач/реабилитолог разрешил лестницу.',
      steps: ['Подъём: сначала здоровая нога', 'Затем оперированная нога и костыли', 'Спуск: сначала костыли и оперированная нога', 'Потом здоровая нога'],
      safety: 'Держитесь за перила, если они есть. Не спешите.'
    }
  ];

  const questionCategories = [
    {
      id: 'operation', title: 'Мне сказали менять сустав',
      intro: 'Это один из самых тревожных этапов. Не принимайте решение по форумам или одному ролику.',
      questions: ['Это точно операция?', 'Можно ли ещё сохранить сустав?', 'Что будет, если тянуть?', 'Как понять стадию коксартроза?', 'Что такое АНГБК?', 'Почему один врач говорит одно, другой другое?', 'Когда нужно второе мнение?', 'Какие снимки нужны врачу?']
    },
    {
      id: 'doctor', title: 'Я выбираю врача',
      intro: 'Выбор врача — это не поиск “самого лучшего вообще”, а сбор понятных критериев.',
      questions: ['Как выбрать хирурга?', 'Что спросить на консультации?', 'Как понять, что врачу можно доверять?', 'Что важнее: доступ, опыт, клиника или цена?', 'Нужен ли передний доступ?', 'Что спросить про имплант?', 'Что спросить про осложнения?', 'Стоит ли ехать в другой город?']
    },
    {
      id: 'fear', title: 'Я боюсь операции',
      intro: 'Страх перед операцией нормален. Мозг пытается защитить вас от неизвестности.',
      questions: ['Боюсь наркоза', 'Боюсь боли после операции', 'Боюсь осложнений', 'Боюсь остаться инвалидом', 'Боюсь, что жизнь закончится', 'Боюсь больницы', 'Боюсь, что родные не справятся']
    },
    {
      id: 'home', title: 'Подготовка дома',
      intro: 'Дом после операции должен быть не красивым, а безопасным.',
      questions: ['Что убрать дома?', 'Какая кровать нужна?', 'Нужна ли насадка на унитаз?', 'Как подготовить душ?', 'Какие костыли выбрать?', 'Как подготовить лестницу?', 'Что купить заранее, а что лишнее?']
    },
    {
      id: 'firstdays', title: 'Первые дни после операции',
      intro: 'Первые дни пугают не потому, что всё плохо, а потому что всё новое.',
      questions: ['Что нормально в первые дни?', 'Почему болит?', 'Почему отёк?', 'Как спать?', 'Как вставать с кровати?', 'Как ходить с костылями?', 'Когда срочно к врачу?']
    },
    {
      id: 'lfk', title: 'ЛФК и упражнения',
      intro: 'Главная цель — не рекорд, а безопасная регулярность. Ограничения врача важнее приложения.',
      questions: ['Какие упражнения можно?', 'Как понять, что я перегрузился?', 'Можно ли поднимать ногу?', 'Можно ли делать подъём на носочки?', 'Когда можно лестницу?', 'Почему мышцы не слушаются?', 'Что делать, если страшно двигаться?']
    },
    {
      id: 'redflags', title: 'Боль, отёк и красные флаги',
      intro: 'Если есть тревожные симптомы, не ждите ответа в приложении. Свяжитесь с врачом.',
      questions: ['Где нормальная боль, а где опасная?', 'Почему отекает нога?', 'Что делать, если боль усилилась?', 'Что делать при температуре?', 'Что делать, если болит икра?', 'Когда нельзя ждать?']
    },
    {
      id: 'family', title: 'Близкие',
      intro: 'Близкие часто хотят помочь, но не знают как. Самая важная помощь — спокойствие и безопасность.',
      questions: ['Как помочь человеку после операции?', 'Что нельзя говорить пациенту?', 'Как подготовить дом?', 'Как не паниковать рядом?', 'Как поддержать, если человек раздражается?', 'Когда звать врача?']
    }
  ];

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (_) { return fallback; }
  }

  function save() {
    localStorage.setItem(STORAGE.screen, state.screen || 'home');
    localStorage.setItem(STORAGE.stage, state.stage || '');
    localStorage.setItem(STORAGE.done, JSON.stringify(state.done || {}));
    localStorage.setItem(STORAGE.tracker, JSON.stringify(state.tracker || {}));
    localStorage.setItem(STORAGE.questions, JSON.stringify(state.questions || []));
  }

  function h(text) {
    return String(text || '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[c]);
  }

  function selectedStage() { return stages.find(s => s.id === state.stage); }

  function setScreen(screen) {
    state.screen = screen;
    save();
    render();
    haptic();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); }
    track('screen_view', { screen });
  }

  function selectStage(stageId) {
    state.stage = stageId;
    state.screen = 'route';
    save();
    render();
    haptic();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); }
    track('stage_selected_go_route', { stage: stageId });
  }

  function toggleTask(id) {
    state.done[id] = !state.done[id];
    save();
    render();
    haptic();
    if (state.done[id]) track('task_done', { task: id });
  }

  function doneCount() {
    return Object.keys(state.done || {}).filter(k => !!state.done[k]).length;
  }

  function levelText() {
    const count = doneCount();
    if (count >= 5) return 'Маршрут собран';
    if (state.done.question) return 'Вопрос врачу готов';
    if (state.done.feet || state.done.breath) return 'Кровь пошла';
    if (state.stage) return 'Я не иду вслепую';
    return 'Я начал маршрут';
  }

  function openUrl(url) {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) window.Telegram.WebApp.openLink(url);
      else window.open(url, '_blank', 'noopener');
    } catch (_) { window.open(url, '_blank', 'noopener'); }
  }

  function haptic() {
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch (_) {}
  }

  function track(event, data) {
    try {
      fetch(TRACK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          source: 'miniapp_v2_5_fixed_nav',
          appVersion: VERSION,
          ts: new Date().toISOString(),
          data: data || {},
          url: location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {});
    } catch (_) {}
  }

  function modal(html) {
    const root = document.getElementById('splus25Modal');
    const content = document.getElementById('splus25ModalContent');
    if (!root || !content) return;
    content.innerHTML = html;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    const root = document.getElementById('splus25Modal');
    if (!root) return;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
  }

  function routeMessage(stage) {
    return `
      <div class="splus25-route-detail">
        <span class="splus25-pill olive">Ваш маршрут</span>
        <h3>${h(stage.title)}</h3>
        <p><b>Главный фокус:</b> ${h(stage.focus)}</p>
        <div class="splus25-route-steps">
          ${stage.steps.map(([title, text], index) => `
            <div class="splus25-route-step">
              <b>${index + 1}. ${h(title)}</b>
              <span>${h(text)}</span>
            </div>
          `).join('')}
        </div>
        <div class="splus25-actions">
          <button class="splus25-btn primary" data-action="go-warmup">Открыть мягкие упражнения</button>
          <button class="splus25-btn secondary" data-action="go-tracker">Открыть трекер</button>
          <button class="splus25-btn ghost" data-action="vitaliy-help">Не разобрались? Виталий поможет</button>
          <button class="splus25-btn linkish" data-action="change-stage">Изменить этап</button>
        </div>
      </div>
    `;
  }

  function renderTopbar() {
    return `
      <div class="splus25-topbar">
        <div class="splus25-brand">
          <div class="splus25-brand-mark">S+</div>
          <div><strong>Сустав+</strong><small>эндопротезирование без хаоса</small></div>
        </div>
        <div class="splus25-top-actions">
          <button class="splus25-icon-btn" data-action="vitaliy-help" title="Виталий поможет">?</button>
        </div>
      </div>
    `;
  }

  function renderProgress() {
    const count = Math.min(doneCount(), 5);
    return `
      <div class="splus25-progress">
        <div><span>Сегодня выполнено</span><strong>${count} из 5</strong></div>
        <div><span>Серия</span><strong>${count > 0 ? '1 день' : '0 дней'}</strong></div>
        <div><span>Уровень</span><strong>${h(levelText())}</strong></div>
      </div>
    `;
  }

  function renderHome() {
    const stage = selectedStage();
    return `
      <section class="splus25-hero">
        <div class="splus25-badge">Сустав+ 2.5 · эндопротезирование без хаоса</div>
        <h1>Сегодня ваш шаг</h1>
        <p class="splus25-lead">Не нужно делать всё сразу. В восстановлении выигрывает не герой, а человек, который спокойно повторяет маленькие действия.</p>
        <div class="splus25-focus">
          <b>${stage ? 'Ваш этап:' : 'Ваш фокус сегодня:'}</b>
          <span>${stage ? `${h(stage.title)}. ${h(stage.focus)}` : 'выбрать этап, понять первый шаг и не тонуть в хаосе.'}</span>
        </div>
        <div class="splus25-actions">
          <button class="splus25-btn primary" data-action="start-route">Начать мой маршрут</button>
          <button class="splus25-btn secondary" data-action="after-operation">Я уже после операции</button>
          <button class="splus25-btn ghost" data-action="anxiety">Мне страшно, я не знаю с чего начать</button>
          <button class="splus25-btn linkish" data-action="vitaliy-help">Не разобрались? Виталий поможет</button>
        </div>
      </section>
      ${renderProgress()}
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Ваши задачи на сегодня</h2><p>Сегодня без подвигов. Суставу нужен ритм, а не драматический сериал.</p></div>
        <div class="splus25-tasks">
          ${tasks.map(task => renderTask(task)).join('')}
        </div>
      </section>
    `;
  }

  function renderTask(task) {
    const done = !!state.done[task.id];
    return `
      <div class="splus25-card splus25-task ${done ? 'is-done' : ''}">
        <button data-task="${h(task.id)}">${done ? '✓' : '+'}</button>
        <div>
          <h3>${h(task.title)}</h3>
          <p>${h(task.text)}</p>
          <button class="splus25-btn secondary" data-go-screen="${h(task.screen)}">Открыть</button>
        </div>
      </div>
    `;
  }

  function renderRoute() {
    const stage = selectedStage();
    if (stage) {
      return `
        <section class="splus25-panel">
          <div class="splus25-head"><h2>Мой маршрут</h2><p>Вы выбрали этап — меню ушло. Теперь перед вами конкретный маршрут и ближайшие действия.</p></div>
          ${routeMessage(stage)}
        </section>
      `;
    }
    return renderStagePicker();
  }

  function renderStagePicker() {
    return `
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Где вы сейчас?</h2><p>Нажмите на свой этап — и приложение сразу откроет ваш маршрут. Никаких пустых кнопок.</p></div>
        <div class="splus25-grid">
          ${stages.map(stage => `
            <article class="splus25-card">
              <small>${h(stage.icon)} Этап</small>
              <h3>${h(stage.title)}</h3>
              <p>${h(stage.text)}</p>
              <button class="splus25-btn primary" data-stage="${h(stage.id)}">Выбрать и открыть маршрут</button>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderWarmup() {
    return `
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Лёгкая разминка</h2><p>Все карточки сделаны как 4 понятных шага. Только то, что разрешил врач или реабилитолог. Без позы йоги, без героизма.</p></div>
        <div class="splus25-grid">
          ${exercises.map(ex => `
            <article class="splus25-card splus25-exercise-card">
              <img src="${h(ex.img)}" alt="${h(ex.title)}" loading="lazy" onerror="this.style.display='none'">
              <div>
                <small>${h(ex.tag)}</small>
                <h3>${h(ex.title)}</h3>
                <p>${h(ex.for)}</p>
                <button class="splus25-btn secondary" data-exercise="${h(ex.id)}">Открыть инструкцию</button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderQuestions() {
    return `
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Найдите свой вопрос</h2><p>Выберите категорию. Вопросы можно сохранить, чтобы потом задать врачу.</p></div>
        <div class="splus25-question-layout">
          <div class="splus25-question-cats">
            ${questionCategories.map(cat => `<button data-question-cat="${h(cat.id)}">${h(cat.title)}</button>`).join('')}
          </div>
          <div class="splus25-question-result" id="questionResult">Выберите категорию вопроса.</div>
        </div>
      </section>
    `;
  }

  function renderTracker() {
    const pain = state.tracker.pain || 0;
    const swelling = state.tracker.swelling || 0;
    const question = state.tracker.question || '';
    return `
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Трекер восстановления</h2><p>Трекер нужен не для контроля ради контроля. Он помогает видеть динамику и меньше паниковать.</p></div>
        <div class="splus25-tracker">
          <label>Боль сегодня, 0–10
            <input type="range" min="0" max="10" value="${h(pain)}" id="painRange">
            <strong id="painValue">${h(pain)}</strong>
          </label>
          <label>Отёк сегодня, 0–10
            <input type="range" min="0" max="10" value="${h(swelling)}" id="swellingRange">
            <strong id="swellingValue">${h(swelling)}</strong>
          </label>
          <label>Вопрос врачу
            <textarea id="doctorQuestion" placeholder="Например: когда можно увеличивать ходьбу?">${h(question)}</textarea>
          </label>
          <button class="splus25-btn primary" data-action="save-tracker">Сохранить самочувствие</button>
          <button class="splus25-btn secondary" data-action="open-google-tracker">Открыть Google-трекер 30 дней</button>
          <button class="splus25-btn ghost" data-action="vitaliy-help">Не понимаю динамику</button>
        </div>
        <div class="splus25-warning">Если есть резкое усиление боли, температура, выраженный отёк, покраснение, одышка, боль в груди, кровотечение или сильное ухудшение самочувствия — не ждите ответа в приложении, свяжитесь с врачом или обратитесь за медицинской помощью.</div>
      </section>
    `;
  }

  function renderHelp() {
    return `
      <section class="splus25-panel">
        <div class="splus25-head"><h2>Помощь и следующий шаг</h2><p>Можно идти самостоятельно. А можно попросить опору. Это не слабость — это нормальный маршрут.</p></div>
        <div class="splus25-products">
          <article><span class="splus25-pill olive">Бесплатно</span><h3>Самостоятельный маршрут Сустав+</h3><p>Этап, упражнения, трекер, вопросы врачу, красные флаги и подсказки для близких.</p><button class="splus25-btn secondary" data-action="start-route">Продолжить бесплатно</button></article>
          <article class="hot"><span class="splus25-pill">4 900 ₽</span><h3>Личный маршрутный разбор</h3><p>30–45 минут: ваш этап, вопросы врачу, подготовка дома и ближайшие шаги.</p><button class="splus25-btn primary" data-action="review">Разобрать мою ситуацию</button></article>
          <article><span class="splus25-pill">15 000–25 000 ₽</span><h3>Индивидуальная маршрут-карта</h3><p>Созвон + письменный план: что делать, что уточнить и какие контрольные точки держать.</p><button class="splus25-btn dark" data-action="route-map">Хочу маршрут-карту</button></article>
          <article><span class="splus25-pill">35 000–50 000 ₽</span><h3>Сопровождение 30 дней</h3><p>Чат, навигация, контроль маршрута, поддержка и подключение специалистов по необходимости.</p><button class="splus25-btn dark" data-action="support30">Хочу сопровождение</button></article>
          <article><span class="splus25-pill olive">Питание</span><h3>Разобрать питание с Викторией</h3><p>Белок, вес, энергия, восстановление и нутритивная поддержка без обещаний лечения.</p><button class="splus25-btn secondary" data-action="victoria">Написать Виктории</button></article>
          <article><span class="splus25-pill olive">Контакты</span><h3>Связаться с проектом</h3><p>Telegram-канал, WhatsApp Виталия и Mini App.</p><button class="splus25-btn secondary" data-action="telegram">Telegram Виталия</button></article>
        </div>
      </section>
    `;
  }

  function renderBottomNav() {
    const items = [
      ['home', '⌂', 'Главная'],
      ['route', '⌁', 'Маршрут'],
      ['warmup', '✣', 'Разминка'],
      ['tracker', '▧', 'Трекер'],
      ['questions', '?', 'Вопросы'],
      ['help', '◉', 'Помощь']
    ];
    return `
      <nav class="splus25-bottom-nav" aria-label="Нижнее меню Сустав+">
        ${items.map(([screen, icon, label]) => `
          <button class="${state.screen === screen ? 'is-active' : ''}" data-screen="${screen}">
            <span>${icon}</span>${label}
          </button>
        `).join('')}
      </nav>
    `;
  }

  function renderModalRoot() {
    return `
      <div class="splus25-modal" id="splus25Modal" aria-hidden="true">
        <div class="splus25-modal-card">
          <button class="splus25-close" data-action="close-modal" type="button">×</button>
          <div id="splus25ModalContent"></div>
        </div>
      </div>
    `;
  }

  function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let screenHtml = '';
    if (state.screen === 'home') screenHtml = renderHome();
    if (state.screen === 'route') screenHtml = renderRoute();
    if (state.screen === 'warmup') screenHtml = renderWarmup();
    if (state.screen === 'questions') screenHtml = renderQuestions();
    if (state.screen === 'tracker') screenHtml = renderTracker();
    if (state.screen === 'help') screenHtml = renderHelp();

    app.className = 'splus25-app';
    app.innerHTML = `
      ${renderTopbar()}
      ${screenHtml}
      <div class="splus25-note">Сустав+ не заменяет врача, хирурга или реабилитолога. Это цифровой проводник, который помогает снять хаос, собрать вопросы и понять следующий шаг.</div>
      ${renderBottomNav()}
      ${renderModalRoot()}
    `;
  }

  function showAnxiety() {
    track('anxiety_open', {});
    modal(`
      <h2>Понимаю, вам тревожно</h2>
      <p>В этот момент у многих в голове хаос: врач, операция, боль, деньги, дом, костыли, восстановление. Это не слабость — это нормальная реакция на неизвестность.</p>
      <p>Сейчас не надо решать всё сразу. Начните с ближайшего шага.</p>
      <div class="splus25-modal-actions">
        <button class="splus25-btn primary" data-action="modal-route">Показать первый шаг</button>
        <button class="splus25-btn secondary" data-action="vitaliy-help">Хочу поговорить с Виталием</button>
      </div>
    `);
  }

  function showVitaliy() {
    track('vitaliy_help_open', { screen: state.screen, stage: state.stage });
    modal(`
      <h2>Разобрать ситуацию с Виталием</h2>
      <p>Я сам прошёл замену двух тазобедренных суставов и понимаю, как легко потеряться: врачи, снимки, операция, дом, боль, восстановление и разные мнения.</p>
      <p>На личном разборе мы спокойно разложим ваш путь:</p>
      <ul>
        <li>где вы сейчас;</li>
        <li>какие вопросы задать врачу;</li>
        <li>как подготовить дом;</li>
        <li>что делать в ближайшие дни;</li>
        <li>где не надо паниковать;</li>
        <li>где обязательно нужен специалист.</li>
      </ul>
      <p><b>Цена: 4 900 ₽.</b><br>Я не врач и не назначаю лечение. Я помогаю собрать маршрут и не идти вслепую.</p>
      <div class="splus25-modal-actions">
        <button class="splus25-btn primary" data-action="review">Личный разбор 4 900 ₽</button>
        <button class="splus25-btn secondary" data-action="close-modal">Сначала продолжу бесплатно</button>
      </div>
    `);
  }

  function showExercise(id) {
    const ex = exercises.find(x => x.id === id);
    if (!ex) return;
    track('exercise_open', { exerciseId: id });
    modal(`
      <h2>${h(ex.title)}</h2>
      <p><b>Для кого:</b> ${h(ex.for)}</p>
      <p><b>Как делать:</b></p>
      <ol>${ex.steps.map(step => `<li>${h(step)}</li>`).join('')}</ol>
      <p><b>Важно:</b> ${h(ex.safety)}</p>
      <div class="splus25-modal-actions">
        <button class="splus25-btn primary" data-done-exercise="${h(ex.id)}">Сделал</button>
        <button class="splus25-btn secondary" data-action="vitaliy-help">Не понял технику</button>
        <button class="splus25-btn ghost" data-action="close-modal">Закрыть</button>
      </div>
    `);
  }

  function showQuestionCategory(id) {
    const cat = questionCategories.find(c => c.id === id);
    const result = document.getElementById('questionResult');
    if (!cat || !result) return;
    document.querySelectorAll('[data-question-cat]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.questionCat === id));
    result.innerHTML = `
      <b>${h(cat.title)}</b>
      <p>${h(cat.intro)}</p>
      <div class="splus25-question-list">
        ${cat.questions.map(q => `<button data-save-question="${encodeURIComponent(q)}">${h(q)}</button>`).join('')}
      </div>
      <div class="splus25-actions">
        <button class="splus25-btn secondary" data-action="start-route">Открыть маршрут</button>
        <button class="splus25-btn primary" data-action="vitaliy-help">Разобрать с Виталием</button>
      </div>
    `;
    track('question_category_open', { id });
  }

  function saveQuestion(q) {
    if (!state.questions.includes(q)) state.questions.push(q);
    state.done.question = true;
    save();
    track('question_saved', { question: q });
    modal(`
      <h2>Вопрос сохранён</h2>
      <p>Отлично. Не держите это в голове. Вопрос врачу готов — это уже шаг к спокойствию.</p>
      <p><b>Ваш вопрос:</b><br>${h(q)}</p>
      <div class="splus25-modal-actions">
        <button class="splus25-btn primary" data-action="vitaliy-help">Разобрать с Виталием</button>
        <button class="splus25-btn secondary" data-action="close-modal">Вернуться</button>
      </div>
    `);
  }

  function saveTracker() {
    const pain = document.getElementById('painRange')?.value || '0';
    const swelling = document.getElementById('swellingRange')?.value || '0';
    const question = (document.getElementById('doctorQuestion')?.value || '').trim();
    state.tracker = { pain, swelling, question, date: new Date().toISOString() };
    state.done.pain = true;
    if (question) {
      state.done.question = true;
      if (!state.questions.includes(question)) state.questions.push(question);
    }
    save();
    track('tracker_save', state.tracker);
    const extra = Number(pain) >= 7
      ? '<p><b>Боль высокая.</b> Не геройствуйте. Проверьте красные флаги и при необходимости свяжитесь со специалистом.</p>'
      : '';
    modal(`
      <h2>Самочувствие сохранено</h2>
      <p>Хорошо. Теперь есть точка контроля. Восстановление легче, когда динамика не только в голове.</p>
      ${extra}
      <div class="splus25-modal-actions">
        <button class="splus25-btn primary" data-action="vitaliy-help">Не понимаю динамику</button>
        <button class="splus25-btn secondary" data-action="close-modal">Вернуться</button>
      </div>
    `);
  }

  function handleAction(action) {
    if (action === 'start-route') {
      state.stage ? setScreen('route') : (state.screen = 'route', save(), render(), track('route_picker_open', {}));
    }
    if (action === 'after-operation') selectStage('first14');
    if (action === 'anxiety') showAnxiety();
    if (action === 'modal-route') { closeModal(); state.stage ? setScreen('route') : setScreen('route'); }
    if (action === 'vitaliy-help') showVitaliy();
    if (action === 'change-stage') { state.stage = ''; save(); setScreen('route'); }
    if (action === 'go-warmup') setScreen('warmup');
    if (action === 'go-tracker') setScreen('tracker');
    if (action === 'save-tracker') saveTracker();
    if (action === 'open-google-tracker') { track('external_click', { action: 'tracker_google', url: TRACKER_URL }); openUrl(TRACKER_URL); }
    if (action === 'review') { track('review_click', { price: 4900 }); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу личный разбор Сустав+ за 4900 ₽.')); }
    if (action === 'route-map') { track('route_map_click', {}); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу индивидуальную маршрут-карту Сустав+.')); }
    if (action === 'support30') { track('support30_click', {}); openUrl(VITALIY_WA + encodeURIComponent('Здравствуйте! Хочу обсудить сопровождение Сустав+ на 30 дней.')); }
    if (action === 'victoria') { track('victoria_click', {}); openUrl(VICTORIA_WA + encodeURIComponent('Здравствуйте! Хочу разобрать питание и восстановление в Сустав+.')); }
    if (action === 'telegram') { track('telegram_click', {}); openUrl(TELEGRAM_URL); }
    if (action === 'miniapp') { track('miniapp_click', {}); openUrl(MINIAPP_URL); }
    if (action === 'close-modal') closeModal();
  }

  function bindEvents() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('button, a');
      if (!target) return;

      const screen = target.dataset.screen;
      const goScreen = target.dataset.goScreen;
      const stage = target.dataset.stage;
      const task = target.dataset.task;
      const exercise = target.dataset.exercise;
      const doneExercise = target.dataset.doneExercise;
      const questionCat = target.dataset.questionCat;
      const saveQ = target.dataset.saveQuestion;
      const action = target.dataset.action;

      if (screen) setScreen(screen);
      if (goScreen) setScreen(goScreen);
      if (stage) selectStage(stage);
      if (task) toggleTask(task);
      if (exercise) showExercise(exercise);
      if (doneExercise) {
        if (doneExercise === 'ankle-pumps') state.done.feet = true;
        else if (doneExercise.includes('breath')) state.done.breath = true;
        else state.done[doneExercise] = true;
        save();
        track('exercise_done', { exerciseId: doneExercise });
        modal(`<h2>Маленький шаг засчитан</h2><p>Отлично. Восстановление строится не на рывках, а на маленьких повторяемых действиях.</p><div class="splus25-modal-actions"><button class="splus25-btn secondary" data-action="close-modal">Вернуться</button></div>`);
      }
      if (questionCat) showQuestionCategory(questionCat);
      if (saveQ) saveQuestion(decodeURIComponent(saveQ));
      if (action) handleAction(action);
    });

    document.addEventListener('input', function (e) {
      if (e.target.id === 'painRange') document.getElementById('painValue').textContent = e.target.value;
      if (e.target.id === 'swellingRange') document.getElementById('swellingValue').textContent = e.target.value;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function init() {
    try {
      window.Telegram?.WebApp?.ready();
      window.Telegram?.WebApp?.expand();
    } catch (_) {}
    render();
    bindEvents();
    track('app_open', { appVersion: VERSION, screen: state.screen, stage: state.stage });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
