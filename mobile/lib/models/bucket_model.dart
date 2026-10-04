class BucketItem {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String? category;
  final String? targetDate;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  BucketItem({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.category,
    this.targetDate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  bool get isCompleted => status == 'COMPLETED';

  factory BucketItem.fromJson(Map<String, dynamic> json) {
    return BucketItem(
      id: json['id'] as String,
      userId: json['userId'] as String? ?? 'default-user',
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      targetDate: json['targetDate'] as String?,
      status: json['status'] as String? ?? 'PLANNED',
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
