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
    const totalCollected = state.data.fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0);
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
    
    const StatCard = (title, val, icon, color, subText) => `
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all group relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 ${color} opacity-5 rounded-full group-hover:scale-150 transition-transform"></div>
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 transition-transform group-hover:scale-110">
                    <i data-lucide="${icon}" class="${color.replace('bg-', 'text-')} w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">${title}</p>
                    <h3 class="text-2xl font-black text-slate-800 tracking-tight">${val}</h3>
                </div>
            </div>
            ${subText ? `<p class="text-xs text-slate-500 font-medium border-t pt-3 border-slate-50">${subText}</p>` : ''}
        </div>
    `;

    const recentActivity = state.data.auditLog.slice(-5).reverse().map(log => `
        <div class="flex gap-4 py-3 border-b border-slate-50 last:border-0 items-start">
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <i data-lucide="zap" class="w-4 h-4 text-slate-400"></i>
            </div>
            <div>
                <p class="text-xs font-bold text-slate-700">${log.action.replace(/_/g, ' ')}</p>
                <p class="text-[10px] text-slate-500">${log.details} &bull; ${new Date(log.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
    `).join('') || '<p class="text-xs text-slate-400 py-4 italic">No recent activity logged.</p>';

    return `
        <div class="fade-in max-w-7xl mx-auto w-full space-y-8">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 tracking-tight">Institutional Overview</h2>
                    <p class="text-slate-500 font-medium">Real-time performance and operational metrics</p>
                </div>
                <div class="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-3">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span class="text-xs font-bold text-slate-600 uppercase tracking-widest">System Live</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${state.role !== 'student' ? `
                    ${StatCard('Total Enrollment', state.data.students.length, 'users', 'bg-blue-600', `${state.data.departments.length} Departments`)}
                    ${StatCard('Faculty Strength', state.data.teachers.length, 'user-check', 'bg-emerald-500', `${Math.round(state.data.students.length / (state.data.teachers.length || 1))}:1 Ratio`)}
                    ${StatCard('Academic Scope', state.data.courses.length, 'layers', 'bg-purple-500', `${state.data.subjects.length} Active Subjects`)}
                    ${StatCard('Revenue Stream', '$' + totalCollected, 'credit-card', 'bg-orange-500', `$${pendingFees} Outstanding`)}
                ` : `
                    ${StatCard('Attendance Rate', studentAttPercent + '%', 'calendar-check', 'bg-emerald-500', 'Current Semester')}
                    ${StatCard('Academic Tasks', studentPendingAssignments, 'book-open', 'bg-purple-500', 'Pending Submission')}
                    ${StatCard('Financial Status', '$' + studentPendingFees, 'credit-card', 'bg-orange-500', 'Fee Balance')}
                    ${StatCard('Academic Rank', studentAvgScore + '%', 'award', 'bg-blue-600', 'Overall Average')}
                `}
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                    <div class="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                        <h3 class="text-xl font-black text-slate-800 tracking-tight">Operational Analytics</h3>
                        <div class="flex gap-2">
                            <button class="px-3 py-1 text-[10px] font-bold bg-slate-100 rounded-md">WEEKLY</button>
                            <button class="px-3 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md">MONTHLY</button>
                        </div>
                    </div>
                    ${state.role === 'admin' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div class="flex flex-col">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Revenue Distribution</h4>
                            <div class="relative w-full h-64 flex justify-center"><canvas id="feeChart"></canvas></div>
                        </div>
                        <div class="flex flex-col">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Enrollment by Course</h4>
                            <div class="relative w-full h-64"><canvas id="enrollmentChart"></canvas></div>
                        </div>
                    </div>
                    ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div class="flex flex-col">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Attendance Trend</h4>
                            <div class="relative w-full h-64 flex justify-center"><canvas id="${state.role}AttendanceChart"></canvas></div>
                        </div>
                        <div class="flex flex-col">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Result Performance</h4>
                            <div class="relative w-full h-64"><canvas id="${state.role}PerformanceChart"></canvas></div>
                        </div>
                    </div>
                    `}
                </div>
                
                <div class="space-y-6">
                    <!-- Notice Board -->
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                        <div class="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><i data-lucide="bell" class="w-4 h-4 text-blue-600"></i></div>
                                <h3 class="font-black text-slate-800 tracking-tight">Notices</h3>
                            </div>
                            <button class="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</button>
                        </div>
                        <div class="space-y-1">
                            ${state.data.notices.slice(0, 3).map(n => `
                                <div class="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                                    <div class="flex justify-between items-center mb-1">
                                        <h4 class="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                                        <span class="text-[9px] font-bold text-slate-400">${n.date}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-500 line-clamp-1">${n.content}</p>
                                </div>
                            `).join('') || '<p class="text-xs text-slate-400 italic py-4">No recent notices.</p>'}
                        </div>
                    </div>

                    <!-- Audit Log / Recent Activity -->
                    <div class="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                        <div class="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><i data-lucide="activity" class="w-4 h-4 text-white"></i></div>
                            <h3 class="font-black tracking-tight text-sm">System Activity</h3>
                        </div>
                        <div class="space-y-1">
                            ${state.data.auditLog.slice(-4).reverse().map(log => `
                                <div class="py-2.5 border-b border-white/5 last:border-0">
                                    <p class="text-[10px] font-bold text-white/90 uppercase tracking-wider">${log.action.replace(/_/g, ' ')}</p>
                                    <p class="text-[9px] text-white/40 mt-0.5">${log.details.slice(0, 30)}... &bull; ${new Date(log.timestamp).toLocaleTimeString()}</p>
                                </div>
                            `).join('') || '<p class="text-[10px] text-white/30 italic py-4">Waiting for system logs...</p>'}
                        </div>
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
    if (!['admin', 'hod', 'accountant'].includes(state.role)) return `<div class="p-8 text-center text-red-500">Access Denied</div>`;

    const isAdmin = state.role === 'admin';
    const isAccountant = state.role === 'accountant';
    const isHOD = state.role === 'hod';

    const tabs = [
        { id: 'academic', label: 'Academic Structure', icon: 'layers', roles: ['admin', 'hod'] },
        { id: 'admission', label: 'Admission & Lifecycle', icon: 'user-plus', roles: ['admin'] },
        { id: 'faculty', label: 'Faculty & Staff', icon: 'users', roles: ['admin', 'hod'] },
        { id: 'scheduling', label: 'Scheduling', icon: 'calendar', roles: ['admin', 'hod'] },
        { id: 'attendance', label: 'Attendance Govt.', icon: 'clipboard-check', roles: ['admin', 'hod'] },
        { id: 'exams', label: 'Exams & Results', icon: 'award', roles: ['admin', 'hod'] },
        { id: 'finance', label: 'Finance & Fees', icon: 'dollar-sign', roles: ['admin', 'accountant'] },
        { id: 'communication', label: 'Communication', icon: 'megaphone', roles: ['admin', 'hod'] },
        { id: 'documents', label: 'Documents', icon: 'file-text', roles: ['admin', 'accountant'] },
        { id: 'approvals', label: 'Approvals', icon: 'check-square', roles: ['admin', 'hod'] },
        { id: 'reports', label: 'Advanced Reports', icon: 'bar-chart-3', roles: ['admin', 'hod', 'accountant'] },
        { id: 'access', label: 'Access Control', icon: 'shield-lock', roles: ['admin'] }
    ].filter(t => t.roles.includes(state.role));

    if (!tabs.find(t => t.id === state.adminTab)) state.adminTab = tabs[0].id;

    const tabBtns = tabs.map(t => `
        <button onclick="window.appAPI.setAdminTab('${t.id}')" 
                class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${state.adminTab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">
            <i data-lucide="${t.icon}" class="w-4 h-4"></i>
            <span>${t.label}</span>
        </button>
    `).join('');

    const selectOptions = (data, valueKey = 'id', labelKey = 'name') => 
        data.map(item => `<option value="${item[valueKey]}">${item[labelKey]}</option>`).join('');

    const forms = {
        'academic': `
            <div class="space-y-8">
                <!-- Departments & Courses -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="building" class="w-4 h-4"></i> Create Department</h4>
                        <form onsubmit="window.appAPI.handleForm(event, 'departments')" class="space-y-4">
                            <input required name="name" placeholder="Department Name (e.g. Computer Science)" class="w-full px-3 py-2 border rounded-md text-sm">
                            <input required name="code" placeholder="Dept Code (e.g. CS)" class="w-full px-3 py-2 border rounded-md text-sm">
                            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-bold">Add Department</button>
                        </form>
                    </div>
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="book" class="w-4 h-4"></i> Create Course/Program</h4>
                        <form onsubmit="window.appAPI.handleForm(event, 'courses')" class="space-y-4">
                            <select required name="departmentId" class="w-full px-3 py-2 border rounded-md text-sm">
                                <option value="">Select Department</option>
                                ${selectOptions(state.data.departments)}
                            </select>
                            <input required name="name" placeholder="Course Name (e.g. B.Tech CS)" class="w-full px-3 py-2 border rounded-md text-sm">
                            <input required name="code" placeholder="Course Code" class="w-full px-3 py-2 border rounded-md text-sm">
                            <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-md text-sm font-bold">Add Course</button>
                        </form>
                    </div>
                </div>
                <!-- Subjects & Sessions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="file-code" class="w-4 h-4"></i> Subjects & Credits</h4>
                        <form onsubmit="window.appAPI.handleForm(event, 'subjects')" class="grid grid-cols-2 gap-3">
                            <input required name="name" placeholder="Subject Name" class="col-span-2 px-3 py-2 border rounded-md text-sm">
                            <input required name="code" placeholder="Subject Code" class="px-3 py-2 border rounded-md text-sm">
                            <input required name="credits" type="number" placeholder="Credits" class="px-3 py-2 border rounded-md text-sm">
                            <button type="submit" class="col-span-2 bg-emerald-600 text-white py-2 rounded-md text-sm font-bold">Add Subject</button>
                        </form>
                    </div>
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4"></i> Academic Sessions</h4>
                        <form onsubmit="window.appAPI.handleForm(event, 'academicSessions')" class="flex gap-2">
                            <input required name="name" placeholder="e.g. 2026-27" class="flex-1 px-3 py-2 border rounded-md text-sm">
                            <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-bold">Add</button>
                        </form>
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${state.data.academicSessions.map(s => `<span class="px-3 py-1 bg-white border rounded text-xs font-bold">${s.name}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`,

        'admission': `
            <div class="space-y-6">
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-blue-800">Next Admission Number</h4>
                        <p class="text-2xl font-black text-blue-600">${window.appAPI.generateAdmissionNo()}</p>
                    </div>
                    <i data-lucide="fingerprint" class="w-12 h-12 text-blue-300"></i>
                </div>
                <form onsubmit="window.appAPI.handleForm(event, 'students')" class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border shadow-sm">
                    <div class="md:col-span-3 border-b pb-2 mb-2 font-bold text-slate-700">Basic Information</div>
                    <input required name="name" placeholder="Full Name" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="email" type="email" placeholder="Email Address" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="password" type="text" value="Welcome@123" class="px-3 py-2 border rounded-md text-sm bg-slate-50">
                    <input name="phone" placeholder="Phone Number" class="px-3 py-2 border rounded-md text-sm">
                    <input name="dob" type="date" class="px-3 py-2 border rounded-md text-sm">
                    <select name="gender" class="px-3 py-2 border rounded-md text-sm"><option>Male</option><option>Female</option><option>Other</option></select>
                    
                    <div class="md:col-span-3 border-b pb-2 my-2 font-bold text-slate-700">Academic Assignment</div>
                    <select required name="departmentId" class="px-3 py-2 border rounded-md text-sm">
                        <option value="">Department</option>
                        ${selectOptions(state.data.departments)}
                    </select>
                    <select required name="courseId" class="px-3 py-2 border rounded-md text-sm">
                        <option value="">Course</option>
                        ${selectOptions(state.data.courses)}
                    </select>
                    <select required name="semester" class="px-3 py-2 border rounded-md text-sm">
                        <option>Semester 1</option><option>Semester 2</option><option>Semester 3</option><option>Semester 4</option>
                    </select>
                    <input required name="class" placeholder="Class/Section" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="rollNo" placeholder="Roll Number" class="px-3 py-2 border rounded-md text-sm">
                    <button type="submit" class="md:col-span-3 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition">Register Student & Generate ID</button>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="refresh-cw" class="w-4 h-4 text-blue-600"></i> Semester Promotion & Lifecycle</h4>
                        <div class="space-y-4">
                            <div class="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p class="text-xs font-bold text-blue-800 mb-2 uppercase">Bulk Promotion</p>
                                <div class="flex gap-2">
                                    <select id="promote-class" class="flex-1 px-3 py-2 border rounded text-xs">
                                        <option value="">Select Class to Promote</option>
                                        ${selectOptions(state.data.classes)}
                                    </select>
                                    <button onclick="const cid = document.getElementById('promote-class').value; if(cid) window.appAPI.promoteStudent(cid, 'Semester 2')" class="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold">Promote All</button>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="p-3 border rounded-lg text-[10px] font-bold hover:bg-red-50 text-red-600 flex items-center justify-center gap-2">
                                    <i data-lucide="user-x" class="w-3 h-3"></i> Detain Selected
                                </button>
                                <button class="p-3 border rounded-lg text-[10px] font-bold hover:bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2">
                                    <i data-lucide="graduation-cap" class="w-3 h-3"></i> Mark as Alumni
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="history" class="w-4 h-4 text-purple-600"></i> Admission History</h4>
                        <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                            ${state.data.students.slice(-5).reverse().map(s => `
                                <div class="p-2 border-b last:border-0 flex justify-between items-center text-xs">
                                    <div>
                                        <p class="font-bold">${s.name}</p>
                                        <p class="text-[10px] text-slate-500">Adm: ${s.admissionNo} &bull; ${s.dateJoined || '2026'}</p>
                                    </div>
                                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">ACTIVE</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`,

        'faculty': `
            <div class="space-y-6">
                <form onsubmit="window.appAPI.handleForm(event, 'teachers')" class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border shadow-sm">
                    <h4 class="md:col-span-3 font-bold text-slate-700 border-b pb-2">Onboard New Faculty</h4>
                    <input required name="name" placeholder="Full Name" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="email" type="email" placeholder="Work Email" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="password" type="text" value="Staff@2026" class="px-3 py-2 border rounded-md text-sm bg-slate-50">
                    <select required name="departmentId" class="px-3 py-2 border rounded-md text-sm">
                        <option value="">Department</option>
                        ${selectOptions(state.data.departments)}
                    </select>
                    <input name="designation" placeholder="Designation (e.g. Asst. Professor)" class="px-3 py-2 border rounded-md text-sm">
                    <input name="workload" type="number" placeholder="Weekly Workload (Hrs)" class="px-3 py-2 border rounded-md text-sm">
                    <button type="submit" class="md:col-span-3 bg-emerald-600 text-white py-2 rounded-md font-bold">Create Faculty Account</button>
                </form>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${state.data.teachers.map(t => `
                        <div class="p-4 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <div>
                                <p class="font-bold text-slate-800">${t.name}</p>
                                <p class="text-xs text-slate-500">${t.designation || 'Faculty'} &bull; ${state.data.departments.find(d => d.id === t.departmentId)?.name || 'General'}</p>
                            </div>
                            <button onclick="window.appAPI.switchView('teachers')" class="text-blue-600 text-xs font-bold underline">Manage Assignments</button>
                        </div>
                    `).join('')}
                </div>
            </div>`,

        'scheduling': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <form onsubmit="window.appAPI.handleForm(event, 'timetable')" class="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h4 class="font-bold text-slate-700 border-b pb-2">Add Schedule Slot</h4>
                        <select required name="classId" class="w-full px-3 py-2 border rounded-md text-sm">${selectOptions(state.data.classes)}</select>
                        <select required name="day" class="w-full px-3 py-2 border rounded-md text-sm">
                            <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                        </select>
                        <select required name="period" class="w-full px-3 py-2 border rounded-md text-sm">
                            <option>09:00 - 10:00</option><option>10:00 - 11:00</option><option>11:00 - 12:00</option><option>12:00 - 01:00</option><option>02:00 - 03:00</option>
                        </select>
                        <select required name="subjectId" class="w-full px-3 py-2 border rounded-md text-sm">${selectOptions(state.data.subjects)}</select>
                        <select required name="teacherId" class="w-full px-3 py-2 border rounded-md text-sm">${selectOptions(state.data.teachers)}</select>
                        <input required name="roomId" placeholder="Room No / Lab" class="w-full px-3 py-2 border rounded-md text-sm">
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-md font-bold">Assign Slot</button>
                    </form>
                    <div class="lg:col-span-2 bg-slate-50 p-6 rounded-xl border overflow-x-auto">
                        <h4 class="font-bold text-slate-700 mb-4">Conflict Monitor</h4>
                        <table class="min-w-full text-xs">
                            <thead><tr class="bg-slate-200 text-slate-600"><th class="p-2 text-left">Day</th><th class="p-2 text-left">Time</th><th class="p-2 text-left">Class</th><th class="p-2 text-left">Teacher</th><th class="p-2 text-left">Room</th></tr></thead>
                            <tbody>
                                ${state.data.timetable.slice(-10).map(t => `
                                    <tr class="border-b"><td class="p-2">${t.day}</td><td class="p-2">${t.period}</td><td class="p-2">${state.data.classes.find(c => c.id === t.classId)?.name || 'N/A'}</td><td class="p-2">${state.data.teachers.find(f => f.id === t.teacherId)?.name || 'N/A'}</td><td class="p-2">${t.roomId}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`,

        'attendance': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i> Attendance Policy</h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span class="text-xs font-medium">Minimum Attendance %</span>
                                <input type="number" value="75" class="w-16 px-2 py-1 border rounded text-xs font-bold text-center">
                            </div>
                            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span class="text-xs font-medium">Automatic Detention Warning</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <button class="w-full bg-slate-800 text-white py-2 rounded-md text-xs font-bold">Save Global Policies</button>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="pie-chart" class="w-4 h-4 text-blue-600"></i> Today's Institutional Pulse</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p class="text-[10px] font-bold text-emerald-700 uppercase mb-1">Present Today</p>
                                <p class="text-xl font-black text-emerald-600">${state.data.attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Present').length}</p>
                            </div>
                            <div class="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p class="text-[10px] font-bold text-red-700 uppercase mb-1">Absent Today</p>
                                <p class="text-xl font-black text-red-600">${state.data.attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Absent').length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl border shadow-sm">
                    <h4 class="font-bold text-slate-700 mb-4">Recent Exceptions & Leave Requests</h4>
                    <div class="space-y-3">
                        <div class="p-3 bg-slate-50 border rounded-lg flex justify-between items-center">
                            <div>
                                <p class="text-xs font-bold text-slate-800">Medical Leave Request</p>
                                <p class="text-[10px] text-slate-500">Student: Rahul (ID: 1024) &bull; 2 Days</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded">Approve</button>
                                <button class="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,

        'finance': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <p class="text-xs font-bold text-emerald-700 uppercase">Total Collected</p>
                        <p class="text-2xl font-black text-emerald-600">$${state.data.fees.filter(f => f.status === 'Paid').reduce((a, b) => a + Number(b.amount), 0)}</p>
                    </div>
                    <div class="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <p class="text-xs font-bold text-orange-700 uppercase">Outstanding Dues</p>
                        <p class="text-2xl font-black text-orange-600">$${state.data.fees.filter(f => f.status === 'Pending').reduce((a, b) => a + Number(b.amount), 0)}</p>
                    </div>
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p class="text-xs font-bold text-blue-700 uppercase">Active Scholarships</p>
                        <p class="text-2xl font-black text-blue-600">12 Students</p>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl border shadow-sm">
                    <h4 class="font-bold text-slate-700 mb-4">Define Fee Structure</h4>
                    <form onsubmit="window.appAPI.handleForm(event, 'feeStructure')" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select required name="courseId" class="px-3 py-2 border rounded-md text-sm">${selectOptions(state.data.courses)}</select>
                        <select required name="semester" class="px-3 py-2 border rounded-md text-sm"><option>Semester 1</option><option>Semester 2</option></select>
                        <input required name="amount" type="number" placeholder="Amount ($)" class="px-3 py-2 border rounded-md text-sm">
                        <button type="submit" class="bg-blue-600 text-white rounded-md font-bold text-sm">Save Structure</button>
                    </form>
                </div>
            </div>`,

        'communication': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onsubmit="window.appAPI.handleForm(event, 'notices')" class="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h4 class="font-bold text-slate-700 border-b pb-2">Broadcast Notice/Alert</h4>
                        <input required name="title" placeholder="Notice Title" class="w-full px-3 py-2 border rounded-md text-sm">
                        <textarea required name="content" placeholder="Type message here..." class="w-full px-3 py-2 border rounded-md text-sm h-24"></textarea>
                        <div class="grid grid-cols-2 gap-2">
                            <select required name="target" class="px-3 py-2 border rounded-md text-sm">
                                <option>All</option><option>Students</option><option>Teachers</option><option>Staff</option>
                            </select>
                            <input required name="date" type="date" value="${new Date().toISOString().split('T')[0]}" class="px-3 py-2 border rounded-md text-sm">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md font-bold flex items-center justify-center gap-2">
                            <i data-lucide="send" class="w-4 h-4"></i> Broadcast to All
                        </button>
                    </form>
                    <div class="bg-slate-50 p-6 rounded-xl border">
                        <h4 class="font-bold text-slate-700 mb-4">Event Calendar</h4>
                        <div class="space-y-3">
                            <div class="p-3 bg-white border-l-4 border-blue-500 rounded shadow-sm">
                                <p class="text-xs font-bold">Annual Tech Fest 2026</p>
                                <p class="text-[10px] text-slate-500">Starts: 15th May 2026</p>
                            </div>
                            <div class="p-3 bg-white border-l-4 border-emerald-500 rounded shadow-sm">
                                <p class="text-xs font-bold">Internal Assessment Week</p>
                                <p class="text-[10px] text-slate-500">Starts: 22nd May 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,

        'exams': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onsubmit="window.appAPI.handleForm(event, 'exams')" class="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h4 class="font-bold text-slate-700 border-b pb-2">Create Examination</h4>
                        <input required name="name" placeholder="Exam Name (e.g. Mid-Term 2026)" class="w-full px-3 py-2 border rounded-md text-sm">
                        <div class="grid grid-cols-2 gap-2">
                            <select required name="type" class="px-3 py-2 border rounded-md text-sm"><option>Internal</option><option>Practical</option><option>Mid-Term</option><option>End-Semester</option></select>
                            <input required name="startDate" type="date" class="px-3 py-2 border rounded-md text-sm">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md font-bold">Schedule Exam</button>
                    </form>
                    <div class="bg-slate-50 p-6 rounded-xl border">
                        <h4 class="font-bold text-slate-700 mb-4">Grade Management</h4>
                        <div class="flex flex-col gap-2">
                            <button onclick="window.appAPI.switchView('admin', {tab: 'marks'})" class="p-3 bg-white border rounded-lg text-sm font-bold flex justify-between items-center hover:bg-blue-50 transition">
                                <span>Lock/Unlock Marks Entry</span>
                                <i data-lucide="lock" class="w-4 h-4"></i>
                            </button>
                            <button class="p-3 bg-white border rounded-lg text-sm font-bold flex justify-between items-center hover:bg-emerald-50 transition">
                                <span>Verify Teacher-Entered Marks</span>
                                <i data-lucide="check-circle" class="w-4 h-4"></i>
                            </button>
                            <button class="p-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex justify-between items-center">
                                <span>Publish Results to Student Portal</span>
                                <i data-lucide="send" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`,

        'documents': `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4 flex items-center gap-2"><i data-lucide="printer" class="w-4 h-4"></i> Bulk Issuance</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="p-4 bg-slate-50 border rounded-xl hover:bg-blue-50 transition text-center flex flex-col items-center gap-2">
                                <i data-lucide="contact" class="text-blue-600"></i>
                                <span class="text-xs font-bold">Print ID Cards</span>
                            </button>
                            <button class="p-4 bg-slate-50 border rounded-xl hover:bg-emerald-50 transition text-center flex flex-col items-center gap-2">
                                <i data-lucide="ticket" class="text-emerald-600"></i>
                                <span class="text-xs font-bold">Admit Cards</span>
                            </button>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-xl border shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-4">Pending Requests</h4>
                        <div class="space-y-3">
                            ${state.data.documentRequests ? state.data.documentRequests.map(r => `
                                <div class="p-3 bg-slate-50 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p class="text-xs font-bold text-slate-800">${r.type}</p>
                                        <p class="text-[10px] text-slate-500">Student: ${r.studentId}</p>
                                    </div>
                                    <button class="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold">Approve</button>
                                </div>
                            `).join('') : '<p class="text-xs text-slate-400 italic">No pending certificate requests.</p>'}
                        </div>
                    </div>
                </div>
            </div>`,

        'approvals': `
            <div class="space-y-6">
                <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table class="min-w-full text-sm">
                        <thead class="bg-slate-50 text-slate-600 font-bold">
                            <tr><th class="p-4 text-left">Category</th><th class="p-4 text-left">Request Details</th><th class="p-4 text-left">Submitted By</th><th class="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr class="hover:bg-slate-50">
                                <td class="p-4"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">PROFILE UPDATE</span></td>
                                <td class="p-4">Change of Permanent Address</td>
                                <td class="p-4 text-xs">Akash Thakur (Roll: 101)</td>
                                <td class="p-4 text-right flex justify-end gap-2">
                                    <button class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><i data-lucide="check" class="w-4 h-4"></i></button>
                                    <button class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><i data-lucide="x" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-4"><span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">ATTENDANCE</span></td>
                                <td class="p-4">Medical Leave Correction (3 Days)</td>
                                <td class="p-4 text-xs">Dr. Verma (HOD)</td>
                                <td class="p-4 text-right flex justify-end gap-2">
                                    <button class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><i data-lucide="check" class="w-4 h-4"></i></button>
                                    <button class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><i data-lucide="x" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`,

        'reports': `
            <div class="space-y-6">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onclick="window.appAPI.previewReport('students')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="users" class="text-blue-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Enrollment</p>
                    </button>
                    <button onclick="window.appAPI.previewReport('attendance')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="check-square" class="text-emerald-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Attendance</p>
                    </button>
                    <button onclick="window.appAPI.previewReport('fees')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="dollar-sign" class="text-orange-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Collections</p>
                    </button>
                    <button onclick="window.appAPI.previewReport('auditLog')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="shield" class="text-indigo-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Audit Logs</p>
                    </button>
                    <button onclick="window.appAPI.previewReport('teachers')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="briefcase" class="text-purple-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Faculty</p>
                    </button>
                    <button onclick="window.appAPI.previewReport('timetable')" class="p-4 bg-white border rounded-xl hover:shadow-md transition text-left group">
                        <i data-lucide="calendar" class="text-cyan-600 mb-2 group-hover:scale-110 transition-transform"></i>
                        <p class="font-bold text-slate-800">Scheduling</p>
                    </button>
                </div>
                ${state.activeReport ? renderReportPreview(state.activeReport) : '<div class="p-20 text-center text-slate-400 bg-slate-50 border rounded-xl border-dashed">Select a report to preview data analytics.</div>'}
            </div>`,

        'access': `
            <div class="space-y-6">
                <div class="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 text-sm flex gap-3">
                    <i data-lucide="alert-triangle" class="w-5 h-5 shrink-0"></i>
                    <p>Critical: Access control changes affect system-wide permissions. Ensure role assignments are verified against institutional policy.</p>
                </div>
                <form onsubmit="window.appAPI.handleForm(event, 'hods')" class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl border shadow-sm items-end mb-8">
                    <div class="md:col-span-4 font-bold text-slate-700">Assign New Role (HOD / Accountant)</div>
                    <input required name="email" type="email" placeholder="Email" class="px-3 py-2 border rounded-md text-sm">
                    <input required name="password" type="text" placeholder="Password" class="px-3 py-2 border rounded-md text-sm">
                    <select required name="role" class="px-3 py-2 border rounded-md text-sm">
                        <option value="hod">Head of Department (HOD)</option>
                        <option value="accountant">Accountant / Bursar</option>
                    </select>
                    <button type="submit" class="bg-slate-800 text-white py-2 rounded-md font-bold">Grant Access</button>
                </form>

                <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b bg-slate-50">
                        <h4 class="font-bold text-slate-700">Active Staff Accounts</h4>
                    </div>
                    <table class="min-w-full text-sm">
                        <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                            <tr><th class="px-6 py-3 text-left">Email</th><th class="px-6 py-3 text-left">Role</th><th class="px-6 py-3 text-right">Actions</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            ${state.data.users.filter(u => ['hod', 'accountant'].includes(u.role)).map(u => `
                                <tr class="hover:bg-slate-50">
                                    <td class="px-6 py-4 font-medium text-slate-800">${u.email}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-2 py-1 rounded-full text-[10px] font-bold ${u.role === 'hod' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} uppercase">
                                            ${u.role}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button onclick="window.appAPI.deleteRecord('users', '${u.id}')" class="text-red-500 hover:text-red-700">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="p-8 text-center text-slate-400 italic">No non-admin staff accounts found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`
    };

    return `
        <div class="fade-in max-w-7xl mx-auto w-full flex flex-col h-full overflow-hidden">
            <div class="bg-white border-b sticky top-0 z-20">
                <div class="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-black text-slate-800">Advanced Institution Controller</h2>
                        <p class="text-xs text-slate-500 font-medium">Managing full lifecycle of college operations</p>
                    </div>
                    <div class="flex gap-2">
                        <span class="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">${state.role} MODE</span>
                        <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">${new Date().getFullYear()} SESSION</span>
                    </div>
                </div>
                <div class="px-4 flex overflow-x-auto hide-scrollbar gap-2">
                    ${tabBtns}
                </div>
            </div>
            <div class="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                <div class="w-full">
                    ${forms[state.adminTab] || `<div class="p-12 text-center text-slate-400">Module [${state.adminTab}] implementation in progress...</div>`}
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
