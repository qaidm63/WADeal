export interface TacticalReply {
  type: 'Persuasive' | 'Direct' | 'Urgent';
  short_label: string;
  text: string;
}

export interface DealResponseResult {
  success: boolean;
  customer_persona: 'Driver' | 'Skeptic' | 'Value Maximizer' | 'Hesitant';
  deal_state: 'CLOSING' | 'OBJECTION' | 'DISCOVERY' | 'LOGISTICS';
  objection_detected: string;
  replies: TacticalReply[];
  credits_remaining: number;
  is_pro: boolean;
  consumed: number;
}

export function generateClientFallbackDealResponse(
  businessContext: string,
  lastCustomerMessage: string,
  chatHistory: Array<{ sender: string; text: string }> = [],
  lang?: 'en' | 'ar'
): DealResponseResult {
  const inquiry = (lastCustomerMessage || '').trim();
  const context = (businessContext || '').trim();
  const isArabic = lang ? lang === 'ar' : (/[\u0600-\u06FF]/.test(inquiry) || /[\u0600-\u06FF]/.test(context));

  // Extract policy cues
  const singlePriceMatch = context.match(/(?:سعر|الحبة|العبوة|قطعة|price|standard|single)[^$\d]*([$£€]?\s*\d+(?:\.\d+)?|\d+\s*[$£€]?)/i);
  const bundleMatch = context.match(/(?:حبتين|قطعتين|بكج|bundle|buy 2)[^$\d]*([$£€]?\s*\d+(?:\.\d+)?|\d+\s*[$£€]?)/i);
  const singlePrice = singlePriceMatch ? singlePriceMatch[1].trim() : (isArabic ? '48$' : '$48');
  const bundlePrice = bundleMatch ? bundleMatch[1].trim() : (isArabic ? '80$' : '$80');

  const lowerInquiry = inquiry.toLowerCase();

  // 1. ORDER CONFIRMATION / CLOSING SIGNALS
  const isOrderConfirmation =
    /(?:تمام|اعتمد|جهز|احجز|أرسل|ارسل|أكد|اكد|تم الطلب|جاهز للطلب|اريد|أريد|ابغى|أبغى|ابي|أبي|buy|confirm|order|ship it|send it)/i.test(inquiry) &&
    /(?:حبة|حبتين|قطعة|قطعتين|العرض|البكج|الرياض|جدة|الدمام|طريق|شارع|حي|عند الاستلام|cod|address)/i.test(inquiry);

  if (isOrderConfirmation) {
    const isKingFahd = /الملك فهد/i.test(inquiry);
    const locationMention = isKingFahd ? (isArabic ? 'طريق الملك فهد بالرياض' : 'King Fahd Road, Riyadh') : (isArabic ? 'عنوانك' : 'your address');

    return {
      success: true,
      customer_persona: 'Driver',
      deal_state: 'CLOSING',
      objection_detected: isArabic ? 'تأكيد واعتماد الطلب (تم البيع ✅)' : 'Order Confirmation (Deal Won ✅)',
      replies: [
        {
          type: 'Persuasive',
          short_label: isArabic ? 'إغلاق فوري مباشر' : 'Instant Order Confirmation',
          text: isArabic
            ? `أبشر بسعدك يا غالي وعلى خشمي! تم تأكيد طلبك لبكج الحبتين بالعرض (${bundlePrice}) وتجهيز الشحن إلى ${locationMention} مع الدفع عند الاستلام كاش. فضلاً أرسل لي رقم الجوال للتواصل لاعتماد بوليصة المندوب فوراً.`
            : `Delighted to serve you! Your 2-piece bundle order (${bundlePrice}) is confirmed for delivery to ${locationMention} with Cash on Delivery. Please share your phone number so our courier can dispatch your shipment today.`
        },
        {
          type: 'Direct',
          short_label: isArabic ? 'تأكيد بدون مخاطرة' : 'Risk-Free Delivery Handover',
          text: isArabic
            ? `يا هلا والله! تم تثبيت حجز بكج الحبتين (${bundlePrice}) والتوصيل مجاني إلى ${locationMention} والدفع كاش عند الاستلام بعد معاينة طلبك بنفسك مع ضمان 14 يوم. ياليت تزودنا برقم الجوال لجدولة تسليم المندوب اليوم.`
            : `Order locked in! 2-item bundle (${bundlePrice}) with free delivery to ${locationMention}. Inspect upon arrival and pay cash with a 14-day warranty. Please provide your contact number for today's courier run.`
        },
        {
          type: 'Urgent',
          short_label: isArabic ? 'حجز رحلة الشحن' : 'Courier Cutoff Confirmation',
          text: isArabic
            ? `أبشر بعزك! تم حجز بكج الحبتين (${bundlePrice}) وإدراجه في رحلة شحن اليوم الصباحية المتجهة إلى ${locationMention} والدفع عند الاستلام. أرسل لي رقم الجوال الآن لطباعة البوليصة وخروج المندوب فوراً.`
            : `Priority registered! Your bundle (${bundlePrice}) is queued for today's express dispatch to ${locationMention}. Send your contact number now to print the shipping label right away.`
        }
      ],
      credits_remaining: 39,
      is_pro: false,
      consumed: 1
    };
  }

  // 2. SKEPTIC: AUTHENTICITY & WARRANTY
  const isAuthenticityWarranty = /(?:أصلي|اصلي|مقلد|تأكد|ضمان|استبدال|استرجاع|authentic|genuine|warranty|guarantee)/i.test(inquiry);
  if (isAuthenticityWarranty) {
    return {
      success: true,
      customer_persona: 'Skeptic',
      deal_state: 'OBJECTION',
      objection_detected: isArabic ? 'السعر والأصالة وضمان الاستبدال' : 'Authenticity & Warranty Inquiries',
      replies: [
        {
          type: 'Persuasive',
          short_label: isArabic ? 'أصلي وتوفير ذكي' : '100% Genuine & Value Math',
          text: isArabic
            ? `أهلاً بك يا غالي! سعر العبوة (${singlePrice}) والمنتج أصلي 100% ومستورد بجودة فاخرة مضمونة. نوفر لك ضمان استبدال رسمي لمدة 14 يوماً مع إمكانية المعاينة والدفع عند الاستلام لتطمئن تماماً. ومتاح لك عرض البكج التوفيري: حبتين بسعر (${bundlePrice}) فقط مع شحن مجاني لكافة المناطق وتوفير حقيقي. تحب نعتمد لك حبة ولا تستفيد من توفير البكج؟`
            : `Standard bottle is ${singlePrice} and 100% original guaranteed. We provide an official 14-day replacement warranty with cash on delivery and physical inspection upon arrival. Our smart bundle offer is 2 for ${bundlePrice} with free shipping. Would you prefer 1 bottle or the savings bundle?`
        },
        {
          type: 'Direct',
          short_label: isArabic ? 'حسم وضمان كامل' : 'Decisive Proof & Risk Reversal',
          text: isArabic
            ? `يا هلا والله! الحبة بـ (${singlePrice}) وهي أصلية ومضمونة 100% بدون أدنى شك. ولا تدفع أي ريال إلا بعد ما يوصلك المندوب وتفحص العبوة بنفسك مع ضمان استبدال رسمي لمدة 14 يوم. كما نوفر عرض الحبتين بـ (${bundlePrice}) مع توصيل مجاني سريع. أين تحب نوصل لك الطلب؟`
            : `Direct price is ${singlePrice}, 100% certified authentic. Zero upfront risk: pay only after inspecting your order with the courier, backed by a 14-day warranty. Bundle: 2 for ${bundlePrice} with free shipping. Where shall we deliver?`
        },
        {
          type: 'Urgent',
          short_label: isArabic ? 'حجز الدفعة الموثقة' : 'Verified Batch Reservation',
          text: isArabic
            ? `أهلاً بك! الحبة بـ (${singlePrice}) وأصلية 100% مع ضمان استبدال رسمي 14 يوماً، ومتبقي كمية محدودة لرحلة شحن اليوم بسعر العرض (${bundlePrice}) للحبتين مع شحن مجاني فوري. إذا أكدت طلبك الآن نحجز لك العرض قبل نفاذ دفعة اليوم، ما هو عنوان التوصيل؟`
            : `Guaranteed authentic at ${singlePrice} with official 14-day warranty. Limited units left in today's warehouse batch eligible for the ${bundlePrice} double-pack deal with free express dispatch. Shall we reserve yours before today's cutoff?`
        }
      ],
      credits_remaining: 39,
      is_pro: false,
      consumed: 1
    };
  }

  // 3. DRIVER: SHORT PRICE INQUIRY ("السعر؟", "كم؟")
  const isShortPrice = inquiry.length <= 15 && /(?:سعر|السعر|بكم|كم|price|cost|how much)/i.test(inquiry);
  if (isShortPrice) {
    return {
      success: true,
      customer_persona: 'Driver',
      deal_state: 'DISCOVERY',
      objection_detected: isArabic ? 'استفسار سريع عن السعر (Driver Persona)' : 'Fast Price Inquiry (Driver Persona)',
      replies: [
        {
          type: 'Persuasive',
          short_label: isArabic ? 'حسم مباشر وتوفير' : 'Direct Price & Bundle Math',
          text: isArabic
            ? `أهلاً بك يا غالي! الحبة بـ ${singlePrice}، ومتاح عرض حبتين بـ ${bundlePrice} مع شحن مجاني ودفع عند الاستلام. تحب نعتمد لك حبة ولا تستفيد من عرض التوفير؟`
            : `Single item is ${singlePrice}. We also offer a bundle deal: 2 for ${bundlePrice} with free delivery and Cash on Delivery. Would you like a single piece or the savings bundle?`
        },
        {
          type: 'Direct',
          short_label: isArabic ? 'السعر والشحن السريع' : 'Direct Bottom-Line Figures',
          text: isArabic
            ? `يا هلا والله! سعر الحبة (${singlePrice})، وبكج الحبتين بـ (${bundlePrice}) شامل الشحن السريع المجاني والدفع عند الاستلام بعد المعاينة مع ضمان استبدال 14 يوم. أرسل لي مدينتك لاعتماد الحجز فوراً؟`
            : `Direct price: ${singlePrice} single, or 2 for ${bundlePrice} with free courier shipping and cash on delivery. Send your city to lock in the reservation.`
        },
        {
          type: 'Urgent',
          short_label: isArabic ? 'حجز كمية العرض' : 'Same-Day Allocation Slot',
          text: isArabic
            ? `أهلاً بك! الحبة بـ (${singlePrice})، ومتبقي آخر كمية مخصصة لشحن اليوم بسعر العرض (${bundlePrice}) للحبتين مع شحن مجاني فوري. تحب نحجز لك العرض قبل خروج مندوب اليوم؟`
            : `Current price is ${singlePrice}, with our best-value 2-pack at ${bundlePrice} with free same-day shipping. Shall we reserve your package before today's dispatch cutoff?`
        }
      ],
      credits_remaining: 39,
      is_pro: false,
      consumed: 1
    };
  }

  // 4. DELIVERY SPEED / DISPATCH SCHEDULING (Subtext: Mental Buy Decision Made)
  const isAskingDelivery = /(?:توصيل|شحن|متى يوصل|مدة التوصيل|delivery|ship|shipping|how fast|arrive)/i.test(inquiry);
  if (isAskingDelivery) {
    return {
      success: true,
      customer_persona: 'Driver',
      deal_state: 'DISCOVERY',
      objection_detected: isArabic ? 'مدة التوصيل وجدولة الشحن' : 'Delivery Speed & Dispatch Scheduling',
      replies: [
        {
          type: 'Persuasive',
          short_label: isArabic ? 'توصيل فوري لباب البيت' : 'Doorstep Courier Delivery',
          text: isArabic
            ? `أبشر بسعدك يا غالي! التوصيل سريع جداً خلال 24–48 ساعة فقط ومباشرة لعند باب بيتك والدفع عند الاستلام كاش. أرسل لي الحي والمدينة عشان ندرج طلبك في جدول مندوب اليوم فوراً؟`
            : `Delivery takes within 24–48 hours directly to your doorstep with Cash on Delivery supported. Which city and neighborhood should we schedule for today's courier run?`
        },
        {
          type: 'Direct',
          short_label: isArabic ? 'شحن مجاني ومباشر' : 'Fulfillment Window',
          text: isArabic
            ? `التوصيل خلال 24–48 ساعة مع شركة شحن سريعة وبدون أي دفع مسبق—تدفع عند الاستلام بعد معاينة طلبك مع ضمان 14 يوم. ما هو العنوان ورقم الجوال لتسجيل الشحنة؟`
            : `Fulfillment window is within 24–48 hours with tracked delivery and zero prepayment needed. What is the best delivery address for your package?`
        },
        {
          type: 'Urgent',
          short_label: isArabic ? 'اللحاق بشحنة اليوم' : 'Morning Dispatch Cutoff',
          text: isArabic
            ? `التوصيل خلال 24–48 ساعة، وإذا أرسلت لي بياناتك الآن نلحق نسلم شحنتك لرحلة الشحن الصباحية وتوصلك بأسرع وقت بدون رسوم توصيل. ما هو عنوانك؟`
            : `Delivery is within 24–48 hours, and orders confirmed right now go out with today's priority courier dispatch with free shipping. Can I take your address details?`
        }
      ],
      credits_remaining: 39,
      is_pro: false,
      consumed: 1
    };
  }

  // 5. GENERAL / BALANCED CLOSING
  return {
    success: true,
    customer_persona: 'Value Maximizer',
    deal_state: 'DISCOVERY',
    objection_detected: isArabic ? 'السعر وعرض البكج التوفيري' : 'Direct Price & Bundle Offer',
    replies: [
      {
        type: 'Persuasive',
        short_label: isArabic ? 'عرض البكج التوفيري' : 'Smart Savings Offer',
        text: isArabic
          ? `أهلاً بك يا غالي! الحبة بـ (${singlePrice})، والأكثر طلباً هو عرض البكج: قطعتان بسعر (${bundlePrice}) مع شحن مجاني لكافة المناطق وتوفير حقيقي مع ضمان استبدال 14 يوماً والدفع عند الاستلام. تحب نعتمد لك البكج ويوصلك خلال 24–48 ساعة؟`
          : `Hello! Single item is ${singlePrice}. Our customer favorite is the 2-pack bundle at ${bundlePrice} with free delivery, COD, and a 14-day warranty. Shall we ship this to your address?`
      },
      {
        type: 'Direct',
        short_label: isArabic ? 'حسم فوري ومعاينة' : 'Direct Delivery & Inspection',
        text: isArabic
          ? `يا هلا والله! السعر (${singlePrice}) للحبة وبكج الحبتين بـ (${bundlePrice}) شامل التوصيل السريع لعنوانك، والدفع متاح عند الاستلام بعد فحص الطلب بنفسك. أرسل لي موقعك أو مدينتك لتأكيد الحجز فوراً؟`
          : `Direct rate: ${singlePrice} single, or 2 for ${bundlePrice} including express delivery. Pay only upon inspection with the courier. Share your city to confirm right away?`
      },
      {
        type: 'Urgent',
        short_label: isArabic ? 'حجز شحن اليوم' : 'Same-Day Courier Slot',
        text: isArabic
          ? `أهلاً بك! متبقي كمية محدودة مخصصة لشحن اليوم بسعر العرض (${bundlePrice}) للحبتين مع شحن مجاني فوري. إذا أكدت طلبك الآن ندرجه في رحلة شحن اليوم مباشرة. ما هو عنوانك؟`
          : `Limited stock available in today's warehouse run at ${bundlePrice} for 2 items with free fast shipping. Confirm now to guarantee shipment today. What is your delivery city?`
      }
    ],
    credits_remaining: 39,
    is_pro: false,
    consumed: 1
  };
}
