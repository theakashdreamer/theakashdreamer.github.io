import { state } from './state.js';
import { showToast } from './ui.js';
import { auth, db, getColRef, firebaseConfig } from './firebase-config.js';
import { renderApp, renderMainContent } from './app.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, addDoc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const switchView = (view, payload = null) => {
    state.activeView = view;
    if (payload && view === 'profile') state.selectedStudentId = payload;
    if (state.isSidebarOpen) state.isSidebarOpen = false;
    renderApp();
};

window.appAPI = {
    switchView,
    toggleSidebar: () => {
        state.isSidebarOpen = !state.isSidebarOpen;
        renderApp();
    },
    setAdminTab: (tab) => { 
        state.adminTab = tab; 
        state.activeReport = null; 
        renderMainContent(); 
    },
    setSearch: (e) => { 
        state.searchQuery = e.target.value.toLowerCase(); 
        renderMainContent(); 
    },
    previewReport: (colName) => { 
        state.activeReport = colName; 
        renderMainContent(); 
    },

    // --- Advanced Admin Utilities ---
    
    generateAdmissionNo: () => {
        const year = new Date().getFullYear().toString().slice(-2);
        const count = (state.data.students.length + 1).toString().padStart(4, '0');
        return `ADM${year}${count}`;
    },

    logAudit: async (action, details) => {
        try {
            await addDoc(getColRef('auditLog'), {
                userId: state.user?.uid,
                userEmail: state.user?.email,
                action,
                details,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error("Audit log failed", err);
        }
    },

    checkTimetableConflict: (newEntry) => {
        return state.data.timetable.some(t => 
            t.day === newEntry.day && 
            t.period === newEntry.period && 
            (t.teacherId === newEntry.teacherId || t.roomId === newEntry.roomId || (t.classId === newEntry.classId && t.sectionId === newEntry.sectionId))
        );
    },
    
    // Auth Actions
    handleAuth: async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            if (state.isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Logged in successfully");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(getColRef('users'), userCredential.user.uid), { 
                    email: email, 
                    role: 'admin' 
                });
                showToast("Admin account created successfully");
            }
        } catch (err) {
            showToast(err.message.replace('Firebase: ', ''), "error");
        }
    },
    
    toggleAuthMode: () => {
        state.isLoginView = !state.isLoginView;
        renderApp();
    },
    
    handleLogout: async () => {
        await signOut(auth);
        state.activeView = 'dashboard';
        showToast("Logged out successfully");
    },
    
    createAccountREST: async (email, password, role) => {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: false })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message.replace(/_/g, ' '));
        
        await setDoc(doc(getColRef('users'), data.localId), { email, role });
        return data.localId;
    },

    // CRUD Actions
    handleForm: async (e, colName) => {
        e.preventDefault();
        if(!state.user) return showToast("Unauthorized", "error");
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            if (colName === 'teachers' || colName === 'hods' || colName === 'accountants') {
                if (state.role !== 'admin') throw new Error("Only admins can perform this action.");
                // Use data.role if provided in form (e.g. for Access Control), otherwise use colName mapping
                const role = data.role || (colName === 'teachers' ? 'teacher' : colName === 'hods' ? 'hod' : 'accountant');
                showToast(`Creating ${role} account...`, "info");
                const uid = await window.appAPI.createAccountREST(data.email, data.password, role);
                delete data.password; 
                data.authId = uid;
                data.role = role;
            } 
            else if (colName === 'students') {
                if (state.role !== 'admin' && state.role !== 'teacher') throw new Error("Only teachers or admins can add students.");
                showToast("Creating Student account...", "info");
                const uid = await window.appAPI.createAccountREST(data.email, data.password, 'student');
                delete data.password;
                data.authId = uid;
                data.role = 'student';
                data.admissionNo = data.admissionNo || window.appAPI.generateAdmissionNo();
                data.status = 'Active';
            }
            else if (colName === 'timetable') {
                if (window.appAPI.checkTimetableConflict(data)) {
                    throw new Error("Scheduling conflict detected for this room, teacher, or class.");
                }
            }

            const docRef = await addDoc(getColRef(colName), {
                ...data,
                createdAt: new Date().toISOString()
            });
            
            await window.appAPI.logAudit(`CREATE_${colName.toUpperCase()}`, `ID: ${docRef.id}`);
            e.target.reset();
            showToast(`Record added successfully`);
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    promoteStudent: async (studentId, nextClass, nextSemester) => {
        try {
            const studentRef = doc(getColRef('students'), studentId);
            await updateDoc(studentRef, {
                class: nextClass,
                semester: nextSemester,
                promotionHistory: [
                    ...(state.data.students.find(s => s.id === studentId).promotionHistory || []),
                    { from: state.data.students.find(s => s.id === studentId).class, to: nextClass, date: new Date().toISOString() }
                ]
            });
            await window.appAPI.logAudit('STUDENT_PROMOTION', `Student: ${studentId} to ${nextClass}`);
            showToast("Student promoted successfully");
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    updateLifecycle: async (studentId, status, reason) => {
        try {
            await updateDoc(doc(getColRef('students'), studentId), { 
                status,
                lifecycleNote: reason,
                updatedAt: new Date().toISOString()
            });
            await window.appAPI.logAudit('LIFECYCLE_UPDATE', `Student: ${studentId} set to ${status}`);
            showToast(`Student status updated to ${status}`);
        } catch (err) {
            showToast(err.message, "error");
        }
    },
    
    deleteRecord: async (colName, id) => {
        try {
            await deleteDoc(doc(getColRef(colName), id));
            showToast("Record deleted");
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    updateRecord: async (colName, id, field, value) => {
        try {
            await updateDoc(doc(getColRef(colName), id), { [field]: value });
            showToast(`Record updated successfully`);
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    resetPassword: async (email) => {
        try {
            const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
            await sendPasswordResetEmail(auth, email);
            showToast("Password reset email sent to " + email);
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    toggleUserStatus: async (uid, currentStatus) => {
        try {
            const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
            await updateDoc(doc(getColRef('users'), uid), { status: newStatus });
            showToast(`User status set to ${newStatus}`);
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    generateMarksheet: (markId) => {
        const mark = state.data.marks.find(m => m.id === markId);
        if (!mark) return;
        const student = state.data.students.find(s => s.id === mark.studentId);
        const w = window.open('', '_blank');
        w.document.write(`<html><body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #ccc; text-align: center;"><h2>Official Marksheet</h2><p>Student: ${student?.name || 'Unknown'}</p><p>Exam: ${mark.exam}</p><p>Subject: ${mark.subject}</p><h1>Score: ${mark.score}/${mark.maxScore}</h1><button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button></body></html>`);
    },

    generateReceipt: (feeId) => {
        const fee = state.data.fees.find(f => f.id === feeId);
        if (!fee) return;
        const student = state.data.students.find(s => s.id === fee.studentId);
        const w = window.open('', '_blank');
        w.document.write(`<html><body style="font-family: sans-serif; padding: 40px; max-width: 400px; margin: auto; border: 1px solid #ccc; text-align: center;"><h2>Payment Receipt</h2><p>Student: ${student?.name || 'Unknown'}</p><p>Date: ${new Date().toLocaleDateString()}</p><h1>Amount Paid: $${fee.amount}</h1><p style="color: green; font-weight: bold;">Status: PAID</p><button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button></body></html>`);
    },

    assignClass: async (teacherId, className) => {
        try {
            const teacherDoc = doc(getColRef('teachers'), teacherId);
            const teacherRef = await getDoc(teacherDoc);
            if (!teacherRef.exists()) return;
            const classes = teacherRef.data().assignedClasses || [];
            if (!classes.includes(className)) {
                classes.push(className);
                await updateDoc(teacherDoc, { assignedClasses: classes });
                showToast("Class assigned successfully");
            } else {
                showToast("Class already assigned", "info");
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    removeClass: async (teacherId, className) => {
        try {
            const teacherDoc = doc(getColRef('teachers'), teacherId);
            const teacherRef = await getDoc(teacherDoc);
            if (!teacherRef.exists()) return;
            let classes = teacherRef.data().assignedClasses || [];
            classes = classes.filter(c => c !== className);
            await updateDoc(teacherDoc, { assignedClasses: classes });
            showToast("Class removed");
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    markFeePaid: async (feeId) => {
        try {
            await updateDoc(doc(getColRef('fees'), feeId), { status: 'Paid' });
            showToast("Fee marked as paid");
        } catch (err) {
            showToast(err.message, "error");
        }
    },

    exportCSV: (colName) => {
        let data = state.data[colName];
        if (!data || data.length === 0) return showToast("No data to export", "info");

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
            } else {
                return showToast("Access Denied", "error");
            }
        }

        if (!data || data.length === 0) return showToast("No data to export", "info");
        
        const keys = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'authId' && k !== 'password');
        const csvRows = [keys.join(',')];
        
        data.forEach(row => {
            const values = keys.map(k => {
                let val = row[k] || '';
                if (Array.isArray(val)) val = val.join('; ');
                return `"${val.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });
        
        const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${colName}_export.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};
