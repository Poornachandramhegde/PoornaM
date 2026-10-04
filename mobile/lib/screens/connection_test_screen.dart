import 'package:flutter/material.dart';
import '../core/config/app_config.dart';
import '../services/health_service.dart';

class ConnectionTestScreen extends StatefulWidget {
  const ConnectionTestScreen({super.key});

  @override
  State<ConnectionTestScreen> createState() => _ConnectionTestScreenState();
}

class _ConnectionTestScreenState extends State<ConnectionTestScreen> {
  final HealthService _healthService = HealthService();
  late final TextEditingController _urlController;

  bool _isLoading = false;
  HealthCheckResult? _lastResult;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: AppConfig.baseUrl);
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _updateUrl(String newUrl) {
    setState(() {
      _urlController.text = newUrl;
      AppConfig.setBaseUrl(newUrl);
    });
  }

  Future<void> _testConnection() async {
    // Commit any typed changes in the URL controller
    AppConfig.setBaseUrl(_urlController.text);

    setState(() {
      _isLoading = true;
      _lastResult = null;
    });

    final result = await _healthService.checkHealth();

    if (mounted) {
      setState(() {
        _isLoading = false;
        _lastResult = result;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('PoornaM Mobile'),
        centerTitle: true,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Info Card
            Card(
              elevation: 0,
              color: theme.colorScheme.primaryContainer.withValues(alpha: 0.35),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(
                  color: theme.colorScheme.primary.withValues(alpha: 0.2),
                ),
              ),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Connectivity Diagnostic Tool',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'This screen verifies network connectivity between PoornaM Mobile and the Express backend (/api/health).',
                      style: TextStyle(fontSize: 13, color: Colors.black87),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Base URL Configuration Section
            const Text(
              'Backend Base URL',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
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
                      SnackBar(
                        content: Text('Base URL set to: ${AppConfig.baseUrl}'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                ),
                hintText: 'http://10.0.2.2:5000',
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 10),

            // Quick Preset Buttons
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.devices, size: 16),
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
            const SizedBox(height: 24),

            // Test Button
            FilledButton.icon(
              onPressed: _isLoading ? null : _testConnection,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              icon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.sync),
              label: Text(
                _isLoading ? 'Checking connection...' : 'Test Backend Connection',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(height: 24),

            // Result Display
            if (_lastResult != null) _buildResultCard(_lastResult!),

            const SizedBox(height: 24),
            // Physical Device Tip Card
            Card(
              elevation: 0,
              color: Colors.amber.withValues(alpha: 0.12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.amber.shade400),
              ),
              child: const Padding(
                padding: EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.lightbulb_outline, color: Colors.amber, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Physical Device via USB',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text(
                      'If testing on your connected physical phone via USB, run this command in terminal to forward port 5000:\n\nadb reverse tcp:5000 tcp:5000',
                      style: TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(HealthCheckResult result) {
    final isSuccess = result.isSuccess;
    final color = isSuccess ? Colors.green : Colors.red;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: color, width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isSuccess ? Icons.check_circle : Icons.error,
                  color: color,
                  size: 28,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isSuccess ? 'CONNECTION SUCCESSFUL' : 'CONNECTION FAILED',
                        style: TextStyle(
                          color: color,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        'Status Code: ${result.statusCode} • Latency: ${result.latencyMs}ms',
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            if (isSuccess && result.data != null) ...[
              const Text(
                'Backend Response:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _infoRow('App Name', result.data!.appName),
                    _infoRow('Status', result.data!.status),
                    _infoRow('Server Time', result.data!.time),
                    const SizedBox(height: 6),
                    const Text(
                      'Raw JSON:',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                    ),
                    SelectableText(
                      result.data!.rawJson,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
                    ),
                  ],
                ),
              ),
            ] else ...[
              const Text(
                'Error Details:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.red),
              ),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: SelectableText(
                  result.errorMessage ?? 'Unknown error occurred.',
                  style: const TextStyle(fontSize: 12, color: Colors.redAccent),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              '$label:',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
