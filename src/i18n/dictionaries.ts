export type LocaleDictionary = Record<string, string>;

const en: LocaleDictionary = {
  lateNightSevere:
    'Severe late-night work pattern detected. Over 75% of your active days involve work between 10 PM and 6 AM. This disrupts circadian rhythm and impairs cognitive recovery.',
  lateNightModerate:
    'Moderate late-night work pattern. A significant portion of your work happens after 10 PM. Try shifting deep work to morning hours when possible.',
  overloadSevere:
    'Severe weekly overload. Your 7-day rolling work average far exceeds sustainable levels. Chronic overload is the strongest predictor of burnout.',
  overloadModerate:
    'Moderate weekly overload detected. Your average daily hours are above the recommended threshold. Consider implementing recharge days.',
  weekendSevere:
    'Severe weekend intrusion. Over 75% of your weekends show significant work activity. Continuous work without full rest days prevents psychological detachment.',
  weekendModerate:
    'Moderate weekend work detected. Regular work on weekends reduces recovery capacity. Aim for at least one completely work-free day per week.',
  recoverySevere:
    'Severe recovery deficit. You have had multiple consecutive high-load days without adequate rest. This pattern is unsustainable and leads to diminishing returns.',
  recoveryModerate:
    'Moderate recovery deficit. Your recent schedule shows limited recovery windows. Even short breaks between intense periods improve long-term resilience.',
  criticalRisk:
    'Critical burnout risk. Immediate intervention recommended. Your current patterns match clinical burnout profiles. Prioritise sleep, boundaries, and rest.',
  highRisk:
    'High burnout risk detected. Multiple risk factors are elevated. Proactive adjustment of work habits is strongly advised.',
  trendWorsening:
    'Your burnout indicators are trending upward. Early intervention prevents long-term damage. Consider reducing workload and establishing firmer boundaries.',
  trendImproving:
    'Your burnout indicators are trending downward. Positive changes are taking effect. Continue protecting your recovery time.',
  healthyPatterns:
    'Your digital work patterns appear healthy. No significant burnout risk factors detected. Maintain your current boundaries and recovery practices.',
};

const tr: LocaleDictionary = {
  lateNightSevere:
    'Ciddi gece çalışma paterni tespit edildi. Aktif günlerinizin %75\'inden fazlası saat 22:00 ile 06:00 arasında çalışma içeriyor. Bu durum sirkadiyen ritmi bozar ve bilişsel iyileşmeyi engeller.',
  lateNightModerate:
    'Orta düzeyde gece çalışma paterni. Çalışmalarınızın önemli bir kısmı saat 22:00\'den sonra gerçekleşiyor. Derin çalışmaları mümkünse sabah saatlerine kaydırmayı deneyin.',
  overloadSevere:
    'Ciddi haftalık aşırı yüklenme. 7 günlük hareketli çalışma ortalamanız sürdürülebilir seviyelerin çok üzerinde. Kronik aşırı yüklenme, tükenmişliğin en güçlü öngörücüdür.',
  overloadModerate:
    'Orta düzeyde haftalık aşırı yüklenme tespit edildi. Günlük ortalama çalışma süreniz önerilen eşiğin üzerinde. Yenilenme günleri eklemeyi değerlendirin.',
  weekendSevere:
    'Ciddi hafta sonu müdahalesi. Hafta sonlarınızın %75\'inden fazlası önemli çalışma aktivitesi gösteriyor. Tam dinlenme günleri olmadan sürekli çalışma, psikolojik ayrışmayı engeller.',
  weekendModerate:
    'Orta düzeyde hafta sonu çalışması tespit edildi. Hafta sonları düzenli çalışma, iyileşme kapasitesini azaltır. Haftada en az bir tamamen işten uzak gün hedefleyin.',
  recoverySevere:
    'Ciddi iyileşme açığı. Yeterli dinlenme olmadan birden fazla ardarda yüksek yüklü gün geçirdiniz. Bu pattern sürdürülemez ve azalan getirilere yol açar.',
  recoveryModerate:
    'Orta düzeyde iyileşme açığı. Son programınız sınırlı iyileşme pencereleri gösteriyor. Yoğun dönemler arasında kısa molalar bile uzun vadeli dayanıklılığı artırır.',
  criticalRisk:
    'Kritik tükenmişlik riski. Derhal müdahale önerilir. Mevcut patternleriniz klinik tükenmişlik profilleriyle eşleşiyor. Uyku, sınırlar ve dinlenmeye öncelik verin.',
  highRisk:
    'Yüksek tükenmişlik riski tespit edildi. Birden fazla risk faktörü yükselmiş durumda. Çalışma alışkanlıklarının proaktif olarak düzeltilmesi önemle tavsiye edilir.',
  trendWorsening:
    'Tükenmişlik göstergeleriniz yükseliş eğiliminde. Erken müdahale, uzun vadeli hasarı önler. İş yükünü azaltmayı ve daha sağlam sınırlar kurmayı değerlendirin.',
  trendImproving:
    'Tükenmişlik göstergeleriniz düşüş eğiliminde. Olumlu değişiklikler etkisini gösteriyor. İyileşme zamanınızı korumaya devam edin.',
  healthyPatterns:
    'Dijital çalışma patternleriniz sağlıklı görünüyor. Önemli bir tükenmişlik risk faktörü tespit edilmedi. Mevcut sınırlarınızı ve iyileşme pratiklerinizi sürdürün.',
};

export const dictionaries: Record<string, LocaleDictionary> = {
  en,
  tr,
  de: en, // Fallback to English for other languages for now to avoid crashes
  es: en,
  fr: en,
  ja: en,
  zh: en,
  pt: en,
};

export const supportedLanguages = ['en', 'tr', 'de', 'es', 'fr', 'ja', 'zh', 'pt'] as const;

export function getDictionary(lang: string): LocaleDictionary {
  return dictionaries[lang] ?? dictionaries['en'] ?? {};
}
