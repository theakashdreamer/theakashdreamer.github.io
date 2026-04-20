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
    
    let studentAttPercent = 0, studentPendingAssignments = 0, studentPendingFees = 0, studentAvgScore = 0;
    if (state.role === 'student') {
        const loggedInStudentRecord = state.data.students.find(s => s.authId === state.user?.uid || s.email === state.user?.email);
        if (loggedInStudentRecord) {
            const sId = loggedInStudentRecord.id;
            const att = state.data.attendance.filter(a => a.studentId === sId);
            const presents = att.filter(a => a.status === 'Present').length;
            studentAttPercent = att.length ? Math.round((presents / att.length) * 100) : 0;
            
            const assignments = state.data.assignments ? state.data.assignments.filter(a => a.class === loggedInStudentRecord.class) : [];
            studentPendingAssignments = assignments.length;
            
            const fees = state.data.fees.filter(f => f.studentId === sId && f.status !== 'Paid');
            studentPendingFees = fees.reduce((acc, curr) => acc + Number(curr.amount), 0);
            
            const marks = state.data.marks.filter(m => m.studentId === sId);
            const totalScore = marks.reduce((acc, curr) => acc + (Number(curr.score)/Number(curr.maxScore))*100, 0);
            studentAvgScore = marks.length ? Math.round(totalScore / marks.length) : 0;
        }
    }
    
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

    let availableNotices = state.data.notices;
    if (state.role === 'teacher') {
        availableNotices = availableNotices.filter(n => ['All', 'Teachers'].includes(n.target));
    } else if (state.role === 'student') {
        availableNotices = availableNotices.filter(n => ['All', 'Students'].includes(n.target));
    }
    
    const noticesHtml = availableNotices.slice(0,5).map(n => `
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
            ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${StatCard('Attendance Rate', studentAttPercent + '%', 'calendar-check', 'bg-emerald-500')}
                ${StatCard('Assignments', studentPendingAssignments, 'book-open', 'bg-purple-500')}
                ${StatCard('Fee Dues', '$' + studentPendingFees, 'credit-card', 'bg-orange-500')}
                ${StatCard('Avg Score', studentAvgScore + '%', 'award', 'bg-blue-600')}
            </div>
            `}
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Overview Analytics</h3>
                    ${state.role === 'admin' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">Fee Collection Status</h4>
                            <div class="relative w-full h-48 flex justify-center"><canvas id="feeChart"></canvas></div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">Class Enrollment</h4>
                            <div class="relative w-full h-48"><canvas id="enrollmentChart"></canvas></div>
                        </div>
                    </div>
                    ` : state.role === 'teacher' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">Overall Attendance</h4>
                            <div class="relative w-full h-48 flex justify-center"><canvas id="teacherAttendanceChart"></canvas></div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">Marks Distribution</h4>
                            <div class="relative w-full h-48"><canvas id="teacherMarksChart"></canvas></div>
                        </div>
                    </div>
                    ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">My Attendance</h4>
                            <div class="relative w-full h-48 flex justify-center"><canvas id="studentAttendanceChart"></canvas></div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
                            <h4 class="text-sm font-medium text-slate-600 mb-4 text-center">My Academic Performance</h4>
                            <div class="relative w-full h-48"><canvas id="studentPerformanceChart"></canvas></div>
                        </div>
                    </div>
                    `}
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
    
    if (state.role === 'teacher') {
        const loggedInTeacher = state.data.teachers.find(t => t.authId === state.user.uid || t.email === state.user.email) || {};
        const assignedClasses = loggedInTeacher.assignedClasses || [];
        filtered = filtered.filter(s => assignedClasses.includes(s.class));
    }

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
                <button onclick="window.appAPI.switchView('profile', '${s.id}')" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors inline-flex items-center gap-1 mr-2">
                    <i data-lucide="user" class="w-4 h-4"></i> Profile
                </button>
                ${state.role === 'admin' ? `<button onclick="if(confirm('Delete student?')) window.appAPI.deleteRecord('students', '${s.id}')" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors inline-flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>` : ''}
            </td>
        </tr>
    `).join('');

    return `
        <div class="fade-in max-w-6xl mx-auto w-full">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div class="flex items-center gap-4">
                        <h2 class="text-lg font-semibold text-slate-800">Student Directory</h2>
                        <span class="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-600">Total: ${filtered.length}</span>
                    </div>
                    <button onclick="window.appAPI.exportCSV('students')" class="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition">
                        <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                    </button>
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
    
    let sId = state.selectedStudentId;
    
    // Strictly map logged-in student to their own record
    if (state.role === 'student') {
        const loggedInStudentRecord = state.data.students.find(s => s.authId === state.user.uid || s.email === state.user.email);
        sId = loggedInStudentRecord ? loggedInStudentRecord.id : null;
    }
    
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

    const sAssignments = state.data.assignments ? state.data.assignments.filter(a => a.class === student.class) : [];
    const assignmentsHtml = sAssignments.length ? sAssignments.map(a => `
        <div class="py-3 border-b border-slate-100 last:border-0">
            <div class="flex justify-between items-start mb-1">
                <div>
                    <h4 class="text-sm font-semibold text-slate-800">${a.title}</h4>
                    <span class="text-[10px] uppercase font-bold text-cyan-600">${a.subject}</span>
                </div>
                <span class="text-[10px] font-semibold px-2 py-1 rounded bg-orange-50 text-orange-700 whitespace-nowrap border border-orange-200">Due: ${a.dueDate}</span>
            </div>
            <p class="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">${a.description || 'No additional details provided.'}</p>
        </div>
    `).join('') : '<p class="text-sm text-slate-500">No pending assignments.</p>';

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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <!-- Assignments -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <i data-lucide="book-open" class="w-5 h-5 text-cyan-500"></i>
                        <h3 class="font-semibold text-slate-800">Assignments</h3>
                    </div>
                    <div class="space-y-1">${assignmentsHtml}</div>
                </div>
            </div>
        </div>
    `;
};

const renderReportPreview = (colName) => {
    let data = state.data[colName];
    
    if (state.role === 'teacher') {
        const loggedInTeacher = state.data.teachers.find(t => t.authId === state.user.uid || t.email === state.user.email) || {};
        const assignedClasses = loggedInTeacher.assignedClasses || [];
        if (colName === 'students') {
            data = data.filter(s => assignedClasses.includes(s.class));
        } else if (colName === 'attendance' || colName === 'marks') {
            data = data.filter(item => {
                const s = state.data.students.find(st => st.id === item.studentId);
                return s && assignedClasses.includes(s.class);
            });
        } else if (colName === 'assignments') {
            data = data.filter(a => assignedClasses.includes(a.class));
        } else {
            data = [];
        }
    }

    if (!data || data.length === 0) return `<div class="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 fade-in">No data available for ${colName}.</div>`;
    
    const keys = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'authId' && k !== 'password');
    
    return `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col fade-in">
            <div class="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-100 text-blue-600 rounded-lg"><i data-lucide="table" class="w-5 h-5"></i></div>
                    <div>
                        <h3 class="font-bold text-slate-800 capitalize text-lg">${colName} Report Preview</h3>
                        <p class="text-xs font-medium text-slate-500">Showing ${data.length} records</p>
                    </div>
                </div>
                <button onclick="window.appAPI.exportCSV('${colName}')" class="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium whitespace-nowrap">
                    <i data-lucide="download" class="w-4 h-4"></i> Download CSV
                </button>
            </div>
            <div class="overflow-x-auto max-h-96">
                <table class="min-w-full divide-y divide-slate-200 text-sm">
                    <thead class="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            ${keys.map(k => `<th class="px-6 py-3 text-left font-bold text-slate-600 capitalize tracking-wider text-xs">${k}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        ${data.map(row => `
                            <tr class="hover:bg-slate-50 transition-colors">
                                ${keys.map(k => {
                                    let val = row[k] || '';
                                    if (Array.isArray(val)) val = val.join(', ');
                                    return `<td class="px-6 py-3 text-slate-700 truncate max-w-[200px] whitespace-nowrap">${val}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

export const ViewAdmin = () => {
    if (state.role === 'student') return `<div class="p-8 text-center text-red-500">Access Denied</div>`;

    const isAdmin = state.role === 'admin';
    const loggedInTeacher = !isAdmin ? (state.data.teachers.find(t => t.authId === state.user.uid || t.email === state.user.email) || {}) : null;
    const assignedClasses = loggedInTeacher?.assignedClasses || [];

    const tabs = [
        { id: 'user', label: 'Users', icon: 'shield', roles: ['admin'] },
        { id: 'student', label: 'Students', icon: 'graduation-cap', roles: ['admin', 'teacher'] },
        { id: 'teacher', label: 'Teachers', icon: 'briefcase', roles: ['admin'] },
        { id: 'class', label: 'Classes', icon: 'layout-template', roles: ['admin'] },
        { id: 'attendance', label: 'Attendance', icon: 'clipboard-check', roles: ['admin', 'teacher'] },
        { id: 'marks', label: 'Marks', icon: 'pen-tool', roles: ['admin', 'teacher'] },
        { id: 'assignment', label: 'Assignments', icon: 'book-open', roles: ['admin', 'teacher'] },
        { id: 'fee', label: 'Fees', icon: 'dollar-sign', roles: ['admin'] },
        { id: 'notice', label: 'Notices', icon: 'bell', roles: ['admin', 'teacher'] },
        { id: 'reports', label: 'Reports', icon: 'file-text', roles: ['admin', 'teacher'] }
    ].filter(t => t.roles.includes(state.role));

    if (!tabs.find(t => t.id === state.adminTab)) state.adminTab = tabs[0].id;

    const tabBtns = tabs.map(t => `
        <button onclick="window.appAPI.setAdminTab('${t.id}')" 
                class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${state.adminTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">
            <i data-lucide="${t.icon}" class="w-4 h-4"></i>
            <span class="hidden sm:inline">${t.label}</span>
        </button>
    `).join('');

    let availableStudents = state.data.students;
    if (!isAdmin) availableStudents = availableStudents.filter(s => assignedClasses.includes(s.class));
    const studentOptions = availableStudents.map(s => `<option value="${s.id}">${s.name} (${s.class})</option>`).join('');
    
    const availableClasses = isAdmin ? state.data.classes : state.data.classes.filter(c => assignedClasses.includes(c.name));
    const classOptions = availableClasses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    const subjectOptions = state.data.subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    const forms = {
        'user': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'users_custom')" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Email</label><input required name="email" type="email" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Password</label><input required name="password" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Role</label>
                        <select required name="role" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Create Admin</button>
                </form>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead class="bg-slate-50"><tr><th class="px-4 py-2 text-left font-medium text-slate-500">Email</th><th class="px-4 py-2 text-left font-medium text-slate-500">Role</th><th class="px-4 py-2 text-left font-medium text-slate-500">Status</th><th class="px-4 py-2 text-right font-medium text-slate-500">Actions</th></tr></thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            ${state.data.users.map(u => `
                                <tr>
                                    <td class="px-4 py-3">${u.email}</td>
                                    <td class="px-4 py-3 capitalize">${u.role}</td>
                                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${u.status || 'active'}</span></td>
                                    <td class="px-4 py-3 text-right">
                                        <button onclick="window.appAPI.resetPassword('${u.email}')" class="text-blue-500 hover:text-blue-700 mr-3" title="Reset Password"><i data-lucide="key" class="w-4 h-4 inline"></i></button>
                                        <button onclick="window.appAPI.toggleUserStatus('${u.id}', '${u.status || 'active'}')" class="text-orange-500 hover:text-orange-700" title="Toggle Status"><i data-lucide="power" class="w-4 h-4 inline"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`,
        'student': `
            <div class="space-y-6">
                ${isAdmin ? `
                <form onsubmit="window.appAPI.handleForm(event, 'students')" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Full Name</label><input required name="name" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Email</label><input required name="email" type="email" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Password</label><input required name="password" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Class/Section</label><select required name="class" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${classOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Roll No</label><input required name="rollNo" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Add Student</button></div>
                </form>
                ` : '<div class="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">You are viewing students in your assigned classes. Contact administration to add or remove students.</div>'}
                <div class="text-sm text-slate-500">Note: To view all students or export, use the <a href="#" onclick="window.appAPI.switchView('students')" class="text-blue-600 underline">Students Directory</a>.</div>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead class="bg-slate-50"><tr><th class="px-4 py-2 text-left font-medium text-slate-500">Name</th><th class="px-4 py-2 text-left font-medium text-slate-500">Class</th><th class="px-4 py-2 text-left font-medium text-slate-500">Roll No</th><th class="px-4 py-2 text-right font-medium text-slate-500">Actions</th></tr></thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            ${availableStudents.slice(0, 10).map(s => `
                                <tr>
                                    <td class="px-4 py-3">${s.name}</td><td class="px-4 py-3">${s.class}</td><td class="px-4 py-3">${s.rollNo}</td>
                                    <td class="px-4 py-3 text-right">
                                        ${isAdmin ? `
                                        <button onclick="const n = prompt('Enter new class for ${s.name}:', '${s.class}'); if(n) window.appAPI.updateRecord('students', '${s.id}', 'class', n)" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit Class"><i data-lucide="edit-3" class="w-4 h-4 inline"></i></button>
                                        <button onclick="if(confirm('Delete?')) window.appAPI.deleteRecord('students', '${s.id}')" class="text-red-500 hover:text-red-700" title="Delete"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
                                        ` : `
                                        <button onclick="window.appAPI.switchView('profile', '${s.id}')" class="text-blue-600 font-medium hover:underline text-xs">View Profile</button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`,
        'teacher': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'teachers')" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Full Name</label><input required name="name" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Email</label><input required name="email" type="email" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Password</label><input required name="password" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Subject Specialization</label><input required name="subject" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Phone</label><input name="phone" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Add Teacher</button></div>
                </form>
                <div class="text-sm text-slate-500">Note: Manage teacher classes and subjects in the <a href="#" onclick="window.appAPI.switchView('teachers')" class="text-blue-600 underline">Teachers Directory</a>.</div>
            </div>`,
        'class': `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <form onsubmit="window.appAPI.handleForm(event, 'classes')" class="flex gap-2 mb-4">
                        <input required name="name" type="text" placeholder="New Class/Section" class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 font-medium">Add</button>
                    </form>
                    <div class="flex flex-wrap gap-2">
                        ${state.data.classes.map(c => `<span class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm font-medium flex items-center">${c.name} <button onclick="window.appAPI.deleteRecord('classes', '${c.id}')" class="text-red-500 ml-2 hover:text-red-700"><i data-lucide="x" class="w-3.5 h-3.5"></i></button></span>`).join('')}
                    </div>
                </div>
                <div>
                    <form onsubmit="window.appAPI.handleForm(event, 'subjects')" class="flex gap-2 mb-4">
                        <input required name="name" type="text" placeholder="New Subject" class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md">
                        <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 font-medium">Add</button>
                    </form>
                    <div class="flex flex-wrap gap-2">
                        ${state.data.subjects.map(s => `<span class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm font-medium flex items-center">${s.name} <button onclick="window.appAPI.deleteRecord('subjects', '${s.id}')" class="text-red-500 ml-2 hover:text-red-700"><i data-lucide="x" class="w-3.5 h-3.5"></i></button></span>`).join('')}
                    </div>
                </div>
            </div>`,
        'attendance': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'attendance')" class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Student</label><select required name="studentId" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${studentOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Date</label><input required name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Status</label><select required name="status" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Mark</button></div>
                </form>
                <div class="overflow-x-auto border border-slate-200 rounded-lg max-h-64">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead class="bg-slate-50 sticky top-0"><tr><th class="px-4 py-2 text-left font-medium text-slate-500">Student</th><th class="px-4 py-2 text-left font-medium text-slate-500">Date</th><th class="px-4 py-2 text-left font-medium text-slate-500">Status</th><th class="px-4 py-2 text-right font-medium text-slate-500">Actions</th></tr></thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            ${state.data.attendance.filter(a => isAdmin || availableStudents.find(s => s.id === a.studentId)).slice(-20).reverse().map(a => {
                                const s = state.data.students.find(st => st.id === a.studentId)?.name || 'Unknown';
                                return `<tr><td class="px-4 py-2">${s}</td><td class="px-4 py-2">${a.date}</td><td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status==='Present'?'bg-green-100 text-green-700':a.status==='Absent'?'bg-red-100 text-red-700':'bg-orange-100 text-orange-700'}">${a.status}</span></td><td class="px-4 py-2 text-right">
                                    <button onclick="const st=prompt('New Status (Present/Absent/Late):','${a.status}'); if(st) window.appAPI.updateRecord('attendance','${a.id}','status',st)" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit"><i data-lucide="edit-3" class="w-4 h-4 inline"></i></button>
                                    ${isAdmin ? `<button onclick="window.appAPI.deleteRecord('attendance','${a.id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>` : ''}
                                </td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`,
        'marks': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'marks')" class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Student</label><select required name="studentId" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${studentOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Subject</label><select required name="subject" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${subjectOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Exam</label><input required name="exam" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Score</label><input required name="score" type="number" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Max Score</label><input required name="maxScore" type="number" value="100" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Save Marks</button></div>
                </form>
                <div class="overflow-x-auto border border-slate-200 rounded-lg max-h-64">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead class="bg-slate-50 sticky top-0"><tr><th class="px-4 py-2 text-left font-medium text-slate-500">Student</th><th class="px-4 py-2 text-left font-medium text-slate-500">Exam/Sub</th><th class="px-4 py-2 text-left font-medium text-slate-500">Score</th><th class="px-4 py-2 text-right font-medium text-slate-500">Actions</th></tr></thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            ${state.data.marks.filter(m => isAdmin || availableStudents.find(s => s.id === m.studentId)).slice(-20).reverse().map(m => {
                                const s = state.data.students.find(st => st.id === m.studentId)?.name || 'Unknown';
                                return `<tr><td class="px-4 py-2">${s}</td><td class="px-4 py-2">${m.exam} - ${m.subject}</td><td class="px-4 py-2 font-medium ${Number(m.score)<40?'text-red-500':'text-emerald-600'}">${m.score}/${m.maxScore}</td><td class="px-4 py-2 text-right">
                                    <button onclick="window.appAPI.generateMarksheet('${m.id}')" class="text-emerald-600 hover:text-emerald-800 mr-3" title="Generate Marksheet"><i data-lucide="printer" class="w-4 h-4 inline"></i></button>
                                    <button onclick="const ns=prompt('New Score:','${m.score}'); if(ns) window.appAPI.updateRecord('marks','${m.id}','score',ns)" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit"><i data-lucide="edit-3" class="w-4 h-4 inline"></i></button>
                                    ${isAdmin ? `<button onclick="window.appAPI.deleteRecord('marks','${m.id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>` : ''}
                                </td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`,
        'fee': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'fees')" class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Student</label><select required name="studentId" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${studentOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Amount ($)</label><input required name="amount" type="number" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Due Date</label><input required name="dueDate" type="date" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Add Fee</button></div>
                </form>
                <div class="overflow-x-auto border border-slate-200 rounded-lg max-h-64">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead class="bg-slate-50 sticky top-0"><tr><th class="px-4 py-2 text-left font-medium text-slate-500">Student</th><th class="px-4 py-2 text-left font-medium text-slate-500">Amount</th><th class="px-4 py-2 text-left font-medium text-slate-500">Status</th><th class="px-4 py-2 text-right font-medium text-slate-500">Actions</th></tr></thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            ${state.data.fees.map(f => {
                                const s = state.data.students.find(st => st.id === f.studentId)?.name || 'Unknown';
                                return `<tr><td class="px-4 py-2">${s}</td><td class="px-4 py-2">$${f.amount}</td><td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${f.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${f.status}</span></td><td class="px-4 py-2 text-right">
                                    ${f.status === 'Paid' ? `<button onclick="window.appAPI.generateReceipt('${f.id}')" class="text-emerald-600 hover:text-emerald-800 mr-3" title="Generate Receipt"><i data-lucide="printer" class="w-4 h-4 inline"></i></button>` : `<button onclick="window.appAPI.updateRecord('fees', '${f.id}', 'status', 'Paid')" class="text-blue-500 hover:text-blue-700 mr-3" title="Mark Paid"><i data-lucide="check-circle" class="w-4 h-4 inline"></i></button>`}
                                    <button onclick="window.appAPI.deleteRecord('fees','${f.id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
                                </td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`,
        'notice': `
            <div class="space-y-6">
                ${isAdmin ? `
                <form onsubmit="window.appAPI.handleForm(event, 'notices')" class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div class="col-span-3"><label class="block text-xs font-medium text-slate-700 mb-1">Title</label><input required name="title" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="col-span-3"><label class="block text-xs font-medium text-slate-700 mb-1">Content</label><textarea required name="content" rows="3" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></textarea></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Target</label><select required name="target" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"><option>All</option><option>Teachers</option><option>Students</option></select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Date</label><input required name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition font-medium">Publish Notice</button></div>
                </form>
                ` : '<div class="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">Review official notices shared by the administration.</div>'}
                <div class="space-y-2">
                    ${state.data.notices.filter(n => isAdmin || ['All', 'Teachers'].includes(n.target)).map(n => `<div class="flex justify-between items-center p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition"><div><h4 class="text-sm font-semibold text-slate-800">${n.title}</h4><p class="text-[11px] font-medium text-slate-500 uppercase mt-0.5">To: ${n.target} &bull; Date: ${n.date}</p></div>${isAdmin ? `<button onclick="window.appAPI.deleteRecord('notices', '${n.id}')" class="text-red-500 hover:text-red-700 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}</div>`).join('')}
                </div>
            </div>`,
        'assignment': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'assignments')" class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div class="col-span-3"><label class="block text-xs font-medium text-slate-700 mb-1">Title</label><input required name="title" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="col-span-3"><label class="block text-xs font-medium text-slate-700 mb-1">Description</label><textarea required name="description" rows="3" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></textarea></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Class</label><select required name="class" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${classOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Subject</label><select required name="subject" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md">${subjectOptions}</select></div>
                    <div><label class="block text-xs font-medium text-slate-700 mb-1">Due Date</label><input required name="dueDate" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"></div>
                    <div class="flex items-end"><button type="submit" class="w-full bg-cyan-600 text-white py-2 px-4 rounded-md text-sm hover:bg-cyan-700 transition font-medium">Post Assignment</button></div>
                </form>
                <div class="space-y-2 max-h-96 overflow-y-auto">
                    ${(state.data.assignments || []).filter(a => isAdmin || assignedClasses.includes(a.class)).map(a => `<div class="flex justify-between items-center p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition"><div><h4 class="text-sm font-semibold text-slate-800">${a.title}</h4><p class="text-[12px] text-slate-600 mt-1">${a.description}</p><p class="text-[11px] font-medium text-slate-500 uppercase mt-2">Class: ${a.class} &bull; Subject: ${a.subject} &bull; Due: ${a.dueDate}</p></div><button onclick="window.appAPI.deleteRecord('assignments', '${a.id}')" class="text-red-500 hover:text-red-700 p-2 ml-4"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`).join('') || '<p class="text-sm text-slate-500">No assignments created.</p>'}
                </div>
            </div>`,
        'reports': `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <button onclick="window.appAPI.previewReport('students')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'students' ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}"><div class="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition"><i data-lucide="users" class="w-6 h-6"></i></div><div><h4 class="font-bold text-slate-800">Student Report</h4><p class="text-xs font-medium text-slate-500">Preview students data</p></div></button>
                <button onclick="window.appAPI.previewReport('attendance')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'attendance' ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''}"><div class="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="clipboard-check"></i></div><div><h4 class="font-bold text-slate-800">Attendance Report</h4><p class="text-xs font-medium text-slate-500">Preview attendance data</p></div></button>
                <button onclick="window.appAPI.previewReport('marks')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'marks' ? 'ring-2 ring-orange-500 bg-orange-50/50' : ''}"><div class="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="pen-tool"></i></div><div><h4 class="font-bold text-slate-800">Marks Report</h4><p class="text-xs font-medium text-slate-500">Preview marks data</p></div></button>
                <button onclick="window.appAPI.previewReport('assignments')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'assignments' ? 'ring-2 ring-cyan-500 bg-cyan-50/50' : ''}"><div class="p-3 bg-cyan-50 text-cyan-600 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="book-open"></i></div><div><h4 class="font-bold text-slate-800">Assignments</h4><p class="text-xs font-medium text-slate-500">Preview assignments</p></div></button>
                ${isAdmin ? `
                <button onclick="window.appAPI.previewReport('teachers')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'teachers' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}"><div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="briefcase"></i></div><div><h4 class="font-bold text-slate-800">Teacher Report</h4><p class="text-xs font-medium text-slate-500">Preview teachers data</p></div></button>
                <button onclick="window.appAPI.previewReport('fees')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'fees' ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : ''}"><div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="dollar-sign"></i></div><div><h4 class="font-bold text-slate-800">Fee Report</h4><p class="text-xs font-medium text-slate-500">Preview fee records</p></div></button>
                <button onclick="window.appAPI.previewReport('classes')" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex items-center gap-4 group ${state.activeReport === 'classes' ? 'ring-2 ring-pink-500 bg-pink-50/50' : ''}"><div class="p-3 bg-pink-50 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition"><i class="w-6 h-6" data-lucide="layout-template"></i></div><div><h4 class="font-bold text-slate-800">Class Summary</h4><p class="text-xs font-medium text-slate-500">Preview class list</p></div></button>
                ` : ''}
            </div>
            ${state.activeReport ? renderReportPreview(state.activeReport) : ''}
        `
    };

    return `
        <div class="fade-in max-w-6xl mx-auto w-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col overflow-hidden">
            <div class="border-b border-slate-200 px-2 flex overflow-x-auto hide-scrollbar bg-slate-50/50">
                ${tabBtns}
            </div>
            <div class="p-6 flex-1 flex flex-col bg-white overflow-y-auto">
                <div class="w-full max-w-5xl mx-auto">
                    <h3 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i data-lucide="${tabs.find(t => t.id === state.adminTab)?.icon}" class="w-5 h-5 text-blue-600"></i>
                        ${tabs.find(t => t.id === state.adminTab)?.label || 'Administration Module'}
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
                    <div class="flex items-center gap-4">
                        <h2 class="text-lg font-semibold text-slate-800">Teachers Directory</h2>
                        <span class="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-600">Total: ${filtered.length}</span>
                    </div>
                    <button onclick="window.appAPI.exportCSV('teachers')" class="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition">
                        <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                    </button>
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
