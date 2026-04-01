import 'package:equatable/equatable.dart';
import '../../data/models/user_model.dart';

class UserEntity extends Equatable {
  final int id;
  final String name;
  final String email;
  final String role;
  final String token;

  const UserEntity({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.token,
  });

  factory UserEntity.fromModel(UserModel model) {
    return UserEntity(
      id: model.id,
      name: model.name,
      email: model.email,
      role: model.role,
      token: model.token,
    );
  }

  @override
  List<Object?> get props => [id, email, role];
}