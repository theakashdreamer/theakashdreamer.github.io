import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/api_response.dart';

class AuthService {
  // Simulate network delay
  Future<ApiResponse<UserModel>> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 1));

    // Mock user based on email
    if (email == 'super@test.com' && password == 'password') {
      return ApiResponse.success(
        UserModel(
          id: 1,
          name: 'Super Admin',
          email: 'super@test.com',
          role: 'superadmin',
          token: 'mock_token_super',
        ),
      );
    } else if (email == 'admin@test.com' && password == 'password') {
      return ApiResponse.success(
        UserModel(
          id: 2,
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          token: 'mock_token_admin',
        ),
      );
    } else if (email == 'account@test.com' && password == 'password') {
      return ApiResponse.success(
        UserModel(
          id: 3,
          name: 'Accountant User',
          email: 'account@test.com',
          role: 'accountant',
          token: 'mock_token_account',
        ),
      );
    } else {
      return ApiResponse.error('Invalid credentials');
    }
  }
}