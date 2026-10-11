# FişOkut — yaşayan uygulama özeti

## Amaç
Türkçe fiş ve sevk irsaliyelerini mobil kamera veya galeriden seçip, yerel demo OCR sonucu üzerinden düzenlenebilir tam metin ve yapılandırılmış satır verisine dönüştürür. El yazısı ve özellikle `1050` gibi düşük güvenli sayıları kullanıcı onaylamadan tamamlanmış saymaz.

## Faz 1 veri modeli
- Kaynak belge: seçilen görsel, önizleme, döndürme ve kırpma modu
- Belge özeti: tedarikçi, belge türü, fiili sevk tarihi
- Satır: mal adı, miktar, birim, birim fiyat, tutar, güven durumu
- Tam metin: düzenlenebilir OCR çıktısı
- Onay: 1050 doğrulaması ve belge onayı

## Ana akış
1. Kullanıcı kamera, galeri veya örnek belge ile görsel seçer.
2. Önizlemede döndürme, kırpma ve kontrast/yeniden çekme kontrollerini görür.
3. Yerel demo OCR sonucu açılır; tam metin ve tablo alanları düzenlenebilir.
4. Düşük güvenli `1050` alanı özel amber panelden doğrulanır ve birim fiyat/tutar korunur.
5. Kullanıcı belgeyi onayladıktan sonra JSON, CSV ve panoya kopyalama açılır.

## Auth / roller
Kimlik doğrulama yoktur. Tüm akış demo ve cihaz içi durum ile çalışır.

## Entegrasyonlar
Gerçek OCR veya harici API yoktur; demo sonucu yerel sabit veriyle gösterilir. Dosya seçimi tarayıcı File API, dışa aktarma Blob API ile yapılır.