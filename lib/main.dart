import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'presentation/auth/login_screen.dart';
import 'presentation/dashboards/super_admin_dashboard.dart';
import 'presentation/dashboards/admin_dashboard.dart';
import 'presentation/dashboards/accountant_dashboard.dart';
import 'presentation/providers/providers.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    Widget screen;
    if (authState.isLoading) {
      screen = const Scaffold(body: Center(child: CircularProgressIndicator()));
    } else if (authState.value != null) {
      final user = authState.value!;
      screen = _getDashboardForRole(user.role);
    } else {
      screen = const LoginScreen();
    }

    return MaterialApp(
      title: 'Role Based Auth',
      theme: AppTheme.darkTheme(),
      debugShowCheckedModeBanner: false,
      home: screen,
    );
  }

  Widget _getDashboardForRole(String role) {
    switch (role) {
      case 'superadmin':
        return const SuperAdminDashboard();
      case 'admin':
        return  AdminDashboard();
      case 'accountant':
        return  AccountantDashboard();
      default:
        return const LoginScreen();
    }
  }
}