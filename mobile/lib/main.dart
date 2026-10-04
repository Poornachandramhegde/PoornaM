import 'package:flutter/material.dart';
import 'screens/main_shell_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PoornaMApp());
}

class PoornaMApp extends StatelessWidget {
  const PoornaMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PoornaM',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5), // Indigo primary
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
        ),
      ),
      home: const MainShellScreen(),
    );
  }
}
