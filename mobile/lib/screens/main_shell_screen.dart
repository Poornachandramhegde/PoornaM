import 'package:flutter/material.dart';
import 'today_screen.dart';
import 'placeholder_screen.dart';
import 'settings_screen.dart';

class MainShellScreen extends StatefulWidget {
  const MainShellScreen({super.key});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen> {
  int _currentIndex = 0;

  void _navigateToIndex(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      TodayScreen(
        onNavigateToSchedule: () => _navigateToIndex(1),
        onNavigateToTodos: () => _navigateToIndex(2),
        onNavigateToBucket: () => _navigateToIndex(3),
      ),
      PlaceholderScreen(
        title: 'Schedule & Calendar',
        targetPhase: 'PHASE 3',
        phaseDescription:
            'Interactive daily/weekly calendar grid, day picker, time-block scheduling, and bidirectional Google Calendar sync.',
        icon: Icons.calendar_month_outlined,
        onBackToToday: () => _navigateToIndex(0),
      ),
      PlaceholderScreen(
        title: 'To-Do List',
        targetPhase: 'PHASE 4',
        phaseDescription:
            'Manage backlog todos, due dates, priority tags, and seamlessly schedule todos into timetable slots.',
        icon: Icons.check_box_outlined,
        onBackToToday: () => _navigateToIndex(0),
      ),
      PlaceholderScreen(
        title: 'Bucket List',
        targetPhase: 'PHASE 5',
        phaseDescription:
            'Track long-term goals, aspirations, milestones, and convert goals into actionable timetable sessions.',
        icon: Icons.star_border_rounded,
        onBackToToday: () => _navigateToIndex(0),
      ),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: _navigateToIndex,
        elevation: 3,
        indicatorColor: const Color(0xFF4F46E5).withValues(alpha: 0.15),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.wb_sunny_outlined),
            selectedIcon: Icon(Icons.wb_sunny_rounded, color: Color(0xFF4F46E5)),
            label: 'Today',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month, color: Color(0xFF4F46E5)),
            label: 'Schedule',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_box_outlined),
            selectedIcon: Icon(Icons.check_box, color: Color(0xFF4F46E5)),
            label: 'To-Do',
          ),
          NavigationDestination(
            icon: Icon(Icons.star_border_rounded),
            selectedIcon: Icon(Icons.star_rounded, color: Color(0xFF4F46E5)),
            label: 'Bucket',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: Color(0xFF4F46E5)),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
