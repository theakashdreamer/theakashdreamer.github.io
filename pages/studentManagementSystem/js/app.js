import { state } from './state.js';
import { auth, getColRef } from './firebase-config.js';
import { renderSidebar, renderHeader } from './ui.js';
import { ViewLogin, ViewDashboard, ViewStudents, ViewProfile, ViewAdmin, ViewTeachers } from './views.js';
import { onSnapshot, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import './api.js'; // Ensure appAPI is registered to window

let feeChartInstance = null;
let enrollmentChartInstance = null;

const initCharts = () => {
    if (typeof Chart === 'undefined') return;

    const feeCanvas = document.getElementById('feeChart');
    if (feeCanvas) {
        if (feeChartInstance) feeChartInstance.destroy();
        const fees = state.data.fees || [];
        const paid = fees.filter(f => f.status === 'Paid').length;
        const pending = fees.filter(f => f.status === 'Pending').length;

        feeChartInstance = new Chart(feeCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending'],
                datasets: [{
                    data: [paid, pending],
                    backgroundColor: ['#22c55e', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    const enrollmentCanvas = document.getElementById('enrollmentChart');
    if (enrollmentCanvas) {
        if (enrollmentChartInstance) enrollmentChartInstance.destroy();
        const students = state.data.students || [];
        const classCounts = {};
        students.forEach(s => {
            const c = s.class || 'Unassigned';
            classCounts[c] = (classCounts[c] || 0) + 1;
        });

        const labels = Object.keys(classCounts);
        const data = Object.values(classCounts);

        enrollmentChartInstance = new Chart(enrollmentCanvas, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Students',
                    data: data.length ? data : [0],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                },
                plugins: {
                    legend: { display: false }
                }
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
    
    if (state.activeView === 'dashboard' && state.role !== 'student') {
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
            // Fallback just in case, but typically handled by account creation API
            await setDoc(userDocRef, { email: user.email, role: 'admin' });
            state.role = 'admin';
        }

        syncData();
        setTimeout(() => {
            renderApp();
        }, 1000);
    } else {
        state.user = null;
        // Clear any cached data on logout
        state.data = { users: [], students: [], teachers: [], classes: [], subjects: [], attendance: [], marks: [], fees: [], notices: [] };
        renderApp();
    }
});

// Start Auth flow
initAuth();
