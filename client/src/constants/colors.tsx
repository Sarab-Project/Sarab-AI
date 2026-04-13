/**
 * Sarab Ai - هوية الألوان الموحدة
 * تم تجميع كافة الدرجات المستخدمة في التصاميم لضمان سهولة التعديل المستقبلي
 */

export const Colors = {
  // الألوان الأساسية (Brand Colors)
  primary: '#b39ddb',      // البنفسجي الفاتح الأساسي للهوية
  secondary: '#9580ff',    // البنفسجي المتوسط (يستخدم في التدرجات)
  darkPurple: '#8066ff',   // البنفسجي الغامق
  
  // التدرج اللوني (Gradients)
  gradient: ['#b39ddb', '#9580ff', '#8066ff'] as const,

  // ألوان النصوص (Text Colors)
  textMain: '#333333',     // للنصوص الأساسية والعناوين داخل الشاشات البيضاء
  textSecondary: '#666666', // للنصوص الفرعية والـ Footer
  placeholder: '#cccccc',  // لنصوص التلميح داخل الحقول
  white: '#ffffff',        // للنصوص فوق الخلفيات الملونة
  
  // ألوان الحقول والأزرار (UI Elements)
  lightBg: '#f8f9ff',      // خلفية حقول الإدخال (TextInput)
  softPurple: '#f3f0ff',   // خلفية الدوائر أو الأيقونات الفرعية
  borderPurple: '#e0d7ff', // حدود العناصر أو الدوائر
  
  // ألوان شفافة (Transparent Variations)
  transparentWhite: 'rgba(255, 255, 255, 0.25)', // لزر تسجيل الدخول في الشاشة الرئيسية
  borderWhite: 'rgba(255, 255, 255, 0.4)',      // لحدود الأزرار فوق التدرج
  
  // ألوان التنبيه (Status)
  error: '#ff5252',
  success: '#4caf50',
};

// ملاحظة: يمكنك الآن استدعاء أي لون في أي ملف عبر: Colors.primary