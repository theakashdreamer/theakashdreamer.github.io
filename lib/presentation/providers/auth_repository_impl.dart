import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/models/user_model.dart';
import '../../data/services/auth_service.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthService _authService;
  final FlutterSecureStorage _secureStorage;

  AuthRepositoryImpl({
    required AuthService authService,
    required FlutterSecureStorage secureStorage,
  }) : _authService = authService, _secureStorage = secureStorage;

  @override
  Future<UserEntity> login(String email, String password) async {
    final response = await _authService.login(email, password);
    if (response.status && response.data != null) {
      final user = response.data!;
      await _secureStorage.write(key: 'token', value: user.token);
      await _secureStorage.write(key: 'user', value: user.toJson().toString());
      return UserEntity.fromModel(user);
    } else {
      throw Exception(response.message ?? 'Login failed');
    }
  }

  @override
  Future<UserEntity?> getStoredUser() async {
    final token = await _secureStorage.read(key: 'token');
    final userStr = await _secureStorage.read(key: 'user');
    if (token != null && userStr != null) {
      try {
        // Parse JSON string to map
        final Map<String, dynamic> json = Map.from(jsonDecode(userStr));
        final userModel = UserModel.fromJson(json);
        return UserEntity.fromModel(userModel);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  @override
  Future<void> logout() async {
    await _secureStorage.delete(key: 'token');
    await _secureStorage.delete(key: 'user');
  }
}
