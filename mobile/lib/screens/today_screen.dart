import 'package:flutter/material.dart';
import '../core/utils/date_formatter.dart';
import '../models/task_model.dart';
import '../services/task_service.dart';
import '../services/todo_service.dart';
import '../services/bucket_service.dart';
import '../widgets/today_progress_card.dart';
import '../widgets/task_card.dart';
import '../widgets/create_task_sheet.dart';

class TodayScreen extends StatefulWidget {
  final VoidCallback onNavigateToSchedule;
  final VoidCallback onNavigateToTodos;
  final VoidCallback onNavigateToBucket;

  const TodayScreen({
    super.key,
    required this.onNavigateToSchedule,
    required this.onNavigateToTodos,
    required this.onNavigateToBucket,
  });

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  final TaskService _taskService = TaskService();
  final TodoService _todoService = TodoService();
  final BucketService _bucketService = BucketService();

  List<ScheduledTask> _todayTasks = [];
  int _pendingTodosCount = 0;
  int _activeBucketCount = 0;

  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final todayStr = DateFormatter.getTodayDateString();

    try {
      final results = await Future.wait([
        _taskService.getTasks(date: todayStr),
        _todoService.getTodos(status: 'TODO'),
        _bucketService.getBucketItems(),
      ]);

      if (mounted) {
        final tasks = results[0] as List<ScheduledTask>;
        final todos = results[1] as List;
        final buckets = results[2] as List;

        // Sort tasks by startTime ascending
        tasks.sort((a, b) => a.startTime.compareTo(b.startTime));

        setState(() {
          _todayTasks = tasks;
          _pendingTodosCount = todos.length;
          _activeBucketCount = buckets.where((b) => (b as dynamic).status != 'COMPLETED').length;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleToggleTask(ScheduledTask task) async {
    // Optimistic UI update
    final originalTasks = List<ScheduledTask>.from(_todayTasks);
    final targetIndex = _todayTasks.indexWhere((t) => t.id == task.id);
    if (targetIndex != -1) {
      setState(() {
        final newStatus = task.isCompleted ? TaskStatus.todo : TaskStatus.completed;
        _todayTasks[targetIndex] = task.copyWith(status: newStatus);
      });
    }

    try {
      final result = await _taskService.toggleTaskComplete(task.id);
      if (mounted) {
        setState(() {
          final idx = _todayTasks.indexWhere((t) => t.id == task.id);
          if (idx != -1) {
            _todayTasks[idx] = result.task;
          }
        });
      }
    } catch (e) {
      // Revert if error
      if (mounted) {
        setState(() {
          _todayTasks = originalTasks;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update task: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleDeleteTask(ScheduledTask task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Task'),
        content: Text('Are you sure you want to delete "${task.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _taskService.deleteTask(task.id);
        setState(() {
          _todayTasks.removeWhere((t) => t.id == task.id);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Task deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete task: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _openCreateTaskSheet() {
    CreateTaskSheet.show(
      context,
      date: DateFormatter.getTodayDateString(),
      onTaskCreated: (newTask) {
        setState(() {
          _todayTasks.add(newTask);
          _todayTasks.sort((a, b) => a.startTime.compareTo(b.startTime));
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Scheduled "${newTask.title}" for Today'),
            backgroundColor: const Color(0xFF4F46E5),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = _todayTasks.where((t) => t.isCompleted).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50 background
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.wb_sunny_rounded, color: Color(0xFF4F46E5), size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  DateFormatter.getGreeting(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                Text(
                  DateFormatter.getReadableHeaderDate(),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _loadData,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateTaskSheet,
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: const Color(0xFF4F46E5),
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
              )
            : _errorMessage != null
                ? _buildErrorView()
                : ListView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                    children: [
                      // Progress Summary Card
                      TodayProgressCard(
                        totalTasks: _todayTasks.length,
                        completedTasks: completedCount,
                      ),
                      const SizedBox(height: 16),

                      // At-A-Glance Quick Stats
                      Row(
                        children: [
                          Expanded(
                            child: _glanceCard(
                              title: 'To-Do List',
                              subtitle: '$_pendingTodosCount pending',
                              icon: Icons.check_box_outlined,
                              color: const Color(0xFF0284C7),
                              onTap: widget.onNavigateToTodos,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _glanceCard(
                              title: 'Bucket List',
                              subtitle: '$_activeBucketCount active',
                              icon: Icons.star_border_rounded,
                              color: const Color(0xFF8B5CF6),
                              onTap: widget.onNavigateToBucket,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Section Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Today's Timeline",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          TextButton.icon(
                            onPressed: widget.onNavigateToSchedule,
                            icon: const Icon(Icons.calendar_month, size: 16),
                            label: const Text('Full Schedule'),
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF4F46E5),
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Task List or Empty State
                      if (_todayTasks.isEmpty)
                        _buildEmptyState()
                      else
                        ..._todayTasks.map(
                          (task) => TaskCard(
                            key: ValueKey(task.id),
                            task: task,
                            onToggle: (_) => _handleToggleTask(task),
                            onDelete: () => _handleDeleteTask(task),
                          ),
                        ),
                    ],
                  ),
      ),
    );
  }

  Widget _glanceCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 18, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF4F46E5).withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.event_available,
              size: 40,
              color: Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No tasks scheduled for today',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Plan your day and stay productive by scheduling your first task.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _openCreateTaskSheet,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF4F46E5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Schedule a Task'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cloud_off, size: 48, color: Colors.red),
            ),
            const SizedBox(height: 16),
            const Text(
              'Cannot reach PoornaM backend',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Network request failed',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: const Text(
                'Tip: If testing on a physical Android device via USB, ensure port 5000 is forwarded:\n"adb reverse tcp:5000 tcp:5000"',
                style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: _loadData,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
              ),
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
