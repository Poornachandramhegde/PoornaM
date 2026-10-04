import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/health_check_response.dart';

/// Result wrapper for the health check.
class HealthCheckResult {
  final bool isSuccess;
  final HealthCheckResponse? data;
  final String? errorMessage;
  final int statusCode;
  final int latencyMs;

  HealthCheckResult({
    required this.isSuccess,
    this.data,
    this.errorMessage,
    required this.statusCode,
    required this.latencyMs,
  });
}

/// Service responsible for testing backend connectivity.
class HealthService {
  final ApiClient _apiClient;

  HealthService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<HealthCheckResult> checkHealth() async {
    final stopwatch = Stopwatch()..start();
    final response = await _apiClient.get(ApiConstants.healthEndpoint);
    stopwatch.stop();

    if (response.isSuccess && response.data is Map<String, dynamic>) {
      final healthResponse = HealthCheckResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.rawBody ?? '{}',
      );
      return HealthCheckResult(
        isSuccess: true,
        data: healthResponse,
        statusCode: response.statusCode,
        latencyMs: stopwatch.elapsedMilliseconds,
      );
    }

    return HealthCheckResult(
      isSuccess: false,
      errorMessage: response.errorMessage ?? 'Unexpected backend response',
      statusCode: response.statusCode,
      latencyMs: stopwatch.elapsedMilliseconds,
    );
  }
}
