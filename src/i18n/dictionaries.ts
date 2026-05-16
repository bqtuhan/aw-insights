export type LocaleDictionary = Record<string, string>;

const en: LocaleDictionary = {
  'burnout.warnings.lateNightSevere':
    'Severe late-night work pattern detected. Over 75% of your active days involve work between 10 PM and 6 AM. This disrupts circadian rhythm and impairs cognitive recovery.',
  'burnout.warnings.lateNightModerate':
    'Moderate late-night work pattern. A significant portion of your work happens after 10 PM. Try shifting deep work to morning hours when possible.',
  'burnout.warnings.overloadSevere':
    'Severe weekly overload. Your 7-day rolling work average far exceeds sustainable levels. Chronic overload is the strongest predictor of burnout.',
  'burnout.warnings.overloadModerate':
    'Moderate weekly overload detected. Your average daily hours are above the recommended threshold. Consider implementing recharge days.',
  'burnout.warnings.weekendSevere':
    'Severe weekend intrusion. Over 75% of your weekends show significant work activity. Continuous work without full rest days prevents psychological detachment.',
  'burnout.warnings.weekendModerate':
    'Moderate weekend work detected. Regular work on weekends reduces recovery capacity. Aim for at least one completely work-free day per week.',
  'burnout.warnings.recoverySevere':
    'Severe recovery deficit. You have had multiple consecutive high-load days without adequate rest. This pattern is unsustainable and leads to diminishing returns.',
  'burnout.warnings.recoveryModerate':
    'Moderate recovery deficit. Your recent schedule shows limited recovery windows. Even short breaks between intense periods improve long-term resilience.',
  'burnout.warnings.criticalRisk':
    'Critical burnout risk. Immediate intervention recommended. Your current patterns match clinical burnout profiles. Prioritise sleep, boundaries, and rest.',
  'burnout.warnings.highRisk':
    'High burnout risk detected. Multiple risk factors are elevated. Proactive adjustment of work habits is strongly advised.',
  'burnout.warnings.trendWorsening':
    'Your burnout indicators are trending upward. Early intervention prevents long-term damage. Consider reducing workload and establishing firmer boundaries.',
  'burnout.warnings.trendImproving':
    'Your burnout indicators are trending downward. Positive changes are taking effect. Continue protecting your recovery time.',
  'burnout.warnings.healthyPatterns':
    'Your digital work patterns appear healthy. No significant burnout risk factors detected. Maintain your current boundaries and recovery practices.',
};

const tr: LocaleDictionary = {
  'burnout.warnings.lateNightSevere':
    'Ciddi gece calisma patterni tespit edildi. Aktif gunlerinizin %75\'inden fazlasi saat 22:00 ile 06:00 arasinda calisma iceriyor. Bu durum sirkadiyen ritmi bozar ve bilissel iyilesmeyi engeller.',
  'burnout.warnings.lateNightModerate':
    'Orta duzeyde gece calisma patterni. Calismalarinizin onemli bir kismi saat 22:00\'den sonra gerceklesiyor. Derin calismalari mumkunse sabah saatlerine kaydirmayi deneyin.',
  'burnout.warnings.overloadSevere':
    'Ciddi haftalik asiri yuklenme. 7 gunluk hareketli calisma ortalamaniz surdurulebilir seviyelerin cok uzerinde. Kronik asiri yuklenme, tukenmisligin en guclu ongorucudur.',
  'burnout.warnings.overloadModerate':
    'Orta duzeyde haftalik asiri yuklenme tespit edildi. Gunluk ortalama calisma sureniz onerilen esigin uzerinde. Yenilenme gunleri eklemeyi degerlendirin.',
  'burnout.warnings.weekendSevere':
    'Ciddi hafta sonu mudahalesi. Hafta sonlarinizin %75\'inden fazlasi onemli calisma aktivitesi gosteriyor. Tam dinlenme gunleri olmadan surekli calisma, psikolojik ayrismayi engeller.',
  'burnout.warnings.weekendModerate':
    'Orta duzeyde hafta sonu calismasi tespit edildi. Hafta sonlari duzenli calisma, iyilesme kapasitesini azaltir. Haftada en az bir tamamen isten uzak gun hedefleyin.',
  'burnout.warnings.recoverySevere':
    'Ciddi iyilesme acigi. Yeterli dinlenme olmadan birden fazla ardarda yuksek yuklu gun gecirdiniz. Bu pattern surdurulemez ve azalan getirilere yol acar.',
  'burnout.warnings.recoveryModerate':
    'Orta duzeyde iyilesme acigi. Son programiniz sinirli iyilesme pencereleri gosteriyor. Yogun donemler arasinda kisa molalar bile uzun vadeli dayanikliligi artirir.',
  'burnout.warnings.criticalRisk':
    'Kritik tukenmislik riski. Derhal mudahale onerilir. Mevcut patternleriniz klinik tukenmislik profilleriyle eslesiyor. Uyku, sinirlar ve dinlenmeye oncelik verin.',
  'burnout.warnings.highRisk':
    'Yuksek tukenmislik riski tespit edildi. Birden fazla risk faktoru yukselmis durumda. Calisma aliskanliklarinin proaktif olarak duzeltilmesi onemle tavsiye edilir.',
  'burnout.warnings.trendWorsening':
    'Tukenmislik gostergeleriniz yukselis egiliminde. Erken mudahale, uzun vadeli hasari onler. Is yukunu azaltmayi ve daha saglam sinirlar kurmayi degerlendirin.',
  'burnout.warnings.trendImproving':
    'Tukenmislik gostergeleriniz dusus egiliminde. Olumlu degisiklikler etkisini gosteriyor. Iyilesme zamaninizi korumaya devam edin.',
  'burnout.warnings.healthyPatterns':
    'Dijital calisma patternleriniz saglikli gorunuyor. Onemli bir tukenmislik risk faktoru tespit edilmedi. Mevcut sinirlarinizi ve iyilesme pratiklerinizi surdurun.',
};

export const dictionaries: Record<string, LocaleDictionary> = {
  en,
  tr,
};

export const supportedLanguages = ['en', 'tr'] as const;

export function getDictionary(lang: string): LocaleDictionary {
  return dictionaries[lang] ?? dictionaries['en'] ?? {};
}