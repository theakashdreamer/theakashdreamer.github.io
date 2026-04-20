export const state = {
    user: null,
    role: 'admin', // default, overridden by db
    isLoginView: true, // Defaults to Login view
    activeView: 'dashboard',
    isSidebarOpen: false,
    selectedStudentId: null,
    searchQuery: '',
    adminTab: 'student', // default admin tab
    activeReport: null,
    data: {
        users: [], 
        students: [], 
        teachers: [], 
        departments: [],
        courses: [],
        semesters: [],
        classes: [], 
        sections: [],
        subjects: [], 
        attendance: [], 
        marks: [], 
        fees: [], 
        notices: [], 
        assignments: [],
        timetable: [],
        exams: [],
        examSchedule: [],
        feeStructure: [],
        documentRequests: [],
        auditLog: [],
        academicSessions: [],
        rooms: []
    },
    unsubscribes: []
};
