import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class GetStoredUserUseCase {
  final AuthRepository _repository;
  GetStoredUserUseCase(this._repository);

  Future<UserEntity?> call() {
    return _repository.getStoredUser();
  }
}