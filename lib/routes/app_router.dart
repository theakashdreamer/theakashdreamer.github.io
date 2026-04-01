import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../presentation/auth/login_screen.dart';
import '../presentation/dashboards/super_admin_dashboard.dart';
import '../presentation/dashboards/admin_dashboard.dart';
import '../presentation/dashboards/accountant_dashboard.dart';
import '../presentation/providers/auth_provider.dart';
import '../presentation/providers/providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  final isLoggedIn = authState.value != null;
  final role = authState.value?.role;

  return GoRouter(
    initialLocation: isLoggedIn ? _getDashboardRoute(role) : '/login',
    redirect: (context, state) {
      final isLoggingIn = state.matchedLocation == '/login';
      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return _getDashboardRoute(role);
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/superadmin',
        builder: (context, state) => const SuperAdminDashboard(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) =>  AdminDashboard(),
      ),
      GoRoute(
        path: '/accountant',
        builder: (context, state) =>  AccountantDashboard(),
      ),
    ],
  );
});

String _getDashboardRoute(String? role) {
  switch (role) {
    case 'superadmin':
      return '/superadmin';
    case 'admin':
      return '/admin';
    case 'accountant':
      return '/accountant';
    default:
      return '/login';
  }
}