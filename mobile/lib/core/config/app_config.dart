/// Configuration management for PoornaM Mobile client.
/// Allows setting and switching base URLs between Android emulator,
/// physical devices (via adb reverse or LAN IP), and production.
class AppConfig {
  static const String emulatorBaseUrl = 'http://10.0.2.2:5000';
  static const String adbReverseBaseUrl = 'http://127.0.0.1:5000';

  // Can be injected at build time with --dart-define=API_BASE_URL=https://...
  static const String _defaultEnvUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: adbReverseBaseUrl,
  );

  static String _baseUrl = _defaultEnvUrl;

  /// Returns the current active base URL without trailing slash.
  static String get baseUrl => _baseUrl;

  /// Sets the active base URL dynamically at runtime.
  static void setBaseUrl(String url) {
    var cleaned = url.trim();
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    _baseUrl = cleaned;
  }
}
