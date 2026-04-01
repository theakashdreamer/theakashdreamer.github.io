import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/get_stored_user_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';

class AuthNotifier extends StateNotifier<AsyncValue<UserEntity?>> {
  final LoginUseCase _loginUseCase;
  final GetStoredUserUseCase _getStoredUserUseCase;
  final LogoutUseCase _logoutUseCase;

  AuthNotifier(
      this._loginUseCase,
      this._getStoredUserUseCase,
      this._logoutUseCase,
      ) : super(const AsyncValue.data(null)) {
    _loadStoredUser();
  }

  Future<void> _loadStoredUser() async {
    final result = await _getStoredUserUseCase();
    if (result != null) {
      state = AsyncValue.data(result);
    } else {
      state = const AsyncValue.data(null);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _loginUseCase(email, password);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    try {
      await _logoutUseCase();
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  UserEntity? get currentUser => state.value;
  bool get isAuthenticated => state.value != null;
}