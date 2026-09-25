import { Contact } from '../types';
import { Language } from './i18n';

export const BUSINESS_PRESETS_EN = [
  {
    id: 'perfume',
    name: 'Luxury Perfume Brand',
    icon: '✨',
    context: 'Luxury perfume brand. Standard bottle: $48. Bundle deal: Buy 2 for $80 with free nationwide delivery. Delivery window: 24–48 hours. Cash on delivery available. 14-day replacement guarantee for sealed bottles.',
  },
  {
    id: 'tech',
    name: 'Smart Gadgets & Electronics',
    icon: '🎧',
    context: 'Smart Electronics & Accessories. TWS Pro Earbuds: $39. Bundle offer: Buy 2 get 15W Qi wireless charger free ($69 total). Same-day courier dispatch. 1-year official replacement warranty. Return within 7 days hassle-free.',
  },
  {
    id: 'fashion',
    name: 'Urban Streetwear Boutique',
    icon: '👕',
    context: 'Urban Streetwear & Modest Fashion. Signature Oversized Hoodie: $55. 2 Hoodies bundle: $95. Free shipping on orders over $75. Exchange sizes easily within 14 days. Pay by Card or Cash on Delivery.',
  },
  {
    id: 'b2b',
    name: 'B2B Wholesale Packaging',
    icon: '📦',
    context: 'Wholesale Eco-Packaging & Boxes. Minimum Order Quantity (MOQ): 500 units at $0.45/unit. Tier discount: orders above 2,000 units get $0.38/unit + free custom logo debossing. Turnaround: 5-7 business days. 50% deposit, balance on dispatch.',
  }
];

export const BUSINESS_PRESETS_AR = [
  {
    id: 'perfume',
    name: 'عطور ومستحضرات فاخرة',
    icon: '✨',
    context: 'متجر عطور فاخرة. العبوة الأساسية: 48$. عرض البكج: قطعتان بـ 80$ مع شحن مجاني لكافة المناطق. التوصيل خلال 24–48 ساعة والدفع عند الاستلام متاح مع ضمان استبدال 14 يوم للعبوات غير المفتوحة.',
  },
  {
    id: 'tech',
    name: 'إلكترونيات وأجهزة ذكية',
    icon: '🎧',
    context: 'إلكترونيات واكسسوارات ذكية. سماعات TWS Pro بسعر 39$. عرض خاص: اشترِ اثنتين واحصل على شاحن لاسلكي بقوة 15W مجاناً (69$ إجمالي). شحن بنفس اليوم وضمان سنة استبدال رسمي واسترجاع مرن خلال 7 أيام.',
  },
  {
    id: 'fashion',
    name: 'أزياء وهوديات راقية',
    icon: '👕',
    context: 'أزياء وستريت وير راقية. هودي أوفر سايز فاخر: 55$. بكج قطعتين: 95$. شحن مجاني للطلبات فوق 75$. استبدال مقاسات سهل خلال 14 يوم والدفع بالبطاقة أو كاش عند الاستلام.',
  },
  {
    id: 'b2b',
    name: 'توريد وتغليف كراتين جملة',
    icon: '📦',
    context: 'توريد كراتين وتغليف بالجملة. الحد الأدنى للطلب (MOQ): 500 وحدة بسعر 0.45$/وحدة. خصم كميات لأكثر من 2000 وحدة بسعر 0.38$/وحدة مع طباعة الشعار مجاناً. مدة التجهيز 5–7 أيام عمل (50% دفعة أولى والباقي عند الشحن).',
  }
];

export const BUSINESS_PRESETS = BUSINESS_PRESETS_EN;

export function getPresetsForLanguage(lang: Language) {
  return lang === 'ar' ? BUSINESS_PRESETS_AR : BUSINESS_PRESETS_EN;
}

export const INITIAL_CONTACTS_EN: Contact[] = [
  {
    id: 'noura',
    name: 'Noura Al-Otaibi',
    phone: '+966 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Is there a discount if I take two, and how fast is delivery?',
    lastTime: '13:42',
    unreadCount: 1,
    leadStatus: 'hot',
    businessCategory: 'perfume',
    suggestedPrompt: 'Luxury Perfume',
    messages: [
      {
        id: 'm1',
        sender: 'Customer',
        text: 'Hi, I saw your Instagram ad for the Royal Oud perfume.',
        timestamp: '13:38',
        isIncoming: true,
      },
      {
        id: 'm2',
        sender: 'Merchant',
        text: 'Hello Noura! Welcome to WADeal Perfumes. Royal Oud is our #1 bestseller with genuine French oils and 12-hour longevity.',
        timestamp: '13:40',
        isIncoming: false,
      },
      {
        id: 'm3',
        sender: 'Customer',
        text: 'Is there a discount if I take two, and how fast is delivery?',
        timestamp: '13:42',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    phone: '+1 (555) 234-8901',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Is there any warranty on the earbuds, and can you throw in a charger?',
    lastTime: '12:15',
    unreadCount: 2,
    leadStatus: 'followup',
    businessCategory: 'tech',
    suggestedPrompt: 'Smart Electronics',
    messages: [
      {
        id: 'm4',
        sender: 'Customer',
        text: 'Hey! Looking at the TWS Pro Earbuds on your shop.',
        timestamp: '12:10',
        isIncoming: true,
      },
      {
        id: 'm5',
        sender: 'Customer',
        text: 'Is there any warranty on the earbuds, and can you throw in a charger?',
        timestamp: '12:15',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'layla',
    name: 'Layla Hassan',
    phone: '+971 52 987 6543',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'If the hoodie size does not fit, can I exchange it easily?',
    lastTime: '11:05',
    unreadCount: 0,
    leadStatus: 'won',
    businessCategory: 'fashion',
    suggestedPrompt: 'Urban Streetwear',
    messages: [
      {
        id: 'm6',
        sender: 'Customer',
        text: 'Hey! I want the sand beige oversized hoodie in size M.',
        timestamp: '11:01',
        isIncoming: true,
      },
      {
        id: 'm7',
        sender: 'Customer',
        text: 'If the hoodie size does not fit, can I exchange it easily?',
        timestamp: '11:05',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'david',
    name: 'David Chen (Apex Brands)',
    phone: '+44 7700 900123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'What is your best rate for 1,000 custom packaging boxes?',
    lastTime: '09:40',
    unreadCount: 0,
    leadStatus: 'none',
    businessCategory: 'b2b',
    suggestedPrompt: 'B2B Wholesale',
    messages: [
      {
        id: 'm8',
        sender: 'Customer',
        text: 'Hello, we require custom mailer boxes for our upcoming subscription launch.',
        timestamp: '09:35',
        isIncoming: true,
      },
      {
        id: 'm9',
        sender: 'Customer',
        text: 'What is your best rate for 1,000 custom packaging boxes?',
        timestamp: '09:40',
        isIncoming: true,
      }
    ]
  }
];

export const INITIAL_CONTACTS_AR: Contact[] = [
  {
    id: 'noura',
    name: 'نورة العتيبي',
    phone: '+966 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'هل يوجد خصم لو طلبت قطعتين، وكم مدة التوصيل؟',
    lastTime: '13:42',
    unreadCount: 1,
    leadStatus: 'hot',
    businessCategory: 'perfume',
    suggestedPrompt: 'عطور فاخرة',
    messages: [
      {
        id: 'm1',
        sender: 'Customer',
        text: 'أهلاً، شفت إعلانكم على إنستغرام عن عطر رويال عود.',
        timestamp: '13:38',
        isIncoming: true,
      },
      {
        id: 'm2',
        sender: 'Merchant',
        text: 'أهلاً نورة! مرحباً بك. عطر رويال عود هو الأكثر طلباً لدينا بزيوت فرنسية أصلية وثبات يتجاوز 12 ساعة.',
        timestamp: '13:40',
        isIncoming: false,
      },
      {
        id: 'm3',
        sender: 'Customer',
        text: 'هل يوجد خصم لو طلبت قطعتين، وكم مدة التوصيل؟',
        timestamp: '13:42',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'marcus',
    name: 'طارق الزهراني',
    phone: '+966 55 234 8901',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'هل يوجد ضمان على السماعات، وهل تقدمون شاحناً مجانياً معها؟',
    lastTime: '12:15',
    unreadCount: 2,
    leadStatus: 'followup',
    businessCategory: 'tech',
    suggestedPrompt: 'إلكترونيات ذكية',
    messages: [
      {
        id: 'm4',
        sender: 'Customer',
        text: 'مرحباً، أبحث عن سماعات TWS Pro في متجركم.',
        timestamp: '12:10',
        isIncoming: true,
      },
      {
        id: 'm5',
        sender: 'Customer',
        text: 'هل يوجد ضمان على السماعات، وهل تقدمون شاحناً مجانياً معها؟',
        timestamp: '12:15',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'layla',
    name: 'ليلى حسان',
    phone: '+971 52 987 6543',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'إذا المقاس ما ناسبني، هل الاستبدال سهل؟ وهل يمكن الدفع عند الاستلام؟',
    lastTime: '11:05',
    unreadCount: 0,
    leadStatus: 'won',
    businessCategory: 'fashion',
    suggestedPrompt: 'أزياء وستريت وير',
    messages: [
      {
        id: 'm6',
        sender: 'Customer',
        text: 'أهلاً! أريد هودي أوفر سايز بلون رملي مقاس M.',
        timestamp: '11:01',
        isIncoming: true,
      },
      {
        id: 'm7',
        sender: 'Customer',
        text: 'إذا المقاس ما ناسبني، هل الاستبدال سهل؟ وهل يمكن الدفع عند الاستلام؟',
        timestamp: '11:05',
        isIncoming: true,
      }
    ]
  },
  {
    id: 'david',
    name: 'م. خالد المنصور (مؤسسة القمة)',
    phone: '+966 54 700 9001',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'ما هو أفضل سعر لديكم لكمية 1,000 كرتون مع طباعة الشعار؟',
    lastTime: '09:40',
    unreadCount: 0,
    leadStatus: 'none',
    businessCategory: 'b2b',
    suggestedPrompt: 'توريد وتغليف جملة',
    messages: [
      {
        id: 'm8',
        sender: 'Customer',
        text: 'السلام عليكم، نحتاج كراتين شحن مخصصة لمنتجاتنا القادمة.',
        timestamp: '09:35',
        isIncoming: true,
      },
      {
        id: 'm9',
        sender: 'Customer',
        text: 'ما هو أفضل سعر لديكم لكمية 1,000 كرتون مع طباعة الشعار؟',
        timestamp: '09:40',
        isIncoming: true,
      }
    ]
  }
];

export const INITIAL_CONTACTS = INITIAL_CONTACTS_EN;

export function getContactsForLanguage(lang: Language): Contact[] {
  return lang === 'ar' ? INITIAL_CONTACTS_AR : INITIAL_CONTACTS_EN;
}
