export type Language = 'en' | 'ar';

export interface I18nDictionary {
  replyBtn: string;
  badgePro: string;
  chips: {
    persuasive: string;
    direct: string;
    urgent: string;
  };
  tags: {
    hot: string;
    followUp: string;
    won: string;
    setStage: string;
  };
  contextPlaceholder: string;
  trustBanner: string;
  langSwitch: string;
  langName: string;
  nav: {
    simulator: string;
    context: string;
    extension: string;
    compliance: string;
    api: string;
    tagline: string;
    ltdCta: string;
    trial: string;
    creditsRemainingLabel: (credits: number) => string;
    resetDemo: string;
  };
  simulator: {
    online: string;
    leadStage: string;
    searchPlaceholder: string;
    inputPlaceholder: string;
    analyzing: string;
    clickToInject: string;
    helperTooltip: string;
    simulateCustomerTitle: string;
    simulateConfirmDeal: string;
    simulateAskDiscount: string;
    simulateAskWarranty: string;
    simulateTracking: string;
    dealWonBadge: string;
    activeContextLabel: string;
    editContext: string;
    showChatList: string;
    showConversation: string;
    myStore: string;
    onlineBadge: string;
    detectedObjectionPrefix: string;
  };
  context: {
    title: string;
    subtitle: string;
    saveBtn: string;
    savedToast: string;
    presetsLabel: string;
    presetsSub: string;
    activeRulesLabel: string;
    charsLabel: string;
    activeBadge: string;
    pricingTipTitle: string;
    pricingTip: string;
    fulfillmentTipTitle: string;
    fulfillmentTip: string;
    guaranteeTipTitle: string;
    guaranteeTip: string;
  };
  paywall: {
    badgeEngine: string;
    title: string;
    subtitle: string;
    annualBadge: string;
    annualTitle: string;
    annualPrice: string;
    annualPeriod: string;
    annualSub: string;
    annualQuota: string;
    annualContext: string;
    scarcityClaimed: string;
    scarcitySlotsLeft: string;
    starterBadge: string;
    starterTitle: string;
    starterPrice: string;
    starterPeriod: string;
    starterSub: string;
    starterQuota: string;
    starterContext: string;
    monthlyBadge: string;
    monthlyTitle: string;
    monthlyPrice: string;
    monthlyPeriod: string;
    monthlySub: string;
    monthlyQuota: string;
    monthlyContext: string;
    checkoutAnnual: string;
    checkoutStarter: string;
    checkoutMonthly: string;
    whopNotice: string;
    globalSettlement: string;
    checkoutBtn: string;
    processingCheckout: string;
    cardOption: string;
    cryptoOption: string;
    haveKey: string;
    keyPlaceholder: string;
    activateBtn: string;
    features: string[];
    toastCard: (key: string) => string;
    toastCrypto: (key: string) => string;
    toastKeyVerified: string;
    toastEnterKey: string;
    toastInvalidKey: string;
    toastNetworkError: string;
  };
  compliance: {
    title: string;
    subtitle: string;
    packageTitleLabel: string;
    packageTitle: string;
    descLabel: string;
    descText: string;
    keywordsLabel: string;
    checklistLabel: string;
    singlePurposeTitle: string;
    singlePurposeDesc: string;
    limitedUseTitle: string;
    limitedUseDesc: string;
    noSpamTitle: string;
    noSpamDesc: string;
  };
  extension: {
    title: string;
    subtitle: string;
    downloadBtn: string;
    packagingText: string;
    howToTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    sourceExplorerTitle: string;
    copyCodeBtn: string;
    copiedBtn: string;
  };
  api: {
    title: string;
    subtitle: string;
    tabGenerate: string;
    tabVerify: string;
    requestParamsLabel: string;
    customerInquiryLabel: string;
    activeContextLabel: string;
    sendGenerateBtn: string;
    processingInference: string;
    licenseKeyLabel: string;
    preseededKeysLabel: string;
    annualKeyName: string;
    starterKeyName: string;
    ltdKeyName: string;
    monthlyKeyName: string;
    validateKeyBtn: string;
    verifyingKey: string;
    responseInspectorLabel: string;
    clickToSendPrompt: string;
  };
}

export const i18nDictionary: Record<Language, I18nDictionary> = {
  en: {
    replyBtn: "⚡ WADeal Reply",
    badgePro: "PRO UNLIMITED 👑",
    chips: {
      persuasive: "Persuasive",
      direct: "Direct",
      urgent: "Urgent"
    },
    tags: {
      hot: "🔥 Hot / Ready to Buy",
      followUp: "⏳ Follow-up",
      won: "✅ Deal Won",
      setStage: "🏷️ Set Lead Stage"
    },
    contextPlaceholder: "Enter your business pricing, policies, and terms...",
    trustBanner: "Messages are end-to-end encrypted. WADeal acts 100% human-in-the-loop with zero ban risk.",
    langSwitch: "عربي",
    langName: "English",
    nav: {
      simulator: "WhatsApp Web Simulator",
      context: "Business Context",
      extension: "Extension Package (.ZIP)",
      compliance: "Store SEO & Compliance",
      api: "API Backend",
      tagline: "AI Sales Closer & Quick Reply for WhatsApp Web",
      ltdCta: "Early-Bird Deal ($59)",
      trial: "Trial",
      creditsRemainingLabel: (credits: number) => `Trial: ${credits} / 40 credits`,
      resetDemo: "Reset demo credits"
    },
    simulator: {
      online: "online • Ready for deal closure",
      leadStage: "Lead Stage:",
      searchPlaceholder: "Search or start new chat",
      inputPlaceholder: "Type a message or click any WADeal chip above...",
      analyzing: "Analyzing Objections...",
      clickToInject: "Click chip to inject into chat",
      helperTooltip: "Click ⚡ WADeal Reply to generate 3 tailored closing replies grounded in your business rules.",
      simulateCustomerTitle: "Simulate Customer Stage:",
      simulateConfirmDeal: "Order 2 bundles (Closing ✅)",
      simulateAskDiscount: "Ask for discount (Objection 💬)",
      simulateAskWarranty: "Ask warranty & specs (Inquiry 🔍)",
      simulateTracking: "Track order (Logistics 🚚)",
      dealWonBadge: "DEAL WON • LOCKED IN ✅",
      activeContextLabel: "Active Micro-Business Context:",
      editContext: "Edit Context ✏️",
      showChatList: "Chats",
      showConversation: "Active Chat",
      myStore: "My Store",
      onlineBadge: "Online",
      detectedObjectionPrefix: "🎯 Objection:"
    },
    context: {
      title: "Micro-Business Context Engine (PRD 2.1)",
      subtitle: "Enter your business parameters once. WADeal dynamically injects this block into all sales prompts to guarantee zero hallucinations and accurate pricing.",
      saveBtn: "Save Business Rules",
      savedToast: "Saved & Active!",
      presetsLabel: "Instant Industry Presets",
      presetsSub: "Click to load pre-configured inventory rules",
      activeRulesLabel: "Active Business Rules (Single Source of Truth)",
      charsLabel: "chars",
      activeBadge: "Active",
      pricingTipTitle: "💰 Pricing Tiers:",
      pricingTip: "Specify unit prices, bundle deals, and volume savings clearly.",
      fulfillmentTipTitle: "🚚 Fulfillment:",
      fulfillmentTip: "State delivery timeframe (24–48h) and courier payment terms (COD).",
      guaranteeTipTitle: "🛡️ Risk Reversal:",
      guaranteeTip: "Include replacement guarantees, return windows, and authenticity proof."
    },
    paywall: {
      badgeEngine: "Paywall & Licensing Engine",
      title: "Keep Closing Deals Without Hesitation 🚀",
      subtitle: '"You just saved over 2 hours and moved your deals forward with WADeal! Don\'t stall your sales pipeline—unlock unlimited closing power now."',
      // Annual Tier (Featured Hero)
      annualBadge: "Save 74% - Top Choice",
      annualTitle: "Early-Bird Annual Deal",
      annualPrice: "$59",
      annualPeriod: "/ year",
      annualSub: "Special early access for the first 50 stores. 1 full year of unlimited closing power. No monthly fees.",
      annualQuota: "Unlimited AI deal-closing responses for a full 365 days",
      annualContext: "Dual Business Context + 4D Psychological Closer Engine",
      scarcityClaimed: "38 / 50 Claimed",
      scarcitySlotsLeft: "Only 12 Remaining!",
      // Starter Tier
      starterBadge: "Solo & Micro-Business",
      starterTitle: "Starter Plan",
      starterPrice: "$9.9",
      starterPeriod: "/ month",
      starterSub: "Ideal for solo merchants and micro-businesses. 150 AI deal-closing responses / month.",
      starterQuota: "150 AI deal-closing responses / month",
      starterContext: "1 Business Profile",
      // Pro Monthly Tier
      monthlyBadge: "Scale & High Volume",
      monthlyTitle: "Pro Monthly Plan",
      monthlyPrice: "$19",
      monthlyPeriod: "/ month",
      monthlySub: "Unlimited deal-closing replies billed flexibly each month with priority server queue.",
      monthlyQuota: "Unlimited AI deal-closing responses",
      monthlyContext: "Multi-business context + Priority queue",
      // Checkout CTA Dynamic Labels
      checkoutAnnual: "Checkout with Whop ($59/year) →",
      checkoutStarter: "Checkout with Whop ($9.9/mo) →",
      checkoutMonthly: "Checkout with Whop ($19/mo) →",
      whopNotice: "Processed securely via Whop (Instant License Delivery):",
      globalSettlement: "Global Settlement",
      checkoutBtn: "Checkout with Whop",
      processingCheckout: "Processing Checkout & Issuing License...",
      cardOption: "Credit / Debit Card",
      cryptoOption: "USDT / Crypto",
      haveKey: "Already purchased? Enter your Whop License Key",
      keyPlaceholder: "e.g. WADEAL-ANNUAL-LAUNCH50",
      activateBtn: "Activate",
      features: [
        "Unlimited contextual AI deal-closing responses on WhatsApp Web",
        "Grounding in your custom Micro-Business pricing & inventory rules",
        "Lead Status Tagger with instant local stage tracking",
        "Zero-ban compliance with 100% human review before dispatch"
      ],
      toastCard: (key: string) => `Payment Confirmed via Whop (Visa/Mastercard)! License Key: ${key}`,
      toastCrypto: (key: string) => `Payment Confirmed via Whop (USDT TRC20)! License Key: ${key}`,
      toastKeyVerified: "License key verified! Unlimited closing credits unlocked.",
      toastEnterKey: "Please enter a license key.",
      toastInvalidKey: "Invalid or unrecognized key.",
      toastNetworkError: "Network error verifying license."
    },
    compliance: {
      title: "Chrome Web Store Listing Metadata & Zero-Ban Compliance (PRD Section 5)",
      subtitle: "Structured for 100% In-Store Organic Search Optimization and guaranteed Web Store policy approvals.",
      packageTitleLabel: "Official Package Title",
      packageTitle: "WADeal: AI Sales Assistant & Quick Reply for WhatsApp Web",
      descLabel: "Store Short Description (Max 132 chars)",
      descText: "Turn WhatsApp conversations into paid deals. Instant AI sales replies, objection handling, and quick answers grounded in your business pricing.",
      keywordsLabel: "Organic Store Keywords (PRD 5.1)",
      checklistLabel: "Zero-Ban & Privacy Compliance Checklist (PRD 5.2)",
      singlePurposeTitle: "Single Purpose Policy",
      singlePurposeDesc: "Positioned strictly under 'Productivity Tools' for sales workflow acceleration.",
      limitedUseTitle: "Limited Use & Ephemeral Processing",
      limitedUseDesc: "Messages are parsed strictly on-the-fly to generate suggestions; never stored or resold.",
      noSpamTitle: "No Unsolicited Automation (100% Anti-Ban)",
      noSpamDesc: "Every reply requires an explicit click to inject and review. No mass blasting or automated bots."
    },
    extension: {
      title: "Google Chrome Extension (Manifest V3) Package",
      subtitle: "Production-grade MV3 client ready to load into Google Chrome or submit to the Chrome Web Store.",
      downloadBtn: "Download Extension (.ZIP)",
      packagingText: "Packaging ZIP...",
      howToTitle: "How to Load Unpacked in Google Chrome (30 Seconds)",
      step1Title: "Unzip the Package",
      step1Desc: "Click Download Extension (.ZIP) above and extract the contents to a local folder.",
      step2Title: "Open Chrome Extensions",
      step2Desc: "Visit chrome://extensions and turn on Developer mode (top right).",
      step3Title: "Click Load Unpacked",
      step3Desc: "Click Load unpacked, choose the folder, and open WhatsApp Web!",
      sourceExplorerTitle: "Extension Source Explorer",
      copyCodeBtn: "Copy File Code",
      copiedBtn: "Copied!"
    },
    api: {
      title: "Cloud Backend API Playground (FastAPI / Express)",
      subtitle: "Test and inspect backend inference payloads, objection classification, and license validation in real-time.",
      tabGenerate: "POST /generate-deal-response",
      tabVerify: "POST /verify-license",
      requestParamsLabel: "Request Parameters",
      customerInquiryLabel: "Customer Objection / Inquiry:",
      activeContextLabel: "Active Business Context:",
      sendGenerateBtn: "Send Generate Request",
      processingInference: "Processing Inference...",
      licenseKeyLabel: "License Key to Validate:",
      preseededKeysLabel: "Pre-seeded Test License Keys:",
      annualKeyName: "(Early-Bird Annual - 365 Days)",
      starterKeyName: "(Starter Plan - 150 Credits)",
      ltdKeyName: "(Annual Special)",
      monthlyKeyName: "(Monthly SaaS)",
      validateKeyBtn: "Validate License Key",
      verifyingKey: "Verifying Key...",
      responseInspectorLabel: "Response Inspector",
      clickToSendPrompt: "Click \"Send Request\" to view live API payload."
    }
  },
  ar: {
    replyBtn: "⚡ رد WADeal الذكي",
    badgePro: "برو غير محدود 👑",
    chips: {
      persuasive: "إقناعي",
      direct: "حاسم",
      urgent: "حسم فوري"
    },
    tags: {
      hot: "🔥 جاهز للشراء",
      followUp: "⏳ متابعة",
      won: "✅ صفقة ناجحة",
      setStage: "🏷️ تحديد مرحلة العميل"
    },
    contextPlaceholder: "أدخل أسعارك، عروضك، وسياسات التوصيل والضمان هنا...",
    trustBanner: "الرسائل مشفرة تماماً. تعمل WADeal بتوافق بشري 100% دون أي خطر للحظر.",
    langSwitch: "English",
    langName: "العربية",
    nav: {
      simulator: "محاكي واتساب ويب",
      context: "سياق المتجر والأسعار",
      extension: "حزمة الإضافة (.ZIP)",
      compliance: "سيو المتجر والأمان",
      api: "واجهة البرمجة (API)",
      tagline: "مساعد المبيعات الذكي وإغلاق الصفقات لواتساب ويب",
      ltdCta: "عرض الإطلاق السنوي (59$)",
      trial: "الرصيد التجريبي",
      creditsRemainingLabel: (credits: number) => `الرصيد التجريبي: ${credits} / 40 رد متبقي`,
      resetDemo: "إعادة ضبط التجربة"
    },
    simulator: {
      online: "متصل الآن • جاهز لإتمام الصفقة",
      leadStage: "مرحلة العميل:",
      searchPlaceholder: "ابحث أو ابدأ محادثة جديدة",
      inputPlaceholder: "اكتب رسالة أو انقر على أي رد ذكي أعلاه للحقن المباشر...",
      analyzing: "جارٍ تحليل الاعتراضات...",
      clickToInject: "انقر للحقن المباشر في مربع الكتابة",
      helperTooltip: "انقر فوق ⚡ رد WADeal لتوليد 3 ردود مبيعات ذكية مقنعة تستند لأسعار متجرك.",
      simulateCustomerTitle: "محاكاة مرحلة العميل:",
      simulateConfirmDeal: "طلب حبتين بالعرض (تأكيد الشراء ✅)",
      simulateAskDiscount: "طلب تخفيض (اعتراض على السعر 💬)",
      simulateAskWarranty: "السؤال عن الضمان (استفسار 🔍)",
      simulateTracking: "تتبع الشحنة (خدمات لوجستية 🚚)",
      dealWonBadge: "تم إغلاق الصفقة بنجاح • جاهز للشحن ✅",
      activeContextLabel: "سياق وقواعد العمل النشطة:",
      editContext: "تعديل القواعد ✏️",
      showChatList: "المحادثات",
      showConversation: "المحادثة النشطة",
      myStore: "متجري الذكي",
      onlineBadge: "نشط",
      detectedObjectionPrefix: "🎯 نوع الاعتراض:"
    },
    context: {
      title: "محرك سياق المتجر والأسعار (PRD 2.1)",
      subtitle: "أدخل بيانات متجرك وأسعارك مرة واحدة، ويتم حقنها ديناميكياً في ردود الذكاء الاصطناعي لمنع أي أخطاء أو اختلاق للأسعار.",
      saveBtn: "حفظ قواعد العمل",
      savedToast: "تم الحفظ بنجاح!",
      presetsLabel: "نماذج أعمال جاهزة ومجهزة مسبقاً",
      presetsSub: "انقر لاختيار نموذج متجر جاهز للاختبار السريع",
      activeRulesLabel: "قواعد العمل النشطة (المرجع الوحيد للأسعار)",
      charsLabel: "حرف",
      activeBadge: "مفعل",
      pricingTipTitle: "💰 الأسعار والعروض:",
      pricingTip: "حدد سعر القطعة، وبكجات التوفير، وخصومات الكمية بدقة.",
      fulfillmentTipTitle: "🚚 الشحن والتوصيل:",
      fulfillmentTip: "حدد مدة التوصيل (24–48 ساعة) وخيارات الدفع عند الاستلام.",
      guaranteeTipTitle: "🛡️ الضمان والاسترجاع:",
      guaranteeTip: "اذكر ضمان الاستبدال وسياسة الاسترجاع والموثوقية."
    },
    paywall: {
      badgeEngine: "محرك الترخيص والاشتراكات",
      title: "أغلق صفقاتك بلا تردد مع WADeal 🚀",
      subtitle: '"لقد وفرت أكثر من ساعتين ودفعت صفقاتك للأمام مع WADeal! لا تدع مبيعاتك تتعطل—افتح قدرات الإغلاق غير المحدودة الآن."',
      // Annual Tier (Featured Hero)
      annualBadge: "وفر 74% - الخيار الأذكى",
      annualTitle: "عرض الإطلاق السنوي",
      annualPrice: "59$",
      annualPeriod: "/ سنوياً",
      annualSub: "عرض مخصص لأول 50 متجراً فقط. سنة كاملة من الردود غير المحدودة دون أي التزام شهري.",
      annualQuota: "ردود مبيعات ذكية غير محدودة لمدة 365 يوماً كاملة",
      annualContext: "سياق متجر مزدوج + محرك الإغلاق النفسي 4D",
      scarcityClaimed: "تم حجز 38 من 50",
      scarcitySlotsLeft: "متبقي 12 مقعداً فقط!",
      // Starter Tier
      starterBadge: "سولو والمشاريع الناشئة",
      starterTitle: "باقة الانطلاق (Starter)",
      starterPrice: "9.9$",
      starterPeriod: "/ شهرياً",
      starterSub: "مثالية للتجار الأفراد والمشاريع الناشئة. 150 رد ذكي شهرياً لإغلاق الصفقات.",
      starterQuota: "150 رد ذكي شهرياً لإغلاق الصفقات",
      starterContext: "ملف تعريفي لمتجر واحد",
      // Pro Monthly Tier
      monthlyBadge: "للمتاجر المتنامية وحجم المبيعات العالي",
      monthlyTitle: "باقة برو الشهرية (Pro)",
      monthlyPrice: "19$",
      monthlyPeriod: "/ شهرياً",
      monthlySub: "ردود مبيعات ذكية غير محدودة مع تجديد شهري وأولوية استجابة سحابية فائقة.",
      monthlyQuota: "ردود غير محدودة شهرياً",
      monthlyContext: "سياقات أعمال متعددة + أولوية معالجة",
      // Checkout CTA Dynamic Labels
      checkoutAnnual: "الدفع والتفعيل عبر Whop (59$ سنوياً) ←",
      checkoutStarter: "الدفع والتفعيل عبر Whop (9.9$ شهرياً) ←",
      checkoutMonthly: "الدفع والتفعيل عبر Whop (19$ شهرياً) ←",
      whopNotice: "معالجة آمنة وفورية عبر Whop مع تسليم فوري لمفتاح التفعيل:",
      globalSettlement: "بوابة تسوية عالمية فورية",
      checkoutBtn: "الدفع الفوري والتفعيل عبر Whop",
      processingCheckout: "جارٍ معالجة الدفع وإصدار المفتاح...",
      cardOption: "بطاقة دفع / مدى / فيزا",
      cryptoOption: "عملة رقمية USDT",
      haveKey: "هل قمت بالشراء مسبقاً؟ أدخل مفتاح الترخيص هنا",
      keyPlaceholder: "مثال: WADEAL-ANNUAL-LAUNCH50",
      activateBtn: "تفعيل الترخيص",
      features: [
        "ردود مبيعات ذكية وغير محدودة لإغلاق الصفقات عبر واتساب",
        "ربط مباشر ودقيق بأسعار متجرك وسياسات التوصيل لمنع أي هلوسة",
        "تتبع مباشر لمراحل العملاء الساخنة (جاهز للشراء / متابعة / تم البيع)",
        "أمان كامل ومكافحة حظر بنسبة 100% مع مراجعة يدوية قبل الإرسال"
      ],
      toastCard: (key: string) => `تم تأكيد الدفع بنجاح عبر Whop (بطاقة دفع)! تم تفعيل مفتاح الترخيص: ${key}`,
      toastCrypto: (key: string) => `تم تأكيد الدفع بنجاح عبر Whop (عملة USDT)! تم تفعيل مفتاح الترخيص: ${key}`,
      toastKeyVerified: "تم تفعيل الترخيص بنجاح! تم فتح الردود اللامحدودة.",
      toastEnterKey: "يرجى إدخال مفتاح الترخيص.",
      toastInvalidKey: "مفتاح ترخيص غير صالح أو غير معروف.",
      toastNetworkError: "تعذر الاتصال بخادم الترخيص."
    },
    compliance: {
      title: "بيانات متجر كروم وسياسات منع الحظر والأمان (PRD القسم 5)",
      subtitle: "مهيأة بنسبة 100% لتصدر نتائج البحث في متجر كروم وضمان اعتماد سياسات الإضافة الرسمية.",
      packageTitleLabel: "عنوان الإضافة الرسمي في متجر كروم",
      packageTitle: "WADeal: AI Sales Assistant & Quick Reply for WhatsApp Web",
      descLabel: "الوصف القصير للمتجر (132 حرف كحد أقصى)",
      descText: "حوّل محادثات واتساب إلى صفقات رابحة. ردود مبيعات ذكية ومعالجة اعتراضات فورية مستندة لأسعار متجرك.",
      keywordsLabel: "الكلمات المفتاحية العضوية للمتجر (PRD 5.1)",
      checklistLabel: "قائمة معايير الخصوصية ومكافحة الحظر بنسبة 100% (PRD 5.2)",
      singlePurposeTitle: "سياسة الغرض الفردي المحدد (Single Purpose)",
      singlePurposeDesc: "مصنفة بصرامة ضمن \"أدوات الإنتاجية\" لتسريع تدفق مبيعات التجار دون أي تشتت.",
      limitedUseTitle: "معالجة آنية مؤقتة دون تخزين (Limited Use)",
      limitedUseDesc: "تُعالج الرسائل لحظياً لتوليد الاقتراحات فقط؛ دون أي تخزين أو مشاركة لبيانات المحادثات.",
      noSpamTitle: "منع الأتمتة العشوائية (أمان 100% ضد الحظر)",
      noSpamDesc: "كل رد يتطلب نقرة بشرية للحقن والمراجعة قبل الإرسال. لا توجد رسائل جماعية أو روبوتات حظر إطلاقاً."
    },
    extension: {
      title: "حزمة إضافة جوجل كروم الرسمية (Manifest V3)",
      subtitle: "إضافة متكاملة جاهزة للتثبيت المباشر في متصفح جوجل كروم أو الرفع لمتجر Chrome Web Store.",
      downloadBtn: "تحميل حزمة الإضافة (.ZIP)",
      packagingText: "جارٍ تجهيز ملف ZIP...",
      howToTitle: "طريقة تثبيت الإضافة في متصفح كروم خلال 30 ثانية",
      step1Title: "1. فك ضغط الحزمة",
      step1Desc: "انقر على \"تحميل حزمة الإضافة (.ZIP)\" أعلاه واستخرج محتويات الملف في مجلد على جهازك.",
      step2Title: "2. افتح صفحة إضافات كروم",
      step2Desc: "توجه إلى الرابط chrome://extensions ثم فعّل \"وضع مطور البرامج\" (Developer mode) في الزاوية العلوية.",
      step3Title: "3. انقر على تحميل إضافة غير محزومة",
      step3Desc: "انقر على \"Load unpacked\" واختر مجلد الإضافة المفكوك، ثم افتح واتساب ويب وابدأ البيع!",
      sourceExplorerTitle: "مستعرض الشيفرة المصدرية للإضافة",
      copyCodeBtn: "نسخ الكود",
      copiedBtn: "تم النسخ!"
    },
    api: {
      title: "منصة اختبار واجهة البرمجة السحابية (API Playground)",
      subtitle: "اختبر استجابات الذكاء الاصطناعي، تصنيف الاعتراضات، والتحقق من التراخيص بشكل مباشر وسريع.",
      tabGenerate: "POST /generate-deal-response",
      tabVerify: "POST /verify-license",
      requestParamsLabel: "معاملات الطلب (Request Parameters)",
      customerInquiryLabel: "اعتراض أو استفسار العميل:",
      activeContextLabel: "سياق وقواعد العمل النشطة:",
      sendGenerateBtn: "إرسال طلب التوليد للـ API",
      processingInference: "جارٍ معالجة الرد الذكي...",
      licenseKeyLabel: "مفتاح الترخيص للتحقق منه:",
      preseededKeysLabel: "مفاتيح ترخيص تجريبية معتمدة مسبقاً:",
      annualKeyName: "(عرض سنوي مبكر - 365 يوماً)",
      starterKeyName: "(باقة انطلاق - 150 رد)",
      ltdKeyName: "(عرض الإطلاق السنوي)",
      monthlyKeyName: "(اشتراك شهري)",
      validateKeyBtn: "التحقق من صلاحية المفتاح",
      verifyingKey: "جارٍ التحقق...",
      responseInspectorLabel: "مستعرض استجابة الـ JSON",
      clickToSendPrompt: "انقر على \"إرسال طلب التوليد للـ API\" لعرض استجابة الخادم المباشرة."
    }
  }
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('wadeal_lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {}
  return 'en';
}

export function saveLanguagePreference(lang: Language) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('wadeal_lang', lang);
  } catch {}
}
