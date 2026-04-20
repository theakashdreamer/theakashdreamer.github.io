import { state } from './state.js';

export const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    toast.className = `${colors} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 toast-slide-up max-w-sm`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
        <span class="text-sm font-medium">${message}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) {
        window.lucide.createIcons();
    }
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

export const SidebarItem = (icon, label, viewId, allowedRoles) => {
    if (!allowedRoles.includes(state.role)) return '';
    const isActive = state.activeView === viewId;
    return `
        <a href="#" onclick="window.appAPI.switchView('${viewId}')" 
           class="nav-item flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium ${isActive ? 'nav-active' : 'text-slate-600'}">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
            ${label}
        </a>
    `;
};

export const renderSidebar = () => `
    <!-- Mobile Overlay -->
    ${state.isSidebarOpen ? '<div class="fixed inset-0 bg-slate-800/50 z-20 md:hidden" onclick="window.appAPI.toggleSidebar()"></div>' : ''}
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm fixed md:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${state.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}">
        <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <i data-lucide="graduation-cap" class="text-white w-5 h-5"></i>
                </div>
                <span class="text-lg font-bold text-slate-800 tracking-tight">EduManage</span>
            </div>
            <button onclick="window.appAPI.toggleSidebar()" class="md:hidden text-slate-500 hover:text-slate-700">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 space-y-1">
            ${SidebarItem('layout-dashboard', 'Dashboard', 'dashboard', ['admin', 'teacher', 'student'])}
            ${SidebarItem('user', 'My Profile', 'profile', ['student'])}
            ${SidebarItem('users', 'Students Directory', 'students', ['admin', 'teacher'])}
            ${SidebarItem('user-check', 'Teachers Directory', 'teachers', ['admin'])}
            ${SidebarItem('settings', 'Admin Panel', 'admin', ['admin', 'teacher'])}
        </nav>
    </aside>
`;

export const renderHeader = () => `
    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
        <div class="flex items-center gap-4">
            <button onclick="window.appAPI.toggleSidebar()" class="md:hidden text-slate-500 hover:text-slate-700">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
            <h1 class="text-xl font-semibold text-slate-800 capitalize">
                ${state.activeView.replace('-', ' ')}
            </h1>
        </div>
        <div class="flex items-center gap-4">
            <div class="relative hidden sm:block">
                <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
                <input type="text" placeholder="Quick search..." oninput="window.appAPI.setSearch(event)"
                       class="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all">
            </div>
            <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    ${state.role.charAt(0).toUpperCase()}
                </div>
                <div class="hidden md:block text-sm">
                    <p class="font-medium text-slate-700 capitalize">${state.role}</p>
                    <p class="text-xs text-slate-500 truncate w-32">${state.user?.email || 'User'}</p>
                </div>
                <button onclick="window.appAPI.handleLogout()" class="ml-2 text-slate-400 hover:text-red-600 transition-colors" title="Logout">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    </header>
`;
