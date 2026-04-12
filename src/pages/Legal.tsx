import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Shield, FileText, MapPin, Scale } from 'lucide-react';

type Section = 'privacy' | 'terms' | 'location' | 'licenses';

const Legal = () => {
  const { lang, appName } = useLanguage();
  const [searchParams] = useSearchParams();
  const Back = lang === 'ar' ? ChevronRight : ChevronLeft;
  const initialSection = (searchParams.get('section') as Section) || 'privacy';
  const [active, setActive] = useState<Section>(initialSection);

  const tabs: { key: Section; icon: React.ReactNode; label: { en: string; ar: string } }[] = [
    { key: 'privacy', icon: <Shield className="w-4 h-4" />, label: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' } },
    { key: 'terms', icon: <FileText className="w-4 h-4" />, label: { en: 'Terms of Service', ar: 'شروط الخدمة' } },
    { key: 'location', icon: <MapPin className="w-4 h-4" />, label: { en: 'Location Usage', ar: 'استخدام الموقع' } },
    { key: 'licenses', icon: <Scale className="w-4 h-4" />, label: { en: 'Licenses', ar: 'التراخيص' } },
  ];

  const lastUpdated = '2026-04-12';

  const content: Record<Section, { en: React.ReactNode; ar: React.ReactNode }> = {
    privacy: {
      en: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">1. Information We Collect</h3>
          <p>We collect information you provide directly: name, email address, phone number, and profile photo. We also collect usage data including ride history, booking preferences, and app interaction patterns.</p>
          <h3 className="text-base font-semibold text-foreground">2. Location Data</h3>
          <p>{appName} collects precise location data to provide core ride services: matching you with nearby shuttles, real-time ride tracking, and navigation. Location is collected when the app is in use and, for drivers, in the background during active trips. See the Location Usage section for full details.</p>
          <h3 className="text-base font-semibold text-foreground">3. How We Use Your Information</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide, maintain, and improve our shuttle services</li>
            <li>Process bookings, payments, and refunds</li>
            <li>Send ride confirmations, updates, and safety notifications</li>
            <li>Verify driver and carpool participant identities</li>
            <li>Respond to customer support requests</li>
            <li>Ensure safety and prevent fraud</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">4. Data Sharing</h3>
          <p>We share limited data with: drivers (your name and pickup location for active rides), payment processors, cloud infrastructure providers (Supabase), and map services (Google Maps). We do not sell your personal data to third parties.</p>
          <h3 className="text-base font-semibold text-foreground">5. Data Retention</h3>
          <p>Account data is retained while your account is active. Ride history is kept for 2 years for service improvement and dispute resolution. You may request deletion of your account and associated data at any time.</p>
          <h3 className="text-base font-semibold text-foreground">6. Data Security</h3>
          <p>We use industry-standard encryption (TLS/SSL) for data in transit and at rest. Access to user data is restricted to authorized personnel only.</p>
          <h3 className="text-base font-semibold text-foreground">7. Your Rights</h3>
          <p>You have the right to access, correct, or delete your personal data. You can export your data or withdraw consent for optional processing at any time through the app settings or by contacting us.</p>
          <h3 className="text-base font-semibold text-foreground">8. Children's Privacy</h3>
          <p>{appName} is not intended for children under 16. We do not knowingly collect personal information from children.</p>
          <h3 className="text-base font-semibold text-foreground">9. Contact</h3>
          <p>For privacy inquiries, contact us at privacy@{appName.toLowerCase()}.app</p>
        </div>
      ),
      ar: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">آخر تحديث: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">1. المعلومات التي نجمعها</h3>
          <p>نجمع المعلومات التي تقدمها مباشرة: الاسم، البريد الإلكتروني، رقم الهاتف، وصورة الملف الشخصي. كما نجمع بيانات الاستخدام بما في ذلك سجل الرحلات وتفضيلات الحجز.</p>
          <h3 className="text-base font-semibold text-foreground">2. بيانات الموقع</h3>
          <p>يجمع {appName} بيانات الموقع الدقيقة لتقديم خدمات النقل الأساسية: مطابقتك مع الحافلات القريبة، تتبع الرحلة في الوقت الفعلي، والملاحة. يتم جمع الموقع عند استخدام التطبيق، وللسائقين، في الخلفية أثناء الرحلات النشطة.</p>
          <h3 className="text-base font-semibold text-foreground">3. كيف نستخدم معلوماتك</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>تقديم خدمات النقل وصيانتها وتحسينها</li>
            <li>معالجة الحجوزات والمدفوعات والمبالغ المستردة</li>
            <li>إرسال تأكيدات الرحلات والتحديثات وإشعارات السلامة</li>
            <li>التحقق من هوية السائقين والمشاركين في مشاركة السيارات</li>
            <li>الرد على طلبات دعم العملاء</li>
            <li>ضمان السلامة ومنع الاحتيال</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">4. مشاركة البيانات</h3>
          <p>نشارك بيانات محدودة مع: السائقين (اسمك وموقع الالتقاط للرحلات النشطة)، معالجي الدفع، مزودي البنية التحتية السحابية (Supabase)، وخدمات الخرائط (Google Maps). لا نبيع بياناتك الشخصية لأطراف ثالثة.</p>
          <h3 className="text-base font-semibold text-foreground">5. الاحتفاظ بالبيانات</h3>
          <p>يتم الاحتفاظ ببيانات الحساب طالما حسابك نشط. يتم الاحتفاظ بسجل الرحلات لمدة عامين لتحسين الخدمة وحل النزاعات. يمكنك طلب حذف حسابك والبيانات المرتبطة به في أي وقت.</p>
          <h3 className="text-base font-semibold text-foreground">6. أمان البيانات</h3>
          <p>نستخدم تشفيرًا متوافقًا مع معايير الصناعة (TLS/SSL) للبيانات أثناء النقل وفي حالة الراحة.</p>
          <h3 className="text-base font-semibold text-foreground">7. حقوقك</h3>
          <p>لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها. يمكنك تصدير بياناتك أو سحب الموافقة على المعالجة الاختيارية في أي وقت.</p>
          <h3 className="text-base font-semibold text-foreground">8. خصوصية الأطفال</h3>
          <p>{appName} غير مخصص للأطفال دون سن 16 عامًا. لا نجمع عن قصد معلومات شخصية من الأطفال.</p>
          <h3 className="text-base font-semibold text-foreground">9. التواصل</h3>
          <p>للاستفسارات المتعلقة بالخصوصية، تواصل معنا على privacy@{appName.toLowerCase()}.app</p>
        </div>
      ),
    },
    terms: {
      en: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h3>
          <p>By downloading, installing, or using {appName}, you agree to be bound by these Terms of Service. If you do not agree, do not use the app.</p>
          <h3 className="text-base font-semibold text-foreground">2. Service Description</h3>
          <p>{appName} is a shared shuttle booking platform connecting riders with shuttle drivers along predefined routes in Egypt. We also facilitate carpooling between verified users.</p>
          <h3 className="text-base font-semibold text-foreground">3. User Accounts</h3>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. One account per person; accounts are non-transferable.</p>
          <h3 className="text-base font-semibold text-foreground">4. Booking & Payments</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Prices are displayed before booking confirmation</li>
            <li>Payments are processed via InstaPay or wallet balance</li>
            <li>Bundle/package purchases are non-refundable once rides are used</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">5. Cancellation & Refund Policy</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Cancellation 24+ hours before departure:</strong> 50% refund issued to your wallet</li>
            <li><strong>Cancellation within 24 hours of departure:</strong> No refund is issued</li>
            <li><strong>Driver no-show (30+ min late):</strong> Full refund issued automatically</li>
            <li><strong>Skipped by driver (no-show at pickup):</strong> 50% refund</li>
            <li>All refunds are credited to your in-app wallet and reviewed by our team</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">6. Platform Commission</h3>
          <p>{appName} charges a <strong>10% service fee</strong> on every completed ride. This fee is automatically calculated and deducted from the ride fare. For cash payments, drivers are responsible for remitting the platform's commission.</p>
          <h3 className="text-base font-semibold text-foreground">7. Driver Financial Obligations</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Drivers must remit the platform's 10% commission for all cash-paid rides</li>
            <li>Cash commissions must be settled <strong>by the end of each calendar month</strong> via InstaPay transfer</li>
            <li>A detailed statement of owed amounts is available in the driver dashboard</li>
            <li>Failure to settle outstanding amounts within <strong>15 days past the due date</strong> will result in:
              <ul className="list-disc list-inside ms-4 mt-1 space-y-1">
                <li>Immediate suspension of the driver account</li>
                <li>A formal demand letter sent to the registered address</li>
                <li>Referral to legal counsel for debt recovery under Egyptian Commercial Law</li>
                <li>Filing of a civil lawsuit for recovery of owed amounts plus legal fees and interest</li>
                <li>Reporting to relevant authorities if amounts constitute criminal breach of trust under Egyptian Penal Code (Article 341)</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">8. Partner Program</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Companies and transport group operators may apply to become {appName} Partners</li>
            <li>Partners receive a unique referral link to share with their existing clients and drivers</li>
            <li>Partners earn a configurable percentage of each ride booked by their referred users</li>
            <li>Partner commissions are calculated automatically and paid monthly</li>
            <li>Partners can submit route requests for admin approval</li>
            <li>Partner accounts may be suspended for violations of these terms or fraudulent referral activity</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">9. User Conduct</h3>
          <p>Users must not: use the service for illegal purposes, harass drivers or other passengers, provide false identity documents, attempt to manipulate the booking system, or interfere with the app's operation.</p>
          <h3 className="text-base font-semibold text-foreground">10. Driver Requirements</h3>
          <p>Drivers must maintain valid licenses, vehicle registration, and insurance. Vehicles must pass safety inspections. {appName} reserves the right to deactivate driver accounts for safety violations.</p>
          <h3 className="text-base font-semibold text-foreground">11. Limitation of Liability</h3>
          <p>{appName} acts as a platform connecting riders and drivers. We are not a transportation company. While we verify drivers and vehicles, we are not liable for incidents during rides beyond what is required by applicable Egyptian law.</p>
          <h3 className="text-base font-semibold text-foreground">12. Intellectual Property</h3>
          <p>All content, trademarks, and technology in {appName} are owned by or licensed to us. You may not copy, modify, or distribute any part of the app without written permission.</p>
          <h3 className="text-base font-semibold text-foreground">13. Termination</h3>
          <p>We may suspend or terminate your account for violations of these terms. You may delete your account at any time through the app.</p>
          <h3 className="text-base font-semibold text-foreground">14. Governing Law</h3>
          <p>These terms are governed by the laws of the Arab Republic of Egypt. Disputes shall be resolved in Egyptian courts.</p>
        </div>
      ),
      ar: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">آخر تحديث: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">1. قبول الشروط</h3>
          <p>بتنزيل أو تثبيت أو استخدام {appName}، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا لم توافق، لا تستخدم التطبيق.</p>
          <h3 className="text-base font-semibold text-foreground">2. وصف الخدمة</h3>
          <p>{appName} هو منصة حجز حافلات مشتركة تربط الركاب بسائقي الحافلات على مسارات محددة مسبقًا في مصر. كما نسهل مشاركة السيارات بين المستخدمين المتحقق منهم.</p>
          <h3 className="text-base font-semibold text-foreground">3. حسابات المستخدمين</h3>
          <p>يجب عليك تقديم معلومات دقيقة عند إنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات الاعتماد الخاصة بك. حساب واحد لكل شخص.</p>
          <h3 className="text-base font-semibold text-foreground">4. الحجز والمدفوعات</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>يتم عرض الأسعار قبل تأكيد الحجز</li>
            <li>تتم معالجة المدفوعات عبر InstaPay أو رصيد المحفظة</li>
            <li>مشتريات الباقات غير قابلة للاسترداد بمجرد استخدام الرحلات</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">5. سياسة الإلغاء والاسترداد</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>الإلغاء قبل 24+ ساعة من الموعد:</strong> استرداد 50% إلى محفظتك</li>
            <li><strong>الإلغاء خلال 24 ساعة من الموعد:</strong> لا يتم إصدار استرداد</li>
            <li><strong>عدم حضور السائق (تأخر 30+ دقيقة):</strong> استرداد كامل تلقائيًا</li>
            <li><strong>تم تخطيك من السائق (عدم الحضور):</strong> استرداد 50%</li>
            <li>جميع المبالغ المستردة تُضاف إلى محفظتك داخل التطبيق ويتم مراجعتها من فريقنا</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">6. عمولة المنصة</h3>
          <p>تفرض {appName} <strong>رسوم خدمة 10%</strong> على كل رحلة مكتملة. يتم احتساب هذه الرسوم تلقائيًا وخصمها من أجرة الرحلة. بالنسبة للمدفوعات النقدية، يتحمل السائق مسؤولية تحويل عمولة المنصة.</p>
          <h3 className="text-base font-semibold text-foreground">7. الالتزامات المالية للسائق</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>يجب على السائقين تحويل عمولة المنصة (10%) عن جميع الرحلات النقدية</li>
            <li>يجب تسوية العمولات النقدية <strong>بحلول نهاية كل شهر ميلادي</strong> عبر تحويل InstaPay</li>
            <li>كشف تفصيلي بالمبالغ المستحقة متاح في لوحة تحكم السائق</li>
            <li>عدم التسوية خلال <strong>15 يومًا بعد تاريخ الاستحقاق</strong> سيؤدي إلى:
              <ul className="list-disc list-inside ms-4 mt-1 space-y-1">
                <li>تعليق فوري لحساب السائق</li>
                <li>إرسال إنذار رسمي للعنوان المسجل</li>
                <li>إحالة للمستشار القانوني لاسترداد الديون بموجب القانون التجاري المصري</li>
                <li>رفع دعوى مدنية لاسترداد المبالغ المستحقة بالإضافة إلى الرسوم القانونية والفوائد</li>
                <li>الإبلاغ للجهات المختصة إذا كانت المبالغ تشكل جريمة خيانة أمانة بموجب قانون العقوبات المصري (المادة 341)</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">8. برنامج الشراكة</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>يمكن للشركات ومشغلي مجموعات النقل التقدم ليصبحوا شركاء {appName}</li>
            <li>يحصل الشركاء على رابط إحالة فريد لمشاركته مع عملائهم وسائقيهم الحاليين</li>
            <li>يكسب الشركاء نسبة قابلة للتخصيص من كل رحلة يحجزها مستخدموهم المُحالون</li>
            <li>يتم احتساب عمولات الشركاء تلقائيًا ودفعها شهريًا</li>
            <li>يمكن للشركاء تقديم طلبات مسارات للموافقة عليها من الإدارة</li>
            <li>قد يتم تعليق حسابات الشركاء لمخالفة هذه الشروط أو نشاط إحالة احتيالي</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">9. سلوك المستخدم</h3>
          <p>يجب على المستخدمين عدم: استخدام الخدمة لأغراض غير قانونية، مضايقة السائقين أو الركاب الآخرين، تقديم وثائق هوية مزورة، أو التلاعب بنظام الحجز.</p>
          <h3 className="text-base font-semibold text-foreground">10. متطلبات السائق</h3>
          <p>يجب على السائقين الحفاظ على رخص قيادة سارية وتسجيل المركبة والتأمين. يجب أن تجتاز المركبات فحوصات السلامة.</p>
          <h3 className="text-base font-semibold text-foreground">11. حدود المسؤولية</h3>
          <p>{appName} يعمل كمنصة تربط الركاب بالسائقين. نحن لسنا شركة نقل.</p>
          <h3 className="text-base font-semibold text-foreground">12. الملكية الفكرية</h3>
          <p>جميع المحتويات والعلامات التجارية والتكنولوجيا في {appName} مملوكة لنا أو مرخصة لنا.</p>
          <h3 className="text-base font-semibold text-foreground">13. الإنهاء</h3>
          <p>يمكننا تعليق أو إنهاء حسابك لمخالفات هذه الشروط. يمكنك حذف حسابك في أي وقت من خلال التطبيق.</p>
          <h3 className="text-base font-semibold text-foreground">14. القانون الحاكم</h3>
          <p>تخضع هذه الشروط لقوانين جمهورية مصر العربية.</p>
        </div>
      ),
    },
    location: {
      en: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">Why We Use Your Location</h3>
          <p>{appName} requires access to your device's location to provide its core transportation services. Here is exactly how we use location data:</p>
          <h3 className="text-base font-semibold text-foreground">For Riders</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>When in use:</strong> To show nearby shuttle stops, calculate pickup/drop-off points, and display your position on the ride tracking map</li>
            <li><strong>Not collected in background:</strong> We do not track rider location when the app is closed</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">For Drivers</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>When in use:</strong> Navigation to pickup/drop-off stops, proximity detection for arrival notifications</li>
            <li><strong>Background location:</strong> During active trips only, to provide real-time tracking to passengers. Background tracking stops immediately when a trip is completed or ended</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">For Carpool</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Setting pickup and drop-off points when posting or requesting carpool rides</li>
            <li>Route matching between drivers and riders</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">Data Handling</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Location data is transmitted over encrypted connections (TLS)</li>
            <li>Real-time location is broadcast only to relevant ride participants</li>
            <li>Location history is not stored permanently — only the last known position during active rides</li>
            <li>You can revoke location permission at any time in your device settings (core features will be limited)</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">Third-Party Access</h3>
          <p>Location data is shared with Google Maps for map display and navigation only. Google's privacy policy applies to their processing of this data.</p>
        </div>
      ),
      ar: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">آخر تحديث: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">لماذا نستخدم موقعك</h3>
          <p>يتطلب {appName} الوصول إلى موقع جهازك لتقديم خدمات النقل الأساسية. إليك كيف نستخدم بيانات الموقع بالضبط:</p>
          <h3 className="text-base font-semibold text-foreground">للركاب</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>أثناء الاستخدام:</strong> لعرض محطات الحافلات القريبة وحساب نقاط الالتقاط/النزول وعرض موقعك على خريطة تتبع الرحلة</li>
            <li><strong>لا يتم جمعه في الخلفية:</strong> لا نتتبع موقع الراكب عند إغلاق التطبيق</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">للسائقين</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>أثناء الاستخدام:</strong> الملاحة إلى محطات الالتقاط/النزول، كشف القرب لإشعارات الوصول</li>
            <li><strong>موقع الخلفية:</strong> أثناء الرحلات النشطة فقط، لتوفير تتبع في الوقت الفعلي للركاب. يتوقف تتبع الخلفية فورًا عند اكتمال الرحلة</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">لمشاركة السيارات</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>تحديد نقاط الالتقاط والنزول عند نشر أو طلب رحلات مشاركة السيارات</li>
            <li>مطابقة المسارات بين السائقين والركاب</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">معالجة البيانات</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>يتم نقل بيانات الموقع عبر اتصالات مشفرة (TLS)</li>
            <li>يتم بث الموقع في الوقت الفعلي فقط للمشاركين المعنيين في الرحلة</li>
            <li>لا يتم تخزين سجل الموقع بشكل دائم</li>
            <li>يمكنك إلغاء إذن الموقع في أي وقت من إعدادات جهازك</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">وصول الأطراف الثالثة</h3>
          <p>يتم مشاركة بيانات الموقع مع Google Maps لعرض الخرائط والملاحة فقط.</p>
        </div>
      ),
    },
    licenses: {
      en: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">Software License</h3>
          <p>{appName} is proprietary software. All rights reserved. You are granted a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial transportation purposes.</p>
          <h3 className="text-base font-semibold text-foreground">Restrictions</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>You may not reverse engineer, decompile, or disassemble the app</li>
            <li>You may not copy, modify, or create derivative works</li>
            <li>You may not rent, lease, or lend the app to third parties</li>
            <li>You may not use the app for any illegal or unauthorized purpose</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">Open Source Acknowledgments</h3>
          <p>{appName} uses the following open-source libraries and frameworks:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>React</strong> — MIT License — Meta Platforms, Inc.</li>
            <li><strong>Capacitor</strong> — MIT License — Ionic</li>
            <li><strong>Tailwind CSS</strong> — MIT License — Tailwind Labs</li>
            <li><strong>Radix UI</strong> — MIT License — WorkOS</li>
            <li><strong>Lucide Icons</strong> — ISC License — Lucide Contributors</li>
            <li><strong>Supabase JS</strong> — MIT License — Supabase Inc.</li>
            <li><strong>React Router</strong> — MIT License — Remix Software</li>
            <li><strong>TanStack Query</strong> — MIT License — TanStack</li>
            <li><strong>Recharts</strong> — MIT License — Recharts Contributors</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">Copyright Notice</h3>
          <p>© 2026 {appName}. All rights reserved. {appName} and its logo are trademarks. Unauthorized use is prohibited.</p>
        </div>
      ),
      ar: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">آخر تحديث: {lastUpdated}</p>
          <h3 className="text-base font-semibold text-foreground">ترخيص البرنامج</h3>
          <p>{appName} هو برنامج ملكية خاصة. جميع الحقوق محفوظة. يُمنح لك ترخيص محدود وغير حصري وغير قابل للتحويل لاستخدام التطبيق لأغراض النقل الشخصية غير التجارية.</p>
          <h3 className="text-base font-semibold text-foreground">القيود</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>لا يجوز لك إجراء هندسة عكسية أو تفكيك أو فك تجميع التطبيق</li>
            <li>لا يجوز لك نسخ أو تعديل أو إنشاء أعمال مشتقة</li>
            <li>لا يجوز لك تأجير أو إعارة التطبيق لأطراف ثالثة</li>
            <li>لا يجوز لك استخدام التطبيق لأي غرض غير قانوني</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">اعترافات المصادر المفتوحة</h3>
          <p>يستخدم {appName} المكتبات والأطر مفتوحة المصدر التالية:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>React</strong> — ترخيص MIT — Meta Platforms, Inc.</li>
            <li><strong>Capacitor</strong> — ترخيص MIT — Ionic</li>
            <li><strong>Tailwind CSS</strong> — ترخيص MIT — Tailwind Labs</li>
            <li><strong>Radix UI</strong> — ترخيص MIT — WorkOS</li>
            <li><strong>Lucide Icons</strong> — ترخيص ISC — Lucide Contributors</li>
            <li><strong>Supabase JS</strong> — ترخيص MIT — Supabase Inc.</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">إشعار حقوق الطبع والنشر</h3>
          <p>© 2026 {appName}. جميع الحقوق محفوظة. {appName} وشعاره علامات تجارية. الاستخدام غير المصرح به محظور.</p>
        </div>
      ),
    },
  };

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <header className="bg-card border-b border-border shrink-0 z-40 safe-area-top">
        <div className="container mx-auto flex items-center h-16 px-4 gap-4">
          <Link to="/profile"><Button variant="ghost" size="icon"><Back className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-bold text-foreground">
            {lang === 'ar' ? 'القانوني والخصوصية' : 'Legal & Privacy'}
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border overflow-x-auto shrink-0">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              {tab.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-lg mx-auto">
          {content[active][lang]}
        </div>
      </main>
    </div>
  );
};

export default Legal;
