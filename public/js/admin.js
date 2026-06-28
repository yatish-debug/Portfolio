// Admin Panel Logic

const ROOT_PASSWORD = 'Yatish@2006'; // Basic auth for demonstration
let currentTab = 'messages';
let editingId = null;
window.currentItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const pwdInput = document.getElementById('adminPassword');
    const errorMsg = document.getElementById('loginError');
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logoutBtn');

    // Login
    loginBtn.addEventListener('click', () => {
        if (pwdInput.value === ROOT_PASSWORD) {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'block';
            loadData('messages');

            // Load Analytics
            fetch('/api/analytics')
                .then(res => res.json())
                .then(data => {
                    const viewElement = document.getElementById('adminTotalViews');
                    if (viewElement) viewElement.textContent = `Total Visits: ${data.totalVisitors || 0}`;
                });
        } else {
            errorMsg.style.display = 'block';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        pwdInput.value = '';
    });

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.id === 'logoutBtn') return;
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const tab = e.target.getAttribute('data-tab');
            currentTab = tab;

            if (tab === 'messages') {
                document.getElementById('messages-tab').classList.add('active');
                document.getElementById('crud-tab').classList.remove('active');
                loadData('messages');
            } else {
                document.getElementById('messages-tab').classList.remove('active');
                document.getElementById('crud-tab').classList.add('active');
                document.getElementById('crudTitle').textContent = `Manage ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
                setupCrudForm(tab);
                loadData(tab);
            }
        });
    });

    // CRUD Form Submit
    document.getElementById('crudForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const url = editingId ? `/api/admin/${currentTab}/edit` : `/api/admin/${currentTab}/add`;
        if (editingId) data.id = editingId;

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    e.target.reset();
                    editingId = null;
                    document.querySelector('#crudForm button[type="submit"]').textContent = 'Add Item';
                    loadData(currentTab);
                    alert(editingId ? 'Item updated successfully!' : 'Item added successfully!');
                }
            });
    });
});

function loadData(tab) {
    if (tab === 'messages') {
        fetch('/api/admin/messages')
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector('#messagesTable tbody');
                tbody.innerHTML = data.map(msg => `
                    <tr>
                        <td>${msg.name}</td>
                        <td>${msg.email}</td>
                        <td>${msg.message}</td>
                        <td>
                            <span style="color: ${msg.status === 'approved' ? 'var(--accent-primary)' : msg.status === 'denied' ? 'red' : 'yellow'}">${msg.status}</span>
                        </td>
                        <td>
                            <button class="action-btn approve" onclick="updateMessageStatus('${msg.id}', 'approved')">Approve</button>
                            <button class="action-btn deny" onclick="updateMessageStatus('${msg.id}', 'denied')">Deny</button>
                        </td>
                    </tr>
                `).join('');
            });
    } else {
        fetch('/api/data')
            .then(res => res.json())
            .then(data => {
                const items = data[tab] || [];
                window.currentItems = items;
                const tbody = document.querySelector('#crudTable tbody');

                if (tab === 'experience') {
                    tbody.innerHTML = items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.company}</td>
                            <td>${item.date}</td>
                            <td>
                                <button class="action-btn approve" onclick="editItem('${item.id}')">Edit</button>
                                <button class="action-btn deny" onclick="deleteItem('${tab}', '${item.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                } else if (tab === 'education') {
                    tbody.innerHTML = items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.institution}</td>
                            <td>${item.date}</td>
                            <td>
                                <button class="action-btn approve" onclick="editItem('${item.id}')">Edit</button>
                                <button class="action-btn deny" onclick="deleteItem('${tab}', '${item.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                } else if (tab === 'certifications') {
                    tbody.innerHTML = items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.issuer}</td>
                            <td>${item.date}</td>
                            <td>
                                <button class="action-btn approve" onclick="editItem('${item.id}')">Edit</button>
                                <button class="action-btn deny" onclick="deleteItem('${tab}', '${item.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                } else if (tab === 'projects') {
                    tbody.innerHTML = items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.category}</td>
                            <td><a href="${item.github}" target="_blank" style="color:var(--accent-primary)">Link</a></td>
                            <td>
                                <button class="action-btn approve" onclick="editItem('${item.id}')">Edit</button>
                                <button class="action-btn deny" onclick="deleteItem('${tab}', '${item.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                } else if (tab === 'skills') {
                    tbody.innerHTML = items.map(item => `
                        <tr>
                            <td>${item.category}</td>
                            <td>${item.skills ? item.skills.length : 0} Skills</td>
                            <td>-</td>
                            <td>
                                <button class="action-btn approve" onclick="editItem('${item.id}')">Edit</button>
                                <button class="action-btn deny" onclick="deleteItem('${tab}', '${item.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
    }
}

function setupCrudForm(tab) {
    const inputs = document.getElementById('dynamicInputs');
    const headers = document.getElementById('crudHeaders');

    if (tab === 'experience') {
        inputs.innerHTML = `
            <input type="text" name="title" placeholder="Job Title" required>
            <input type="text" name="company" placeholder="Company Name" required>
            <input type="text" name="date" placeholder="Date (e.g. Oct 2025 - Mar 2026)" required>
            <textarea name="description" placeholder="Description" required></textarea>
        `;
        headers.innerHTML = `<th>Title</th><th>Company</th><th>Date</th><th>Actions</th>`;
    } else if (tab === 'education') {
        inputs.innerHTML = `
            <input type="text" name="title" placeholder="Degree/Certificate" required>
            <input type="text" name="institution" placeholder="Institution Name" required>
            <input type="text" name="date" placeholder="Date (e.g. 2022 - 2024)" required>
            <input type="text" name="score" placeholder="Score (e.g. CGPA: 9.0 / 10.0)" required>
        `;
        headers.innerHTML = `<th>Title</th><th>Institution</th><th>Date</th><th>Actions</th>`;
    } else if (tab === 'certifications') {
        inputs.innerHTML = `
            <input type="text" name="title" placeholder="Certification Title" required>
            <input type="text" name="issuer" placeholder="Issuer (e.g. Google)" required>
            <input type="text" name="category" placeholder="Category" required>
            <input type="text" name="icon" placeholder="Emoji Icon (e.g. 🛡️)" required>
            <input type="text" name="date" placeholder="Date (e.g. May 2025)" required>
            <textarea name="description" placeholder="Description" required></textarea>
        `;
        headers.innerHTML = `<th>Title</th><th>Issuer</th><th>Date</th><th>Actions</th>`;
    } else if (tab === 'projects') {
        inputs.innerHTML = `
            <input type="text" name="title" placeholder="Project Title" required>
            <input type="text" name="category" placeholder="Category (e.g. Web Security)" required>
            <input type="text" name="description" placeholder="Short Description" required>
            <input type="text" name="github" placeholder="GitHub URL" required>
            <input type="text" name="demo" placeholder="Live Demo URL (or #)" required>
        `;
        headers.innerHTML = `<th>Title</th><th>Category</th><th>Link</th><th>Actions</th>`;
    } else if (tab === 'skills') {
        inputs.innerHTML = `
            <input type="text" name="category" placeholder="Skill Category (e.g. Reverse Engineering)" required>
            <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem;">(Note: Add exact skills array directly in JSON later. This creates the category wrapper.)</p>
        `;
        headers.innerHTML = `<th>Category</th><th>Item Count</th><th>-</th><th>Actions</th>`;
    }
    
    // Reset form state
    editingId = null;
    document.querySelector('#crudForm button[type="submit"]').textContent = 'Add Item';
}

function editItem(id) {
    const item = window.currentItems.find(i => i.id === id);
    if (!item) return;

    editingId = id;
    const form = document.getElementById('crudForm');
    
    // Populate form inputs
    Object.keys(item).forEach(key => {
        const input = form.elements[key];
        if (input) {
            input.value = item[key];
        }
    });

    document.querySelector('#crudForm button[type="submit"]').textContent = 'Update Item';
    
    // Scroll to form
    document.getElementById('crudTitle').scrollIntoView({ behavior: 'smooth' });
}

function updateMessageStatus(id, status) {
    fetch('/api/admin/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
    }).then(() => loadData('messages'));
}

function deleteItem(section, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`/api/admin/${section}/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        }).then(() => loadData(currentTab));
    }
}
