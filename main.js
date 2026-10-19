const KEY = 'morning-planner';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { work: [], personal: [] }; }
  catch { return { work: [], personal: [] }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

let state = load();

document.getElementById('today').textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long', day: 'numeric', month: 'long'
});

function item(listName, task) {
  const li = document.createElement('li');
  if (task.done) li.classList.add('done');

  const star = document.createElement('button');
  star.className = 'star';
  star.textContent = task.top ? '★' : '☆';
  star.title = task.top ? 'Remove from top 3' : 'Add to top 3';
  star.onclick = () => {
    const tops = state[listName].filter(t => t.top).length;
    if (!task.top && tops >= 3) { alertTop(listName); return; }
    task.top = !task.top; save(); render();
  };

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = task.done;
  box.onchange = () => { task.done = box.checked; save(); render(); };

  const text = document.createElement('span');
  text.textContent = task.text;

  const del = document.createElement('button');
  del.className = 'del';
  del.textContent = '✕';
  del.title = 'Delete';
  del.onclick = () => {
    state[listName] = state[listName].filter(t => t !== task); save(); render();
  };

  li.append(box, text, star, del);
  return li;
}

function alertTop(listName) {
  const sec = document.querySelector(`[data-list="${listName}"] h3`);
  sec.textContent = 'Top 3 today (full! un-star one first)';
  setTimeout(() => (sec.textContent = 'Top 3 today'), 2000);
}

function render() {
  for (const listName of ['work', 'personal']) {
    const sec = document.querySelector(`[data-list="${listName}"]`);
    const top = sec.querySelector('.top');
    const rest = sec.querySelector('.rest');
    top.innerHTML = ''; rest.innerHTML = '';
    for (const t of state[listName]) (t.top ? top : rest).append(item(listName, t));
    if (!top.children.length) top.innerHTML = '<li class="empty">Tap ☆ on a task to add it here</li>';
    if (!rest.children.length) rest.innerHTML = '<li class="empty">Nothing here yet</li>';
  }
}

document.querySelectorAll('.list').forEach(sec => {
  const listName = sec.dataset.list;
  const form = sec.querySelector('form');
  const input = form.querySelector('input');
  form.onsubmit = e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    state[listName].push({ text, top: false, done: false });
    input.value = ''; save(); render();
  };
});

document.getElementById('newday').onclick = () => {
  for (const k of ['work', 'personal']) {
    state[k] = state[k].filter(t => !t.done).map(t => ({ ...t, top: false }));
  }
  save(); render();
};

render();
