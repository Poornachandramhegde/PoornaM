import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

/// Represents a standardized response from the PoornaM API.
class ApiResponse {
  final int statusCode;
  final bool isSuccess;
  final dynamic data;
  final String? rawBody;
  final String? errorMessage;

  ApiResponse({
    required this.statusCode,
    required this.isSuccess,
    this.data,
    this.rawBody,
    this.errorMessage,
  });
}

/// Simple, robust HTTP client for interacting with the PoornaM Express backend.
class ApiClient {
  final http.Client _httpClient;
  final Duration timeoutDuration;

  ApiClient({
    http.Client? httpClient,
    this.timeoutDuration = const Duration(seconds: 10),
  }) : _httpClient = httpClient ?? http.Client();

  /// Builds the complete URI using the configured baseUrl and provided path.
  Uri _buildUri(String path, [Map<String, dynamic>? queryParameters]) {
    final base = AppConfig.baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$base$normalizedPath';

    if (queryParameters != null && queryParameters.isNotEmpty) {
      final stringParams = queryParameters.map(
        (key, value) => MapEntry(key, value.toString()),
      );
      return Uri.parse(fullUrl).replace(queryParameters: stringParams);
    }

    return Uri.parse(fullUrl);
  }

  Map<String, String> _defaultHeaders([Map<String, String>? headers]) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...?headers,
    };
  }

  ApiResponse _processResponse(http.Response response) {
    final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
    dynamic parsedData;
    String? error;

    if (response.body.isNotEmpty) {
      try {
        parsedData = jsonDecode(response.body);
      } catch (_) {
        parsedData = null;
      }
    }

    if (!isSuccess) {
      if (parsedData is Map<String, dynamic> && parsedData.containsKey('error')) {
        error = parsedData['error'].toString();
      } else {
        error = 'HTTP ${response.statusCode}: ${response.reasonPhrase ?? 'Request failed'}';
      }
    }

    return ApiResponse(
      statusCode: response.statusCode,
      isSuccess: isSuccess,
      data: parsedData,
      rawBody: response.body,
      errorMessage: error,
    );
  }

  ApiResponse _handleError(dynamic error) {
    if (error is SocketException) {
      return ApiResponse(
        statusCode: 0,
        isSuccess: false,
        errorMessage: 'Network error: Cannot reach server at ${AppConfig.baseUrl}. Check connection or adb reverse.',
      );
    } else if (error is TimeoutException) {
      return ApiResponse(
        statusCode: 408,
        isSuccess: false,
        errorMessage: 'Connection timed out after ${timeoutDuration.inSeconds} seconds.',
      );
    }
    return ApiResponse(
      statusCode: 0,
      isSuccess: false,
      errorMessage: 'Unexpected error: $error',
    );
  }

  /// Sends a GET request.
  Future<ApiResponse> get(
    String path, {
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await _httpClient
          .get(uri, headers: _defaultHeaders(headers))
          .timeout(timeoutDuration);
      return _processResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  /// Sends a POST request with JSON encoded body.
  Future<ApiResponse> post(
    String path, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    try {
      final uri = _buildUri(path);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _httpClient
          .post(uri, headers: _defaultHeaders(headers), body: encodedBody)
          .timeout(timeoutDuration);
      return _processResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  /// Sends a PUT request with JSON encoded body.
  Future<ApiResponse> put(
    String path, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    try {
      final uri = _buildUri(path);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _httpClient
          .put(uri, headers: _defaultHeaders(headers), body: encodedBody)
          .timeout(timeoutDuration);
      return _processResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  /// Sends a PATCH request with JSON encoded body.
  Future<ApiResponse> patch(
    String path, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    try {
      final uri = _buildUri(path);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _httpClient
          .patch(uri, headers: _defaultHeaders(headers), body: encodedBody)
          .timeout(timeoutDuration);
      return _processResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  /// Sends a DELETE request.
  Future<ApiResponse> delete(
    String path, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _httpClient
          .delete(uri, headers: _defaultHeaders(headers))
          .timeout(timeoutDuration);
      return _processResponse(response);
    } catch (e) {
      return _handleError(e);
    }
  }

  void close() {
    _httpClient.close();
  }
}
