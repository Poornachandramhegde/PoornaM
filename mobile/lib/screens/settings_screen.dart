import 'package:flutter/material.dart';
import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../services/health_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final HealthService _healthService = HealthService();
  final ApiClient _apiClient = ApiClient();
  late final TextEditingController _urlController;

  bool _isTesting = false;
  HealthCheckResult? _healthResult;

  bool _isLoadingGoogle = false;
  Map<String, dynamic>? _googleStatus;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: AppConfig.baseUrl);
    _fetchGoogleStatus();
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _fetchGoogleStatus() async {
    setState(() => _isLoadingGoogle = true);
    try {
      final res = await _apiClient.get('${ApiConstants.googleEndpoint}/status');
      if (mounted && res.isSuccess && res.data is Map<String, dynamic>) {
        setState(() {
          _googleStatus = res.data['data'] as Map<String, dynamic>?;
          _isLoadingGoogle = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingGoogle = false);
    }
  }

  void _updateUrl(String newUrl) {
    setState(() {
      _urlController.text = newUrl;
      AppConfig.setBaseUrl(newUrl);
    });
  }

  Future<void> _testConnection() async {
    AppConfig.setBaseUrl(_urlController.text);
    setState(() {
      _isTesting = true;
      _healthResult = null;
    });

    final res = await _healthService.checkHealth();
    if (mounted) {
      setState(() {
        _isTesting = false;
        _healthResult = res;
      });
      _fetchGoogleStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isGoogleConnected = _googleStatus?['connected'] == true;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Settings & Diagnostics', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Google Calendar status card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isGoogleConnected
                              ? Colors.green.withValues(alpha: 0.1)
                              : Colors.grey.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.calendar_today,
                          color: isGoogleConnected ? Colors.green : Colors.grey,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Google Calendar Sync',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              isGoogleConnected
                                  ? 'Connected (${_googleStatus?['email'] ?? 'synced'})'
                                  : 'Not connected (managed via web settings)',
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                      if (_isLoadingGoogle)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      else
                        Icon(
                          isGoogleConnected ? Icons.check_circle : Icons.info_outline,
                          color: isGoogleConnected ? Colors.green : Colors.grey,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // API Base URL card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Backend API Endpoint',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'PoornaM Express server runs on port 5000.',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _urlController,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.link),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.check),
                        tooltip: 'Apply URL',
                        onPressed: () {
                          AppConfig.setBaseUrl(_urlController.text);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Base URL set to: ${AppConfig.baseUrl}')),
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.usb, size: 16),
                        label: const Text('ADB Reverse (127.0.0.1:5000)'),
                        onPressed: () => _updateUrl(AppConfig.adbReverseBaseUrl),
                      ),
                      ActionChip(
                        avatar: const Icon(Icons.android, size: 16),
                        label: const Text('Emulator (10.0.2.2:5000)'),
                        onPressed: () => _updateUrl(AppConfig.emulatorBaseUrl),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _isTesting ? null : _testConnection,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: _isTesting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.network_check),
                    label: Text(_isTesting ? 'Testing...' : 'Test Connection (/api/health)'),
                  ),
                  if (_healthResult != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _healthResult!.isSuccess ? Colors.green.shade50 : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _healthResult!.isSuccess ? Colors.green.shade200 : Colors.red.shade200,
                        ),
                      ),
                      child: Text(
                        _healthResult!.isSuccess
                            ? 'Connection OK • Latency: ${_healthResult!.latencyMs}ms'
                            : 'Connection Failed: ${_healthResult!.errorMessage}',
                        style: TextStyle(
                          fontSize: 12,
                          color: _healthResult!.isSuccess ? Colors.green.shade900 : Colors.red.shade900,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // About Card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'About PoornaM Mobile',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Version: 1.0.0 (Phase 2 - Shell & Today)\nClient: Flutter Material 3\nBackend: Node.js Express + SQLite + Prisma',
                    style: TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.5),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
