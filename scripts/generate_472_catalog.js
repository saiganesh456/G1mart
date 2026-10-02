const fs = require('fs');
const path = require('path');

// Raw OCR items extracted from G1 MART Item Sales Detail report (1 to 472)
const rawItems = [
  // Page 1
  { id: 1, name: "5 MUCH", qty: 6.00, unit: "Pieces", total: 30.00 },
  { id: 2, name: "5 STAR 5RS", qty: 5.00, unit: "Pieces", total: 25.00 },
  { id: 3, name: "5 Star Tea 250g", qty: 5.00, unit: "Pieces", total: 375.00 },
  { id: 4, name: "50-50 SWEET&SALTY", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 5, name: "707 SOAP", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 6, name: "AACHHI GARAM MASALA", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 7, name: "AACHI APPALAM 100G", qty: 2.00, unit: "Pieces", total: 84.00 },
  { id: 8, name: "AACHI CHICKEN MASALA", qty: 3.00, unit: "Pieces", total: 15.00 },
  { id: 9, name: "Aashirvaad 1kg", qty: 11.00, unit: "Pieces", total: 715.00 },
  { id: 10, name: "AASHIRVAAD CRYSTAL SALT 1KG", qty: 5.00, unit: "Packs", total: 100.00 },
  { id: 11, name: "AASHIRVAAD SALT", qty: 4.00, unit: "Pieces", total: 112.00 },
  { id: 12, name: "Aashirvaad Suji Rava", qty: 7.00, unit: "Pieces", total: 255.00 },
  { id: 13, name: "Aashirvaad Vermicelli", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 14, name: "AASHIRVAAD VERMICELLI 850G", qty: 1.00, unit: "Packs", total: 78.00 },
  { id: 15, name: "ACID 700ML", qty: 1.00, unit: "Pieces", total: 65.00 },
  { id: 16, name: "Ajay Brush", qty: 4.00, unit: "Pieces", total: 80.00 },
  { id: 17, name: "ALL IN ONE 100G", qty: 2.00, unit: "Pieces", total: 110.00 },
  { id: 18, name: "ALLOUT MATCHS", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 19, name: "APSARA PENCILS", qty: 2.00, unit: "Pieces", total: 110.00 },
  { id: 20, name: "ARIEL FRONT LIQ 10", qty: 16.00, unit: "Pieces", total: 160.00 },
  { id: 21, name: "Ariel Power Gel Top Load&semi Auto 1kg", qty: 1.00, unit: "Pieces", total: 175.00 },
  { id: 22, name: "AROKYA MILK", qty: 2.00, unit: "Pieces", total: 80.00 },
  { id: 23, name: "ARUN BITES", qty: 21.00, unit: "Pieces", total: 110.00 },
  { id: 24, name: "ARUN DONUT", qty: 20.00, unit: "Pieces", total: 200.00 },
  { id: 25, name: "ARUN DOUBLE", qty: 1.00, unit: "Pieces", total: 60.00 },
  { id: 26, name: "ARUN IBAR", qty: 1.00, unit: "Pieces", total: 90.00 },
  { id: 27, name: "ARUN MILKY FANTASY", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 28, name: "Arun Popitos", qty: 6.00, unit: "Pieces", total: 30.00 },
  { id: 29, name: "Arun Sunny Sil", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 30, name: "ARUN TOFFEE CON", qty: 6.00, unit: "Pieces", total: 120.00 },
  { id: 31, name: "ASSORATED FRUIT", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 32, name: "Avalu 250g", qty: 3.00, unit: "Packs", total: 120.00 },
  { id: 33, name: "Avalu50g", qty: 2.00, unit: "Packs", total: 20.00 },
  { id: 34, name: "BADAM 100GR", qty: 2.00, unit: "Packs", total: 230.00 },
  { id: 35, name: "BADAM 250G", qty: 2.00, unit: "Pieces", total: 560.00 },
  { id: 36, name: "BADAM 50G", qty: 1.00, unit: "Pieces", total: 65.00 },
  { id: 37, name: "BAMBINO MYSORE PACK 200G", qty: 2.00, unit: "Pieces", total: 220.00 },

  // Page 2
  { id: 38, name: "BAMBINON VERMICELLI 250G", qty: 3.00, unit: "Pieces", total: 81.00 },
  { id: 39, name: "BANSI RAVA 500G", qty: 3.00, unit: "Pieces", total: 111.00 },
  { id: 40, name: "BAT PAPAD 250G", qty: 1.00, unit: "Pieces", total: 20.00 },
  { id: 41, name: "BINGO CHILLI", qty: 12.00, unit: "Pieces", total: 120.00 },
  { id: 42, name: "BINGO KOREAN", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 43, name: "BINGO MASALA", qty: 5.00, unit: "Pieces", total: 100.00 },
  { id: 44, name: "BINGO MASTI", qty: 5.00, unit: "Pieces", total: 100.00 },
  { id: 45, name: "BINGO TOMATO", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 46, name: "BINO TEMATO 21G", qty: 7.00, unit: "Pieces", total: 70.00 },
  { id: 47, name: "Biriyani Masala", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 48, name: "BISCOTT", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 49, name: "BLEACHUNG POWDER 100G", qty: 1.00, unit: "Pieces", total: 12.00 },
  { id: 50, name: "BOOST", qty: 31.00, unit: "Packs", total: 155.00 },
  { id: 51, name: "BOOST 200G", qty: 1.00, unit: "Pieces", total: 105.00 },
  { id: 52, name: "BOURBON BISCUIT", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 53, name: "BRU", qty: 4.00, unit: "Pieces", total: 192.00 },
  { id: 54, name: "Bru Instant 1.2g", qty: 10.00, unit: "Pieces", total: 20.00 },
  { id: 55, name: "BRU INSTENT JAR", qty: 1.00, unit: "Pieces", total: 135.00 },
  { id: 56, name: "Brush", qty: 1.00, unit: "Pieces", total: 25.00 },
  { id: 57, name: "CAMLIN 0.7MM LEDIS", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 58, name: "Camphor 50g", qty: 1.00, unit: "Pieces", total: 60.00 },
  { id: 59, name: "CASTOR OIL 100ML", qty: 2.00, unit: "Pieces", total: 110.00 },
  { id: 60, name: "CHILLY POWDER 100G", qty: 3.00, unit: "Pieces", total: 165.00 },
  { id: 61, name: "CHOKI STIX 16G", qty: 4.00, unit: "Pieces", total: 40.00 },
  { id: 62, name: "CINTHOL", qty: 9.00, unit: "Pieces", total: 351.00 },
  { id: 63, name: "CLASSIC RUSK 59G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 64, name: "Cleaning Wiper", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 65, name: "CLEAR ANTI-DANDRUFF NUTRIUM", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 66, name: "CLINIC PLUS EGG", qty: 4.00, unit: "Pieces", total: 56.00 },
  { id: 67, name: "Clinic Plus STRONG&LONG", qty: 3.00, unit: "Bag", total: 42.00 },
  { id: 68, name: "CLOTH PINS", qty: 2.00, unit: "Packs", total: 100.00 },
  { id: 69, name: "COCA CALA", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 70, name: "Coconut", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 71, name: "COLGATE 100G", qty: 2.00, unit: "Pieces", total: 140.00 },
  { id: 72, name: "Colgate Brash", qty: 1.00, unit: "Pieces", total: 35.00 },
  { id: 73, name: "Colgate Brush Set", qty: 1.00, unit: "Number", total: 130.00 },
  { id: 74, name: "COLGATE EXTRA MEDIUM", qty: 1.00, unit: "Pieces", total: 20.00 },
  { id: 75, name: "COLGATE MAXFESH", qty: 1.00, unit: "Pieces", total: 19.00 },
  { id: 76, name: "Colgate Softb Kids", qty: 2.00, unit: "Pieces", total: 56.00 },
  { id: 77, name: "Colgate Strong Teeth 300g", qty: 1.00, unit: "Pieces", total: 204.00 },

  // Page 3
  { id: 78, name: "COLGATE VEDSHIAIKTI 100G", qty: 1.00, unit: "Pieces", total: 84.00 },
  { id: 79, name: "COLOUR PAPAD 250G", qty: 1.00, unit: "Pieces", total: 20.00 },
  { id: 80, name: "Comfort 30ml", qty: 2.00, unit: "Pieces", total: 250.00 },
  { id: 81, name: "Comfort Morning Fresh 210 Ml", qty: 1.00, unit: "Packs", total: 58.00 },
  { id: 82, name: "COMFORT ROYAL 80ML", qty: 73.00, unit: "Pieces", total: 292.00 },
  { id: 83, name: "CORIANDER 100G", qty: 3.00, unit: "Pieces", total: 69.00 },
  { id: 84, name: "CORIANDER POWDER 100G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 85, name: "CORIANDER POWDER 50G", qty: 4.00, unit: "Pieces", total: 60.00 },
  { id: 86, name: "CORIANDER SEEDS 250G", qty: 3.00, unit: "Pieces", total: 165.00 },
  { id: 87, name: "CURD", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 88, name: "DABUR RED 100G", qty: 1.00, unit: "Pieces", total: 70.00 },
  { id: 89, name: "DABUR RED 300G", qty: 3.00, unit: "Pieces", total: 594.00 },
  { id: 90, name: "DABUR RED 50G", qty: 3.00, unit: "Pieces", total: 60.00 },
  { id: 91, name: "DAIRY MILK 10RS", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 92, name: "DAIRY MILK 5RS", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 93, name: "DARK FANTASY", qty: 8.00, unit: "Pieces", total: 80.00 },
  { id: 94, name: "DARK FANTASY BOURBON 90G", qty: 3.00, unit: "Pieces", total: 90.00 },
  { id: 95, name: "Dark Fantasy Choco Fills 10g", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 96, name: "DARK FANTASY CHOCOLATE COOKIE", qty: 6.00, unit: "Pieces", total: 30.00 },
  { id: 97, name: "Dark Fantasy Cookis", qty: 6.00, unit: "Pieces", total: 210.00 },
  { id: 98, name: "DARK FANTASY VANILLA 55G", qty: 4.00, unit: "Pieces", total: 40.00 },
  { id: 99, name: "DARK FANTASY5RS", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 100, name: "DESI POPZ", qty: 18.00, unit: "Pieces", total: 90.00 },
  { id: 101, name: "DETTAL 250 ML", qty: 1.00, unit: "Pieces", total: 90.00 },
  { id: 102, name: "DOMEX POWDER", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 103, name: "DOVE HAIR SHAMPOO6ML", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 104, name: "DOVE SHAMPOO", qty: 1.00, unit: "Pieces", total: 68.00 },
  { id: 105, name: "DOVE SOP BAR", qty: 1.00, unit: "Pieces", total: 38.00 },
  { id: 106, name: "DRY NUTS BOL", qty: 1.00, unit: "Pieces", total: 175.00 },
  { id: 107, name: "DUSTPAN", qty: 2.00, unit: "Pieces", total: 90.00 },
  { id: 108, name: "E BUTES", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 109, name: "EAGLE SAMBRANI 50G", qty: 3.00, unit: "Pieces", total: 80.00 },
  { id: 110, name: "Ear Buts", qty: 2.00, unit: "Pieces", total: 50.00 },
  { id: 111, name: "Eggs", qty: 22.00, unit: "Pieces", total: 136.00 },
  { id: 112, name: "EGGS TRA", qty: 2.00, unit: "Pieces", total: 360.00 },
  { id: 113, name: "ELACHI", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 114, name: "ELAICHI 10G", qty: 4.00, unit: "Pieces", total: 84.00 },

  // Page 4
  { id: 115, name: "ELAICHI RUSK 182G", qty: 1.00, unit: "Pieces", total: 34.00 },
  { id: 116, name: "ELAICHI RUSK 58G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 117, name: "ENDU MERCHI 250G", qty: 1.00, unit: "Packs", total: 78.00 },
  { id: 118, name: "ENDU MERCHI 500G", qty: 3.00, unit: "Pieces", total: 465.00 },
  { id: 119, name: "ENO", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 120, name: "EXO", qty: 4.00, unit: "Pieces", total: 40.00 },
  { id: 121, name: "Exo 10", qty: 10.00, unit: "Pieces", total: 100.00 },
  { id: 122, name: "Exo 5", qty: 6.00, unit: "Pieces", total: 30.00 },
  { id: 123, name: "EXO POWDER 5600G", qty: 1.00, unit: "Pieces", total: 13.00 },
  { id: 124, name: "EXO SCRUBRS", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 125, name: "FAB LIQ 825G", qty: 6.00, unit: "Pieces", total: 570.00 },
  { id: 126, name: "FAB LIQUID 10", qty: 6.00, unit: "Pieces", total: 60.00 },
  { id: 127, name: "FAIR LOVELI RE NEW 2.78G", qty: 2.00, unit: "Pieces", total: 270.00 },
  { id: 128, name: "FANTA 10RUPEES", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 129, name: "FINGER MILLET 500G", qty: 3.00, unit: "Pieces", total: 90.00 },
  { id: 130, name: "FLAIR CARBONIX0.7MM", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 131, name: "FLATTENED RICE 250G", qty: 5.00, unit: "Pieces", total: 175.00 },
  { id: 132, name: "FLATTENED RICE 500G", qty: 3.00, unit: "Pieces", total: 204.00 },
  { id: 133, name: "FOGG SPRAY", qty: 1.00, unit: "Pieces", total: 220.00 },
  { id: 134, name: "Freedam Oil 500ml", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 135, name: "Freedom 1LT", qty: 1.00, unit: "Packs", total: 188.00 },
  { id: 136, name: "FREEDOM GROUNDNUT OLI 1L", qty: 2.00, unit: "Pieces", total: 356.00 },
  { id: 137, name: "FREEDOM OIL 1L", qty: 16.00, unit: "Pieces", total: 2898.00 },
  { id: 138, name: "FREEDOM RICE 1L", qty: 3.00, unit: "Pieces", total: 534.00 },
  { id: 139, name: "Fried Rice Masala 20g", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 140, name: "Gadda Camphpr 25g", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 141, name: "GANGI PENDI 100G", qty: 1.00, unit: "Pieces", total: 17.00 },
  { id: 142, name: "GARLIC MIXTURE 100G", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 143, name: "GARNIER F . W", qty: 1.00, unit: "Pieces", total: 95.00 },
  { id: 144, name: "GAYATHARI SAMBRANI STICK", qty: 1.00, unit: "Pieces", total: 20.00 },
  { id: 145, name: "Gelakara 50g", qty: 1.00, unit: "Packs", total: 20.00 },
  { id: 146, name: "GEMINI TEE 100G", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 147, name: "Gilakara 100g", qty: 7.00, unit: "Packs", total: 252.00 },
  { id: 148, name: "Gkl Black Dates", qty: 2.00, unit: "Pouches", total: 220.00 },
  { id: 149, name: "GKL SEEDED 250G", qty: 3.00, unit: "Packs", total: 180.00 },
  { id: 150, name: "GLOW & LOVELY", qty: 4.00, unit: "Pieces", total: 280.00 },
  { id: 151, name: "Glow&lovely 20g", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 152, name: "GN GOLD LIQ", qty: 3.00, unit: "Pieces", total: 240.00 },
  { id: 153, name: "GN GOLD MATCH", qty: 1.00, unit: "Pieces", total: 105.00 },
  { id: 154, name: "GOKILAM DATES 250G", qty: 3.00, unit: "Pieces", total: 465.00 },

  // Page 5
  { id: 155, name: "GOKUL SANTOL POWDER 30G", qty: 1.00, unit: "Pieces", total: 43.00 },
  { id: 156, name: "Gokulam Dates", qty: 2.00, unit: "Pieces", total: 450.00 },
  { id: 157, name: "GONGURA PICKELS 60G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 158, name: "Gopuram", qty: 3.00, unit: "Pieces", total: 36.00 },
  { id: 159, name: "GOPURAM 20G", qty: 2.00, unit: "Pieces", total: 18.00 },
  { id: 160, name: "Gopuram Turmeric Powder 20g", qty: 1.00, unit: "Pieces", total: 16.00 },
  { id: 161, name: "Gopuram Turmeric Powder 50", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 162, name: "GRB GHEE", qty: 4.00, unit: "Pieces", total: 440.00 },
  { id: 163, name: "GRB GHEE50ML", qty: 2.00, unit: "Pieces", total: 118.00 },
  { id: 164, name: "GULAB JAM (1+1) 160GM", qty: 4.00, unit: "Pieces", total: 540.00 },
  { id: 165, name: "GULAB JAMUM MIX", qty: 1.00, unit: "Pieces", total: 67.00 },
  { id: 166, name: "GUM 5RS", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 167, name: "Harpic Blue 600m", qty: 1.00, unit: "Pieces", total: 110.00 },
  { id: 168, name: "Harpic Red 500ml", qty: 1.00, unit: "Pieces", total: 115.00 },
  { id: 169, name: "HATSUN CURD", qty: 3.00, unit: "Pieces", total: 123.00 },
  { id: 170, name: "HEAD AND SHOULDER 2RS", qty: 3.00, unit: "Packs", total: 108.00 },
  { id: 171, name: "HIDE&SEEK BISCUITS 10RS", qty: 6.00, unit: "Pieces", total: 60.00 },
  { id: 172, name: "HORLICKS", qty: 3.00, unit: "Packs", total: 15.00 },
  { id: 173, name: "Horlicks 500g", qty: 1.00, unit: "Pieces", total: 260.00 },
  { id: 174, name: "Horlicks Biscuit Small", qty: 4.00, unit: "Number", total: 40.00 },
  { id: 175, name: "Horlicks Biscuits", qty: 2.00, unit: "Number", total: 40.00 },
  { id: 176, name: "HORLICKS BISCUITS", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 177, name: "HR CHEKARALU 150G", qty: 1.00, unit: "Pieces", total: 53.00 },
  { id: 178, name: "HR CORN FLAKES MIXTURE 24G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 179, name: "HR KHATTA MEETHA 48G", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 180, name: "HR MASALA PEANUTS 34G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 181, name: "HR MOONG DAL 200G", qty: 1.00, unit: "Pieces", total: 58.00 },
  { id: 182, name: "HR MOONG DAL 35G", qty: 9.00, unit: "Pieces", total: 90.00 },
  { id: 183, name: "HR SOYA CHIPS 42G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 184, name: "HR TASTY NUTS 38G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 185, name: "IMMUNITY BOOSTING", qty: 2.00, unit: "Pieces", total: 100.00 },
  { id: 186, name: "INDIA GATE 1KG", qty: 5.00, unit: "Pieces", total: 725.00 },
  { id: 187, name: "ITC CHIKKIN MASALA 50G", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 188, name: "ITC GARAM MASALA 50G", qty: 1.00, unit: "Pieces", total: 48.00 },
  { id: 189, name: "JAGGERY 1KG", qty: 3.00, unit: "Pieces", total: 240.00 },
  { id: 190, name: "JAGGERY 500G", qty: 4.00, unit: "Pieces", total: 160.00 },
  { id: 191, name: "JAM OJAM", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 192, name: "Jeedi Pappu 100g", qty: 4.00, unit: "Pieces", total: 396.00 },
  { id: 193, name: "Jeedi Pappu 250g", qty: 8.00, unit: "Pieces", total: 1880.00 },
  { id: 194, name: "Jeedi Pappu 50g", qty: 4.00, unit: "Pieces", total: 220.00 },

  // Page 6
  { id: 195, name: "JEERA 100G", qty: 3.00, unit: "Pieces", total: 170.00 },
  { id: 196, name: "JEERA 250G", qty: 1.00, unit: "Pieces", total: 72.00 },
  { id: 197, name: "JEERA 50G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 198, name: "JS OILE 800ML", qty: 2.00, unit: "Pieces", total: 260.00 },
  { id: 199, name: "JS OILE DEEPAM 400ML", qty: 1.00, unit: "Pieces", total: 61.00 },
  { id: 200, name: "JS OILS 180ML", qty: 1.00, unit: "Pieces", total: 52.00 },
  { id: 201, name: "KALKANDA CANDY 250G", qty: 1.00, unit: "Pieces", total: 25.00 },
  { id: 202, name: "Kandipappu 1kg", qty: 7.00, unit: "Pieces", total: 1015.00 },
  { id: 203, name: "Kandipappu 500g", qty: 9.00, unit: "Pieces", total: 612.00 },
  { id: 204, name: "KASTURI APPALAM 40G", qty: 2.00, unit: "Pieces", total: 21.00 },
  { id: 205, name: "KASURI METHI 10G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 206, name: "KINDAR JOYS 25", qty: 4.00, unit: "Pieces", total: 100.00 },
  { id: 207, name: "KINDER JOY (B)", qty: 2.00, unit: "Pieces", total: 100.00 },
  { id: 208, name: "KINLEY 500ML", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 209, name: "KINLEY SALTY LEMON SODA", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 210, name: "KINLEYSTRONG SODA", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 211, name: "KISAN JAM", qty: 2.00, unit: "Packs", total: 46.00 },
  { id: 212, name: "KISAN TOMOTA KETCHUP", qty: 1.00, unit: "Packs", total: 14.00 },
  { id: 213, name: "KISMIS 100G", qty: 2.00, unit: "Packs", total: 110.00 },
  { id: 214, name: "KISMIS 50G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 215, name: "KITKAT", qty: 8.00, unit: "Pieces", total: 116.00 },
  { id: 216, name: "KNORR CUP SOUP", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 217, name: "KNORR DARK SOYA SAS", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 218, name: "KNORR RED CHILLI SAUCE 200G", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 219, name: "KURNOOL RIC BAG 25KG", qty: 3.00, unit: "Pieces", total: 4650.00 },
  { id: 220, name: "Lakme 2in1", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 221, name: "Lalitha Idly Ravva 1kg", qty: 14.00, unit: "Pieces", total: 700.00 },
  { id: 222, name: "Launch Plate", qty: 2.00, unit: "Packs", total: 70.00 },
  { id: 223, name: "LAVENDER", qty: 2.00, unit: "Pieces", total: 100.00 },
  { id: 224, name: "LG ENGIVA 50G", qty: 1.00, unit: "Pieces", total: 95.00 },
  { id: 225, name: "LGV 10G", qty: 3.00, unit: "Pieces", total: 72.00 },
  { id: 226, name: "LIMCA 10RUPEES", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 227, name: "LION HONEY 250G", qty: 1.00, unit: "Pieces", total: 77.00 },
  { id: 228, name: "LION HONEY SET 250G", qty: 3.00, unit: "Packs", total: 390.00 },
  { id: 229, name: "LIRIL LIMEN", qty: 4.00, unit: "Pieces", total: 152.00 },
  { id: 230, name: "LOTTE CHOCO PIE", qty: 8.00, unit: "Pieces", total: 40.00 },
  { id: 231, name: "LUX GLUTATHIONE", qty: 1.00, unit: "Pieces", total: 75.00 },
  { id: 232, name: "LUX ROSE SCENT 545G", qty: 2.00, unit: "Pieces", total: 80.00 },
  { id: 233, name: "MAAZA 250ML", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 234, name: "MAGGI 140G", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 235, name: "MAGGI 15RS", qty: 5.00, unit: "Packs", total: 75.00 },

  // Page 7
  { id: 236, name: "Makhana SeaSalt&pepper 70g", qty: 1.00, unit: "Pieces", total: 175.00 },
  { id: 237, name: "MALKIST", qty: 4.00, unit: "Pieces", total: 20.00 },
  { id: 238, name: "MALKIST CHEESE 144G", qty: 2.00, unit: "Pieces", total: 86.00 },
  { id: 239, name: "MALKIST CHEESE 72G", qty: 3.00, unit: "Pieces", total: 72.00 },
  { id: 240, name: "MALKIST DOUBLE CHOCOLATEY 144G", qty: 2.00, unit: "Pieces", total: 86.00 },
  { id: 241, name: "MALKIST DOUBLE CHOCOLATEY 72G", qty: 3.00, unit: "Pieces", total: 72.00 },
  { id: 242, name: "MANGALDEEP 3IN1", qty: 2.00, unit: "Pieces", total: 200.00 },
  { id: 243, name: "MANGALDEEP FLORA", qty: 6.00, unit: "Pieces", total: 300.00 },
  { id: 244, name: "Mangaldeep Sambrani", qty: 3.00, unit: "Pieces", total: 45.00 },
  { id: 245, name: "Mangaldeep Samrani Cup 1 Box", qty: 1.00, unit: "Packs", total: 60.00 },
  { id: 246, name: "MANGALDEEP SCENT 110G", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 247, name: "Mangaldeep Treya", qty: 1.00, unit: "Pieces", total: 65.00 },
  { id: 248, name: "MANGO FRUIT", qty: 4.00, unit: "Pieces", total: 20.00 },
  { id: 249, name: "MARGO ORIGINAL 500G", qty: 1.00, unit: "Pieces", total: 187.00 },
  { id: 250, name: "MARIE LIGHT ACTIVE 140G", qty: 3.00, unit: "Pieces", total: 60.00 },
  { id: 251, name: "MARIE LIGHT ACTIVE 34G", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 252, name: "Masala Noodles 200g", qty: 1.00, unit: "Pieces", total: 70.00 },
  { id: 253, name: "MAYA AGARBATHI", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 254, name: "MEDIMIX CLASSIC SOP 75G", qty: 1.00, unit: "Pieces", total: 32.00 },
  { id: 255, name: "MENTHULU 100G", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 256, name: "MENTHULU 250G", qty: 2.00, unit: "Pieces", total: 70.00 },
  { id: 257, name: "MENTHULU 50G", qty: 1.00, unit: "Pieces", total: 12.00 },
  { id: 258, name: "MIKL RUSK 58G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 259, name: "MILK BIKIS", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 260, name: "MILK RUSK 182G", qty: 2.00, unit: "Pieces", total: 68.00 },
  { id: 261, name: "MILKYBAR", qty: 8.00, unit: "Pieces", total: 80.00 },
  { id: 262, name: "MILKYBAR CHOO", qty: 4.00, unit: "Pieces", total: 20.00 },
  { id: 263, name: "MILKYBBAR SMAL BOX", qty: 1.00, unit: "Packs", total: 135.00 },
  { id: 264, name: "Minapappu 1kg", qty: 18.00, unit: "Pieces", total: 2268.00 },
  { id: 265, name: "Minapapu 500g", qty: 8.00, unit: "Number", total: 520.00 },
  { id: 266, name: "MINUTE MAID ORANGE", qty: 2.00, unit: "Pieces", total: 50.00 },
  { id: 267, name: "MIRIYALU 50G", qty: 2.00, unit: "Pieces", total: 100.00 },
  { id: 268, name: "MOMS MAGIC CASHEW& ALMOND", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 269, name: "MOMS MAGIC CASHEW&ALMOND 61G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 270, name: "MOMS MAGIC SHINES SHINIG BUTTER 126G", qty: 2.00, unit: "Pieces", total: 70.00 },
  { id: 271, name: "MOMS MAGIC SHINES SHINING BUTTER 44G", qty: 2.00, unit: "Pieces", total: 20.00 },

  // Page 8
  { id: 272, name: "MOON DAL 250G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 273, name: "MOON DAL 500G", qty: 5.00, unit: "Pieces", total: 300.00 },
  { id: 274, name: "MOONG DALL 120G", qty: 2.00, unit: "Pieces", total: 110.00 },
  { id: 275, name: "MROW", qty: 1.00, unit: "Pieces", total: 27.00 },
  { id: 276, name: "MUNCH 5RS", qty: 21.00, unit: "Pieces", total: 105.00 },
  { id: 277, name: "MUNG BEAN 500G", qty: 2.00, unit: "Pieces", total: 110.00 },
  { id: 278, name: "MURALI VATHULU", qty: 1.00, unit: "Pieces", total: 29.00 },
  { id: 279, name: "Muskmelon Seeds 100g", qty: 2.00, unit: "Pieces", total: 210.00 },
  { id: 280, name: "MYSORE SANDAL 50G", qty: 3.00, unit: "Pieces", total: 120.00 },
  { id: 281, name: "Mysore Sandal Gold", qty: 2.00, unit: "Pieces", total: 160.00 },
  { id: 282, name: "MYSORE SANDAL SOAP 150G", qty: 3.00, unit: "Pieces", total: 216.00 },
  { id: 283, name: "MYSORE SANDAL SOP 125G", qty: 4.00, unit: "Pieces", total: 240.00 },
  { id: 284, name: "MYSORE SANDALS FRESHNOL", qty: 1.00, unit: "Pieces", total: 145.00 },
  { id: 285, name: "NALLA KARAM PODI 150G", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 286, name: "NATURO", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 287, name: "NAVARATNA OIL 50ML", qty: 1.00, unit: "Packs", total: 47.00 },
  { id: 288, name: "NEEM NIMYLE 200ML", qty: 1.00, unit: "Pieces", total: 40.00 },
  { id: 289, name: "Nice Peanut Chikki", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 290, name: "NO 1 SOAP LEMON", qty: 1.00, unit: "Pieces", total: 135.00 },
  { id: 291, name: "NSR", qty: 2.00, unit: "Pieces", total: 30.00 },
  { id: 292, name: "NUVVULU 250G", qty: 1.00, unit: "Pieces", total: 60.00 },
  { id: 293, name: "NYCIL GERM EXPERT 210G", qty: 1.00, unit: "Pieces", total: 155.00 },
  { id: 294, name: "NYCIL POWDER SMALL", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 295, name: "OATS 400G", qty: 1.00, unit: "Pieces", total: 82.00 },
  { id: 296, name: "OIONES 500G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 297, name: "ONIONS 1KG", qty: 12.00, unit: "Bag", total: 780.00 },
  { id: 298, name: "ORINGE CANDY 150G", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 299, name: "Osmania Bisc", qty: 1.00, unit: "Pieces", total: 75.00 },
  { id: 300, name: "Pachisenaga Pappu 250g", qty: 1.00, unit: "Pieces", total: 24.00 },
  { id: 301, name: "Pachisenagapappu 500g", qty: 2.00, unit: "Pieces", total: 96.00 },
  { id: 302, name: "PARACHUTE 175ML", qty: 2.00, unit: "Pieces", total: 220.00 },
  { id: 303, name: "Parachute Aloe Vera 250ml", qty: 1.00, unit: "Pieces", total: 160.00 },
  { id: 304, name: "PARACHUTEB 100ML", qty: 3.00, unit: "Pieces", total: 180.00 },
  { id: 305, name: "PARK10RS", qty: 6.00, unit: "Pieces", total: 60.00 },
  { id: 306, name: "PEARS PURE& GENTLE GLOW 52G", qty: 4.00, unit: "Pieces", total: 200.00 },
  { id: 307, name: "PEARS WITH MINT 50G", qty: 1.00, unit: "Pieces", total: 22.00 },
  { id: 308, name: "Pepper 100g", qty: 2.00, unit: "Pieces", total: 140.00 },
  { id: 309, name: "PEPPER BOLS 50G", qty: 3.00, unit: "Pieces", total: 150.00 },
  { id: 310, name: "PITAMBARI 20G", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 311, name: "POND S 23G", qty: 3.00, unit: "Pieces", total: 330.00 },

  // Page 9
  { id: 312, name: "PONDS BRICHT BEAUTY 15G", qty: 2.00, unit: "Pieces", total: 130.00 },
  { id: 313, name: "Ponds Cold Cream", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 314, name: "POOJA GOLD OIL 800ML", qty: 2.00, unit: "Pieces", total: 260.00 },
  { id: 315, name: "POOJA OIAL 800ML", qty: 2.00, unit: "Pieces", total: 250.00 },
  { id: 316, name: "POOJA POWDER 50 G,", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 317, name: "POOJA POWDER B GANDAM", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 318, name: "POWER NATURAL SOAP", qty: 1.00, unit: "Pieces", total: 48.00 },
  { id: 319, name: "Priya Gold 500g", qty: 1.00, unit: "Pieces", total: 80.00 },
  { id: 320, name: "PRIYA GOLD1KG", qty: 1.00, unit: "Packs", total: 155.00 },
  { id: 321, name: "Pumpkin Seeds 100g", qty: 5.00, unit: "Pieces", total: 325.00 },
  { id: 322, name: "REAL AAM 400G", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 323, name: "RED CHILLI PICKEL 60G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 324, name: "RED LABUL NATURAL 100G", qty: 1.00, unit: "Pieces", total: 58.00 },
  { id: 325, name: "RED LENTILS 500G", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 326, name: "RIMZIM JEERA", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 327, name: "RIN", qty: 15.00, unit: "Pieces", total: 150.00 },
  { id: 328, name: "RIN ANTIBAV", qty: 1.00, unit: "Pieces", total: 125.00 },
  { id: 329, name: "RIN MATIC", qty: 2.00, unit: "Pieces", total: 20.00 },
  { id: 330, name: "ROBAN CAKE 25G", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 331, name: "RUCHI GOLD 750G", qty: 5.00, unit: "Pieces", total: 675.00 },
  { id: 332, name: "Ruchigold 1kg", qty: 8.00, unit: "Packs", total: 1240.00 },
  { id: 333, name: "SAGGUBIYYAM 250G", qty: 5.00, unit: "Pieces", total: 115.00 },
  { id: 334, name: "SAI BANSI RAVVA 500G", qty: 1.00, unit: "Pieces", total: 35.00 },
  { id: 335, name: "SALT MIRCHI 250G", qty: 3.00, unit: "Pieces", total: 60.00 },
  { id: 336, name: "SANTOOR", qty: 5.00, unit: "Pieces", total: 190.00 },
  { id: 337, name: "SANTOOR 150G", qty: 6.00, unit: "Pieces", total: 330.00 },
  { id: 338, name: "SANTOOR FRESH SKIN", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 339, name: "SANTOOR SOAP BIG SET", qty: 1.00, unit: "Pieces", total: 205.00 },
  { id: 340, name: "Savlon Handwash 375 Ml", qty: 1.00, unit: "Pieces", total: 95.00 },
  { id: 341, name: "SCISSORS 10INCH", qty: 1.00, unit: "Pieces", total: 120.00 },
  { id: 342, name: "Sensodyne Bresh", qty: 1.00, unit: "Pieces", total: 58.00 },
  { id: 343, name: "SENSORA PASTE 80G", qty: 1.00, unit: "Pieces", total: 140.00 },
  { id: 344, name: "SHINK BRASHS", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 345, name: "SMART MOP", qty: 1.00, unit: "Pairs", total: 160.00 },
  { id: 346, name: "SOANPAPDI", qty: 1.00, unit: "Pieces", total: 70.00 },
  { id: 347, name: "SOLO FRESH 100G", qty: 1.00, unit: "Packs", total: 30.00 },
  { id: 348, name: "SOMPU 50G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 349, name: "SOMPU100G", qty: 1.00, unit: "Packs", total: 20.00 },
  { id: 350, name: "SORGHUM500G", qty: 1.00, unit: "Pieces", total: 35.00 },
  { id: 351, name: "SOYA BIG 100G", qty: 1.00, unit: "Pieces", total: 15.00 },
  { id: 352, name: "SOYA CHUNKS 42G", qty: 1.00, unit: "Pieces", total: 10.00 },

  // Page 10
  { id: 353, name: "SOYA SMALL 100G", qty: 2.00, unit: "Pieces", total: 30.00 },
  { id: 354, name: "SOYA SMALL 50G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 355, name: "SP CHOCOLATE 200G", qty: 1.00, unit: "Pieces", total: 70.00 },
  { id: 356, name: "SP DUET 200G", qty: 2.00, unit: "Pieces", total: 140.00 },
  { id: 357, name: "SPINZ BB FACE POWDER 10G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 358, name: "SPINZ BBCREAM15G", qty: 1.00, unit: "Pieces", total: 85.00 },
  { id: 359, name: "SPINZ BBPOWDER20G", qty: 3.00, unit: "Pieces", total: 90.00 },
  { id: 360, name: "SPRITE 1L", qty: 4.00, unit: "Pieces", total: 180.00 },
  { id: 361, name: "SRI DURGA CHILLI POWDER 100G", qty: 1.00, unit: "Packs", total: 35.00 },
  { id: 362, name: "SRI DURGA CORIANDER 100G", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 363, name: "SRI DURGA DANIA POWDER 50G", qty: 1.00, unit: "Packs", total: 18.00 },
  { id: 364, name: "Sri Durga Green Tamarind Pickleb 200g", qty: 1.00, unit: "Pieces", total: 40.00 },
  { id: 365, name: "SRI DURGA MANGO AVAKAI 200G", qty: 1.00, unit: "Pieces", total: 40.00 },
  { id: 366, name: "SRI DURGA PAPULA PODI150G", qty: 1.00, unit: "Packs", total: 35.00 },
  { id: 367, name: "SRI DURGA SINGER GARLIC", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 368, name: "SRI DURGA TARMARIK 50G", qty: 1.00, unit: "Packs", total: 18.00 },
  { id: 369, name: "SRI DURGA TOMATO PICKLE 200G", qty: 1.00, unit: "Pieces", total: 40.00 },
  { id: 370, name: "SRI DURGA TOMATO PICKLE 500G", qty: 1.00, unit: "Pieces", total: 90.00 },
  { id: 371, name: "SRI PAPADS 100G", qty: 2.00, unit: "Pieces", total: 56.00 },
  { id: 372, name: "SS ROD", qty: 2.00, unit: "Packs", total: 220.00 },
  { id: 373, name: "SSCG3", qty: 1.00, unit: "Pieces", total: 110.00 },
  { id: 374, name: "SSCG4S", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 375, name: "STARFREE XL", qty: 1.00, unit: "Packs", total: 43.00 },
  { id: 376, name: "STRABERRY CANDYB 135G", qty: 1.00, unit: "Pieces", total: 55.00 },
  { id: 377, name: "Subha Lakshmi Turmeric 100", qty: 3.00, unit: "Pieces", total: 90.00 },
  { id: 378, name: "Sugar 1Kg", qty: 17.00, unit: "Pieces", total: 1020.00 },
  { id: 379, name: "Sugar 500g", qty: 4.00, unit: "Pieces", total: 120.00 },
  { id: 380, name: "SUN GOLD SOAP 25", qty: 29.00, unit: "Pieces", total: 696.00 },
  { id: 381, name: "SUNFEAST BOUNCE 28G", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 382, name: "SUNFEAST FANTASTIK CHOCO ALMOND", qty: 10.00, unit: "Pieces", total: 100.00 },
  { id: 383, name: "SUNFEAST FANTASTIK FRUIT &NUT", qty: 1.00, unit: "Pieces", total: 45.00 },
  { id: 384, name: "SUNFEAST GLICOSE 24G", qty: 2.00, unit: "Pieces", total: 6.00 },
  { id: 385, name: "SUNFEAST SUPERMILK 31G", qty: 4.00, unit: "Pieces", total: 20.00 },

  // Page 11
  { id: 386, name: "SUNFEAST SUPERMILK 72G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 387, name: "SUNFEAST SWEET&SALTY 68G", qty: 3.00, unit: "Pieces", total: 30.00 },
  { id: 388, name: "Sunflower Seeds 100g", qty: 5.00, unit: "Pieces", total: 125.00 },
  { id: 389, name: "SUPER MOP", qty: 1.00, unit: "Pieces", total: 180.00 },
  { id: 390, name: "SURF EXCEL 10", qty: 5.00, unit: "Pieces", total: 50.00 },
  { id: 391, name: "SURF EXCEL 65G", qty: 5.00, unit: "Packs", total: 50.00 },
  { id: 392, name: "SURF EXCEL 84 G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 393, name: "Surf Excel Bar 250g", qty: 11.00, unit: "Pieces", total: 418.00 },
  { id: 394, name: "SURF EXCEL MATIC 70G", qty: 2.00, unit: "Packs", total: 18.00 },
  { id: 395, name: "SURFEXEL SOPE", qty: 2.00, unit: "Pieces", total: 48.00 },
  { id: 396, name: "SURYA DEVA", qty: 4.00, unit: "Pieces", total: 92.00 },
  { id: 397, name: "Swastiks Mango Pickle200g", qty: 1.00, unit: "Pieces", total: 40.00 },
  { id: 398, name: "SWASTIKS RED CHILLI PICKLE 500G", qty: 1.00, unit: "Pieces", total: 90.00 },
  { id: 399, name: "SWD GARLIC MIXTUR", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 400, name: "SWD SPICY NUTS 25G", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 401, name: "SWEEPER", qty: 2.00, unit: "Pieces", total: 300.00 },
  { id: 402, name: "TAJ MAHAL 250G", qty: 2.00, unit: "Pieces", total: 430.00 },
  { id: 403, name: "TAMARIND250G", qty: 9.00, unit: "Pieces", total: 405.00 },
  { id: 404, name: "TAMARIND500G", qty: 6.00, unit: "Pieces", total: 570.00 },
  { id: 405, name: "TANGY IMLI 350G", qty: 1.00, unit: "Pieces", total: 5.00 },
  { id: 406, name: "TASTY NUTS 100G", qty: 3.00, unit: "Pieces", total: 165.00 },
  { id: 407, name: "TATA RA SALT", qty: 1.00, unit: "Pieces", total: 20.00 },
  { id: 408, name: "Telagadalu 100G", qty: 1.00, unit: "Pieces", total: 12.00 },
  { id: 409, name: "Telagadalu 250G", qty: 8.00, unit: "Packs", total: 320.00 },
  { id: 410, name: "Telagadalu 500g", qty: 4.00, unit: "Pieces", total: 320.00 },
  { id: 411, name: "TERMERIC POWDER 100G", qty: 5.00, unit: "Pieces", total: 225.00 },
  { id: 412, name: "TERMERIC POWDER 500G", qty: 1.00, unit: "Pieces", total: 145.00 },
  { id: 413, name: "TERMERIC POWDER 50G", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 414, name: "Thumsup", qty: 2.00, unit: "Pieces", total: 64.00 },
  { id: 415, name: "THUMSUP 1L", qty: 2.00, unit: "Pieces", total: 90.00 },
  { id: 416, name: "THUMSUP 2.25L", qty: 1.00, unit: "Pieces", total: 85.00 },
  { id: 417, name: "TOMATO SOUP", qty: 1.00, unit: "Pieces", total: 10.00 },
  { id: 418, name: "TRESEMME 180ML", qty: 1.00, unit: "Pieces", total: 185.00 },
  { id: 419, name: "TULIPS COTTON SWABS", qty: 1.00, unit: "Pieces", total: 35.00 },
  { id: 420, name: "UINIBIC CASEW BADAM", qty: 3.00, unit: "Pieces", total: 84.00 },
  { id: 421, name: "UINIBIC CHOCO CHIP", qty: 2.00, unit: "Pieces", total: 116.00 },
  { id: 422, name: "UINIBIC CHOCO RIPPLE", qty: 1.00, unit: "Pieces", total: 28.00 },
  { id: 423, name: "UINIBIC ORANGE SPLASH", qty: 3.00, unit: "Pieces", total: 84.00 },
  { id: 424, name: "UJALA 30ML", qty: 1.00, unit: "Packs", total: 10.00 },
  { id: 425, name: "Ujala 75ml", qty: 1.00, unit: "Pieces", total: 38.00 },

  // Page 12
  { id: 426, name: "ULTIMATE POWER LIQUID DETERGENT", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 427, name: "ULTRA FLOOR CLEAN", qty: 3.00, unit: "Pieces", total: 435.00 },
  { id: 428, name: "ULTRA SOFT BRUSH", qty: 2.00, unit: "Pieces", total: 310.00 },
  { id: 429, name: "UNIBIC BUTTER", qty: 6.00, unit: "Pieces", total: 98.00 },
  { id: 430, name: "UNIBIC CASHEW", qty: 3.00, unit: "Pieces", total: 127.00 },
  { id: 431, name: "UNIBIC CASHEW BADAM", qty: 7.00, unit: "Pieces", total: 45.00 },
  { id: 432, name: "UNIBIC CHOCO CHIP", qty: 2.00, unit: "Pieces", total: 60.00 },
  { id: 433, name: "UNIBIC CHOCO NUT", qty: 8.00, unit: "Pieces", total: 180.00 },
  { id: 434, name: "UNIBIC CHOCO RIPPLE", qty: 6.00, unit: "Pieces", total: 50.00 },
  { id: 435, name: "UNIBIC CHOCOLATE WAFER", qty: 2.00, unit: "Pieces", total: 116.00 },
  { id: 436, name: "UNIBIC COCONUT", qty: 1.00, unit: "Pieces", total: 30.00 },
  { id: 437, name: "UNIBIC DANISH COCONUT", qty: 4.00, unit: "Pieces", total: 40.00 },
  { id: 438, name: "UNIBIC FRUIT & NUT", qty: 3.00, unit: "Pieces", total: 118.00 },
  { id: 439, name: "UNIBIC OATS", qty: 3.00, unit: "Pieces", total: 174.00 },
  { id: 440, name: "UNIBIC ORANGE SPLASH", qty: 4.00, unit: "Pieces", total: 30.00 },
  { id: 441, name: "UNIBIC PISTA BADAM", qty: 5.00, unit: "Pieces", total: 262.00 },
  { id: 442, name: "UNIBIC RICH CHOCOLATE WAFER", qty: 6.00, unit: "Pieces", total: 60.00 },
  { id: 443, name: "UNIBIC STRABERRY WAFER", qty: 12.00, unit: "Pieces", total: 168.00 },
  { id: 444, name: "VAM 50G", qty: 2.00, unit: "Pieces", total: 40.00 },
  { id: 445, name: "VASELINE 5.5G", qty: 4.00, unit: "Packs", total: 20.00 },
  { id: 446, name: "Vermicilli Bambino1kg", qty: 1.00, unit: "Pieces", total: 90.00 },
  { id: 447, name: "Vermicilli Payasam Mix", qty: 2.00, unit: "Pieces", total: 180.00 },
  { id: 448, name: "Verusenaga Pappu 1kg", qty: 7.00, unit: "Pieces", total: 1120.00 },
  { id: 449, name: "Verusenaga Pappu 500g", qty: 7.00, unit: "Pieces", total: 560.00 },
  { id: 450, name: "VIJAYA GROUNDNUT OIL 1L", qty: 3.00, unit: "Pieces", total: 534.00 },
  { id: 451, name: "Vim 10g", qty: 4.00, unit: "Pieces", total: 40.00 },
  { id: 452, name: "Vim 126g", qty: 3.00, unit: "Pieces", total: 90.00 },
  { id: 453, name: "VIM 190ML", qty: 2.00, unit: "Pieces", total: 46.00 },
  { id: 454, name: "VIM 250ML", qty: 3.00, unit: "Pieces", total: 220.00 },
  { id: 455, name: "Vim 480g", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 456, name: "Vim 5rs Bar", qty: 31.00, unit: "Pieces", total: 155.00 },
  { id: 457, name: "Vim Sop", qty: 7.00, unit: "Pieces", total: 70.00 },
  { id: 458, name: "Vt Avalu 100g", qty: 6.00, unit: "Pieces", total: 120.00 },
  { id: 459, name: "WAGH BAKRI TEA 100G", qty: 1.00, unit: "Pieces", total: 47.00 },
  { id: 460, name: "WAGH BAKRI250G", qty: 1.00, unit: "Pieces", total: 155.00 },
  { id: 461, name: "WAGHB BAKRI ELAICHI 100G", qty: 1.00, unit: "Pieces", total: 50.00 },
  { id: 462, name: "WALL STICK", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 463, name: "Watermelon Seeds 100g", qty: 1.00, unit: "Pieces", total: 70.00 },
  { id: 464, name: "WHISPER XXL", qty: 1.00, unit: "Pieces", total: 50.00 },

  // Page 13
  { id: 465, name: "WHITE URAD DAL 500G", qty: 6.00, unit: "Pieces", total: 300.00 },
  { id: 466, name: "WHITE URAD DAL250g", qty: 6.00, unit: "Pieces", total: 180.00 },
  { id: 467, name: "WIPPER STICK", qty: 1.00, unit: "Pieces", total: 100.00 },
  { id: 468, name: "WOMENS PLUS", qty: 1.00, unit: "Pieces", total: 350.00 },
  { id: 469, name: "Yendu Kobbari 250g", qty: 9.00, unit: "Pieces", total: 459.00 },
  { id: 470, name: "YIPPEE NOODLES 280G", qty: 4.00, unit: "Pieces", total: 220.00 },
  { id: 471, name: "YIPPEE NOODLES MAGIC MASALA", qty: 2.00, unit: "Pieces", total: 10.00 },
  { id: 472, name: "YIPPEE WOW MASALA", qty: 2.00, unit: "Pieces", total: 10.00 }
];

console.log(`Total raw items defined: ${rawItems.length}`);

// Brand detection rules
const KNOWN_BRANDS = [
  'Aashirvaad', 'Aachi', 'Ariel', 'Arokya', 'Arun', 'Bambino', 'Bingo', 'Boost', 'Bourbon',
  'Britannia', 'Bru', 'Cinthol', 'Clinic Plus', 'Coca Cola', 'Colgate', 'Comfort', 'Dabur',
  'Dairy Milk', 'Dark Fantasy', 'Dettol', 'Domex', 'Dove', 'Eagle', 'Exo', 'Fab', 'Fair & Lovely',
  'Fanta', 'Fogg', 'Freedom', 'Gemini', 'Glow & Lovely', 'Gopuram', 'GRB', 'Harpic', 'Hatsun',
  'Head & Shoulders', 'Hide & Seek', 'Horlicks', 'India Gate', 'ITC', 'Kinley', 'Kissan', 'KitKat',
  'Knorr', 'Lakme', 'Lalitha', 'LG', 'Limca', 'Lion', 'Liril', 'Lotte', 'Lux', 'Maaza', 'Maggi',
  'Malkist', 'Mangaldeep', 'Margo', 'Marie Light', 'Medimix', 'Milk Bikis', 'Milkybar', "Mom's Magic",
  'Munch', 'Mysore Sandal', 'Navaratna', 'Nimyle', 'Nycil', 'Parachute', 'Pears', 'Pitambari',
  'Ponds', 'Priya', 'Rin', 'Ruchi Gold', 'Santoor', 'Savlon', 'Sensodyne', 'Soanpapdi', 'Spinz',
  'Sprite', 'Sri Durga', 'Sunfeast', 'Surf Excel', 'Swastiks', 'Taj Mahal', 'Tata', 'Thums Up',
  'Tresemme', 'Tulips', 'Unibic', 'Ujala', 'Vaseline', 'Vijaya', 'Vim', 'Wagh Bakri', 'Whisper', 'Yippee'
];

function detectBrand(name) {
  const upper = name.toUpperCase();
  for (const b of KNOWN_BRANDS) {
    const bUpper = b.toUpperCase().replace('&', '');
    if (upper.includes(bUpper) || upper.startsWith(bUpper.slice(0, 4))) {
      return b;
    }
  }
  return 'G1 Mart';
}

function extractUnit(name, reportUnit) {
  // Check for grams / kg / ml / L
  const match = name.match(/(\d+(?:\.\d+)?)\s*(KG|G|GR|GM|ML|L|LT|LITRE|INCH)/i);
  if (match) {
    const val = match[1];
    let u = match[2].toUpperCase();
    if (u === 'GR' || u === 'GM') u = 'g';
    if (u === 'G') u = 'g';
    if (u === 'KG') u = 'kg';
    if (u === 'ML') u = 'ml';
    if (u === 'LT' || u === 'LITRE') u = 'L';
    if (u === 'L') u = 'L';
    return `${val} ${u}`;
  }
  return reportUnit === 'Packs' ? '1 pack' : reportUnit === 'Bag' ? '1 bag' : '1 piece';
}

function detectCategory(name) {
  const u = name.toUpperCase();
  if (u.includes('OIL') || u.includes('OILE') || u.includes('GHEE')) return 'edible-oils';
  if (u.includes('TEA') || u.includes('BRU') || u.includes('COFFEE') || u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('COCA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK') || u.includes('HORLICKS') || u.includes('BOOST')) return 'beverages';
  if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('CHIPS') || u.includes('NOODLES') || u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('MUNCH') || u.includes('5 STAR') || u.includes('5 MUCH') || u.includes('KITKAT') || u.includes('CHOCO') || u.includes('BINGO') || u.includes('CANDY') || u.includes('POPS') || u.includes('UNIBIC') || u.includes('FANTASY') || u.includes('MIKL')) return 'snacks';
  if (u.includes('RICE') || u.includes('ATT') || u.includes('AASHIRVAAD') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('WHEAT') || u.includes('SUJI') || u.includes('VERMICELLI') || u.includes('VERMICILLI') || u.includes('SUGAR') || u.includes('JAGGERY') || u.includes('SAGGUBIYYAM') || u.includes('OATS') || u.includes('MILLET') || u.includes('FLATTENED')) return 'rice-dal-atta';
  if (u.includes('PAPPU') || u.includes('DAL') || u.includes('DALL') || u.includes('MINAPAPPU') || u.includes('KANDIPAPPU') || u.includes('LENTIL') || u.includes('BEAN')) return 'rice-dal-atta';
  if (u.includes('MASALA') || u.includes('POWDER') || u.includes('CHILLI') || u.includes('SALT') || u.includes('JEERA') || u.includes('GELAKARA') || u.includes('GILAKARA') || u.includes('AVALU') || u.includes('ELACHI') || u.includes('ELAICHI') || u.includes('PEPPER') || u.includes('MIRIYALU') || u.includes('MENTHULU') || u.includes('CORIANDER') || u.includes('TAMARIND') || u.includes('TURMERIC') || u.includes('PICKEL') || u.includes('PICKLE') || u.includes('APPALAM') || u.includes('PAPAD')) return 'rice-dal-atta';
  if (u.includes('MILK') || u.includes('CURD') || u.includes('AROKYA') || u.includes('HATSUN') || u.includes('EGGS') || u.includes('EGG')) return 'dairy-bakery';
  if (u.includes('BADAM') || u.includes('JEEDI') || u.includes('KISMIS') || u.includes('DATES') || u.includes('SEEDS') || u.includes('NUTS') || u.includes('CASHEW') || u.includes('MAKHANA') || u.includes('KOBBARI')) return 'snacks';
  if (u.includes('SOAP') || u.includes('SOP') || u.includes('DETERGENT') || u.includes('SURF') || u.includes('RIN') || u.includes('VIM') || u.includes('EXO') || u.includes('FAB') || u.includes('COMFORT') || u.includes('HARPIC') || u.includes('DOMEX') || u.includes('MOP') || u.includes('WIPER') || u.includes('SWEEPER') || u.includes('BRUSH') || u.includes('NIMYLE') || u.includes('BLEACH') || u.includes('ACID') || u.includes('MATCH') || u.includes('PINS') || u.includes('DUSTPAN') || u.includes('UJALA') || u.includes('PITAMBARI')) return 'household';
  if (u.includes('SHAMPOO') || u.includes('CREAM') || u.includes('COLGATE') || u.includes('PASTE') || u.includes('DOVE') || u.includes('CINTHOL') || u.includes('LUX') || u.includes('SANTOOR') || u.includes('PEARS') || u.includes('LIRIL') || u.includes('MEDIMIX') || u.includes('MARGO') || u.includes('DABUR') || u.includes('SENSODYNE') || u.includes('SENSORA') || u.includes('LAKME') || u.includes('GARNIER') || u.includes('GLOW') || u.includes('FAIR') || u.includes('VASELINE') || u.includes('PONDS') || u.includes('SPINZ') || u.includes('NYCIL') || u.includes('FOGG') || u.includes('SAVLON') || u.includes('DETTAL') || u.includes('WHISPER') || u.includes('PARACHUTE') || u.includes('HAIR') || u.includes('SWABS') || u.includes('EAR')) return 'personal-care';
  if (u.includes('SAMBRANI') || u.includes('AGARBATHI') || u.includes('POOJA') || u.includes('CAMPHOR') || u.includes('CAMPHPR') || u.includes('GOPURAM') || u.includes('DEEPAM') || u.includes('VATHULU') || u.includes('GANDAM')) return 'household';
  if (u.includes('ONION') || u.includes('OIONES') || u.includes('COCONUT') || u.includes('MANGO') || u.includes('FRUIT')) return 'fruits-vegetables';

  return 'household';
}


function detectPhotoImage(name, brand, category) {
  const u = name.toUpperCase();
  if (u.includes('AASHIRVAAD') && (u.includes('1KG') || u.includes('ATTA') || u.includes('WHEAT'))) return '/products/prod-2.jpg';
  if (u.includes('CRYSTAL SALT')) return '/products/photos/crystal-salt.jpg';
  if (u.includes('SALT') || u.includes('TATA SALT')) return '/products/prod-1.jpg';
  if (u.includes('FORTUNE') || (u.includes('SUNFLOWER') && u.includes('OIL'))) return '/products/prod-3.jpg';
  if (u.includes('MILK') || u.includes('AROKYA') || u.includes('HATSUN')) return '/products/prod-4.jpg';
  if (u.includes('BREAD') || u.includes('BUN')) return '/products/prod-5.jpg';
  if (u.includes('BASMATI') || u.includes('INDIA GATE')) return '/products/prod-6.jpg';
  if (u.includes('LAYS') || u.includes("LAY'S")) return '/products/prod-7.jpg';
  if (u.includes('COCA') || u.includes('COLA')) return '/products/prod-8.jpg';
  if (u.includes('SURF EXCEL')) return '/products/prod-9.jpg';
  if (u.includes('COLGATE')) return '/products/prod-10.jpg';
  if (u.includes('APPLE')) return '/products/prod-11.jpg';
  if (u.includes('TOMATO') || u.includes('TEMATO')) return '/products/prod-12.jpg';
  if (u.includes('ONION') || u.includes('OIONES')) return '/products/prod-13.jpg';
  if (u.includes('POTATO') || u.includes('ALOO')) return '/products/prod-14.jpg';
  if (u.includes('GINGER') || u.includes('ALLAM')) return '/products/prod-15.jpg';
  if (u.includes('GARLIC') || u.includes('VELLULLI')) return '/products/prod-16.jpg';
  if (u.includes('CHILLIES') || (u.includes('CHILLI') && !u.includes('POWDER'))) return '/products/prod-17.jpg';
  if (u.includes('LEMON') || u.includes('NIMMA')) return '/products/prod-18.jpg';
  if (u.includes('CORIANDER') && !u.includes('POWDER') && !u.includes('SEEDS')) return '/products/prod-19.jpg';
  if (u.includes('CURRY LEAF') || u.includes('CURRY LEAVES')) return '/products/prod-20.jpg';
  if (u.includes('JAM') || u.includes('KISSAN')) return '/products/prod-21.jpg';
  if (u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('NOODLES')) return '/products/prod-22.jpg';
  if (u.includes('PARLE')) return '/products/prod-23.jpg';
  if (u.includes('GOOD DAY')) return '/products/prod-24.jpg';
  if (u.includes('OREO')) return '/products/prod-25.jpg';
  if (u.includes('RED LABEL') || u.includes('3 ROSES') || (u.includes('TEA') && !u.includes('TATA') && !u.includes('5 STAR'))) return '/products/prod-26.jpg';
  if (u.includes('TATA TEA')) return '/products/prod-27.jpg';
  if (u.includes('BRU')) return '/products/prod-28.jpg';
  if (u.includes('NESCAFE') || u.includes('COFFEE')) return '/products/prod-29.jpg';
  if (u.includes('HORLICKS') || u.includes('BOOST')) return '/products/prod-30.jpg';
  if (u.includes('DETTOL')) return '/products/prod-31.jpg';
  if (u.includes('LIFEBUOY')) return '/products/prod-32.jpg';
  if (u.includes('DOVE')) return '/products/prod-33.jpg';
  if (u.includes('HEAD & SHOULDERS') || u.includes('CLEAR ANTI')) return '/products/prod-34.jpg';
  if (u.includes('CLINIC PLUS')) return '/products/prod-35.jpg';
  if (u.includes('PARACHUTE') || u.includes('COCONUT OIL')) return '/products/prod-36.jpg';
  if (u.includes('VIM') || u.includes('EXO')) return '/products/prod-37.jpg';
  if (u.includes('HARPIC')) return '/products/prod-38.jpg';
  if (u.includes('LIZOL')) return '/products/prod-39.jpg';
  if (u.includes('COMFORT')) return '/products/prod-40.jpg';
  if (u.includes('DAIRY MILK') || u.includes('CADBURY')) return '/products/prod-41.jpg';
  if (u.includes('KITKAT') || u.includes('5 STAR') || u.includes('MUNCH') || u.includes('5 MUCH')) return '/products/prod-42.jpg';
  if (u.includes('WHISPER') || u.includes('HIMALAYA') || u.includes('WIPES')) return '/products/prod-43.jpg';

  if (u.includes('TOOR') || u.includes('KANDIPAPPU')) return '/products/photos/toor-dal.jpg';
  if (u.includes('MINAPAPPU') || u.includes('URAD')) return '/products/photos/urad-dal.jpg';
  if (u.includes('MOONG') || u.includes('PESALU') || u.includes('PESARA')) return '/products/photos/moong-dal.jpg';
  if (u.includes('CHANA') || u.includes('SENAGALU') || u.includes('SENAGA') || u.includes('BENGAL GRAM')) return '/products/photos/chana-dal.jpg';
  if (u.includes('JEEDI') || u.includes('CASHEW')) return '/products/photos/cashews.jpg';
  if (u.includes('BADAM') || u.includes('ALMOND')) return '/products/photos/almonds.jpg';
  if (u.includes('KISMIS') || u.includes('RAISIN') || u.includes('DATES')) return '/products/photos/raisins.jpg';
  if (u.includes('CHILLY POWDER') || u.includes('MIRCHI POWDER') || u.includes('CHILLI POWDER')) return '/products/photos/chilli-powder.jpg';
  if (u.includes('TURMERIC') || u.includes('PASUPU') || u.includes('HALDI')) return '/products/photos/turmeric.jpg';
  if (u.includes('CORIANDER POWDER') || u.includes('CORIANDER SEEDS') || u.includes('DHANIYALU')) return '/products/photos/coriander-powder.jpg';
  if (u.includes('AVALU') || u.includes('MUSTARD') || u.includes('JEERA') || u.includes('GELAKARA') || u.includes('GILAKARA')) return '/products/photos/mustard-cumin.jpg';
  if (u.includes('MASALA') || u.includes('ELACHI') || u.includes('PEPPER') || u.includes('MIRIYALU') || u.includes('CLOVE') || u.includes('LAVANG')) return '/products/photos/spices-cloves.jpg';
  if (u.includes('SUGAR') || u.includes('BELLAM') || u.includes('JAGGERY')) return '/products/photos/sugar-jaggery.jpg';
  if (u.includes('SUJI') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('BANSI') || u.includes('MAIDA') || u.includes('BESAN') || u.includes('ATTA') || u.includes('WHEAT')) return '/products/photos/suji-rava.jpg';
  if (u.includes('VERMICELLI') || u.includes('SEMIYA') || u.includes('BAMBINO')) return '/products/photos/vermicelli.jpg';
  if (u.includes('POHA') || u.includes('ATUKULU') || u.includes('SAGGUBIYYAM') || u.includes('SABUDANA')) return '/products/photos/poha.jpg';
  if (u.includes('GHEE')) return '/products/photos/ghee.jpg';
  if (u.includes('OIL') || u.includes('OILE')) return '/products/photos/cooking-oil.jpg';
  if (u.includes('CAMPHOR') || u.includes('AGARBATHI') || u.includes('POOJA') || u.includes('SAMBRANI') || u.includes('VATHULU') || u.includes('GANDAM')) return '/products/photos/pooja-camphor.jpg';
  if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('BOURBON') || u.includes('50-50')) return '/products/photos/biscuits-pack.jpg';
  if (u.includes('CHIPS') || u.includes('BINGO') || u.includes('PAPAD') || u.includes('APPALAM') || u.includes('STIX') || u.includes('POPS')) return '/products/photos/chips-namkeen.jpg';
  if (u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK')) return '/products/photos/cold-drink-bottle.jpg';
  if (u.includes('ARIEL') || u.includes('RIN') || u.includes('FAB') || u.includes('DETERGENT') || u.includes('BLEACH') || u.includes('ACID') || u.includes('UJALA') || u.includes('WIPER') || u.includes('MOP')) return '/products/photos/cleaning-wash.jpg';
  if (u.includes('SOAP') || u.includes('CINTHOL') || u.includes('LUX') || u.includes('SANTOOR') || u.includes('PEARS') || u.includes('MEDIMIX') || u.includes('MARGO')) return '/products/prod-31.jpg';
  if (u.includes('PASTE') || u.includes('DABUR RED') || u.includes('SENSODYNE') || u.includes('BRUSH')) return '/products/prod-10.jpg';
  if (u.includes('SHAMPOO')) return '/products/prod-35.jpg';
  if (u.includes('HAIR OIL')) return '/products/prod-36.jpg';
  if (u.includes('TEA')) return '/products/prod-26.jpg';

  if (category === 'rice-dal-atta') return '/products/photos/test-rice.jpg';
  if (category === 'edible-oils') return '/products/photos/cooking-oil.jpg';
  if (category === 'dairy-bakery') return '/products/prod-4.jpg';
  if (category === 'snacks') return '/products/photos/chips-namkeen.jpg';
  if (category === 'beverages') return '/products/prod-26.jpg';
  if (category === 'household') return '/products/photos/cleaning-wash.jpg';
  if (category === 'personal-care') return '/products/prod-31.jpg';
  if (category === 'fruits-vegetables') return '/products/prod-11.jpg';

  return '/products/photos/test-rice.jpg';
}

function detectSubCategory(name, category) {
  const u = name.toUpperCase();
  if (category === 'rice-dal-atta') {
    if (u.includes('ATT') || u.includes('WHEAT') || u.includes('MAIDA') || u.includes('BESAN') || u.includes('SUJI') || u.includes('RAVA') || u.includes('RAVVA') || u.includes('BANSI')) return 'Atta & Flours';
    if (u.includes('RICE') || u.includes('BASMATI') || u.includes('POHA') || u.includes('ATUKULU') || u.includes('SAGGUBIYYAM') || u.includes('VERMICELLI') || u.includes('SEMIYA') || u.includes('BAMBINO')) return 'Rice & Grains';
    if (u.includes('PAPPU') || u.includes('DAL') || u.includes('DALL') || u.includes('MINAPAPPU') || u.includes('KANDIPAPPU') || u.includes('LENTIL') || u.includes('BEAN') || u.includes('MOONG') || u.includes('CHANA') || u.includes('RAJMA') || u.includes('BATANI')) return 'Dals & Pulses';
    if (u.includes('SALT') || u.includes('SUGAR') || u.includes('BELLAM') || u.includes('JAGGERY')) return 'Salt & Sugar';
    return 'Spices & Masalas';
  }
  if (category === 'edible-oils') {
    if (u.includes('SUNFLOWER') || u.includes('FORTUNE') || u.includes('FREEDOM') || u.includes('GOLD DROP')) return 'Sunflower Oil';
    if (u.includes('GHEE')) return 'Pure Ghee';
    if (u.includes('DEEPAM') || u.includes('POOJA')) return 'Deepam & Pooja Oil';
    return 'Groundnut & Other Oils';
  }
  if (category === 'dairy-bakery') {
    if (u.includes('BREAD') || u.includes('BUN') || u.includes('RUSK')) return 'Bread & Bakery';
    if (u.includes('EGG')) return 'Eggs';
    return 'Milk & Curd';
  }
  if (category === 'snacks') {
    if (u.includes('BISCUIT') || u.includes('COOKI') || u.includes('RUSK') || u.includes('PARLE') || u.includes('GOOD DAY') || u.includes('OREO') || u.includes('BOURBON')) return 'Biscuits & Cookies';
    if (u.includes('CHIPS') || u.includes('BINGO') || u.includes('LAYS') || u.includes('KURKURE') || u.includes('MUNCHIES') || u.includes('PAPAD') || u.includes('APPALAM')) return 'Chips & Namkeen';
    if (u.includes('BADAM') || u.includes('JEEDI') || u.includes('KISMIS') || u.includes('CASHEW') || u.includes('ALMOND') || u.includes('NUTS') || u.includes('RAISIN') || u.includes('DATES')) return 'Dry Fruits & Nuts';
    if (u.includes('NOODLES') || u.includes('MAGGI') || u.includes('YIPPEE') || u.includes('PASTA')) return 'Instant Noodles & Pasta';
    return 'Chocolates & Sweets';
  }
  if (category === 'beverages') {
    if (u.includes('COFFEE') || u.includes('BRU') || u.includes('NESCAFE')) return 'Instant Coffee';
    if (u.includes('SPRITE') || u.includes('THUMS') || u.includes('LIMCA') || u.includes('FANTA') || u.includes('COCA') || u.includes('MAAZA') || u.includes('SODA') || u.includes('DRINK') || u.includes('JUICE')) return 'Cold Drinks & Soda';
    if (u.includes('HORLICKS') || u.includes('BOOST')) return 'Health Drinks';
    return 'Tea & Chai';
  }
  if (category === 'personal-care') {
    if (u.includes('COLGATE') || u.includes('PASTE') || u.includes('BRUSH') || u.includes('DABUR RED') || u.includes('SENSODYNE')) return 'Oral Care';
    if (u.includes('SHAMPOO') || u.includes('HAIR') || u.includes('PARACHUTE')) return 'Hair Care';
    if (u.includes('CREAM') || u.includes('VASELINE') || u.includes('PONDS') || u.includes('FAIR') || u.includes('GLOW') || u.includes('WHISPER') || u.includes('WIPES') || u.includes('EAR') || u.includes('SWABS')) return 'Skincare & Hygiene';
    return 'Bath Soaps';
  }
  if (category === 'household') {
    if (u.includes('VIM') || u.includes('EXO') || u.includes('DISHWASH') || u.includes('SCRUB')) return 'Dishwash & Kitchen';
    if (u.includes('SURF') || u.includes('ARIEL') || u.includes('RIN') || u.includes('COMFORT') || u.includes('FAB') || u.includes('UJALA') || u.includes('DETERGENT')) return 'Detergent & Fabric Care';
    if (u.includes('HARPIC') || u.includes('LIZOL') || u.includes('NIMYLE') || u.includes('BLEACH') || u.includes('ACID') || u.includes('DOMEX')) return 'Floor & Cleaners';
    if (u.includes('CAMPHOR') || u.includes('AGARBATHI') || u.includes('SAMBRANI') || u.includes('POOJA') || u.includes('VATHULU') || u.includes('GANDAM')) return 'Pooja Needs';
    return 'Home Utilities';
  }
  if (category === 'fruits-vegetables') {
    if (u.includes('APPLE') || u.includes('FRUIT') || u.includes('COCONUT') || u.includes('MANGO')) return 'Fresh Produce & Fruits';
    return 'Daily Vegetables';
  }
  return 'General';
}

function cleanTitle(name) {
  let cleaned = name
    .replace(/\b(\d+(?:\.\d+)?)\s*(KG|G|GR|GM|ML|L|LT|LITRE)\b/gi, '')
    .replace(/\b\d+RS\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  cleaned = cleaned.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return cleaned || name;
}

const catalog = rawItems.map(item => {
  const unitPrice = Math.round((item.total / item.qty) * 100) / 100;
  const unit = extractUnit(item.name, item.unit);
  const brand = detectBrand(item.name);
  const category = detectCategory(item.name);
  const subCategory = detectSubCategory(item.name, category);
  const title = cleanTitle(item.name);
  const id = `g1-${item.id}`;
  const image = detectPhotoImage(item.name, brand, category);

  return {
    id,
    itemNumber: item.id,
    rawName: item.name,
    name: `${title} (${unit})`,
    brand,
    category,
    subCategory,
    unit,
    price: unitPrice,
    originalPrice: unitPrice,
    discountPercentage: 0,
    inStock: true,
    stockCount: Math.max(10, Math.floor(item.qty * 3)),
    image,
    description: `Authentic ${title} - ${unit} pack. Sourced, verified and quality-packed at G1 Mart Supermarket.`,
    rating: 4.8,
    reviewsCount: 14 + (item.id % 27),
    isPopular: item.qty >= 5,
    isBestDeal: false
  };
});

console.log(`Generated ${catalog.length} structured products with real photographic imagery.`);
// Ensure public/products/generated folder exists
const genDir = path.join(__dirname, '..', 'public', 'products', 'generated');
fs.mkdirSync(genDir, { recursive: true });

// Function to generate G1 Mart branded packet SVG
function generateSvgPacket(product) {
  const catColors = {
    'rice-dal-atta': { bg1: '#E8F5E9', bg2: '#C8E6C9', accent: '#2E7D32', icon: '🌾' },
    'edible-oils': { bg1: '#FFF8E1', bg2: '#FFECB3', accent: '#F57F17', icon: '🛢️' },
    'dairy-bakery': { bg1: '#E1F5FE', bg2: '#B3E5FC', accent: '#0277BD', icon: '🥛' },
    'snacks': { bg1: '#FFF3E0', bg2: '#FFE0B2', accent: '#E65100', icon: '🍪' },
    'beverages': { bg1: '#EDE7F6', bg2: '#D1C4E9', accent: '#512DA8', icon: '☕' },
    'household': { bg1: '#E0F2F1', bg2: '#B2DFDB', accent: '#00695C', icon: '🧼' },
    'personal-care': { bg1: '#FCE4EC', bg2: '#F8BBD0', accent: '#C2185B', icon: '✨' },
    'fruits-vegetables': { bg1: '#F1F8E9', bg2: '#DCEDC8', accent: '#33691E', icon: '🥦' },
  };

  const theme = catColors[product.category] || { bg1: '#F5F5F5', bg2: '#E0E0E0', accent: '#2E7D32', icon: '🛍️' };
  
  // Truncate long display names for clean rendering on packet
  const maxLen = 22;
  const line1 = product.rawName.slice(0, maxLen);
  const line2 = product.rawName.length > maxLen ? product.rawName.slice(maxLen, maxLen * 2) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
  <defs>
    <linearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2E7D32" />
      <stop offset="100%" stop-color="#1B5E20" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Pouch Outer Boundary with 3D Gusset Shadow -->
  <rect x="25" y="18" width="270" height="284" rx="20" fill="url(#pouchGrad)" stroke="#E0E0E0" stroke-width="1.5" filter="url(#shadow)" />

  <!-- Pouch Top Heat-Seal Crimp Details -->
  <line x1="30" y1="26" x2="290" y2="26" stroke="${theme.accent}" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />
  <line x1="30" y1="32" x2="290" y2="32" stroke="${theme.accent}" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />

  <!-- Top Brand Banner: G1 MART -->
  <rect x="40" y="38" width="240" height="42" rx="10" fill="url(#headerGrad)" />
  <text x="160" y="60" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">G1 MART</text>
  <text x="160" y="73" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="8.5" fill="#E8F5E9" text-anchor="middle" letter-spacing="0.8">SUPERMARKET FRESH</text>

  <!-- Center Circular Emblem with Category Icon -->
  <circle cx="160" cy="120" r="32" fill="#FFFFFF" stroke="${theme.accent}" stroke-width="2" stroke-opacity="0.25" />
  <text x="160" y="130" font-size="30" text-anchor="middle">${theme.icon}</text>

  <!-- Product Name on Packet -->
  <text x="160" y="174" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="13.5" fill="#212121" text-anchor="middle">${line1}</text>
  ${line2 ? `<text x="160" y="192" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="12" fill="#424242" text-anchor="middle">${line2}</text>` : ''}

  <!-- Net Quantity Pill -->
  <rect x="100" y="208" width="120" height="26" rx="13" fill="${theme.accent}" />
  <text x="160" y="225" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="12" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">NET WT: ${product.unit}</text>

  <!-- Clean Bottom Seal & Verification Badge -->
  <line x1="45" y1="254" x2="275" y2="254" stroke="#BDBDBD" stroke-width="1" stroke-dasharray="2,2" />
  <text x="160" y="272" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="9" fill="#616161" text-anchor="middle">★ HYGIENICALLY STORE-PACKED ★</text>
  <text x="160" y="285" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="500" font-size="8" fill="#9E9E9E" text-anchor="middle">G1 Mart · Nellore Hub</text>
</svg>`;
}

// Write SVG packet files
for (const p of catalog) {
  const svg = generateSvgPacket(p);
  const filePath = path.join(genDir, `item-${p.itemNumber}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
}
console.log(`Generated all 472 branded SVG packet images in public/products/generated/`);

// Write TypeScript catalog
const tsContent = `/**
 * G1 MART — Full Product Catalog (472 Items)
 * Parsed directly from Item Sales Detail report.
 * Prices calculated: Total Sales ÷ Quantity Sold.
 * Generated with G1 Mart branded pack illustrations.
 */
import type { Product } from '@/types';

export const CATALOG_PRODUCTS: Product[] = ${JSON.stringify(catalog, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'catalog.ts'), tsContent, 'utf8');
console.log(`Saved src/data/catalog.ts with ${catalog.length} products.`);

// Generate SQL Seed for Supabase
const sqlRows = catalog.map(p => {
  const nameSafe = p.name.replace(/'/g, "''");
  const brandSafe = p.brand.replace(/'/g, "''");
  const descSafe = p.description.replace(/'/g, "''");
  return `('${p.id}', '${nameSafe}', '${brandSafe}', '${p.category}', '${p.unit}', ${p.price}, true, ${p.stockCount}, '${p.image}', '${descSafe}', 4.8, ${p.reviewsCount}, ${p.isPopular}, false, true)`;
});

const sqlContent = `-- G1 MART 472-Item Production Seed
-- Calculated from Item Sales Detail report

INSERT INTO public.products (
  id, name, brand, category_id, unit, price, in_stock, stock_count, image_url, description, rating, reviews_count, is_popular, is_best_deal, is_active
) VALUES
${sqlRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url;
`;

fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'seed_472_products.sql'), sqlContent, 'utf8');
console.log(`Saved supabase/seed_472_products.sql with ${catalog.length} SQL insert rows.`);
