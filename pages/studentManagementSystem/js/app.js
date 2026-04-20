import { state } from './state.js';
import { auth, getColRef } from './firebase-config.js';
import { renderSidebar, renderHeader } from './ui.js';
import { ViewLogin, ViewDashboard, ViewStudents, ViewProfile, ViewAdmin, ViewTeachers } from './views.js';
import { onSnapshot, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import './api.js'; // Ensure appAPI is registered to window

let chartInstances = {};

const initCharts = () => {
    if (typeof Chart === 'undefined') return;

    // Destroy existing chart instances
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) chartInstances[key].destroy();
    });
    chartInstances = {};

    // Admin Charts
    const feeCanvas = document.getElementById('feeChart');
    if (feeCanvas) {
        const fees = state.data.fees || [];
        const paid = fees.filter(f => f.status === 'Paid').length;
        const pending = fees.filter(f => f.status === 'Pending').length;

        const feeCtx = feeCanvas.getContext('2d');
        const feeGradient1 = feeCtx.createLinearGradient(0, 0, 0, 400);
        feeGradient1.addColorStop(0, '#10b981');
        feeGradient1.addColorStop(1, '#059669');

        const feeGradient2 = feeCtx.createLinearGradient(0, 0, 0, 400);
        feeGradient2.addColorStop(0, '#f43f5e');
        feeGradient2.addColorStop(1, '#e11d48');

        chartInstances['fee'] = new Chart(feeCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Paid Fees', 'Pending Fees'],
                datasets: [{
                    data: [paid, pending],
                    backgroundColor: [feeGradient1, feeGradient2],
                    hoverBackgroundColor: ['#34d399', '#fb7185'],
                    borderWidth: 0,
                    hoverOffset: 12,
                    borderRadius: 15,
                    spacing: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '78%',
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { padding: 25, usePointStyle: true, font: { family: "'Inter', sans-serif", size: 13, weight: '500' }, color: '#475569' }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: { family: "'Inter', sans-serif", size: 14, weight: '600' },
                        bodyFont: { family: "'Inter', sans-serif", size: 15, weight: 'bold' },
                        displayColors: true,
                        boxPadding: 6,
                        usePointStyle: true,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                animation: { animateScale: true, animateRotate: true, duration: 2000, easing: 'easeOutQuart' }
            }
        });
    }

    const enrollmentCanvas = document.getElementById('enrollmentChart');
    if (enrollmentCanvas) {
        const students = state.data.students || [];
        const classCounts = {};
        students.forEach(s => {
            const c = s.class || 'Unassigned';
            classCounts[c] = (classCounts[c] || 0) + 1;
        });

        const labels = Object.keys(classCounts);
        const data = Object.values(classCounts);

        const ctx = enrollmentCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');

        const hoverGradient = ctx.createLinearGradient(0, 0, 0, 400);
        hoverGradient.addColorStop(0, '#60a5fa');
        hoverGradient.addColorStop(0.5, '#818cf8');
        hoverGradient.addColorStop(1, '#a78bfa');

        chartInstances['enrollment'] = new Chart(enrollmentCanvas, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Enrolled Students',
                    data: data.length ? data : [0],
                    backgroundColor: gradient,
                    hoverBackgroundColor: hoverGradient,
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
                    borderSkipped: false,
                    barPercentage: 0.5,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 1, font: { family: "'Inter', sans-serif", size: 12, weight: '500' }, color: '#64748b', padding: 10 },
                        grid: { borderDash: [4, 4], color: '#e2e8f0', drawBorder: false },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { family: "'Inter', sans-serif", size: 13, weight: '600' }, color: '#475569', padding: 10 },
                        border: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 16,
                        cornerRadius: 12,
                        titleFont: { family: "'Inter', sans-serif", size: 14, weight: '600' },
                        bodyFont: { family: "'Inter', sans-serif", size: 15, weight: 'bold' },
                        displayColors: false,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        yAlign: 'bottom'
                    }
                },
                animation: {
                    y: {
                        duration: 1500,
                        easing: 'easeOutElastic',
                        from: (ctx) => {
                            if (ctx.type === 'data') {
                                if (ctx.mode === 'default' && !ctx.dropped) {
                                    ctx.dropped = true;
                                    return 0;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Teacher Charts
    const teacherAttCanvas = document.getElementById('teacherAttendanceChart');
    if (teacherAttCanvas) {
        const att = state.data.attendance || [];
        const present = att.filter(a => a.status === 'Present').length;
        const absent = att.filter(a => a.status === 'Absent').length;
        const late = att.filter(a => a.status === 'Late').length;

        chartInstances['teacherAtt'] = new Chart(teacherAttCanvas, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [present, absent, late],
                    backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
                    borderWidth: 0, hoverOffset: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: "'Inter', sans-serif", size: 12 } } }
                }
            }
        });
    }

    const teacherMarksCanvas = document.getElementById('teacherMarksChart');
    if (teacherMarksCanvas) {
        const marks = state.data.marks || [];
        let excellent = 0, good = 0, average = 0, poor = 0;
        marks.forEach(m => {
            const pct = (Number(m.score) / Number(m.maxScore)) * 100;
            if (pct >= 80) excellent++;
            else if (pct >= 60) good++;
            else if (pct >= 40) average++;
            else poor++;
        });

        chartInstances['teacherMarks'] = new Chart(teacherMarksCanvas, {
            type: 'bar',
            data: {
                labels: ['80%+', '60-79%', '40-59%', '<40%'],
                datasets: [{
                    label: 'Students',
                    data: [excellent, good, average, poor],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { borderDash: [4, 4] }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Student Charts
    const studentAttCanvas = document.getElementById('studentAttendanceChart');
    if (studentAttCanvas) {
        const loggedInStudentRecord = state.data.students.find(s => s.authId === state.user?.uid || s.email === state.user?.email);
        const sId = loggedInStudentRecord ? loggedInStudentRecord.id : null;
        const att = state.data.attendance.filter(a => a.studentId === sId) || [];
        
        const present = att.filter(a => a.status === 'Present').length;
        const absent = att.filter(a => a.status === 'Absent').length;
        const late = att.filter(a => a.status === 'Late').length;

        chartInstances['studentAtt'] = new Chart(studentAttCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [present, absent, late],
                    backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
                    borderWidth: 0, hoverOffset: 10, cutout: '70%'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: "'Inter', sans-serif", size: 12 } } }
                }
            }
        });
    }

    const studentPerfCanvas = document.getElementById('studentPerformanceChart');
    if (studentPerfCanvas) {
        const loggedInStudentRecord = state.data.students.find(s => s.authId === state.user?.uid || s.email === state.user?.email);
        const sId = loggedInStudentRecord ? loggedInStudentRecord.id : null;
        const marks = state.data.marks.filter(m => m.studentId === sId) || [];

        const labels = marks.map(m => m.subject);
        const data = marks.map(m => (Number(m.score) / Number(m.maxScore)) * 100);

        chartInstances['studentPerf'] = new Chart(studentPerfCanvas, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Score %',
                    data: data.length ? data : [0],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { borderDash: [4, 4] }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

export const renderMainContent = () => {
    const container = document.getElementById('view-container');
    if (!container) return;
    
    let html = '';
    switch (state.activeView) {
        case 'dashboard': html = ViewDashboard(); break;
        case 'students': html = ViewStudents(); break;
        case 'profile': html = ViewProfile(); break;
        case 'admin': html = ViewAdmin(); break;
        case 'teachers': html = ViewTeachers(); break;
        default: html = ViewDashboard();
    }
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
    
    if (state.activeView === 'dashboard') {
        setTimeout(initCharts, 100);
    }
};

export const renderApp = () => {
    const app = document.getElementById('app');
    
    if (!state.user) {
        app.innerHTML = ViewLogin();
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    app.innerHTML = `
        ${renderSidebar()}
        <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
            ${renderHeader()}
            <main class="flex-1 overflow-y-auto p-4 md:p-8">
                <div id="view-container" class="w-full h-full"></div>
            </main>
        </div>
    `;
    renderMainContent();
};

const syncData = () => {
    const collections = Object.keys(state.data);
    
    // Clear old listeners
    state.unsubscribes.forEach(unsub => unsub());
    state.unsubscribes = [];

    collections.forEach(colName => {
        const unsub = onSnapshot(getColRef(colName), (snap) => {
            state.data[colName] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderMainContent(); // Re-render active view on data change
        }, (error) => {
            console.error(`Error syncing ${colName}:`, error);
        });
        state.unsubscribes.push(unsub);
    });
};

const initAuth = async () => {
    if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
        try {
            await signInWithCustomToken(auth, window.__initial_auth_token);
        } catch (e) {
            console.warn("Custom token sign-in failed. Showing standard login.", e);
        }
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        // Fetch or create user role doc
        const userDocRef = doc(getColRef('users'), user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
            state.role = userSnap.data().role || 'student';
        } else {
            // Fallback to student for safety
            await setDoc(userDocRef, { email: user.email, role: 'student' });
            state.role = 'student';
        }

        syncData();
        setTimeout(() => {
            renderApp();
        }, 1000);
    } else {
        state.user = null;
        // Clear any cached data on logout
        state.data = { 
            users: [], students: [], teachers: [], classes: [], subjects: [], 
            attendance: [], marks: [], fees: [], notices: [], assignments: [],
            departments: [], courses: [], semesters: [], sections: [], 
            academicSessions: [], timetable: [], exams: [], feeStructure: [], 
            auditLog: [], documentRequests: []
        };
        renderApp();
    }
});

// Start Auth flow
initAuth();
