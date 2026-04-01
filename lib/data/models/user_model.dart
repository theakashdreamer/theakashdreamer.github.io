import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
part 'user_model.g.dart';
@JsonSerializable()
class UserModel extends Equatable {
  final int id;
  final String name;
  final String email;
  final String role;
  final String token;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  @override
  List<Object?> get props => [id, email, role];
}