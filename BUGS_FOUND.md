# AW Insights - Tespit Edilen Hatalar

## Kritik Hatalar

### 1. Flow Volume Sıfır Gösteriliyor (0m, 0%)
- **Sorun**: Flow Volume kartı her zaman 0m ve 0% gösteriyor
- **Beklenen**: Verilere göre flow dakikaları ve oranı hesaplanmalı
- **Dosya**: `src/components/dashboard/OverviewSection.tsx` (satır 88-90)
- **Neden**: `flowAnalysis.totalFlowMinutes` ve `flowAnalysis.flowRatio` yanlış hesaplanıyor

### 2. Burnout Risk Sıfır Gösteriliyor (0, LOW)
- **Sorun**: Burnout Risk kartı her zaman 0 ve LOW gösteriyor
- **Beklenen**: Verilere göre burnout skoru hesaplanmalı
- **Dosya**: `src/components/dashboard/OverviewSection.tsx` (satır 94-97)
- **Neden**: `burnoutAnalysis.burnoutScore` yanlış hesaplanıyor

### 3. Productive Minutes Grafikte Sıfır
- **Sorun**: Grafikte productive minutes her zaman 0 gösteriliyor
- **Beklenen**: Günlük productive minutes doğru hesaplanmalı
- **Dosya**: `src/components/dashboard/OverviewSection.tsx` (satır 147-155)

### 4. Focus Level Çok Yüksek (247656)
- **Sorun**: Focus Level kartı 247656 gibi absurd bir değer gösteriyor
- **Beklenen**: 0-100 arasında bir skor olmalı
- **Dosya**: `src/components/dashboard/OverviewSection.tsx` (satır 81)

## Araştırılması Gereken Alanlar

### 1. FlowDetector Modülü
- `src/modules/flow/FlowDetector.ts` - Flow hesaplaması
- `src/modules/flow/flowScorer.ts` - Flow skoru hesaplaması

### 2. BurnoutPredictor Modülü
- `src/modules/burnout/BurnoutPredictor.ts` - Burnout analizi

### 3. FocusAnalyzer Modülü
- `src/modules/focus/FocusAnalyzer.ts` - Focus skoru hesaplaması

### 4. useAnalyticsComputation Hook
- `src/hooks/useAnalyticsComputation.ts` - Analytics hesaplamalarının koordinasyonu

## Test Verileri
- JSON dosyası: 3.2MB
- Bucket sayısı: 7+ bucket (Android, Desktop, Web, Editor vb.)
- Tarih aralığı: 2026-04-29 ile 2026-05-16
- Toplam aktif gün: 18
