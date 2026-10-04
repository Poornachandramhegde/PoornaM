class Todo {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String? dueDate;
  final String priority;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  Todo({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.dueDate,
    required this.priority,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  bool get isCompleted => status == 'COMPLETED';

  factory Todo.fromJson(Map<String, dynamic> json) {
    return Todo(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? 'default-user',
      title: json['title'] as String,
      description: json['description'] as String?,
      dueDate: json['dueDate'] as String?,
      priority: json['priority'] as String? ?? 'MEDIUM',
      status: json['status'] as String? ?? 'TODO',
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
}
