/// Model representing the response from GET /api/health.
class HealthCheckResponse {
  final String status;
  final String appName;
  final String time;
  final String rawJson;

  HealthCheckResponse({
    required this.status,
    required this.appName,
    required this.time,
    required this.rawJson,
  });

  factory HealthCheckResponse.fromJson(Map<String, dynamic> json, String rawJson) {
    return HealthCheckResponse(
      status: json['status']?.toString() ?? 'unknown',
      appName: json['appName']?.toString() ?? 'unknown',
      time: json['time']?.toString() ?? '',
      rawJson: rawJson,
    );
  }
}
