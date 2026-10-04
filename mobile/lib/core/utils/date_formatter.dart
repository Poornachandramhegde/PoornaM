/// Helper utilities for formatting dates and times consistent with PoornaM.
class DateFormatter {
  /// Returns today's date in YYYY-MM-DD format based on local device time.
  static String getTodayDateString([DateTime? date]) {
    final now = date ?? DateTime.now();
    final year = now.year.toString().padLeft(4, '0');
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  /// Returns user friendly greeting based on current hour.
  static String getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  /// Returns human readable header date (e.g. "Sunday, October 4").
  static String getReadableHeaderDate([DateTime? date]) {
    final now = date ?? DateTime.now();
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    final weekday = days[now.weekday - 1];
    final month = months[now.month - 1];
    return '$weekday, $month ${now.day}';
  }

  /// Formats 24h "HH:mm" time string into 12h display with AM/PM (e.g. "09:30 AM").
  static String formatTimeDisplay(String time24) {
    final parts = time24.split(':');
    if (parts.length < 2) return time24;
    final hour = int.tryParse(parts[0]) ?? 0;
    final minute = parts[1].padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    final hour12 = hour % 12 == 0 ? 12 : hour % 12;
    return '${hour12.toString().padLeft(2, '0')}:$minute $period';
  }
}
