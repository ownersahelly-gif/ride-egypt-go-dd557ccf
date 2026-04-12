import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MapView from '@/components/MapView';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft, ChevronRight, Users, MapPin, MessageCircle,
  CheckCircle2, Navigation, UserCheck, Phone, Clock,
  Flag, SkipForward, ArrowRight, ExternalLink,
  DollarSign, TrendingUp, X, TestTube, RotateCcw
} from 'lucide-react';

// Mock data for a realistic driver test
const MOCK_ROUTE = {
  id: 'test-route',
  name_en: 'Madinaty - Smart Village',
  name_ar: 'مدينتي - القرية الذكية',
  origin_name_en: 'Madinaty Gate 1',
  origin_name_ar: 'بوابة مدينتي 1',
  destination_name_en: 'Smart Village',
  destination_name_ar: 'القرية الذكية',
  origin_lat: 30.1070,
  origin_lng: 31.6387,
  destination_lat: 30.0712,
  destination_lng: 31.0167,
  price: 35,
};

const MOCK_STOPS = [
  { id: 'stop-1', name_en: 'Madinaty Gate 1', name_ar: 'بوابة مدينتي 1', lat: 30.1070, lng: 31.6387, stop_order: 0, stop_type: 'pickup' },
  { id: 'stop-2', name_en: 'Rehab City', name_ar: 'مدينة الرحاب', lat: 30.0600, lng: 31.4900, stop_order: 1, stop_type: 'pickup' },
  { id: 'stop-3', name_en: 'Nasr City', name_ar: 'مدينة نصر', lat: 30.0500, lng: 31.3500, stop_order: 2, stop_type: 'pickup' },
];

interface MockPassenger {
  bookingId: string;
  name: string;
  phone: string;
  boardingCode: string;
  status: 'confirmed' | 'boarded' | 'completed' | 'cancelled';
  stopId: string;
  totalPrice: number;
  paymentProofUrl: string | null;
}

const INITIAL_PASSENGERS: MockPassenger[] = [
  { bookingId: 'b1', name: 'Mohamed Ahmed', phone: '+201234567890', boardingCode: '123456', status: 'confirmed', stopId: 'stop-1', totalPrice: 35, paymentProofUrl: null },
  { bookingId: 'b2', name: 'Sara Hassan', phone: '+201098765432', boardingCode: '654321', status: 'confirmed', stopId: 'stop-1', totalPrice: 35, paymentProofUrl: 'proof.jpg' },
  { bookingId: 'b3', name: 'Ali Mahmoud', phone: '+201555123456', boardingCode: '111222', status: 'confirmed', stopId: 'stop-2', totalPrice: 35, paymentProofUrl: null },
  { bookingId: 'b4', name: 'Nour El-Din', phone: '+201777654321', boardingCode: '333444', status: 'confirmed', stopId: 'stop-3', totalPrice: 35, paymentProofUrl: 'proof2.jpg' },
];

const DriverTestView = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const Back = lang === 'ar' ? ChevronRight : ChevronLeft;

  const [passengers, setPassengers] = useState<MockPassenger[]>(INITIAL_PASSENGERS);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [arrivedAt, setArrivedAt] = useState<number | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [boardingInput, setBoardingInput] = useState('');
  const [verifyingBooking, setVerifyingBooking] = useState<string | null>(null);
  const [showEndRideDialog, setShowEndRideDialog] = useState(false);
  const [showEarningsSummary, setShowEarningsSummary] = useState(false);

  const waitTimeMinutes = 3;
  const waitTimeSec = waitTimeMinutes * 60;

  // Timer
  useEffect(() => {
    if (arrivedAt === null) return;
    const interval = setInterval(() => {
      setWaitSeconds(Math.floor((Date.now() - arrivedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [arrivedAt]);

  // Reset on stop change
  useEffect(() => {
    setArrivedAt(null);
    setWaitSeconds(0);
    setVerifyingBooking(null);
    setBoardingInput('');
  }, [currentStopIndex]);

  // Build pickup stops
  const pickupStops = MOCK_STOPS.map(stop => ({
    stop,
    passengers: passengers.filter(p => p.stopId === stop.id && p.status === 'confirmed'),
  })).filter(s => s.passengers.length > 0);

  const currentPickup = pickupStops[currentStopIndex] || null;

  const allHandledAtStop = currentPickup
    ? currentPickup.passengers.every(p => {
        const latest = passengers.find(pp => pp.bookingId === p.bookingId);
        return latest?.status === 'boarded' || latest?.status === 'cancelled';
      })
    : true;

  const allPickupsDone = pickupStops.length > 0 && currentStopIndex >= pickupStops.length;

  const boardedCount = passengers.filter(p => p.status === 'boarded').length;
  const totalCount = passengers.length;
  const completedCount = passengers.filter(p => p.status === 'completed').length;
  const totalEarnings = passengers.filter(p => p.status === 'completed').reduce((s, p) => s + p.totalPrice, 0);
  const cashEarnings = passengers.filter(p => p.status === 'completed' && !p.paymentProofUrl).reduce((s, p) => s + p.totalPrice, 0);
  const onlineEarnings = passengers.filter(p => p.status === 'completed' && p.paymentProofUrl).reduce((s, p) => s + p.totalPrice, 0);

  const verifyBoarding = (bookingId: string) => {
    const p = passengers.find(pp => pp.bookingId === bookingId);
    if (!p) return;
    if (p.boardingCode !== boardingInput) {
      toast({ title: lang === 'ar' ? 'رمز خاطئ' : 'Wrong Code', description: lang === 'ar' ? 'رمز الصعود غير صحيح' : 'Invalid boarding code', variant: 'destructive' });
      return;
    }
    setPassengers(prev => prev.map(pp => pp.bookingId === bookingId ? { ...pp, status: 'boarded' } : pp));
    setBoardingInput('');
    setVerifyingBooking(null);
    const amountDue = p.paymentProofUrl ? 0 : p.totalPrice;
    toast({
      title: lang === 'ar' ? 'تم التأكيد ✓' : 'Boarded! ✓',
      description: amountDue > 0
        ? (lang === 'ar' ? `💵 مطلوب كاش: ${amountDue} جنيه` : `💵 Cash needed: ${amountDue} EGP`)
        : (lang === 'ar' ? '✅ مدفوع عبر InstaPay — 0 جنيه' : '✅ Paid via InstaPay — 0 EGP'),
    });
  };

  const skipPassenger = (bookingId: string) => {
    setPassengers(prev => prev.map(pp => pp.bookingId === bookingId ? { ...pp, status: 'cancelled' } : pp));
    toast({ title: lang === 'ar' ? 'تم تخطي الراكب' : 'Passenger Skipped' });
  };

  const completeRide = () => {
    setPassengers(prev => prev.map(p => p.status === 'boarded' ? { ...p, status: 'completed' } : p));
    setShowEndRideDialog(false);
    setShowEarningsSummary(true);
  };

  const resetTest = () => {
    setPassengers(INITIAL_PASSENGERS);
    setCurrentStopIndex(0);
    setArrivedAt(null);
    setWaitSeconds(0);
    setBoardingInput('');
    setVerifyingBooking(null);
    setShowEndRideDialog(false);
    setShowEarningsSummary(false);
    toast({ title: lang === 'ar' ? 'تم إعادة التعيين' : 'Test reset!' });
  };

  // Markers
  const markers: { lat: number; lng: number; label?: string; color?: 'red' | 'green' | 'blue' | 'orange' | 'purple' }[] = [];
  markers.push({ lat: MOCK_ROUTE.origin_lat, lng: MOCK_ROUTE.origin_lng, label: 'A', color: 'green' });
  markers.push({ lat: MOCK_ROUTE.destination_lat, lng: MOCK_ROUTE.destination_lng, label: 'B', color: 'red' });
  MOCK_STOPS.forEach((s, i) => {
    markers.push({ lat: s.lat, lng: s.lng, label: `${i + 1}`, color: currentPickup?.stop.id === s.id ? 'orange' : 'blue' });
  });

  const dirOrigin = { lat: MOCK_ROUTE.origin_lat, lng: MOCK_ROUTE.origin_lng };
  const dirDest = currentPickup ? { lat: currentPickup.stop.lat, lng: currentPickup.stop.lng } : { lat: MOCK_ROUTE.destination_lat, lng: MOCK_ROUTE.destination_lng };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${MOCK_ROUTE.origin_lat},${MOCK_ROUTE.origin_lng}&destination=${MOCK_ROUTE.destination_lat},${MOCK_ROUTE.destination_lng}&waypoints=${MOCK_STOPS.map(s => `${s.lat},${s.lng}`).join('|')}&travelmode=driving`;

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border shrink-0 z-40 safe-area-top">
        <div className="container mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><Back className="w-5 h-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <TestTube className="w-4 h-4 text-amber-500" />
            <h1 className="text-base font-bold text-foreground">
              {lang === 'ar' ? 'وضع اختبار السائق' : 'Driver Test Mode'}
            </h1>
          </div>
          <span className="ms-auto text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
            {boardedCount}/{totalCount}
          </span>
          <Button variant="ghost" size="icon" onClick={resetTest}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Test mode banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
        <TestTube className="w-4 h-4 text-amber-600" />
        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
          {lang === 'ar'
            ? 'هذا وضع اختباري — البيانات وهمية والأكواد معروضة أدناه'
            : 'Test mode — data is fake. Codes: 123456, 654321, 111222, 333444'}
        </p>
      </div>

      {/* Google Maps Full Trip navigation */}
      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold text-sm">
              {lang === 'ar' ? 'افتح كل الرحلة في خرائط جوجل' : 'Navigate Full Trip'}
            </span>
          </div>
          <ExternalLink className="w-4 h-4 text-primary-foreground" />
        </div>
      </a>

      {/* Map */}
      <div className="h-[220px] relative">
        <MapView
          className="h-full"
          markers={markers}
          origin={dirOrigin}
          destination={dirDest}
          showDirections={true}
          center={dirOrigin}
          zoom={10}
          showUserLocation={false}
        />
        <div className="absolute top-3 start-3 z-[5] bg-card border border-border rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{boardedCount}</span>
          <span className="text-xs text-muted-foreground">/ {totalCount}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* PICKUP PHASE */}
        {currentPickup && !allHandledAtStop && (
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 space-y-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {lang === 'ar' ? `التوقف ${currentStopIndex + 1} من ${pickupStops.length}` : `Stop ${currentStopIndex + 1} of ${pickupStops.length}`}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'اذهب لـ' : 'Go pickup'}
              </p>
              <div className="mt-2 space-y-3">
                {currentPickup.passengers
                  .filter(p => {
                    const latest = passengers.find(pp => pp.bookingId === p.bookingId);
                    return latest?.status !== 'boarded' && latest?.status !== 'cancelled';
                  })
                  .map(p => (
                    <div key={p.bookingId} className="flex items-center justify-center gap-3">
                      <p className="text-xl font-bold text-primary">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => toast({ title: lang === 'ar' ? 'اتصال تجريبي' : 'Test call' })}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => toast({ title: lang === 'ar' ? 'محادثة تجريبية' : 'Test chat' })}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Navigate button */}
            {!arrivedAt && (
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${currentPickup.stop.lat},${currentPickup.stop.lng}&travelmode=driving`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2" size="lg">
                  <Navigation className="w-5 h-5" />
                  {lang === 'ar' ? 'افتح الملاحة' : 'Navigate'}
                </Button>
              </a>
            )}

            {/* I Arrived button */}
            {!arrivedAt && (
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => {
                  setArrivedAt(Date.now());
                  setWaitSeconds(0);
                  toast({ title: lang === 'ar' ? `⏱️ بدأ العد — ${waitTimeMinutes} دقيقة` : `⏱️ Timer started — ${waitTimeMinutes} min` });
                }}
              >
                <Clock className="w-5 h-5 me-2" />
                {lang === 'ar' ? 'وصلت' : "I Arrived"}
              </Button>
            )}

            {/* Timer + Code verification */}
            {arrivedAt && (
              <>
                <div className="bg-surface rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {lang === 'ar' ? 'وقت الانتظار' : 'Waiting'}
                  </span>
                  <span className={`text-lg font-bold font-mono ${waitSeconds >= waitTimeSec ? 'text-destructive' : 'text-foreground'}`}>
                    {Math.floor(waitSeconds / 60)}:{String(waitSeconds % 60).padStart(2, '0')}
                  </span>
                </div>

                {currentPickup.passengers.map(p => {
                  const latest = passengers.find(pp => pp.bookingId === p.bookingId);
                  if (latest?.status === 'boarded' || latest?.status === 'cancelled') return null;

                  return (
                    <div key={p.bookingId} className="bg-surface rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => toast({ title: lang === 'ar' ? 'اتصال تجريبي' : 'Test call' })}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast({ title: lang === 'ar' ? 'محادثة تجريبية' : 'Test chat' })}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {verifyingBooking === p.bookingId ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={boardingInput}
                            onChange={(e) => setBoardingInput(e.target.value)}
                            placeholder={lang === 'ar' ? '6 أرقام' : '6-digit code'}
                            className="h-12 text-center font-mono tracking-[0.3em] text-lg"
                            maxLength={6}
                            autoFocus
                          />
                          <Button size="lg" onClick={() => verifyBoarding(p.bookingId)} disabled={boardingInput.length !== 6}>
                            <CheckCircle2 className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" size="lg" onClick={() => { setVerifyingBooking(p.bookingId); setBoardingInput(''); }}>
                          <CheckCircle2 className="w-5 h-5 me-2" />
                          {lang === 'ar' ? 'أدخل الرمز' : 'Enter Code'}
                        </Button>
                      )}

                      {waitSeconds >= waitTimeSec && (
                        <Button variant="destructive" className="w-full" onClick={() => skipPassenger(p.bookingId)}>
                          <SkipForward className="w-4 h-4 me-2" />
                          {lang === 'ar' ? 'تخطي' : 'Skip'}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* All pickups at current stop handled → Next stop */}
        {currentPickup && allHandledAtStop && currentStopIndex < pickupStops.length - 1 && (
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="text-lg font-bold text-foreground">
              {lang === 'ar' ? 'تم! التالي؟' : 'Done! Next stop?'}
            </p>
            <Button className="w-full" size="lg" onClick={() => setCurrentStopIndex(prev => prev + 1)}>
              <ArrowRight className="w-5 h-5 me-2" />
              {lang === 'ar' ? 'التوقف التالي' : 'Next Stop'}
            </Button>
          </div>
        )}

        {/* Last pickup stop handled or all pickups done */}
        {(allPickupsDone || (currentPickup && allHandledAtStop && currentStopIndex >= pickupStops.length - 1)) && (
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="text-lg font-bold text-foreground">
              {lang === 'ar' ? 'تم جمع جميع الركاب!' : 'All passengers picked up!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === 'ar'
                ? 'استخدم خرائط جوجل للوصول إلى نقاط الإنزال'
                : 'Use Google Maps to navigate to drop-off points'}
            </p>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2" size="lg" variant="outline">
                <Navigation className="w-5 h-5" />
                {lang === 'ar' ? 'افتح خرائط جوجل' : 'Open Google Maps'}
              </Button>
            </a>
          </div>
        )}

        {pickupStops.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            {lang === 'ar' ? 'لا يوجد ركاب' : 'No passengers'}
          </div>
        )}
      </div>

      {/* Complete Ride button */}
      {boardedCount > 0 && (allPickupsDone || (currentPickup && allHandledAtStop && currentStopIndex >= pickupStops.length - 1)) && (
        <div className="border-t border-border bg-card p-4 safe-area-bottom">
          <Button className="w-full" size="lg" variant="destructive" onClick={() => setShowEndRideDialog(true)}>
            <Flag className="w-5 h-5 me-2" />
            {lang === 'ar'
              ? `إنهاء الرحلة (${boardedCount} راكب)`
              : `Complete Ride (${boardedCount})`}
          </Button>
        </div>
      )}

      {/* End Ride Confirmation */}
      {showEndRideDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-2xl p-6 w-[90%] max-w-sm shadow-xl space-y-4">
            <div className="text-center">
              <Flag className="w-12 h-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-bold text-foreground">
                {lang === 'ar' ? 'إنهاء الرحلة؟' : 'End Ride?'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === 'ar'
                  ? `سيتم إنزال ${boardedCount} راكب وإنهاء الرحلة.`
                  : `This will drop off ${boardedCount} passenger${boardedCount > 1 ? 's' : ''} and end the ride.`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndRideDialog(false)}>
                {lang === 'ar' ? 'لا' : 'No'}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={completeRide}>
                {lang === 'ar' ? 'نعم، أنهِ' : 'Yes, End'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      {showEarningsSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-2xl p-6 w-[90%] max-w-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {lang === 'ar' ? 'ملخص الرحلة' : 'Ride Summary'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowEarningsSummary(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary">{totalEarnings} EGP</p>
              <p className="text-sm text-muted-foreground mt-1">{lang === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{completedCount}</p>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'راكب' : 'Riders'}</p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{cashEarnings} / {onlineEarnings}</p>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'كاش / إلكتروني' : 'Cash / Online'}</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={resetTest}>
              <RotateCcw className="w-4 h-4 me-2" />
              {lang === 'ar' ? 'اختبار مرة أخرى' : 'Test Again'}
            </Button>
            <Link to="/admin" className="block">
              <Button variant="outline" className="w-full" size="lg">
                {lang === 'ar' ? 'العودة للوحة الإدارة' : 'Back to Admin'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTestView;
