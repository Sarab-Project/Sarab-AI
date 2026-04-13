// constants/theme.tsx

// ألوان الوضع الفاتح (الأصلي الخاص بك مع تحسينات بسيطة)
export const LightTheme = {
  primary: '#b39ddb',
  placeholder: '#ccc',
  bgLight: '#f3f0ff',
  inputBg: '#f8f9ff',
  white: '#ffffff',
  danger: '#ff4d4d',
  text: '#333333',
  background: '#ffffff', // خلفية الشاشة الأساسية
  card: '#fcfaff',      // خلفية الكروت
};

// ألوان الوضع الداكن (النسخة الفاتحة والمريحة)
export const DarkTheme = {
  primary: '#b39ddb',    
  placeholder: '#9e9e9e', // رمادي أوضح قليلاً
  bgLight: '#42424b',    // رمادي متوسط للعناصر الثانوية
  inputBg: '#37373f',    // رمادي هادئ للحقول
  white: '#ffffff',      
  danger: '#ff5252',
  text: '#ffffff',       // نص أبيض ناصع ليبرز فوق الرمادي
  background: '#2c2c34', // اللون الأساسي: رمادي "فحمي فاتح" مريح جداً
  card: '#3d3d45',       // الكروت: رمادي فاتح ليعطي تباين جميل مع الخلفية
};
/**
 * ملاحظة: لتجنب كسر الكود الحالي في ملفاتك، 
 * سنقوم بتصدير Colors ككائن افتراضي (Default).
 * ولكن مستقبلاً سنعتمد على الاختيار الديناميكي من الـ Store.
 */
export const Colors = LightTheme;