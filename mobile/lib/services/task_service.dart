import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/task_model.dart';

class TaskResult {
  final ScheduledTask task;
  final String? syncError;

  TaskResult({required this.task, this.syncError});
}

class TaskService {
  final ApiClient _apiClient;

  TaskService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Fetches scheduled tasks with optional query filters.
  Future<List<ScheduledTask>> getTasks({
    String? date,
    String? startDate,
    String? endDate,
    String? status,
  }) async {
    final params = <String, dynamic>{
      'date': ?date,
      'startDate': ?startDate,
      'endDate': ?endDate,
      'status': ?status,
    };

    final response = await _apiClient.get(
      ApiConstants.tasksEndpoint,
      queryParameters: params,
    );

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to fetch tasks');
    }

    if (response.data is Map<String, dynamic> && response.data['data'] is List) {
      final list = response.data['data'] as List;
      return list
          .map((item) => ScheduledTask.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return [];
  }

  /// Creates a new scheduled task and automatically syncs to Google Calendar on backend.
  Future<TaskResult> createTask(Map<String, dynamic> data) async {
    final response = await _apiClient.post(
      ApiConstants.tasksEndpoint,
      body: data,
    );

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to create task');
    }

    final resData = response.data;
    if (resData is Map<String, dynamic> && resData['data'] != null) {
      final task = ScheduledTask.fromJson(resData['data'] as Map<String, dynamic>);
      final syncError = resData['syncError'] as String?;
      return TaskResult(task: task, syncError: syncError);
    }

    throw Exception('Malformed backend response');
  }

  /// Toggles task completion state between TODO and COMPLETED.
  Future<TaskResult> toggleTaskComplete(String taskId) async {
    final response = await _apiClient.patch(
      '${ApiConstants.tasksEndpoint}/$taskId/complete',
    );

    // Note: Some Express routers might define PATCH, let's also support fallback if 404 or method not allowed
    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to toggle task');
    }

    final resData = response.data;
    if (resData is Map<String, dynamic> && resData['data'] != null) {
      final task = ScheduledTask.fromJson(resData['data'] as Map<String, dynamic>);
      final syncError = resData['syncError'] as String?;
      return TaskResult(task: task, syncError: syncError);
    }

    throw Exception('Malformed backend response');
  }

  /// Updates a task.
  Future<TaskResult> updateTask(String id, Map<String, dynamic> data) async {
    final response = await _apiClient.put(
      '${ApiConstants.tasksEndpoint}/$id',
      body: data,
    );

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to update task');
    }

    final resData = response.data;
    if (resData is Map<String, dynamic> && resData['data'] != null) {
      final task = ScheduledTask.fromJson(resData['data'] as Map<String, dynamic>);
      final syncError = resData['syncError'] as String?;
      return TaskResult(task: task, syncError: syncError);
    }

    throw Exception('Malformed backend response');
  }

  /// Deletes a task.
  Future<void> deleteTask(String id) async {
    final response = await _apiClient.delete(
      '${ApiConstants.tasksEndpoint}/$id',
    );

    if (!response.isSuccess) {
      throw Exception(response.errorMessage ?? 'Failed to delete task');
    }
  }
}
