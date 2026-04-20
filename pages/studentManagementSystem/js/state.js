export const state = {
    user: null,
    role: 'admin', // default, overridden by db
    isLoginView: true, // Defaults to Login view
    activeView: 'dashboard',
    isSidebarOpen: false,
    selectedStudentId: null,
    searchQuery: '',
    adminTab: 'student', // default admin tab
    data: {
        users: [], students: [], teachers: [], classes: [], subjects: [], attendance: [], marks: [], fees: [], notices: [], assignments: []
    },
    unsubscribes: []
};
