import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_flutter/core/di/injection_container.dart';
import 'package:mobile_flutter/main.dart';

void main() {
  testWidgets('Payment screen renders correctly', (WidgetTester tester) async {
    await init();
    await tester.pumpWidget(const PayCashApp());
    await tester.pumpAndSettle();

    expect(find.text('PayCash'), findsOneWidget);
    expect(find.text('Payer'), findsOneWidget);
  });
}
