import { state } from './state.js';

export const ViewLogin = () => `
    <div class="flex-1 flex flex-col items-center justify-center h-full p-4 bg-slate-50 w-full">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden fade-in">
            <div class="bg-blue-600 p-6 text-center">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <i data-lucide="graduation-cap" class="text-blue-600 w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold text-white tracking-tight">EduManage Pro</h2>
                <p class="text-blue-100 text-sm mt-1">${state.isLoginView ? 'Sign in to your account' : 'Initial Admin Account Setup'}</p>
            </div>
            <div class="p-8">
                <form onsubmit="window.appAPI.handleAuth(event)" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input required name="email" type="email" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input required name="password" type="password" minlength="6" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        ${state.isLoginView ? 'Sign In' : 'Register Admin Account'}
                    </button>
                </form>
                <div class="mt-6 text-center text-sm text-slate-600">
                    ${state.isLoginView ? 'System Setup?' : 'Already set up?'} 
                    <button type="button" onclick="window.appAPI.toggleAuthMode()" class="text-blue-600 font-semibold hover:underline">
                        ${state.isLoginView ? 'Create Admin Owner' : 'Sign in'}
                    </button>
                </div>
                <div class="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                    <strong>Note:</strong> Teachers are added by Admins. Students are added by Teachers or Admins from within the Dashboard.
                </div>
            </div>
        </div>
    </div>
`;

export const ViewDashboard = () => {
    const pendingFees = state.data.fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const StatCard = (title, val, icon, color) => `
        <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-10">
                <i data-lucide="${icon}" class="${color.replace('bg-', 'text-')} w-6 h-6"></i>
            </div>
            <div>
                <p class="text-sm font-medium text-slate-500 mb-1">${title}</p>
                <h3 class="text-2xl font-bold text-slate-800">${val}</h3>
            </div>
        </div>
    `;

    const noticesHtml = state.data.notices.slice(0,5).map(n => `
        <div class="py-3 border-b border-slate-100 last:border-0">
            <div class="flex justify-between items-start mb-1">
                <h4 class="text-sm font-semibold text-slate-800">${n.title}</h4>
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">${n.date}</span>
            </div>
            <p class="text-xs text-slate-600 line-clamp-2">${n.content}</p>
            <span class="text-[10px] uppercase font-bold text-blue-500 mt-1 block">To: ${n.target}</span>
        </div>
    `).join('') || '<p class="text-sm text-slate-500 py-4">No recent notices.</p>';

    return `
        <div class="fade-in max-w-7xl mx-auto w-full">
            ${state.role !== 'student' ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${StatCard('Total Students', state.data.students.length, 'users', 'bg-blue-600')}
                ${StatCard('Total Teachers', state.data.teachers.length, 'user-check', 'bg-emerald-500')}
                ${StatCard('Active Classes', state.data.classes.length, 'book-open', 'bg-purple-500')}
                ${StatCard('Pending Fees', '$'+pendingFees, 'credit-card', 'bg-orange-500')}
            </div>
            ` : ''}
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Welcome to EduManage Pro</h3>
                    <div class="aspect-video bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center flex-col text-slate-400">
                        <i data-lucide="bar-chart-3" class="w-16 h-16 mb-4 opacity-50"></i>
                        <p class="text-sm">Activity graphs will appear here</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-[400px]">
                    <div class="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <i data-lucide="bell" class="w-5 h-5 text-blue-500"></i>
                        <h3 class="text-lg font-semibold text-slate-800">Notice Board</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto pr-2">
                        ${noticesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const ViewStudents = () => {
    let filtered = state.data.students;
    if (state.searchQuery) {
        filtered = filtered.filter(s => 
            s.name?.toLowerCase().includes(state.searchQuery) || 
            s.class?.toLowerCase().includes(state.searchQuery) ||
            s.rollNo?.toLowerCase().includes(state.searchQuery)
        );
    }

    const rows = filtered.map(s => `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        ${s.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">${s.name}</p>
                        <p class="text-xs text-slate-500">${s.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${s.class}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${s.rollNo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="window.appAPI.switchView('profile', '${s.id}')" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                    View Profile
                </button>
            </td>
        </tr>
    `).join('');

    return `
        <div class="fade-in max-w-6xl mx-auto w-full">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 class="text-lg font-semibold text-slate-800">Student Directory</h2>
                    <span class="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-600">Total: ${filtered.length}</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                        <thead class="bg-slate-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-slate-200">
                            ${rows.length ? rows : '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500 text-sm">No students found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export const ViewProfile = () => {
    if (!state.selectedStudentId && state.role !== 'student') {
        return `<div class="text-center py-10 text-slate-500 fade-in">No student selected.</div>`;
    }
    
    // Map logged-in student to their record automatically
    const loggedInStudentRecord = state.data.students.find(s => s.authId === state.user.uid || s.email === state.user.email);
    const sId = state.role === 'student' && !state.selectedStudentId && loggedInStudentRecord ? loggedInStudentRecord.id : state.selectedStudentId;
    
    const student = state.data.students.find(s => s.id === sId);
    
    if (!student) return `<div class="text-center py-10 text-slate-500 fade-in">Student profile not found. Please contact administration.</div>`;

    const sMarks = state.data.marks.filter(m => m.studentId === sId);
    const sAtt = state.data.attendance.filter(a => a.studentId === sId);
    const sFees = state.data.fees.filter(f => f.studentId === sId);

    const marksHtml = sMarks.length ? sMarks.map(m => `
        <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span class="text-sm font-medium text-slate-700">${m.subject} <span class="text-xs text-slate-400">(${m.exam})</span></span>
            <span class="text-sm font-bold ${Number(m.score) < 40 ? 'text-red-500' : 'text-green-600'}">${m.score}/${m.maxScore}</span>
        </div>
    `).join('') : '<p class="text-sm text-slate-500">No marks recorded.</p>';

    const attHtml = sAtt.length ? sAtt.slice(-5).map(a => `
        <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span class="text-sm text-slate-600">${a.date}</span>
            <span class="text-xs font-semibold px-2 py-1 rounded ${a.status === 'Present' ? 'bg-green-100 text-green-700' : a.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}">${a.status}</span>
        </div>
    `).join('') : '<p class="text-sm text-slate-500">No attendance recorded.</p>';

    const feesHtml = sFees.length ? sFees.map(f => `
        <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <div>
                <p class="text-sm font-medium text-slate-700">$${f.amount}</p>
                <p class="text-xs text-slate-400">Due: ${f.dueDate}</p>
            </div>
            <span class="text-xs font-semibold px-2 py-1 rounded ${f.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${f.status}</span>
        </div>
    `).join('') : '<p class="text-sm text-slate-500">No fee records.</p>';

    return `
        <div class="fade-in max-w-5xl mx-auto w-full space-y-6">
            ${state.role !== 'student' ? `<button onclick="window.appAPI.switchView('students')" class="text-sm text-blue-600 hover:underline mb-2 flex items-center gap-1"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Directory</button>` : ''}
            
            <!-- Profile Header -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                    ${student.name?.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1 text-center md:text-left">
                    <h2 class="text-2xl font-bold text-slate-800">${student.name}</h2>
                    <p class="text-slate-500 mb-4">${student.email} | Phone: ${student.phone || 'N/A'}</p>
                    <div class="flex flex-wrap justify-center md:justify-start gap-3">
                        <span class="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-sm font-medium">Class: ${student.class}</span>
                        <span class="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-sm font-medium">Roll No: ${student.rollNo}</span>
                    </div>
                </div>
            </div>

            <!-- Reports Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Marks -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <i data-lucide="award" class="w-5 h-5 text-indigo-500"></i>
                        <h3 class="font-semibold text-slate-800">Academic Marks</h3>
                    </div>
                    <div class="space-y-1">${marksHtml}</div>
                </div>
                
                <!-- Attendance -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <i data-lucide="calendar-check" class="w-5 h-5 text-emerald-500"></i>
                        <h3 class="font-semibold text-slate-800">Recent Attendance</h3>
                    </div>
                    <div class="space-y-1">${attHtml}</div>
                </div>

                <!-- Fees -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <i data-lucide="credit-card" class="w-5 h-5 text-orange-500"></i>
                        <h3 class="font-semibold text-slate-800">Fee Status</h3>
                    </div>
                    <div class="space-y-1">${feesHtml}</div>
                </div>
            </div>
        </div>
    `;
};

export const ViewAdmin = () => {
    if (state.role === 'student') return `<div class="p-8 text-center text-red-500">Access Denied</div>`;

    const tabs = [
        { id: 'student', label: 'Add Student', icon: 'user-plus', roles: ['admin', 'teacher'] },
        { id: 'attendance', label: 'Mark Attendance', icon: 'clipboard-check', roles: ['admin', 'teacher'] },
        { id: 'marks', label: 'Enter Marks', icon: 'pen-tool', roles: ['admin', 'teacher'] },
        { id: 'notice', label: 'Add Notice', icon: 'bell-plus', roles: ['admin', 'teacher'] },
        { id: 'teacher', label: 'Add Teacher', icon: 'users', roles: ['admin'] },
        { id: 'class', label: 'Add Class', icon: 'layout-template', roles: ['admin'] },
        { id: 'subject', label: 'Add Subject', icon: 'book', roles: ['admin'] },
        { id: 'fee', label: 'Add Fee', icon: 'dollar-sign', roles: ['admin'] }
    ].filter(t => t.roles.includes(state.role));

    // Ensure active tab is allowed
    if (!tabs.find(t => t.id === state.adminTab)) state.adminTab = tabs[0].id;

    const tabBtns = tabs.map(t => `
        <button onclick="window.appAPI.setAdminTab('${t.id}')" 
                class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${state.adminTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">
            <i data-lucide="${t.icon}" class="w-4 h-4"></i>
            <span class="hidden sm:inline">${t.label}</span>
        </button>
    `).join('');

    // Common Selectors
    const studentOptions = state.data.students.map(s => `<option value="${s.id}">${s.name} (${s.class})</option>`).join('');
    const classOptions = state.data.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    const subjectOptions = state.data.subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    // Forms Generation Map
    const forms = {
        'student': `
            <form onsubmit="window.appAPI.handleForm(event, 'students')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input required name="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Email (Login ID)</label><input required name="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Initial Password</label><input required name="password" type="text" placeholder="e.g. Pass123!" minlength="6" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Class</label><select required name="class" class="w-full px-3 py-2 border border-slate-300 rounded-md">${classOptions}</select></div>
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Roll No</label><input required name="rollNo" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                </div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Phone</label><input name="phone" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium flex justify-center items-center gap-2"><i data-lucide="user-plus" class="w-4 h-4"></i> Create Student Account</button>
            </form>`,
        'teacher': `
            <form onsubmit="window.appAPI.handleForm(event, 'teachers')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input required name="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Email (Login ID)</label><input required name="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Initial Password</label><input required name="password" type="text" placeholder="e.g. Teach123!" minlength="6" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Specialization/Subject</label><input required name="subject" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Phone</label><input name="phone" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium flex justify-center items-center gap-2"><i data-lucide="user-plus" class="w-4 h-4"></i> Create Teacher Account</button>
            </form>`,
        'attendance': `
            <form onsubmit="window.appAPI.handleForm(event, 'attendance')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Select Student</label><select required name="studentId" class="w-full px-3 py-2 border border-slate-300 rounded-md">${studentOptions}</select></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Date</label><input required name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <div class="flex gap-4">
                        <label class="flex items-center"><input type="radio" name="status" value="Present" checked class="mr-2 text-blue-600"> Present</label>
                        <label class="flex items-center"><input type="radio" name="status" value="Absent" class="mr-2 text-blue-600"> Absent</label>
                        <label class="flex items-center"><input type="radio" name="status" value="Late" class="mr-2 text-blue-600"> Late</label>
                    </div>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Save Attendance</button>
            </form>`,
        'marks': `
            <form onsubmit="window.appAPI.handleForm(event, 'marks')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Select Student</label><select required name="studentId" class="w-full px-3 py-2 border border-slate-300 rounded-md">${studentOptions}</select></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Subject</label><select required name="subject" class="w-full px-3 py-2 border border-slate-300 rounded-md">${subjectOptions}</select></div>
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Exam Name</label><input required name="exam" type="text" placeholder="e.g. Mid Term" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Score Obtained</label><input required name="score" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Maximum Score</label><input required name="maxScore" type="number" value="100" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Save Marks</button>
            </form>`,
        'notice': `
            <form onsubmit="window.appAPI.handleForm(event, 'notices')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Notice Title</label><input required name="title" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Content</label><textarea required name="content" rows="4" class="w-full px-3 py-2 border border-slate-300 rounded-md"></textarea></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Date</label><input required name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                        <select required name="target" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option>All</option><option>Teachers</option><option>Students</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Publish Notice</button>
            </form>`,
        'fee': `
            <form onsubmit="window.appAPI.handleForm(event, 'fees')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Select Student</label><select required name="studentId" class="w-full px-3 py-2 border border-slate-300 rounded-md">${studentOptions}</select></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label><input required name="amount" type="number" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                    <div><label class="block text-sm font-medium text-slate-700 mb-1">Due Date</label><input required name="dueDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                </div>
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select required name="status" class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="Pending">Pending</option><option value="Paid">Paid</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Add Fee Record</button>
            </form>`,
        'class': `
            <form onsubmit="window.appAPI.handleForm(event, 'classes')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Class Name (e.g. 10A)</label><input required name="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Create Class</button>
            </form>`,
        'subject': `
            <form onsubmit="window.appAPI.handleForm(event, 'subjects')" class="space-y-4 max-w-lg">
                <div><label class="block text-sm font-medium text-slate-700 mb-1">Subject Name</label><input required name="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md"></div>
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium">Add Subject</button>
            </form>`
    };

    return `
        <div class="fade-in max-w-6xl mx-auto w-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
            <div class="border-b border-slate-200 px-2 flex overflow-x-auto hide-scrollbar">
                ${tabBtns}
            </div>
            <div class="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50">
                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm w-full max-w-2xl">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 capitalize">
                        ${tabs.find(t => t.id === state.adminTab)?.label || 'Administration'}
                    </h3>
                    ${forms[state.adminTab] || '<p class="text-slate-500">Select an action</p>'}
                </div>
            </div>
        </div>
    `;
};

export const ViewTeachers = () => {
    let filtered = state.data.teachers;
    if (state.searchQuery) {
        filtered = filtered.filter(t => 
            t.name?.toLowerCase().includes(state.searchQuery) || 
            t.subject?.toLowerCase().includes(state.searchQuery)
        );
    }

    const classOptions = state.data.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    const rows = filtered.map(t => {
        const assignedClasses = t.assignedClasses || [];
        const classBadges = assignedClasses.map(c => `
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                ${c}
                <button onclick="window.appAPI.removeClass('${t.id}', '${c}')" class="hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button>
            </span>
        `).join(' ');

        return `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        ${t.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">${t.name}</p>
                        <p class="text-xs text-slate-500">${t.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${t.subject || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-normal text-sm text-slate-600">
                <div class="flex flex-wrap gap-1 mb-2">${classBadges || '<span class="text-xs text-slate-400">No classes assigned</span>'}</div>
                <div class="flex items-center gap-2">
                    <select id="assign-class-${t.id}" class="text-xs border border-slate-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                        <option value="">Select Class</option>
                        ${classOptions}
                    </select>
                    <button onclick="const sel = document.getElementById('assign-class-${t.id}'); if(sel.value) window.appAPI.assignClass('${t.id}', sel.value);" class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition">Assign</button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="if(confirm('Are you sure you want to delete this teacher?')) window.appAPI.deleteRecord('teachers', '${t.id}')" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1 inline-flex">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </td>
        </tr>
    `}).join('');

    return `
        <div class="fade-in max-w-6xl mx-auto w-full">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 class="text-lg font-semibold text-slate-800">Teachers Directory</h2>
                    <span class="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-600">Total: ${filtered.length}</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                        <thead class="bg-slate-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teacher Info</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Classes</th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-slate-200">
                            ${rows.length ? rows : '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500 text-sm">No teachers found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
