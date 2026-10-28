const form = document.getElementById('task-form');
const input = document.getElementById('new-task');
const formError = document.getElementById('form-error');
const status = document.getElementById('status');
const list = document.getElementById('task-list');

async function api(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function renderTask(task) {
  const item = document.createElement('li');
  item.dataset.testid = 'task-item';
  item.dataset.id = task.id;
  item.classList.toggle('done', task.done);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.done;
  checkbox.addEventListener('change', async () => {
    try {
      const updated = await api('PATCH', `/api/tasks/${task.id}`, { done: checkbox.checked });
      item.classList.toggle('done', updated.done);
    } catch (err) {
      checkbox.checked = !checkbox.checked;
      formError.textContent = err.message;
    }
  });

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = task.title;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete ${task.title}`);
  remove.addEventListener('click', async () => {
    try {
      await api('DELETE', `/api/tasks/${task.id}`);
      item.remove();
      updateStatus();
    } catch (err) {
      formError.textContent = err.message;
    }
  });

  item.append(checkbox, label, remove);
  return item;
}

function updateStatus() {
  const count = list.children.length;
  status.textContent = count === 0 ? 'No tasks yet' : `${count} task${count === 1 ? '' : 's'}`;
}

async function loadTasks() {
  try {
    const tasks = await api('GET', '/api/tasks');
    list.replaceChildren(...tasks.map(renderTask));
    updateStatus();
  } catch {
    status.textContent = 'Could not load tasks';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';
  try {
    const task = await api('POST', '/api/tasks', { title: input.value });
    list.append(renderTask(task));
    input.value = '';
    updateStatus();
  } catch (err) {
    formError.textContent = err.message;
  }
});

loadTasks();
