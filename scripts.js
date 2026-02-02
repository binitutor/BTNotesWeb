(() => {
    const page = document.body?.dataset?.page;
    if (!page) {
        return;
    }

    const AUTH_KEY = 'btnotes_token';
    const TASKS_KEY = 'btnotes_tasks';
    const PROJECTS_KEY = 'btnotes_projects';
    const TEAM_KEY = 'btnotes_team';

    const getToken = () => sessionStorage.getItem(AUTH_KEY);
    const setToken = (token) => sessionStorage.setItem(AUTH_KEY, token);
    const clearToken = () => sessionStorage.removeItem(AUTH_KEY);

    const showError = (element, message) => {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('d-none');
    };

    const hideError = (element) => {
        if (!element) return;
        element.textContent = '';
        element.classList.add('d-none');
    };

    const safeAlert = (options, callback) => {
        if (window.Swal) {
            Swal.fire(options).then(callback);
        } else if (callback) {
            alert(options.title || options.text || 'Action complete');
            callback();
        }
    };

    if (page === 'login') {
        if (getToken()) {
            window.location.href = 'app.html';
            return;
        }

        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');

        loginForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            hideError(loginError);

            const username = document.getElementById('loginUsername')?.value.trim();
            const password = document.getElementById('loginPassword')?.value.trim();

            if (!username || !password) {
                showError(loginError, 'Please enter both username and password.');
                return;
            }

            setToken(`demo-token-${Date.now()}`);
            safeAlert({
                icon: 'success',
                title: 'Logged in',
                text: 'Welcome back to BTNotes.'
            }, () => {
                window.location.href = 'app.html';
            });
        });
    }

    if (page === 'signup') {
        if (getToken()) {
            window.location.href = 'app.html';
            return;
        }

        const signupForm = document.getElementById('signupForm');
        const signupError = document.getElementById('signupError');

        signupForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            hideError(signupError);

            const username = document.getElementById('signupUsername')?.value.trim();
            const password = document.getElementById('signupPassword')?.value.trim();
            const confirm = document.getElementById('signupConfirm')?.value.trim();

            if (!username || !password || !confirm) {
                showError(signupError, 'All fields are required.');
                return;
            }

            if (password.length < 6) {
                showError(signupError, 'Password must be at least 6 characters long.');
                return;
            }

            if (password !== confirm) {
                showError(signupError, 'Passwords do not match.');
                return;
            }

            setToken(`demo-token-${Date.now()}`);
            safeAlert({
                icon: 'success',
                title: 'Account created',
                text: 'Your BTNotes account is ready.'
            }, () => {
                window.location.href = 'app.html';
            });
        });
    }

    if (page === 'app') {
        if (!getToken()) {
            window.location.href = 'login.html';
            return;
        }

        const seedTasks = [
            {
                id: 1,
                title: 'Prepare onboarding checklist',
                type: 'Todo',
                priority: 2,
                status: 'pending',
                dueDate: '2026-02-04',
                description: 'Finalize tasks for new team members.',
                isProtected: false
            },
            {
                id: 2,
                title: 'Sprint planning notes',
                type: 'Plan Note',
                priority: 3,
                status: 'complete',
                dueDate: '2026-02-03',
                description: 'Key milestones and risks.',
                isProtected: false
            },
            {
                id: 3,
                title: 'API credentials vault',
                type: 'Password Note',
                priority: 5,
                status: 'pending',
                dueDate: '2026-02-06',
                description: 'Store with restricted access.',
                isProtected: true
            }
        ];

        const seedProjects = [
            { id: 1, name: 'Launch Campaign', lead: 'Amira', status: 'On Track', progress: 78 },
            { id: 2, name: 'Mobile Redesign', lead: 'Bayo', status: 'At Risk', progress: 52 },
            { id: 3, name: 'Customer Success', lead: 'Chen', status: 'On Track', progress: 64 }
        ];

        const seedTeam = [
            { name: 'Amira', role: 'Project Lead', focus: 'Launch campaign updates' },
            { name: 'Bayo', role: 'Designer', focus: 'Mobile UI refresh' },
            { name: 'Chen', role: 'Product Ops', focus: 'Customer success metrics' }
        ];

        const loadStored = (key, fallback) => {
            const stored = sessionStorage.getItem(key);
            if (!stored) return fallback;
            try {
                return JSON.parse(stored);
            } catch (error) {
                return fallback;
            }
        };

        const saveStored = (key, value) => {
            sessionStorage.setItem(key, JSON.stringify(value));
        };

        let tasks = loadStored(TASKS_KEY, seedTasks);
        let projects = loadStored(PROJECTS_KEY, seedProjects);
        let team = loadStored(TEAM_KEY, seedTeam);

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn?.addEventListener('click', () => {
            clearToken();
            window.location.href = 'login.html';
        });

        const taskTypeSelect = document.getElementById('taskType');
        const passwordField = document.getElementById('passwordField');
        const taskForm = document.getElementById('taskForm');

        taskTypeSelect?.addEventListener('change', (event) => {
            const value = event.target.value;
            if (value === 'Password Note') {
                passwordField?.classList.remove('d-none');
            } else {
                passwordField?.classList.add('d-none');
            }
        });

        const taskCardsContainer = document.getElementById('taskCards');
        const tasksTableElement = document.getElementById('tasksTable');
        const projectsTableElement = document.getElementById('projectsTable');
        const teamListElement = document.getElementById('teamList');
        const progressCanvas = document.getElementById('progressChart');

        let tasksTable = null;
        let projectsTable = null;
        let progressChart = null;

        const formatDate = (dateValue) => {
            if (!dateValue) return '—';
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) return dateValue;
            return date.toLocaleDateString();
        };

        const renderTaskCards = () => {
            if (!taskCardsContainer) return;
            taskCardsContainer.innerHTML = '';
            tasks.forEach((task) => {
                const col = document.createElement('div');
                col.className = 'col-md-6';
                col.innerHTML = `
                    <div class="task-card h-100">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="fw-semibold mb-1">${task.title}</h6>
                                <small class="text-secondary">${task.type} • ${formatDate(task.dueDate)}</small>
                            </div>
                            <span class="priority-label priority-${task.priority}">Priority ${task.priority}</span>
                        </div>
                        <p class="text-secondary small mt-2 mb-3">${task.description || 'No description provided.'}</p>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge-status ${task.status}">${task.status === 'complete' ? 'Complete' : 'Pending'}</span>
                            <button class="btn btn-sm btn-outline-secondary toggle-status" data-id="${task.id}">
                                ${task.status === 'complete' ? 'Mark Pending' : 'Mark Complete'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">Delete</button>
                        </div>
                    </div>
                `;
                taskCardsContainer.appendChild(col);
            });
        };

        const renderTeamList = () => {
            if (!teamListElement) return;
            teamListElement.innerHTML = '';
            team.forEach((member) => {
                const item = document.createElement('li');
                item.className = 'list-group-item';
                item.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div>
                            <div class="fw-semibold">${member.name}</div>
                            <div class="text-secondary small">${member.role}</div>
                        </div>
                        <div class="text-secondary small">${member.focus}</div>
                    </div>
                `;
                teamListElement.appendChild(item);
            });
        };

        const renderProjectsTable = () => {
            if (!projectsTableElement) return;
            if (projectsTable) {
                projectsTable.clear().rows.add(projects).draw();
                return;
            }

            if (window.jQuery) {
                projectsTable = window.jQuery(projectsTableElement).DataTable({
                    data: projects,
                    paging: false,
                    info: false,
                    searching: false,
                    columns: [
                        { data: 'name' },
                        { data: 'lead' },
                        { data: 'status' },
                        {
                            data: 'progress',
                            render: (data) => `
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar" role="progressbar" style="width: ${data}%;" aria-valuenow="${data}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="progress-pill">${data}% <span>done</span></div>
                            `
                        }
                    ]
                });
            }
        };

        const getProgressCounts = () => {
            const completed = tasks.filter((task) => task.status === 'complete').length;
            const pending = tasks.length - completed;
            return { completed, pending };
        };

        const renderProgressChart = () => {
            if (!progressCanvas || !window.Chart) return;
            const counts = getProgressCounts();

            if (!progressChart) {
                progressChart = new window.Chart(progressCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: ['Complete', 'Pending'],
                        datasets: [
                            {
                                data: [counts.completed, counts.pending],
                                backgroundColor: ['#66D887', '#EE7D35'],
                                borderWidth: 0
                            }
                        ]
                    },
                    options: {
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            } else {
                progressChart.data.datasets[0].data = [counts.completed, counts.pending];
                progressChart.update();
            }
        };

        const renderTasksTable = () => {
            if (!tasksTableElement || !window.jQuery) return;

            if (tasksTable) {
                tasksTable.clear().rows.add(tasks).draw();
                return;
            }

            tasksTable = window.jQuery(tasksTableElement).DataTable({
                data: tasks,
                columns: [
                    { data: 'title' },
                    { data: 'type' },
                    {
                        data: 'priority',
                        render: (value) => `<span class="priority-label priority-${value}">P${value}</span>`
                    },
                    {
                        data: 'status',
                        render: (value, type, row) => `
                            <button class="btn btn-sm ${value === 'complete' ? 'btn-success' : 'btn-outline-secondary'} toggle-status" data-id="${row.id}">
                                ${value === 'complete' ? 'Complete' : 'Pending'}
                            </button>
                        `
                    },
                    {
                        data: 'dueDate',
                        render: (value) => formatDate(value)
                    },
                    {
                        data: null,
                        orderable: false,
                        render: (value, type, row) => `
                            <button class="btn btn-sm btn-outline-danger delete-task" data-id="${row.id}">Delete</button>
                        `
                    }
                ],
                order: [[4, 'asc']]
            });
        };

        const refreshAll = () => {
            saveStored(TASKS_KEY, tasks);
            renderTaskCards();
            renderTasksTable();
            renderProgressChart();
        };

        const upsertTask = (newTask) => {
            tasks = [newTask, ...tasks];
            refreshAll();
        };

        const updateTaskStatus = (taskId) => {
            tasks = tasks.map((task) => {
                if (task.id !== taskId) return task;
                const status = task.status === 'complete' ? 'pending' : 'complete';
                return { ...task, status };
            });
            refreshAll();
        };

        const deleteTask = (taskId) => {
            tasks = tasks.filter((task) => task.id !== taskId);
            refreshAll();
        };

        taskForm?.addEventListener('submit', (event) => {
            event.preventDefault();

            const title = document.getElementById('taskTitle')?.value.trim();
            const type = document.getElementById('taskType')?.value;
            const priority = Number(document.getElementById('taskPriority')?.value || 3);
            const dueDate = document.getElementById('taskDueDate')?.value;
            const description = document.getElementById('taskDescription')?.value.trim();
            const password = document.getElementById('taskPassword')?.value.trim();

            if (!title) {
                safeAlert({ icon: 'error', title: 'Title required', text: 'Please enter a task or note title.' });
                return;
            }

            if (type === 'Password Note' && !password) {
                safeAlert({ icon: 'error', title: 'Password required', text: 'Add a password to protect this note.' });
                return;
            }

            const newTask = {
                id: Date.now(),
                title,
                type,
                priority,
                status: 'pending',
                dueDate,
                description,
                isProtected: type === 'Password Note'
            };

            upsertTask(newTask);
            taskForm.reset();
            passwordField?.classList.add('d-none');

            safeAlert({ icon: 'success', title: 'Added', text: 'Your item has been saved.' });
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;

            if (target.classList.contains('toggle-status')) {
                const taskId = Number(target.dataset.id);
                if (taskId) updateTaskStatus(taskId);
            }

            if (target.classList.contains('delete-task')) {
                const taskId = Number(target.dataset.id);
                if (!taskId) return;
                safeAlert({
                    icon: 'warning',
                    title: 'Delete item?',
                    text: 'This action cannot be undone.',
                    showCancelButton: true,
                    confirmButtonText: 'Delete'
                }, (result) => {
                    if (result?.isConfirmed || result === undefined) {
                        deleteTask(taskId);
                    }
                });
            }
        });

        renderTaskCards();
        renderTasksTable();
        renderProgressChart();
        renderProjectsTable();
        renderTeamList();
    }
})();