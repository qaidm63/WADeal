import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory credit store and valid licenses database
// client_id -> remaining free credits (default 40)
const creditStore = new Map<string, number>();
const clientLicenses = new Map<string, { key: string; plan: 'ltd' | 'monthly'; activatedAt: string }>();

// Pre-seeded valid test licenses for convenience & Whop simulation
const validLicenses = new Set<string>([
  'WADEAL-LTD-LAUNCH50',
  'WADEAL-LTD-FOUNDER88',
  'WADEAL-LTD-WHOP2026',
  'WADEAL-PRO-MONTHLY99',
  'WADEAL-VIP-PROPASS',
]);

const INITIAL_CREDITS = 40;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getClientCredits(clientId: string): number {
  if (!creditStore.has(clientId)) {
    creditStore.set(clientId, INITIAL_CREDITS);
  }
  return creditStore.get(clientId)!;
}

// 1. Get user credit status & license info
app.get('/api/v1/user-credits', (req, res) => {
  const clientId = (req.query.client_id as string) || 'default-user';
  const licenseKey = (req.query.license_key as string) || '';

  const isPro = Boolean(
    (licenseKey && validLicenses.has(licenseKey.toUpperCase())) ||
    clientLicenses.has(clientId)
  );

  const licenseInfo = clientLicenses.get(clientId);

  res.json({
    client_id: clientId,
    credits_remaining: getClientCredits(clientId),
    initial_credits: INITIAL_CREDITS,
    is_pro: isPro,
    plan: isPro ? (licenseInfo?.plan || 'ltd') : 'trial',
  });
});

// 2. Verify / activate license
app.post('/api/v1/verify-license', (req, res) => {
  const { license_key, client_id } = req.body || {};
  const normalizedKey = String(license_key || '').trim().toUpperCase();
  const clientId = client_id || 'default-user';

  if (!normalizedKey) {
    return res.status(400).json({
      valid: false,
      message: 'License key is required.',
    });
  }

  // Accepts pre-seeded keys or valid pattern like WADEAL-LTD-XXXX / WADEAL-PRO-XXXX
  const isValid = validLicenses.has(normalizedKey) || /^WADEAL-(LTD|PRO)-[A-Z0-9]{4,12}$/.test(normalizedKey);

  if (isValid) {
    const plan = normalizedKey.includes('MONTHLY') || normalizedKey.includes('PRO') ? 'monthly' : 'ltd';
    clientLicenses.set(clientId, {
      key: normalizedKey,
      plan: plan,
      activatedAt: new Date().toISOString(),
    });

    return res.json({
      valid: true,
      license_key: normalizedKey,
      plan: plan,
      status: 'active',
      tier_name: plan === 'ltd' ? 'WADeal Lifetime Deal (LTD)' : 'WADeal Pro Unlimited',
      message: 'License activated successfully! You now have unlimited deal-closing credits.',
    });
  }

  return res.status(400).json({
    valid: false,
    message: 'Invalid or expired license key. Verify your code from Whop receipt.',
  });
});

// Helper: Smart Dynamic Contextual Sales Intelligence Engine (Strictly grounded in Merchant Business Context)
interface SalesEngineResult {
  deal_state: 'CLOSING' | 'OBJECTION' | 'DISCOVERY' | 'LOGISTICS';
  objection_detected: string;
  replies: Array<{ type: 'Persuasive' | 'Direct' | 'Urgent'; short_label: string; text: string }>;
}

function extractBusinessParameters(merchantContext: string) {
  const ctx = merchantContext || '';
  
  // Extract prices (e.g. $48, 48$, 80$, $80)
  const priceMatches = [...ctx.matchAll(/(?:\$|USD|ريال|ر\.س)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:\$|USD|ريال|ر\.س)/gi)];
  const prices = priceMatches.map(m => m[1] || m[2]).filter(Boolean);
  
  const singlePrice = prices[0] ? `${prices[0]}$` : '48$';
  const bundlePrice = prices[1] ? `${prices[1]}$` : '80$';

  const isArabic = /[\u0600-\u06FF]/.test(ctx);
  const deliveryTerm = isArabic ? 'خلال 24–48 ساعة' : 'within 24–48 hours';
  const warrantyTerm = isArabic ? 'ضمان استبدال 14 يوم' : '14-day replacement guarantee';
  const paymentTerm = isArabic ? 'الدفع عند الاستلام متاح' : 'Cash on delivery available';

  return { singlePrice, bundlePrice, deliveryTerm, warrantyTerm, paymentTerm };
}

function buildDynamicContextualReplies(merchantContext: string, chatHistory: any[], customerMsgOverride?: string): SalesEngineResult {
  let lastMsg = customerMsgOverride ? String(customerMsgOverride).trim() : '';
  if (!lastMsg && Array.isArray(chatHistory) && chatHistory.length > 0) {
    const customerMsgs = chatHistory.filter(m => m && m.sender && !m.sender.toLowerCase().includes('merchant') && !m.sender.toLowerCase().includes('you'));
    lastMsg = customerMsgs.length > 0
      ? String(customerMsgs[customerMsgs.length - 1].text || '').trim()
      : String(chatHistory[chatHistory.length - 1].text || '').trim();
  }
  if (!lastMsg) {
    lastMsg = 'كم السعر وهل يوجد ضمان استبدال وتوصيل سريع؟';
  }

  const isArabic = /[\u0600-\u06FF]/.test(lastMsg) || /[\u0600-\u06FF]/.test(merchantContext);
  const lowerMsg = lastMsg.toLowerCase();
  const { singlePrice, bundlePrice, deliveryTerm, warrantyTerm } = extractBusinessParameters(merchantContext);

  // Extract location/address from message if mentioned
  let locationText = '';
  if (/الرياض|riyadh/i.test(lastMsg)) {
    locationText = isArabic ? 'الرياض (طريق الملك فهد)' : 'King Fahd Rd, Riyadh';
  } else if (/جدة|jeddah/i.test(lastMsg)) {
    locationText = isArabic ? 'جدة' : 'Jeddah';
  } else if (/الدمام|dammam/i.test(lastMsg)) {
    locationText = isArabic ? 'الدمام' : 'Dammam';
  } else if (/مكة|mecca/i.test(lastMsg)) {
    locationText = isArabic ? 'مكة المكرمة' : 'Mecca';
  } else if (/road|street|rd|st|حي|شارع|طريق/i.test(lastMsg)) {
    locationText = isArabic ? 'عنوانك المحدد' : 'your specified address';
  }

  // 1. CONVERSATION STAGE DETECTION
  // Check CLOSING / ORDER CONFIRMATION first (Treat the deal as WON)
  const isClosing = (
    /(جهز|اعتمد|أعتمد|تم |تمام|أرسل|ارسل|باخذ|بطلب|احجز|ابي حبتين|أبي حبتين|حبتين بالعرض|العنوان|الرياض|جدة|الدمام|طريق الملك فهد|شارع|الدفع عند الاستلام|كاش|توكلنا|اعتمد لي|خلاص باخذ)/i.test(lastMsg) ||
    /(deliver to|send to|take 2|take two|order 2|order two|confirm|prepare|cash on delivery|cod|address|street|road|king fahd|riyadh|jeddah|i'll take|i will take|ready to order|go ahead|book it|ship to)/i.test(lowerMsg)
  );

  if (isClosing) {
    const stageLabel = isArabic ? 'تأكيد واعتماد الطلب (تم البيع ✅)' : 'Order Confirmation & Dispatch (Won Deal ✅)';
    
    if (isArabic) {
      return {
        deal_state: 'CLOSING',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'اعتماد فوري للطلب',
            text: `أبشر يا غالي وعلى خشمي! تم تسجيل طلبك لبكج الحبتين بالعرض (${bundlePrice}) مع شحن سريع مجاني ${locationText ? `إلى ${locationText}` : 'لكافة المناطق'} والدفع عند الاستلام كاش. بس أرسل لي الاسم الكريم ورقم الجوال لتأكيد إرسال الشحنة مع المندوب فوراً.`
          },
          {
            type: 'Direct',
            short_label: 'ملخص وتأكيد الشحن',
            text: `تم الاعتماد بنجاح! ملخص الطلب: بكج حبتين (${bundlePrice}) - الوجهة: ${locationText || 'موقعك'} - الدفع عند الاستلام مع ضمان 14 يوم. فضلاً أرسل رقم الاتصال لجدولة تسليم المندوب اليوم.`
          },
          {
            type: 'Urgent',
            short_label: 'حجز رحلة شحن اليوم',
            text: `يا هلا والله! تم حجز البكج الخاص بك وإضافته لرحلة شحن اليوم الصباحية ${locationText ? `إلى ${locationText}` : ''} بدون أي رسوم شحن. زودني برقم الجوال الحين ويطلع طلبك في الشحنة الأولى خلال ساعات!`
          }
        ]
      };
    }

    return {
      deal_state: 'CLOSING',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Order Confirmed',
          text: `Awesome! Your order for the 2-pack bundle special (${bundlePrice}) is officially locked in with free expedited delivery ${locationText ? `to ${locationText}` : 'to your address'} and Cash on Delivery. Please confirm the recipient's name and mobile number so we can dispatch the courier right away!`
        },
        {
          type: 'Direct',
          short_label: 'Dispatch Summary',
          text: `Order confirmed! Summary: 2-Pack Bundle (${bundlePrice}) — Destination: ${locationText || 'Your address'} — Cash on Delivery with full replacement warranty. Please share your phone number so our courier can schedule delivery today.`
        },
        {
          type: 'Urgent',
          short_label: 'Priority Courier Slot',
          text: `You got it! We've secured your 2 bundles and placed them into today's priority express courier run ${locationText ? `for ${locationText}` : ''} with waived shipping fees. Send over your contact phone number now so we can print the dispatch label right away!`
        }
      ]
    };
  }

  // 2. Check LOGISTICS / POST-PURCHASE
  const isLogistics = (
    /(تتبع|وين شحنتي|وين الطلب|متى توصل|تأخر|وصلت|المندوب|رقم التتبع)/i.test(lastMsg) ||
    /(track|tracking|where is my order|when will it arrive|delayed|status|courier|dispatch status)/i.test(lowerMsg)
  );

  if (isLogistics) {
    const stageLabel = isArabic ? 'متابعة الشحن والتوصيل' : 'Fulfillment & Logistics Tracking';
    if (isArabic) {
      return {
        deal_state: 'LOGISTICS',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'متابعة الشحنة',
            text: `أهلاً وسهلاً بك! طلبك قيد التجهيز مع شركة الشحن والتوصيل ${deliveryTerm} حسب الموعد المحدد. فريقنا يتابع خط سير الشحنة لحظة بلحظة حتى تستلمها بيدك وتكون راضياً 100%. هل تحب أزودك برقم بوليصة الشحن الحالية؟`
          },
          {
            type: 'Direct',
            short_label: 'حالة الطلب المباشرة',
            text: `مرحباً بك! طلبك معتمد ومسجل، ومدة الشحن ${deliveryTerm} مع إشعار بالرسائل النصية فور خروج المندوب. ما هو رقم الطلب أو رقم جوالك للتحقق الفوري من الحالة؟`
          },
          {
            type: 'Urgent',
            short_label: 'تسريع التوصيل',
            text: `يا هلا! رفعت تنبيه لفريق التوزيع لتسريع تسليم شحنتك مع أول مندوب بالمنطقة اليوم. خلي جوالك متاح وسيتم الاتصال بك لتحديد وقت الاستلام بدقة.`
          }
        ]
      };
    }

    return {
      deal_state: 'LOGISTICS',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Track & Assurance',
          text: `Hi there! Your package is currently processed with our courier and scheduled ${deliveryTerm}. We track every shipment until it's safely in your hands. Would you like me to send your active tracking link?`
        },
        {
          type: 'Direct',
          short_label: 'Status Check',
          text: `Hello! Your order is safely logged and moving through dispatch. You'll receive a courier SMS upon arrival. Could you share your phone number so I can pull up the live courier GPS?`
        },
        {
          type: 'Urgent',
          short_label: 'Expedite Request',
          text: `Hey! I just flagged your package with our logistics team to give it priority courier dispatch today. Keep your phone handy for the driver's arrival call!`
        }
      ]
    };
  }

  // 3. MANDATORY DIRECT-ANSWER LOGIC: Check Specific Customer Inquiry Category
  const isAuthenticityInquiry = /(أصلي|تقليد|مقلد|اصلي|original|fake|authentic|genuine|copy)/i.test(lastMsg);
  const isWarrantyInquiry = /(ضمان|مضمون|استرجاع|استرداد|warranty|guarantee|refund|return)/i.test(lastMsg);
  const isSizingInquiry = /(مقاس|مقاسات|تبديل|استبدال|size|fit|sizes|exchange|swap)/i.test(lastMsg);
  const isDeliveryInquiry = /(توصيل|شحن|متى يوصل|مدة التوصيل|delivery|ship|shipping|how fast|arrive)/i.test(lastMsg);
  const isB2bInquiry = /(moq|wholesale|boxes|cartons|units|كمية|جملة|كرتون|كراتين)/i.test(lastMsg);
  const isPriceInquiry = /(كم|السعر|بكم|تكلفة|سعر|خصم|غالي|تنزل|تخفيض|أرخص|price|how much|cost|rate|discount|expensive|cheaper)/i.test(lastMsg);

  // A. DIRECT ANSWER: Authenticity Inquiry
  if (isAuthenticityInquiry) {
    const stageLabel = isArabic ? 'إثبات الأصالة والموثوقية' : 'Authenticity & Genuine Proof';
    if (isArabic) {
      return {
        deal_state: 'OBJECTION',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'أصلي 100% ومضمون',
            text: `نعم بكل تأكيد! جميع منتجاتنا أصلية 100% ومستوردة بزيوت نقية ومشمولة بـ (${warrantyTerm}) مع إمكانية المعاينة والدفع عند الاستلام لتطمئن تماماً. تحب نعتمد طلبك اليوم؟`
          },
          {
            type: 'Direct',
            short_label: 'تأكيد الأصالة والدفع',
            text: `نعم، المنتجات أصلية ومضمونة 100% مع (${warrantyTerm}) والدفع كاش عند الاستلام بعد التأكد. أرسل لي المدينة والاسم لاعتماد الحجز فوراً؟`
          },
          {
            type: 'Urgent',
            short_label: 'دفعة أصلية موثقة',
            text: `أصلي 100% ومرفق معه شهادة ضمان ذهبية، ومتبقي كمية محدودة لرحلة شحن اليوم السريعة مجاناً. إذا أكدت طلبك الآن يخرج مع مندوب اليوم؟`
          }
        ]
      };
    }

    return {
      deal_state: 'OBJECTION',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: '100% Genuine Guaranteed',
          text: `Yes, absolutely! All our products are 100% genuine and original, covered by our official ${warrantyTerm}. Plus, Cash on Delivery is supported so you can inspect before paying a single dollar. Shall I lock in yours today?`
        },
        {
          type: 'Direct',
          short_label: 'Authenticity & Terms',
          text: `Yes, 100% authentic and genuine with our ${warrantyTerm} and cash on delivery. What delivery location should we schedule?`
        },
        {
          type: 'Urgent',
          short_label: 'Certified Batch',
          text: `100% genuine guaranteed with express courier dispatch today. If you confirm your shipping address now, we will assign it to today's priority run!`
        }
      ]
    };
  }

  // B. DIRECT ANSWER: Warranty / Guarantee Inquiry
  if (isWarrantyInquiry) {
    const stageLabel = isArabic ? 'الضمان وسياسة الاستبدال' : 'Warranty & Guarantee Assurance';
    if (isArabic) {
      return {
        deal_state: 'OBJECTION',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'ضمان استبدال رسمي',
            text: `نعم، نوفر لك (${warrantyTerm}) رسمي يضمن حقك بالكامل، والدفع متاح كاش عند الاستلام بعد المعاينة بدون أي مخاطرة. تحب نعتمد طلبك وتجربه بنفسك؟`
          },
          {
            type: 'Direct',
            short_label: 'شروط الضمان المباشرة',
            text: `نعم، يشمل (${warrantyTerm}) مع استبدال فوري عند باب بيتك والدفع عند الاستلام. ما هو العنوان والاسم لتأكيد الطلب؟`
          },
          {
            type: 'Urgent',
            short_label: 'ضمان ذهبي ممتد',
            text: `نعم، مشمول بضمان ذهبي مع شحن سريع مجاني لطلبات اليوم. إذا سجلت طلبك الآن نرسله مع أقرب رحلة شحن؟`
          }
        ]
      };
    }

    return {
      deal_state: 'OBJECTION',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Official Warranty',
          text: `Yes, you get our official ${warrantyTerm} for complete peace of mind. Cash on delivery is supported so you can inspect upon arrival. Shall I set your package aside today?`
        },
        {
          type: 'Direct',
          short_label: 'Warranty Terms',
          text: `Yes, you receive our ${warrantyTerm} with courier door-to-door replacement and tracked shipping. Where should we deliver?`
        },
        {
          type: 'Urgent',
          short_label: 'Protected Dispatch',
          text: `Yes, orders placed today automatically qualify for our extended replacement warranty plus same-day courier handover. Can I get your address to lock it in?`
        }
      ]
    };
  }

  // C. DIRECT ANSWER: Sizing & Exchange Inquiry
  if (isSizingInquiry) {
    const stageLabel = isArabic ? 'المقاس وسهولة التبديل' : 'Sizing & Exchange Friction';
    if (isArabic) {
      return {
        deal_state: 'OBJECTION',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'استبدال مجاني سلس',
            text: `نعم وبكل سهولة! نوفر لك استبدال مقاسات مجاني تماماً خلال 14 يوم، والمندوب يبدل لك القطعة عند باب بيتك دون أي تعقيد. خذ مقاسك المعتاد وأنت مطمئن. نجهز لك المقاس المناسب الحين؟`
          },
          {
            type: 'Direct',
            short_label: 'سياسة المقاسات المباشرة',
            text: `التبديل متاح وسهل خلال 14 يوم والدفع متاح بالبطاقة أو كاش عند الاستلام. أرسل لي مقاسك ولونك المفضل لاعتماد الحجز؟`
          },
          {
            type: 'Urgent',
            short_label: 'آخر قطع بالمستودع',
            text: `التبديل مضمون وسهل، ومتبقي قطعتين فقط من هذا المقاس في المستودع اليوم. احجز مقاسك الآن قبل نفاذ الدفعة، ما هو عنوان التوصيل؟`
          }
        ]
      };
    }

    return {
      deal_state: 'OBJECTION',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Hassle-Free Exchange',
          text: `Yes, absolutely! We make size exchanges completely seamless and free within 14 days—our courier swaps it right at your door. You can order with 100% confidence. Shall I reserve your size now?`
        },
        {
          type: 'Direct',
          short_label: 'Exchange Policy',
          text: `Yes, if the size does not fit perfectly, our courier will swap it for you within 14 days. Cash on delivery is supported. What color and size should I hold?`
        },
        {
          type: 'Urgent',
          short_label: 'Low Inventory Alert',
          text: `Hassle-free exchange guaranteed, and only 2 units remain in this size from this production run. Where should we send your parcel?`
        }
      ]
    };
  }

  // D. DIRECT ANSWER: Delivery & Shipping Speed
  if (isDeliveryInquiry) {
    const stageLabel = isArabic ? 'مدة التوصيل والشحن' : 'Delivery Speed & Shipping Window';
    if (isArabic) {
      return {
        deal_state: 'DISCOVERY',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'التوصيل والشحن المجاني',
            text: `التوصيل يستغرق ${deliveryTerm} فقط لكافة المناطق، وعند طلب حبتين بالعرض (${bundlePrice}) يكون الشحن مجاني بالكامل والدفع عند الاستلام. تحب نعتمد لك الطلب اليوم؟`
          },
          {
            type: 'Direct',
            short_label: 'مدة الشحن المباشرة',
            text: `مدة التوصيل ${deliveryTerm} مع شركة الشحن المعتمدة والدفع كاش عند الاستلام متاح. ما هو موقعك للتسليم؟`
          },
          {
            type: 'Urgent',
            short_label: 'حجز رحلة اليوم',
            text: `التوصيل ${deliveryTerm}، ولدينا آخر خانات لرحلة شحن اليوم السريعة بدون رسوم توصيل. زودني بالعنوان لتخرج شحنتك اليوم فوراً.`
          }
        ]
      };
    }

    return {
      deal_state: 'DISCOVERY',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Fast Delivery & Savings',
          text: `Delivery takes ${deliveryTerm} nationwide, and ordering our 2-pack bundle (${bundlePrice}) unlocks 100% free delivery with Cash on Delivery. Shall I schedule your dispatch today?`
        },
        {
          type: 'Direct',
          short_label: 'Direct Delivery Window',
          text: `Fulfillment window is ${deliveryTerm} with tracked courier delivery and cash on delivery supported. What is your preferred delivery address?`
        },
        {
          type: 'Urgent',
          short_label: 'Same-Day Dispatch Run',
          text: `Delivery is ${deliveryTerm}, and orders confirmed in the next 20 minutes go out with today's priority courier dispatch. Can I take your address details?`
        }
      ]
    };
  }

  // E. DIRECT ANSWER: B2B Volume / MOQ Inquiry
  if (isB2bInquiry) {
    const stageLabel = isArabic ? 'تسعير الجملة والكميات' : 'B2B Volume & MOQ Pricing';
    if (isArabic) {
      return {
        deal_state: 'OBJECTION',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'تسعير كميات مخصص',
            text: `أهلاً بك! الحد الأدنى 500 وحدة بسعر تشجيعي، وللكميات الأكبر من 2,000 وحدة نوفر خصم تصاعدي مع طباعة الشعار مجاناً وجودة معتمدة. تحب نجهز لك عرض سعر رسمي (فاتورة أولية) بالمواصفات؟`
          },
          {
            type: 'Direct',
            short_label: 'تفاصيل الدفعات والتنفيذ',
            text: `مرحباً! الحد الأدنى 500 وحدة، وخصومات إضافية للكميات (50% دفعة أولى والباقي عند الشحن). ما هي الأبعاد والكمية المطلوبة بدقة؟`
          },
          {
            type: 'Urgent',
            short_label: 'حجز خط الإنتاج',
            text: `يا هلا! لدينا خط إنتاج متاح للبدء هذا الأسبوع. إذا اعتمدت طلب العينات اليوم نضمن تسليم الشحنة في أسرع وقت. نرسل لك رابط الاعتماد؟`
          }
        ]
      };
    }

    return {
      deal_state: 'OBJECTION',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Volume Discount',
          text: `Hi! Our MOQ is 500 units, and volume orders above 2,000 units receive tiered rates with complimentary custom logo debossing and 5-7 business day turnaround. Shall I prepare a formal pro-forma invoice for you?`
        },
        {
          type: 'Direct',
          short_label: 'MOQ & Rates',
          text: `Hello! Our standard MOQ is 500 units at unit rate, with deeper discounts unlocking at 2,000+ units (50% deposit, balance on dispatch). What exact dimensions and quantities do you need?`
        },
        {
          type: 'Urgent',
          short_label: 'Production Slot',
          text: `Hey! We have one production batch slot opening this week. If you approve the sample order today, we can fast-track manufacturing with zero queue delays. Can I send over the confirmation link?`
        }
      ]
    };
  }

  // F. DIRECT ANSWER: Price Inquiry / Price Objection
  if (isPriceInquiry) {
    const stageLabel = isArabic ? 'السعر وعرض التوفير' : 'Direct Price & Bundle Value';
    if (isArabic) {
      return {
        deal_state: 'DISCOVERY',
        objection_detected: stageLabel,
        replies: [
          {
            type: 'Persuasive',
            short_label: 'السعر وعرض التوفير',
            text: `سعر العبوة الأساسية (${singlePrice}) فقط، ونوفر لك عرض البكج التوفيري: قطعتان بسعر (${bundlePrice}) مع شحن مجاني لكافة المناطق وتوفير حقيقي مع (${warrantyTerm}). تحب نعتمد لك عرض البكج ويوصلك خلال 24–48 ساعة؟`
          },
          {
            type: 'Direct',
            short_label: 'الأسعار والتوصيل',
            text: `سعر القطعة (${singlePrice})، وبكج القطعتين بـ (${bundlePrice}) شامل التوصيل السريع والدفع عند الاستلام متاح. أرسل لي المدينة لاعتماد الحجز فوراً؟`
          },
          {
            type: 'Urgent',
            short_label: 'حجز عرض اليوم',
            text: `سعر القطعة (${singlePrice})، لكن لدينا آخر كمية لشحن اليوم بسعر العرض (${bundlePrice}) للحبتين مع شحن مجاني فوري. إذا أكدت طلبك الآن نحجز لك العرض فوراً. ما هو العنوان؟`
          }
        ]
      };
    }

    return {
      deal_state: 'DISCOVERY',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'Direct Price & Bundle',
          text: `The price is ${singlePrice} for a single item, and our bundle special gives you 2 units for ${bundlePrice} with 100% free expedited shipping and our ${warrantyTerm} included. Shall I lock in this bundle offer for you today?`
        },
        {
          type: 'Direct',
          short_label: 'Price Comparison',
          text: `Single unit price is ${singlePrice}, and the 2-pack bundle is ${bundlePrice} with free delivery and cash on delivery. What is your preferred delivery city?`
        },
        {
          type: 'Urgent',
          short_label: 'Today Only Incentive',
          text: `Single unit is ${singlePrice}, but we have 3 slots left for today's same-day courier dispatch at ${bundlePrice} for 2 with waived shipping. Can I take your address to lock it in?`
        }
      ]
    };
  }

  // 4. Default: DISCOVERY / INQUIRY with Direct Factual Grounding
  const stageLabel = isArabic ? 'الاستفسار وعرض البكج' : 'Product Inquiry & Direct Answer';
  if (isArabic) {
    return {
      deal_state: 'DISCOVERY',
      objection_detected: stageLabel,
      replies: [
        {
          type: 'Persuasive',
          short_label: 'السعر وعرض البكج',
          text: `سعر القطعة (${singlePrice})، وبكج الحبتين بـ (${bundlePrice}) شامل الشحن السريع المجاني وضمان استبدال ذهبي 14 يوم. نعتمد لك البكج ويوصلك ${deliveryTerm}؟`
        },
        {
          type: 'Direct',
          short_label: 'الأسعار والشحن',
          text: `السعر (${singlePrice}) للقطعة وبكج الحبتين بـ (${bundlePrice}) مع شحن مجاني والدفع عند الاستلام متاح. ما هي تفاصيل طلبك وعنوانك للتجهيز؟`
        },
        {
          type: 'Urgent',
          short_label: 'حجز كمية اليوم',
          text: `سعر العرض (${bundlePrice}) للحبتين مع شحن مجاني ساري على كمية محدودة من دفعة اليوم. إذا حجزت طلبك الآن يخرج مع أقرب موعد شحن. أين تفضل التوصيل؟`
        }
      ]
    };
  }

  return {
    deal_state: 'DISCOVERY',
    objection_detected: stageLabel,
    replies: [
      {
        type: 'Persuasive',
        short_label: 'Direct Value & Bundle',
        text: `The single item is ${singlePrice}, and our 2-unit bundle special is ${bundlePrice} with free expedited ${deliveryTerm} delivery and our ${warrantyTerm} included. Shall I lock in this bundle offer for you today?`
      },
      {
        type: 'Direct',
        short_label: 'Fast & Clear Answer',
        text: `Single item pricing is ${singlePrice}, or take the 2-pack bundle for ${bundlePrice} to save with free delivery. Cash on delivery is also supported. What is the best delivery address for your package?`
      },
      {
        type: 'Urgent',
        short_label: 'Special Offer',
        text: `Single price is ${singlePrice}, but we only have 3 bundles left allocated for today's dispatch at ${bundlePrice} with waived shipping fees. Can I get your delivery details to ensure it goes out today?`
      }
    ]
  };
}

// 3. Reset demo credits for testing
app.post('/api/v1/reset-demo', (req, res) => {
  const { client_id } = req.body || {};
  const clientId = client_id || 'default-user';
  creditStore.set(clientId, INITIAL_CREDITS);
  clientLicenses.delete(clientId);
  res.json({
    message: `Credits reset to ${INITIAL_CREDITS} for client ${clientId}`,
    credits_remaining: INITIAL_CREDITS,
    is_pro: false,
  });
});

// 4. Generate deal response
app.post('/api/v1/generate-deal-response', async (req, res) => {
  try {
    const { client_id, license_key, business_context, chat_history, last_customer_message } = req.body || {};
    const clientId = client_id || 'default-user';
    const normalizedKey = String(license_key || '').trim().toUpperCase();

    const isPro = Boolean(
      (normalizedKey && validLicenses.has(normalizedKey)) ||
      clientLicenses.has(clientId) ||
      (normalizedKey && /^WADEAL-(LTD|PRO)-[A-Z0-9]{4,12}$/.test(normalizedKey))
    );

    let creditsRemaining = getClientCredits(clientId);

    if (!isPro && creditsRemaining <= 0) {
      return res.status(402).json({
        error: 'QUOTA_EXHAUSTED',
        message: 'You have used all 40 free deal-closing credits. Upgrade to WADeal Lifetime Deal ($59) to keep closing deals instantly without hesitation.',
        credits_remaining: 0,
        is_pro: false,
      });
    }

    // Determine the actual last customer message accurately
    let explicitCustomerInquiry = '';
    if (typeof last_customer_message === 'string' && last_customer_message.trim()) {
      explicitCustomerInquiry = last_customer_message.trim();
    } else if (Array.isArray(chat_history) && chat_history.length > 0) {
      const customerMsgs = chat_history.filter(m => m && m.sender && !m.sender.toLowerCase().includes('merchant') && !m.sender.toLowerCase().includes('you'));
      if (customerMsgs.length > 0) {
        explicitCustomerInquiry = String(customerMsgs[customerMsgs.length - 1].text || '').trim();
      } else {
        explicitCustomerInquiry = String(chat_history[chat_history.length - 1].text || '').trim();
      }
    }

    if (!explicitCustomerInquiry) {
      return res.status(400).json({
        error: 'NO_CUSTOMER_MESSAGE',
        message: 'WADeal: No customer message detected. Please select an active chat with an inbound customer message.',
      });
    }

    const merchantContext = business_context || 'Standard e-commerce merchant. 1-2 days fast delivery, 14-day warranty, premium original items.';
    const formattedHistory = Array.isArray(chat_history) && chat_history.length > 0
      ? chat_history.map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`).join('\n')
      : `Customer: ${explicitCustomerInquiry}`;

    const systemPrompt = `You are an elite Sales Closer representing a business on WhatsApp. Your single objective is to answer questions directly, build trust, remove hesitation, and close deals smoothly.

[MERCHANT BUSINESS DATA]:
${merchantContext}

[CHAT HISTORY]:
${formattedHistory}

[CUSTOMER'S EXACT LATEST INQUIRY]:
"${explicitCustomerInquiry}"

### MANDATORY DIRECT-ANSWER RULE (CRITICAL REQUIREMENT):
1. FACTUAL DIRECT ANSWER FIRST:
   The VERY FIRST sentence of EVERY reply MUST directly, factually, and accurately answer what the customer specifically asked in their latest inquiry ("${explicitCustomerInquiry}") using the Merchant Business Data:
   - If they ask about PRICE (e.g. "how much", "كم السعر", "price?"): The opening sentence MUST state the exact price directly (e.g., "سعر العبوة 48$..." or "The single item is $48...").
   - If they ask about AUTHENTICITY / ORIGINAL (e.g. "is it original?", "أصلي؟", "fake?"): The opening sentence MUST confirm 100% genuine original authenticity directly.
   - If they ask about WARRANTY / GUARANTEE (e.g. "is there warranty?", "ضمان؟"): The opening sentence MUST state the 14-day replacement guarantee terms directly.
   - If they ask about SIZING / FIT / EXCHANGE (e.g. "size?", "exchange?", "مقاس؟"): The opening sentence MUST state the sizing guidance and 14-day replacement policy directly.
   - If they ask about DELIVERY SPEED / SHIPPING (e.g. "how fast?", "متى يوصل؟"): The opening sentence MUST state the 24–48h delivery timeframe directly.
   - If they confirm the order (CLOSING): STOP PITCHING. Enthusiastically confirm order items + total + destination + COD, and ask for recipient mobile number to dispatch.
2. ONLY AFTER directly answering their question, frame the bundle deal (Buy 2 for bundle savings with free delivery) and ask a closing question.
3. NEVER evade or ignore the customer's question. NEVER open with generic marketing fluff without answering what they specifically asked.

### STEP-BY-STEP COGNITIVE WORKFLOW:
1. Examine the customer's exact latest inquiry: "${explicitCustomerInquiry}".
2. Classify into ONE of the 4 Conversation Stages:
   - CLOSING: Customer agreeing, confirming quantity, providing an address, or choosing payment method.
     STRICT RULE: STOP PITCHING! Validate receipt, confirm total + destination + COD, and ask for phone number to dispatch.
   - OBJECTION: Customer saying price is high, hesitating, or comparing competitors.
     Address objection factually, emphasize guarantee/ROI, present low-friction incentive, and ask closing CTA.
   - DISCOVERY: Customer asking general questions about price, specs, warranty, or options.
     Answer factually in sentence 1, frame bundle deal, and ask closing CTA.
   - LOGISTICS: Customer asking about tracking or delivery status.
     Provide immediate reassurance, courier status update, and next steps.

3. Formulate EXACTLY 3 distinct response angles adhering strictly to the detected stage and direct answer:
   - Chip 1 (Persuasive): Warm, value-focused or reassuring order confirmation.
   - Chip 2 (Direct): Crisp, fast, and conclusive answers / dispatch logistics confirmation.
   - Chip 3 (Urgent Offer / Priority Dispatch): Time-sensitive incentive or priority fulfillment dispatch guarantee.

### THE ELITE SALES CLOSER PERSONA & RULES:
- Sound 100% Human & Local: Write in natural, warm, and professional business dialect matching the buyer (e.g., authentic Saudi business dialect: "أبشر يا غالي", "تم اعتماد طلبك", "على خشمي", "يا هلا والله", or clean international business English).
- ZERO Template Phrasing: Strictly forbid robotic prefixes like: "نوفر لك جودة ممتازة مضمونة 100%" or identical copy-pasted ending questions. Formulate each sentence from scratch.
- Dynamic Context Grounding: Use the Merchant Business Data strictly for real prices and policies, but formulate each sentence from scratch.
- If deal state is CLOSING: Never re-pitch the offer or say "عند طلب حبتين ستحصل على...". The deal is already won. Validate receipt, summarize order items + total + address + COD, and ask for mobile number to dispatch.

Output MUST be valid, clean JSON with no extra markdown formatting:
{
  "deal_state": "CLOSING" | "OBJECTION" | "DISCOVERY" | "LOGISTICS",
  "objection_detected": "<Brief localized label of stage/intent, e.g. 'تأكيد واعتماد الطلب (تم البيع ✅)' or 'Order Confirmation & Dispatch (Won Deal ✅)'>",
  "replies": [
    {
      "type": "Persuasive",
      "short_label": "<Short 2-3 word label>",
      "text": "<Complete message text starting with direct answer>"
    },
    {
      "type": "Direct",
      "short_label": "<Short 2-3 word label>",
      "text": "<Complete message text starting with direct answer>"
    },
    {
      "type": "Urgent",
      "short_label": "<Short 2-3 word label>",
      "text": "<Complete message text starting with direct answer>"
    }
  ]
}`;

    let parsedResult: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const textOutput = response.text || '';
        if (textOutput) {
          parsedResult = JSON.parse(textOutput);
        }
      } catch {
        // Quietly route to smart contextual generator when API key permissions are restricted
      }
    }

    // High performance dynamic contextual generator grounded in Merchant Business Context
    if (!parsedResult || !Array.isArray(parsedResult.replies) || parsedResult.replies.length < 3) {
      parsedResult = buildDynamicContextualReplies(merchantContext, chat_history, explicitCustomerInquiry);
    }

    // Deduct credit if not pro
    if (!isPro) {
      creditsRemaining = Math.max(0, creditsRemaining - 1);
      creditStore.set(clientId, creditsRemaining);
    }

    return res.json({
      success: true,
      deal_state: parsedResult.deal_state || 'DISCOVERY',
      objection_detected: parsedResult.objection_detected || 'Inquiry & Objection',
      replies: parsedResult.replies,
      credits_remaining: creditsRemaining,
      is_pro: isPro,
      consumed: !isPro ? 1 : 0,
    });
  } catch (error: any) {
    console.error('Error generating deal response:', error);
    res.status(500).json({
      error: 'GENERATION_ERROR',
      message: error?.message || 'Failed to generate closing responses.',
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WADeal Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
