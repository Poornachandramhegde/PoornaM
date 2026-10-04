import 'package:flutter/material.dart';
import '../core/utils/date_formatter.dart';
import '../models/task_model.dart';

class TaskCard extends StatelessWidget {
  final ScheduledTask task;
  final ValueChanged<bool?> onToggle;
  final VoidCallback onDelete;

  const TaskCard({
    super.key,
    required this.task,
    required this.onToggle,
    required this.onDelete,
  });

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.high:
        return const Color(0xFFEF4444); // Red
      case TaskPriority.medium:
        return const Color(0xFFF59E0B); // Amber
      case TaskPriority.low:
        return const Color(0xFF10B981); // Emerald
    }
  }

  String _getPriorityLabel(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.high:
        return 'High';
      case TaskPriority.medium:
        return 'Med';
      case TaskPriority.low:
        return 'Low';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDone = task.isCompleted;
    final priorityColor = _getPriorityColor(task.priority);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: isDone
              ? Colors.grey.shade200
              : theme.colorScheme.outlineVariant.withValues(alpha: 0.6),
        ),
      ),
      color: isDone ? Colors.grey.shade50 : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Checkbox
            Transform.scale(
              scale: 1.1,
              child: Checkbox(
                value: isDone,
                onChanged: onToggle,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(5),
                ),
                activeColor: const Color(0xFF4F46E5),
              ),
            ),
            const SizedBox(width: 8),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Time row & Badges
                  Row(
                    children: [
                      Icon(
                        Icons.access_time_filled,
                        size: 14,
                        color: isDone ? Colors.grey : const Color(0xFF4F46E5),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${DateFormatter.formatTimeDisplay(task.startTime)} - ${DateFormatter.formatTimeDisplay(task.endTime)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDone ? Colors.grey : const Color(0xFF4F46E5),
                        ),
                      ),
                      const Spacer(),
                      // Priority Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: priorityColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _getPriorityLabel(task.priority),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: priorityColor,
                          ),
                        ),
                      ),
                      // Google Calendar Icon if synced
                      if (task.googleEventId != null) ...[
                        const SizedBox(width: 6),
                        Tooltip(
                          message: 'Synced with Google Calendar',
                          child: Icon(
                            Icons.cloud_done,
                            size: 15,
                            color: Colors.blue.shade600,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    task.title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      decoration: isDone ? TextDecoration.lineThrough : null,
                      color: isDone ? Colors.grey.shade600 : const Color(0xFF1E293B),
                    ),
                  ),

                  // Optional Description
                  if (task.description != null && task.description!.trim().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      task.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDone ? Colors.grey.shade400 : Colors.grey.shade700,
                      ),
                    ),
                  ],

                  // Category tag
                  if (task.category != null && task.category!.trim().isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '# ${task.category}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // More / Delete Action
            PopupMenuButton<String>(
              icon: Icon(Icons.more_vert, size: 20, color: Colors.grey.shade500),
              padding: EdgeInsets.zero,
              onSelected: (value) {
                if (value == 'delete') {
                  onDelete();
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete_outline, size: 18, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete Task', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
