import 'package:equatable/equatable.dart';

class ApiResponse<T> extends Equatable {
  final bool status;
  final T? data;
  final String? message;

  const ApiResponse({required this.status, this.data, this.message});

  factory ApiResponse.success(T data) =>
      ApiResponse(status: true, data: data);
  factory ApiResponse.error(String message) =>
      ApiResponse(status: false, message: message);

  @override
  List<Object?> get props => [status, data, message];
}