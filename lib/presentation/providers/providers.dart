import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/services/auth_service.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/get_stored_user_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import 'auth_provider.dart';

// Secure storage instance
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

// AuthService instance
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// AuthRepository implementation
final authRepositoryProvider = Provider<AuthRepositoryImpl>((ref) {
  final authService = ref.watch(authServiceProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthRepositoryImpl(authService: authService, secureStorage: secureStorage);
});

// Use cases
final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return LoginUseCase(authRepository);
});

final getStoredUserUseCaseProvider = Provider<GetStoredUserUseCase>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return GetStoredUserUseCase(authRepository);
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return LogoutUseCase(authRepository);
});

// AuthNotifier (StateNotifier)
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserEntity?>>((ref) {
  final loginUseCase = ref.watch(loginUseCaseProvider);
  final getStoredUserUseCase = ref.watch(getStoredUserUseCaseProvider);
  final logoutUseCase = ref.watch(logoutUseCaseProvider);
  return AuthNotifier(loginUseCase, getStoredUserUseCase, logoutUseCase);
});