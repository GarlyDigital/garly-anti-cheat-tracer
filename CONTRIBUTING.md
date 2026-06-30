## Ozet

Bu repo kademeli olarak gelistirilmektedir. Tam surum ve aylik commit plani icin ana projedeki `RELEASE_GUIDE.md` dosyasina bakin.

## Hizli baslangic

```bash
npm install
cp ayarlar.example.json ayarlar.json
# ayarlar.json icine bot token'inizi yazin
npm start
```

## Aylik guncelleme

Ana `GarlyBot` klasorunde:

```bash
bash scripts/apply-month.sh 02   # ay numarasi: 01-07
```

Sonra bu klasorde commit atip push edin.
