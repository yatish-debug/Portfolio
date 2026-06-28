// signed: Yatish
/*
    File: main.js
    Purpose: handles boot screen, observers and UI interactions
    Signed by: Yatish
*/
// Boot Screen Animation
document.addEventListener('DOMContentLoaded', () => {
    const bootScreen = document.getElementById('bootScreen');
    
    // Hide boot screen after animation completes
    setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    }, 6000); // 6 seconds total boot time
    
    // Allow skipping with any key press or click
    const skipBoot = () => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    };
    
    document.addEventListener('keydown', skipBoot, { once: true });
    bootScreen.addEventListener('click', skipBoot, { once: true });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-category').forEach(category => {
    skillObserver.observe(category);
});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                lazyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('lazy-section');
        lazyObserver.observe(section);
    });
});

let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        document.body.style.overflowY = 'auto';
    }, 150);
}, { passive: true });

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (themeToggle) themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let targetTheme = 'dark';
            
            if (document.documentElement.getAttribute('data-theme') === 'light') {
                targetTheme = 'dark';
                themeToggle.textContent = '☀️';
            } else {
                targetTheme = 'light';
                themeToggle.textContent = '🌙';
            }

            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
            
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transition = 'none';
                themeToggle.style.transform = 'rotate(0deg)';
                setTimeout(() => themeToggle.style.transition = 'transform 0.3s', 50);
            }, 300);
        });
    }
});

// Project Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close-modal');
    const projectLinks = document.querySelectorAll('.project-link');

    let projectsData = null;

    // Fetch projects data
    fetch('src/data/projects.json')
        .then(response => response.json())
        .then(data => { projectsData = data; })
        .catch(err => console.error("Error loading project data:", err));

    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = link.getAttribute('data-project-id');
            if (projectsData && projectId) {
                const project = projectsData.find(p => p.id === projectId);
                if (project) {
                    // Populate modal
                    modalBody.innerHTML = `
                        <h2>${project.title}</h2>
                        <span class="modal-category">${project.category}</span>
                        <p>${project.description}</p>
                        <h3 style="color: var(--accent-secondary); margin-bottom: 1rem; font-size: 1.2rem;">Key Features</h3>
                        <ul>
                            ${project.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        <h3 style="color: var(--accent-secondary); margin-bottom: 1rem; font-size: 1.2rem;">Tech Stack</h3>
                        <div class="blog-tags" style="margin-bottom: 2rem;">
                            ${project.tech.map(t => `<span class="blog-tag">${t}</span>`).join('')}
                        </div>
                        <div class="modal-links">
                            <a href="${project.github}" target="_blank" class="btn btn-primary">GitHub Repo</a>
                            ${project.demo !== '#' ? `<a href="${project.demo}" target="_blank" class="btn btn-secondary">Live Demo</a>` : ''}
                        </div>
                    `;
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent background scroll
                }
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, (err) => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Fetch Dynamic Data from Backend
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            // Render Experience
            const expContainer = document.getElementById('experience-container');
            if (expContainer && data.experience) {
                expContainer.innerHTML = data.experience.map((exp, index) => `
                    <div class="timeline-item fade-in" style="animation-delay: ${index * 0.1}s;">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h3>${exp.title}</h3>
                            <div class="timeline-date">${exp.date} | ${exp.company}</div>
                            <p class="timeline-description">${exp.description}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Education
            const eduContainer = document.getElementById('education-container');
            if (eduContainer && data.education) {
                eduContainer.innerHTML = data.education.map((edu, index) => `
                    <div class="timeline-item fade-in" style="animation-delay: ${index * 0.1}s;">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <h3>${edu.title}</h3>
                            <div class="timeline-date">${edu.date} | ${edu.institution}</div>
                            <p class="timeline-description"><strong>${edu.score.split(':')[0]}:</strong> ${edu.score.split(':')[1] || edu.score}</p>
                        </div>
                    </div>
                `).join('');
            }

            // Render Certifications
            const certContainer = document.getElementById('certifications-container');
            if (certContainer && data.certifications) {
                certContainer.innerHTML = data.certifications.map((cert, index) => `
                    <div class="cert-card fade-in" style="animation-delay: ${index * 0.1}s;">
                        <div class="cert-icon">${cert.icon}</div>
                        <div class="cert-badge">
                            <div class="cert-badge-inner">
                                <div class="cert-title">${cert.category}</div>
                                <div class="cert-issuer">${cert.issuer}</div>
                            </div>
                        </div>
                        <h3>${cert.title}</h3>
                        <p class="cert-description">${cert.description}</p>
                        <div class="cert-footer">
                            <span class="cert-date">${cert.date}</span>
                            <a href="#" class="cert-link">Verify &rarr;</a>
                        </div>
                    </div>
                `).join('');
            }

            // Render Skills
            const skillsContainer = document.getElementById('skills-container');
            if (skillsContainer && data.skills) {
                skillsContainer.innerHTML = data.skills.map((category, index) => `
                    <div class="skill-category fade-in" style="animation-delay: ${index * 0.1}s;">
                        <h3>${category.category}</h3>
                        ${(category.skills || []).map(skill => `
                            <div class="skill-item">
                                <div class="skill-name">
                                    <span>${skill.name}</span>
                                    <span>${skill.percentage}%</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 0%" data-width="${skill.percentage}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('');
                
                // Re-attach skillObserver for the progress bars
                if (typeof skillObserver !== 'undefined') {
                    document.querySelectorAll('.skill-category').forEach(cat => {
                        skillObserver.observe(cat);
                    });
                }
            }

            // Re-attach IntersectionObserver for fade-in animations on newly added elements
            if (typeof observer !== 'undefined') {
                document.querySelectorAll('.fade-in').forEach(el => {
                    // Only re-apply if it hasn't been observed and animated yet
                    if (el.style.opacity !== '1') {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(20px)';
                        el.style.transition = 'all 0.6s ease-out';
                        observer.observe(el);
                    }
                });
            }
        })
        .catch(err => console.error("Error loading dynamic data:", err));
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    btn.textContent = 'Message Sent! \\o/';
                    contactForm.reset();
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 3000);
                } else {
                    btn.textContent = 'Error sending';
                    btn.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                btn.textContent = 'Network Error';
                btn.disabled = false;
            });
        });
    }
});

// Analytics Tracking
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/analytics/visit', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            const counter = document.getElementById('visitorCount');
            if (counter && data.success) {
                counter.textContent = data.totalVisitors;
            }
        })
        .catch(err => console.error('Analytics Error:', err));
});

// End of file - signed: Yatish
