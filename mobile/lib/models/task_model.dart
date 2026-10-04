enum TaskPriority { low, medium, high }

enum TaskStatus { todo, inProgress, completed, cancelled }

class ScheduledTask {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String date; // YYYY-MM-DD
  final String startTime; // HH:mm
  final String endTime; // HH:mm
  final TaskPriority priority;
  final TaskStatus status;
  final String? category;
  final String? googleEventId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  ScheduledTask({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.priority,
    required this.status,
    this.category,
    this.googleEventId,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  bool get isCompleted => status == TaskStatus.completed;

  ScheduledTask copyWith({
    String? id,
    String? userId,
    String? title,
    String? description,
    String? date,
    String? startTime,
    String? endTime,
    TaskPriority? priority,
    TaskStatus? status,
    String? category,
    String? googleEventId,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
  }) {
    return ScheduledTask(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      date: date ?? this.date,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      category: category ?? this.category,
      googleEventId: googleEventId ?? this.googleEventId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  factory ScheduledTask.fromJson(Map<String, dynamic> json) {
    TaskPriority parsePriority(String? p) {
      switch (p?.toUpperCase()) {
        case 'HIGH':
          return TaskPriority.high;
        case 'LOW':
          return TaskPriority.low;
        case 'MEDIUM':
        default:
          return TaskPriority.medium;
      }
    }

    TaskStatus parseStatus(String? s) {
      switch (s?.toUpperCase()) {
        case 'COMPLETED':
          return TaskStatus.completed;
        case 'IN_PROGRESS':
          return TaskStatus.inProgress;
        case 'CANCELLED':
          return TaskStatus.cancelled;
        case 'TODO':
        default:
          return TaskStatus.todo;
      }
    }

    return ScheduledTask(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? 'default-user',
      title: json['title'] as String,
      description: json['description'] as String?,
      date: json['date'] as String,
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      priority: parsePriority(json['priority'] as String?),
      status: parseStatus(json['status'] as String?),
      category: json['category'] as String?,
      googleEventId: json['googleEventId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    String priorityStr;
    switch (priority) {
      case TaskPriority.high:
        priorityStr = 'HIGH';
        break;
      case TaskPriority.low:
        priorityStr = 'LOW';
        break;
      case TaskPriority.medium:
        priorityStr = 'MEDIUM';
        break;
    }

    String statusStr;
    switch (status) {
      case TaskStatus.completed:
        statusStr = 'COMPLETED';
        break;
      case TaskStatus.inProgress:
        statusStr = 'IN_PROGRESS';
        break;
      case TaskStatus.cancelled:
        statusStr = 'CANCELLED';
        break;
      case TaskStatus.todo:
        statusStr = 'TODO';
        break;
    }

    return {
      'title': title,
      if (description != null) 'description': description,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'priority': priorityStr,
      'status': statusStr,
      if (category != null) 'category': category,
    };
  }
}
