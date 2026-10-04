import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/todo_model.dart';

class TodoService {
  final ApiClient _apiClient;

  TodoService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<Todo>> getTodos({String? status}) async {
    final params = <String, dynamic>{
      'status': ?status,
    };

    final response = await _apiClient.get(
      ApiConstants.todosEndpoint,
      queryParameters: params,
    );

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to fetch todos');
    }

    if (response.data is Map<String, dynamic> && response.data['data'] is List) {
      final list = response.data['data'] as List;
      return list
          .map((item) => Todo.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return [];
  }
}
