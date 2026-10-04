import 'package:flutter/material.dart';
import '../core/utils/date_formatter.dart';
import '../models/task_model.dart';
import '../services/task_service.dart';

class CreateTaskSheet extends StatefulWidget {
  final String date; // YYYY-MM-DD
  final ValueChanged<ScheduledTask> onTaskCreated;

  const CreateTaskSheet({
    super.key,
    required this.date,
    required this.onTaskCreated,
  });

  static Future<void> show(
    BuildContext context, {
    required String date,
    required ValueChanged<ScheduledTask> onTaskCreated,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateTaskSheet(
        date: date,
        onTaskCreated: onTaskCreated,
      ),
    );
  }

  @override
  State<CreateTaskSheet> createState() => _CreateTaskSheetState();
}

class _CreateTaskSheetState extends State<CreateTaskSheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _categoryController = TextEditingController();

  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 10, minute: 0);
  TaskPriority _priority = TaskPriority.medium;

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  String _formatTime(TimeOfDay time) {
    final h = time.hour.toString().padLeft(2, '0');
    final m = time.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  bool _isEndTimeValid() {
    final startMinutes = _startTime.hour * 60 + _startTime.minute;
    final endMinutes = _endTime.hour * 60 + _endTime.minute;
    return endMinutes > startMinutes;
  }

  Future<void> _selectTime({required bool isStart}) async {
    final initial = isStart ? _startTime : _endTime;
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
          // Auto-adjust end time if it became earlier than or equal to start time
          final startMinutes = _startTime.hour * 60 + _startTime.minute;
          final endMinutes = _endTime.hour * 60 + _endTime.minute;
          if (endMinutes <= startMinutes) {
            _endTime = TimeOfDay(
              hour: (_startTime.hour + 1) % 24,
              minute: _startTime.minute,
            );
          }
        } else {
          _endTime = picked;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isEndTimeValid()) {
      setState(() {
        _errorMessage = 'End time must be after start time';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final priorityString = _priority == TaskPriority.high
        ? 'HIGH'
        : _priority == TaskPriority.low
            ? 'LOW'
            : 'MEDIUM';

    final data = {
      'title': _titleController.text.trim(),
      if (_descController.text.trim().isNotEmpty)
        'description': _descController.text.trim(),
      'date': widget.date,
      'startTime': _formatTime(_startTime),
      'endTime': _formatTime(_endTime),
      'priority': priorityString,
      if (_categoryController.text.trim().isNotEmpty)
        'category': _categoryController.text.trim(),
      'status': 'TODO',
    };

    try {
      final taskService = TaskService();
      final result = await taskService.createTask(data);
      if (mounted) {
        widget.onTaskCreated(result.task);
        Navigator.of(context).pop();
        if (result.syncError != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Task saved. Calendar sync notice: ${result.syncError}'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Sheet Title
              const Text(
                'Schedule New Task',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 16),

              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red, fontSize: 13),
                  ),
                ),
              ],

              // Title input
              TextFormField(
                controller: _titleController,
                autofocus: true,
                decoration: const InputDecoration(
                  labelText: 'Task Title *',
                  hintText: 'e.g. Study Operating Systems',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.assignment_outlined),
                ),
                validator: (val) =>
                    val == null || val.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 14),

              // Description input
              TextFormField(
                controller: _descController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'Notes, chapter details, links...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.notes_outlined),
                ),
              ),
              const SizedBox(height: 14),

              // Time Selection Row
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => _selectTime(isStart: true),
                      borderRadius: BorderRadius.circular(8),
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Start Time',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.access_time),
                        ),
                        child: Text(
                          DateFormatter.formatTimeDisplay(_formatTime(_startTime)),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: () => _selectTime(isStart: false),
                      borderRadius: BorderRadius.circular(8),
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'End Time',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.access_time),
                        ),
                        child: Text(
                          DateFormatter.formatTimeDisplay(_formatTime(_endTime)),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Priority Selector
              const Text(
                'Priority',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              SegmentedButton<TaskPriority>(
                segments: const [
                  ButtonSegment(
                    value: TaskPriority.low,
                    label: Text('Low'),
                    icon: Icon(Icons.arrow_downward, size: 16),
                  ),
                  ButtonSegment(
                    value: TaskPriority.medium,
                    label: Text('Medium'),
                    icon: Icon(Icons.remove, size: 16),
                  ),
                  ButtonSegment(
                    value: TaskPriority.high,
                    label: Text('High'),
                    icon: Icon(Icons.arrow_upward, size: 16),
                  ),
                ],
                selected: {_priority},
                onSelectionChanged: (set) {
                  setState(() => _priority = set.first);
                },
              ),
              const SizedBox(height: 14),

              // Category input
              TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: 'Category (optional)',
                  hintText: 'e.g. College, Work, Personal',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.label_outline),
                ),
              ),
              const SizedBox(height: 20),

              // Submit Button
              FilledButton.icon(
                onPressed: _isSubmitting ? null : _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.add_task),
                label: Text(
                  _isSubmitting ? 'Scheduling...' : 'Add to Today',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
