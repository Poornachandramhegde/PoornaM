import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('PoornaM smoke test - renders shell navigation and today view', (WidgetTester tester) async {
    await tester.pumpWidget(const PoornaMApp());

    // Navigation bar destinations
    expect(find.text('Today'), findsOneWidget);
    expect(find.text('Schedule'), findsOneWidget);
    expect(find.text('To-Do'), findsOneWidget);
    expect(find.text('Bucket'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });
}
