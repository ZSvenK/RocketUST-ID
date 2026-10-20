import type { CheckRecord } from '../types';
import { cleanUstId, validateEuUstId } from '../utils/validation';

/**
 * Rohdaten aus der Kundenliste "UST-ID-Nr 2026 SK.pdf" (Zahn Pinsel GmbH)
 * Enthält vollständige Kundenübersicht inklusive Firmen ohne USt-IdNr.,
 * deutscher Firmen und Drittlandfirmen (Moldawien).
 */
export const RAW_KUNDEN_LISTE_2026 = [
  // Blatt 3 (Italien & Irland)
  { kdNr: 'B0714', firmenname: 'DITTA BERGAVI 3 BELLE ARTI SAS', ort: 'I-80139 NAPOLI', ustId: 'IT07983941217', umsatz: 0.00 },
  { kdNr: 'B0906', firmenname: 'PENNELLIFICIO BAGNOLI S.R.L.', ort: 'I-50029 Tavarnuzze (Impruneta) FI', ustId: 'IT03702400486', umsatz: 0.00 },
  { kdNr: 'B0911', firmenname: 'Pennelli Bulova s.r.l.', ort: 'IT-46019 Cicognara (MN)', ustId: 'IT00402170203', umsatz: 9746.71 },
  { kdNr: 'C0007', firmenname: 'Notority Srls', ort: 'IT- 00193 ROMA', ustId: 'IT14984471004', umsatz: 0.00 },
  { kdNr: 'C0063', firmenname: 'Capello Point SpA', ort: 'IT - 20121 Milano', ustId: 'IT10004780960', umsatz: 0.00 },
  { kdNr: 'C0065', firmenname: 'COR.PEL. SRL', ort: 'IT-80131 NAPOLI', ustId: 'IT06248120484', umsatz: 0.00 },
  { kdNr: 'C0160', firmenname: 'Camy Nails & Beauty', ort: 'IT - 37010 Affi', ustId: 'IT04989330230', umsatz: 1765.47 },
  { kdNr: 'D0080', firmenname: 'DOC TRADE srl', ort: 'I-50013 Campi Bisenzio (FI)', ustId: 'IT00545830481', umsatz: 889.68 },
  { kdNr: 'D0100', firmenname: '3S Dental s.r.l.', ort: 'IT - 74015 Martina Franca (TA)', ustId: 'IT03288690732', umsatz: 4161.89 },
  { kdNr: 'D0110', firmenname: 'Diananail srls', ort: 'IT-04100 Latina (LT)', ustId: 'IT03180890596', umsatz: 0.00 },
  { kdNr: 'D0180', firmenname: 'Divina Nails Srls', ort: 'IT-80018 Mugnano di Napoli (NA)', ustId: 'IT09479751217', umsatz: 0.00 },
  { kdNr: 'E0069', firmenname: 'Estetics & Unghie Discount', ort: 'IT-10123 Torino', ustId: 'IT10240750017', umsatz: 0.00 },
  { kdNr: 'E0160', firmenname: 'EGO DI GARGIULO EMMANUELA', ort: 'IT-80014 Giugliano in Campania (NA)', ustId: 'IT08889791219', umsatz: 0.00 },
  { kdNr: 'F0032', firmenname: 'FIORELLINI SERGIO & C.SNC', ort: 'IT 26041 RONCADELLO DI CASALMAGGIORE (CR)', ustId: 'IT01411570201', umsatz: 0.00 },
  { kdNr: 'F0122', firmenname: 'Flor Make Up SRL', ort: 'IT-90138 Palermo', ustId: 'IT06616400823', umsatz: 0.00 },
  { kdNr: 'F0902', firmenname: 'FERSTL KG', ort: 'I-39012 Meran (BZ)', ustId: 'IT01509230213', umsatz: 400.26 },
  { kdNr: 'G0018', firmenname: 'Gamax srl', ort: 'I - 00186 Roma', ustId: 'IT07608691007', umsatz: 1691.25 },
  { kdNr: 'G0904', firmenname: 'Gamma Pennelli S.p.a.', ort: 'IT-426041 Casalmaggiore (CR)', ustId: 'IT01962920201', umsatz: 19862.00 },
  { kdNr: 'H0906', firmenname: 'Hammeley S.r.l.', ort: 'IT- 30173 DESE (VE)', ustId: 'IT04059280273', umsatz: 24986.12 },
  { kdNr: 'H0907', firmenname: 'Hammeley S.r.l.', ort: 'IT- 30173 DESE (VE)', ustId: 'IT04059280273', umsatz: 0.00 },
  { kdNr: 'J0009', firmenname: 'Jet Nails International', ort: 'I-10137 Torino TO', ustId: 'IT11328060014', umsatz: 1601.05 },
  { kdNr: 'J0010', firmenname: 'Hotel Jagdhof', ort: 'IT-39052 Kaltern am See', ustId: 'IT01494720210', umsatz: 0.00 },
  { kdNr: 'J0030', firmenname: "Jamie's Nail Art Studio", ort: 'IT- 10137 Torino', ustId: 'IT07945530017', umsatz: 0.00 },
  { kdNr: 'J0098', firmenname: 'JOSIE NAIL ACADEMY', ort: 'I-10042 NICHELINO TO', ustId: 'IT11533740012', umsatz: 0.00 },
  { kdNr: 'K0015', firmenname: 'Carlo Kolloeffel Pennelli', ort: 'I-20146 Milano MI', ustId: 'IT05080030967', umsatz: 0.00 },
  { kdNr: 'K0035', firmenname: 'KB Style srl', ort: 'I-34074 Monfalcone (GO)', ustId: 'IT01172030312', umsatz: 0.00 },
  { kdNr: 'L0001', firmenname: 'ANDY MAID srl', ort: 'IT-80141 NAPOLI - CAP', ustId: 'IT0500160964', umsatz: 0.00 },
  { kdNr: 'L0020', firmenname: 'LADYBIRD HOUSE S.R.L.', ort: 'IT-41126 Modena', ustId: 'IT03025740360', umsatz: 0.00 },
  { kdNr: 'L0023', firmenname: 'Liliana Laboratori S.r.l.', ort: 'IT- 80142 Napoli (Italia)', ustId: 'IT06980361213', umsatz: 2047.85 },
  { kdNr: 'L0077', firmenname: 'Linea B & Beauty', ort: 'IT - 61036 Colli al Metauro (PU)', ustId: 'IT01397950419', umsatz: 0.00 },
  { kdNr: 'L0911', firmenname: 'Penn. Livorati', ort: 'I-46019 CICOGNARA (MN)', ustId: 'IT01660520204', umsatz: 0.00 },
  { kdNr: 'M0008', firmenname: 'Mam Cosmetics Srl', ort: 'IT-20135 Milano', ustId: 'IT05389680967', umsatz: 1449.32 },
  { kdNr: 'M0018', firmenname: 'Clever di Silvia Mancini & C snc', ort: "I-63821 Porto Sant'Elpidio", ustId: 'IT02330990447', umsatz: 0.00 },
  { kdNr: 'M0099', firmenname: 'MYNAILPRO Srl', ort: 'IT-20123 Milano', ustId: 'IT03958560132', umsatz: 22768.78 },
  { kdNr: 'M0170', firmenname: 'BMA SRL', ort: 'IT -10144 Torino', ustId: 'IT11477560012', umsatz: 977.16 },
  { kdNr: 'N0032', firmenname: 'Daniela Scaglione', ort: 'I - 90138 PALERMO (SICILIA)', ustId: 'IT05528150823', umsatz: 0.00 },
  { kdNr: 'N0052', firmenname: 'Niko Nail Care SRL', ort: 'IT-37029 San Pietro in Cariano (VR)', ustId: 'IT04847840230', umsatz: 0.00 },
  { kdNr: 'N0115', firmenname: 'NAIL & BEAUTY LOUNGE SRL (NBL)', ort: 'IT - 50142 Firenze', ustId: 'IT01330550524', umsatz: 0.00 },
  { kdNr: 'N0220', firmenname: 'NICSA SRLS', ort: 'IT-35010 San Pietro in Gu (PD)', ustId: 'IT05121420284', umsatz: 0.00 },
  { kdNr: 'N0480', firmenname: 'Nail2milaNail srl', ort: 'I - 00151 ROMA - ITALY', ustId: 'IT10782551005', umsatz: 0.00 },
  { kdNr: 'N0926', firmenname: 'Stafil AG', ort: 'I-39100 Bolzano', ustId: 'IT01227750211', umsatz: 222.91 },
  { kdNr: 'Q0013', firmenname: 'ROLLAND SRL', ort: 'IT - 40136 BOLOGNA', ustId: 'IT00820241206', umsatz: 0.00 },
  { kdNr: 'P0019', firmenname: 'Professione Estetica srl', ort: 'I - 16138 Genova (GE) - Italia', ustId: 'IT02938510993', umsatz: 135.76 },
  { kdNr: 'P0086', firmenname: 'FOR NAILS AND BEAUTY SRL', ort: 'IT- 37057 San Giovanni Lupatoto (VR)', ustId: 'IT04933410237', umsatz: 0.00 },
  { kdNr: 'P0900', firmenname: 'PASSIONE BEAUTY S.p.A. a Socio Unico', ort: 'IT - 36100 Vicenza (VI)', ustId: 'IT10710530964', umsatz: 0.00 },
  { kdNr: 'P0915', firmenname: 'PENNELLIFICIO PANDOLFO S.r.l.', ort: 'I- 90143 Palermo', ustId: 'IT06174020823', umsatz: 2767.44 },
  { kdNr: 'P0916', firmenname: 'Gennaro Paolo', ort: 'I-16012 Sarissola Busalla Genova', ustId: 'IT02809170992', umsatz: 0.00 },
  { kdNr: 'R0144', firmenname: 'REX', ort: 'IT-26040 Casalbellotto (CR), I', ustId: 'IT00130640196', umsatz: 12162.79 },
  { kdNr: 'T0170', firmenname: 'Sarner Natur GmbH', ort: 'IT-39058 Sarntal', ustId: 'IT02593760214', umsatz: 0.00 },
  { kdNr: 'T0904', firmenname: 'Pennelli Tigre srl', ort: 'IT-30037 Scorze', ustId: 'IT01567130271', umsatz: 85901.29 },
  { kdNr: 'T0933', firmenname: 'TINTORETTO srl', ort: 'IT-52100 Arezzo (AR)', ustId: 'IT01666540511', umsatz: 5952.44 },
  { kdNr: 'V0006', firmenname: 'VanderMeer s.r.l', ort: 'IT- 95030 PEDARA (SICILIA)', ustId: 'IT05454580878', umsatz: 0.00 },
  { kdNr: 'V0904', firmenname: 'VIP s.n.c. di Civiero', ort: 'I-30037 Scorze (VE)', ustId: 'IT01510430273', umsatz: 1125.36 },
  { kdNr: 'W0130', firmenname: 'Sarah Weidacher', ort: 'IT-39025 Naturns', ustId: 'IT03091970214', umsatz: 0.00 },
  { kdNr: 'X0030', firmenname: 'X beauty Italy', ort: 'IT - 37051 Bovolone / VR', ustId: 'IT05016540238', umsatz: 0.00 },
  { kdNr: 'K0055', firmenname: 'Mark-John Limited', ort: 'IE Dublin 22', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'P0073', firmenname: 'PAINTFORCE', ort: 'IE Dublin 13, D13 FT67 IRELAND', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!

  // Blatt 4 (Irland, Dänemark, Griechenland, Portugal, Spanien)
  { kdNr: 'S0090', firmenname: 'Stuff 4 Cakes', ort: 'Ballybrit, Galway H91YYOE, IRELAND', ustId: 'IE9843246O', umsatz: 0.00 },
  { kdNr: 'A0034', firmenname: 'The Army Painter A/S', ort: 'DK-8660 Skanderborg', ustId: 'DK30720121', umsatz: 63302.54 },
  { kdNr: 'A0084', firmenname: 'Anla Glas A/S', ort: 'DK-8600 Silkeborg', ustId: 'DK31575974', umsatz: 0.00 },
  { kdNr: 'B0290', firmenname: 'Brand Partners A/S', ort: 'DK-2500 Valby', ustId: 'DK41846879', umsatz: 0.00 },
  { kdNr: 'C0019', firmenname: 'Kalkmaling.dk', ort: 'DK 6240 Loegumkloster', ustId: 'DK42415146', umsatz: 157.91 },
  { kdNr: 'F0101', firmenname: 'Flügger AB', ort: 'DK- 2610 Rodovre - Dänemark', ustId: 'SE556479211601', umsatz: 46731.89 },
  { kdNr: 'I0001', firmenname: 'Insight Cosmetics A/S', ort: 'DK - 3490 Kvistgaard', ustId: 'DK12322496', umsatz: 0.00 },
  { kdNr: 'K0009', firmenname: 'Helen Kuusk', ort: 'DK-2300 Copenhagen S', ustId: '', umsatz: 700.64 }, // OHNE NUMMER!
  { kdNr: 'L0123', firmenname: 'LINOLIE DORE & VINDUER', ort: 'DK 7570 Venb', ustId: 'DK34474958', umsatz: 1286.86 },
  { kdNr: 'L0124', firmenname: 'LINOLIE & PIGMENT A/S', ort: 'DK 6100 Haderslev', ustId: 'DK41189932', umsatz: 579.64 },
  { kdNr: 'N0067', firmenname: 'NAILMANIA APS', ort: 'DK- 4200 Slagelse', ustId: 'DK34602387', umsatz: 0.00 },
  { kdNr: 'SCH0022', firmenname: 'SCHJERNING FARVER A/S', ort: 'DK-8400 EBELTOFT', ustId: 'DK10911087', umsatz: 0.00 },
  { kdNr: 'SCH0207', firmenname: "Schuller Eh'klar Nordic ApS", ort: 'DK-7100 Vejle DENMARK', ustId: 'DK32886299', umsatz: 2596.89 },
  { kdNr: 'T0080', firmenname: 'Terapi-Hobby Intercraft ApS', ort: 'DK - 8361 Hasselager', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'A0058', firmenname: 'Antoniadis Konstantinos Kai Sia G.P.', ort: 'GR-56533 Thessaloniki', ustId: 'EL803299443', umsatz: 874.74 },
  { kdNr: 'A0220', firmenname: 'ALEZORI P.C.', ort: 'GR-60100 Katerini', ustId: 'EL801633036', umsatz: 1851.67 },
  { kdNr: 'A0323', firmenname: 'Aesthetics - Beautification Service', ort: "GR - 54623 D' Thessaloniki", ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'C0054', firmenname: 'Call of Beauty', ort: 'GR-16344 Athen Ilioupoli', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'E0014', firmenname: 'Evgenia Kontogianni mon IKE', ort: 'GR - 13674 Athens', ustId: 'EL800535198', umsatz: 463.50 },
  { kdNr: 'F0071', firmenname: 'Christos Fragos', ort: 'GR- Kallithea 17671 Attiki GREECE', ustId: 'EL123146559', umsatz: 93.08 },
  { kdNr: 'F0081', firmenname: 'FASMA MODELS', ort: 'GR-10680 Athen', ustId: 'EL999368140', umsatz: 0.00 },
  { kdNr: 'G0006', firmenname: 'ART & COLOUR', ort: 'GR- 654 03 Kavala', ustId: 'EL076029869', umsatz: 0.00 },
  { kdNr: 'G0190', firmenname: 'GlitterakiNails', ort: 'GR-71500 Heraklion (Kreta)', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'H0110', firmenname: 'HOBBYLAND Greece P.C.', ort: 'GR-55535 Pylaia Thessaloniki', ustId: 'EL802165050', umsatz: 0.00 },
  { kdNr: 'K0008', firmenname: 'Karlas Art World', ort: 'GR-54453 Thessaloniki', ustId: 'EL109560047', umsatz: 0.00 },
  { kdNr: 'M0069', firmenname: 'MPF BRUSH IKE', ort: 'GR- Rhodes 85132', ustId: 'EL999675925', umsatz: 0.00 },
  { kdNr: 'M0120', firmenname: 'Kounatidis P. - Kardara A. G.P.', ort: 'GR-54635 Thessaloniki', ustId: 'EL801728351', umsatz: 2146.10 },
  { kdNr: 'M0121', firmenname: 'Infinity Nail Creations', ort: 'GR - 12132 Peristeri, Athens', ustId: 'EL997941935', umsatz: 6205.50 },
  { kdNr: 'N0201', firmenname: 'Nikos AmarantoS SA', ort: 'GR - Athens 10678', ustId: 'EL094155439', umsatz: 0.00 },
  { kdNr: 'N0212', firmenname: 'Nailit', ort: 'GR - 54623 Thessaloniki', ustId: 'EL139663698', umsatz: 0.00 },
  { kdNr: 'S0032', firmenname: 'Sofia Motskalidou', ort: 'GR-66131 Drama', ustId: 'EL131134561', umsatz: 0.00 },
  { kdNr: 'U0035', firmenname: 'Unique Cosmetics', ort: 'GR-11252 Athen', ustId: 'EL147735883', umsatz: 0.00 },
  { kdNr: 'A0360', firmenname: 'Anita Sabina Unipessoal Lda.', ort: 'PT-4425-077 Aguas Santas, Maia', ustId: 'PT516377191', umsatz: 0.00 },
  { kdNr: 'D0019', firmenname: 'Annija Denina - Studio, unipessoal', ort: 'PT- 1170-054 Lisboa PORTUGAL', ustId: 'PT515712094', umsatz: 162.27 },
  { kdNr: 'H0077', firmenname: 'HVStore, LDA', ort: 'PT-Y1990-156 Lisboa', ustId: 'PT514684801', umsatz: 0.00 },
  { kdNr: 'L0913', firmenname: 'Ana Lopes', ort: 'PT - 1700-073 Lisbon', ustId: 'PT224603183', umsatz: 0.00 },
  { kdNr: 'S0036', firmenname: 'SHEN ESSENCE UNIPESSOAL LDA', ort: 'PT Rua Amalia Rodrigues N21 3B Sintra', ustId: 'PT515064700', umsatz: 0.00 },
  { kdNr: 'U0010', firmenname: 'Urban Design Care', ort: 'PT-4520-614 Santa Maria da Feira', ustId: 'PT510923976', umsatz: 0.00 },
  { kdNr: 'U0200', firmenname: 'Unanimous Strategy, Lda', ort: 'PT- 4460-255 Senhora da Hora - Matosinho', ustId: 'PT515891398', umsatz: 0.00 },
  { kdNr: 'A0003', firmenname: 'ACRYLICOS VALLEJO, S.L.', ort: 'ES- 08800 Vilanova i la Geltru', ustId: 'ESB60562956', umsatz: 0.00 },
  { kdNr: 'B0096', firmenname: 'Belles Arts i Manualitats Angels', ort: 'E 08370 Calella Barcelona', ustId: 'ES38098006R', umsatz: 0.00 },
  { kdNr: 'C0018', firmenname: 'COSMETICA Y BELLEZA S.L.', ort: 'ES - 28021 MADRID', ustId: 'ESB88010207', umsatz: 2075.16 },
  { kdNr: 'C0048', firmenname: 'CIRET IBERIA S.L.U.', ort: 'ES 48100 MUNGIA, BIZKAIA', ustId: 'ESB95706438', umsatz: 5319.60 },
  { kdNr: 'C0099', firmenname: 'Coronado / Belles Artes Enmarcaciones', ort: 'ES-28003 Madrid', ustId: 'ESS0169416E', umsatz: 0.00 },
  { kdNr: 'D0260', firmenname: 'Dismoer Spain SL', ort: 'ES-09002 Burgos', ustId: 'ESB09586223', umsatz: 1095.20 },
  { kdNr: 'E0009', firmenname: 'ESCODA SABATES, S.L.', ort: 'E-08206 Sabadell', ustId: 'ESB58288697', umsatz: 10114.48 },

  // Blatt 5 (Spanien, Belgien, Luxemburg, Schweden)
  { kdNr: 'E0010', firmenname: 'ESCODA SABATES, S.L.', ort: 'E-08206 Sabadell', ustId: 'ESB58288697', umsatz: 26805.73 },
  { kdNr: 'F0067', firmenname: 'Distributiones Feran S.A.', ort: 'E-28703 San Sebastian de los Reyes (Madr)', ustId: 'ESA28579191', umsatz: 0.00 },
  { kdNr: 'F0153', firmenname: 'Fantasy Nails Europe S.L.', ort: 'ES-29590 Malaga', ustId: 'ESB93210094', umsatz: 2255.20 },
  { kdNr: 'G0210', firmenname: 'Manicura Artistica Siglo XXI, SL', ort: 'ES-06006 Badajoz', ustId: 'ESB06582951', umsatz: 0.00 },
  { kdNr: 'L0097', firmenname: "L'Artist Nail 2019 SL", ort: 'ES-04740 Roquetas de Mar', ustId: 'ESB04911772', umsatz: 0.00 },
  { kdNr: 'M0092', firmenname: 'Cristobal Martinez Garcia', ort: 'ES- 41003 Sevilla', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'M0300', firmenname: 'Manicura 24', ort: 'ES-17481 Sant Julia de Ramis', ustId: 'ESB55284996', umsatz: 15332.28 },
  { kdNr: 'N0100', firmenname: 'NF NAILS IN VOGUE S.L.', ort: 'ES-28500 Arganda del Rey (Madrid)', ustId: 'ESB84396407', umsatz: 1564.24 },
  { kdNr: 'P0154', firmenname: 'Artesania Chopo S.L.', ort: 'ES-28947 FUENLABRADA (MADRID)', ustId: 'ESB28741288', umsatz: 7022.88 },
  { kdNr: 'R0009', firmenname: 'Darius Jucys', ort: 'ES-04006 Almeria', ustId: 'ESX6230702W', umsatz: 933.64 },
  { kdNr: 'V0095', firmenname: 'Verona Nails', ort: 'ES-38108 Taco San Cristobal de la Laguna', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'A0007', firmenname: 'Ampa bv', ort: 'B-9032 Wondelgem', ustId: 'BE0412737671', umsatz: 0.00 },
  { kdNr: 'A0018', firmenname: 'SD INC BV', ort: 'BE-8200 Brugge', ustId: 'BE0785956653', umsatz: 2098.14 },
  { kdNr: 'C0932', firmenname: 'CEREPHARMA Laboratorie Pharmaceutique', ort: 'B-7822 Ghislenghien', ustId: 'BE0834075086', umsatz: 0.00 },
  { kdNr: 'E0052', firmenname: 'Da Vinci Nail art', ort: 'BE - 3500 Hasselt', ustId: 'BE0650995110', umsatz: 89.14 },
  { kdNr: 'G0002', firmenname: 'Groothandel', ort: 'BE-2800 Mechelen (Belgien)', ustId: 'BE0502426742', umsatz: 8779.71 },
  { kdNr: 'H0014', firmenname: 'RAYNAUD BVBA', ort: 'B- 2660 Hoboken/Antwerpen', ustId: 'BE0412109646', umsatz: 0.00 },
  { kdNr: 'J0042', firmenname: 'SINELCO INTERNATIONAL Bvba', ort: 'BE - 9600 Ronse', ustId: 'BE0400208340', umsatz: 21957.24 },
  { kdNr: 'L0008', firmenname: 'LAB76', ort: 'BE - 8730 Beernem', ustId: 'BE0775342180', umsatz: 4688.20 },
  { kdNr: 'M0011', firmenname: 'Manino S.P.R.L.', ort: 'B- 4840 Welkenraedt', ustId: 'BE0537822834', umsatz: 1662.08 },
  { kdNr: 'M0181', firmenname: 'MHP Tools SRL', ort: 'BE-5600 Jamioile', ustId: 'BE0792564234', umsatz: 609.70 },
  { kdNr: 'N0039', firmenname: 'Naima Aouni', ort: 'B-2140 Borgerhout', ustId: 'BE0671659573', umsatz: 0.00 },
  { kdNr: 'N0101', firmenname: 'NAILISA SPRL', ort: 'BE - 4100 Seraing', ustId: 'BE0820202801', umsatz: 485.84 },
  { kdNr: 'S0042', firmenname: 'SINELCO INTERNATIONAL Bvba', ort: 'BE - 9600 Ronse', ustId: 'BE0400208340', umsatz: 6948.78 },
  { kdNr: 'SCH0020', firmenname: 'SCHLEIPER S.A.', ort: 'BE-1040 BRUXELLES', ustId: 'BE0400442526', umsatz: 7650.84 },
  { kdNr: 'V0007', firmenname: 'Van de Woude BVBA', ort: 'BE-9310 Moorsel (Aalst)', ustId: 'BE0423536741', umsatz: 708.74 },
  { kdNr: 'W0011', firmenname: 'DE NIEUW nv', ort: 'BE-2000 Antwerpen', ustId: 'BE0422764206', umsatz: 3444.50 },
  { kdNr: 'W0012', firmenname: 'DE NIEUW nv', ort: 'B-2000 Antwerpen', ustId: 'BE0422764206', umsatz: 0.00 },
  { kdNr: 'W0201', firmenname: 'Webmaki BV', ort: 'B-2920 Kalmthout', ustId: 'BE0562881201', umsatz: 350.00 },
  { kdNr: 'R0200', firmenname: 'Raskopp Hair & Beauty', ort: 'LU-6914 Roodt-sur-Syre', ustId: 'LU28023765', umsatz: 0.00 },
  { kdNr: 'Z0101', firmenname: 'ZahnDesignStudio', ort: 'LU- 6717 Grevenmacher', ustId: 'LU34031265', umsatz: 3180.17 },
  { kdNr: 'A0009', firmenname: 'Infusion AB', ort: 'SE-17837 Ekero', ustId: 'SE556747106401', umsatz: 974.01 },
  { kdNr: 'A0095', firmenname: 'Lek Ute i Norden AB', ort: 'S-79021 Bjursas', ustId: 'SE559120074501', umsatz: 1137.80 },
  { kdNr: 'A0916', firmenname: 'artistica', ort: 'S- 863 41 SUNDSVALL', ustId: 'SE916575179401', umsatz: 0.00 },
  { kdNr: 'B0086', firmenname: 'Brine & Bark', ort: 'SE- 139 41 Värmdö SWEDEN', ustId: 'SE801222658801', umsatz: 0.00 },
  { kdNr: 'B0915', firmenname: 'Lekolar AB', ort: 'SE- 283 23 OSBY', ustId: 'SE556605064601', umsatz: 15063.03 },
  { kdNr: 'E0061', firmenname: 'ERNST P. AB', ort: 'SE-43133 Mölndal - SCHWEDEN', ustId: 'SE556653486201', umsatz: 185.56 },
  { kdNr: 'E0245', firmenname: 'Eskader AB', ort: 'S-18129 Lidingö', ustId: 'SE556906878501', umsatz: 0.00 },
  { kdNr: 'E0360', firmenname: 'embo AB', ort: 'S-36193 Broakulla - Schweden', ustId: 'SE556113945101', umsatz: 0.00 },
  { kdNr: 'F0050', firmenname: 'ABC Färgekonomi', ort: 'S- 11356 Stockholm', ustId: 'SE556259407601', umsatz: 0.00 },
  { kdNr: 'H0009', firmenname: 'Penselgrossisten AB', ort: 'SE- 41707 Göteborg', ustId: 'SE556229280401', umsatz: 6721.14 },
  { kdNr: 'H0099', firmenname: 'Hobby Center', ort: 'S-41459 Göteborg - Schweden', ustId: 'SE556148760301', umsatz: 0.00 },
  { kdNr: 'H0202', firmenname: 'Häxkraft AB', ort: 'S-11726 Stockholm', ustId: 'SE559477831701', umsatz: 543.74 },
  { kdNr: 'I0907', firmenname: 'I B Wahlström AB', ort: 'SE- 103 63 STOCKHOLM', ustId: 'SE556295868501', umsatz: 68901.05 },
  { kdNr: 'J0058', firmenname: 'Jeco AB', ort: 'SE-12630 Hagersten', ustId: 'SE556228251601', umsatz: 0.00 },
  { kdNr: 'K0913', firmenname: 'Korgboet AB', ort: 'S-341 76 RYSSBY', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!

  // Blatt 6 (Schweden, Finnland, Österreich)
  { kdNr: 'L0101', firmenname: 'Löfmark Design Studio AB', ort: 'S- 91342 Obbola', ustId: 'SE559493267401', umsatz: 0.00 },
  { kdNr: 'M0705', firmenname: 'Med Vänliga Hälsningar', ort: '97234 Lulea', ustId: 'SE556576477501', umsatz: 0.00 },
  { kdNr: 'M0904', firmenname: 'LeMona Porslin i Fliseryd', ort: 'SE-384 73 Fliseryd', ustId: 'SE916527843401', umsatz: 0.00 },
  { kdNr: 'N0180', firmenname: 'NUD BEAUTY AB', ort: 'SE-75311 Uppsala', ustId: 'SE556656333301', umsatz: 0.00 },
  { kdNr: 'P0016', firmenname: 'Pen Store Sthlm AB', ort: 'SE-118 21 Stockholm', ustId: 'SE556797007301', umsatz: 17273.18 },
  { kdNr: 'P0545', firmenname: 'Panduro Hobby AB', ort: 'SE-205 14 Malmö', ustId: 'SE556073635601', umsatz: 36039.60 },
  { kdNr: 'P0909', firmenname: 'Porslinsetaljen Christinelund', ort: 'SE-260 38 KATTARP', ustId: 'SE530824358201', umsatz: 0.00 },
  { kdNr: 'S0094', firmenname: 'Mode i Europa ab', ort: 'SE-435 33 Mölnlycke', ustId: 'SE556949663001', umsatz: 0.00 },
  { kdNr: 'S0915', firmenname: 'Slöjd - Detaljer AB', ort: 'SE-532 37 SKARA - SCHWEDEN', ustId: 'SE556094235001', umsatz: 32136.14 },
  { kdNr: 'S0917', firmenname: "Smink & Perukmakar'n Söder AB", ort: 'S-111 31 Stockholm', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'ST0010', firmenname: 'Stjernarps', ort: 'SE- 305 97 Eldsberga', ustId: 'SE556897587301', umsatz: 0.00 },
  { kdNr: 'W0002', firmenname: 'Wasp Shaving', ort: 'SE- 33231 Gislaved', ustId: 'SE559017049301', umsatz: 0.00 },
  { kdNr: 'F0150', firmenname: 'Farbe Oy', ort: 'FIN- 00180 Helsinki, Finland', ustId: 'FI07747166', umsatz: 1128.87 },
  { kdNr: 'H0012', firmenname: 'Hobby Point', ort: 'Fin-00100 Helsinki, Finnland', ustId: 'FI08661030', umsatz: 3724.00 },
  { kdNr: 'J0170', firmenname: 'Sini Jurva Design', ort: 'FIN-37630 Valkeakoski', ustId: 'FI27798825', umsatz: 0.00 },
  { kdNr: 'M0045', firmenname: 'Meikkimuija Oy', ort: 'FI 28400 Ulvila', ustId: 'FI32746958', umsatz: 0.00 },
  { kdNr: 'M0058', firmenname: 'Mosarte ky', ort: 'FI-38700 Kankaanpää', ustId: 'FI21098393', umsatz: 214.03 },
  { kdNr: 'M0201', firmenname: 'Makea Helsinki Oy', ort: 'FI - 00820 Helsinki', ustId: 'FI31756927', umsatz: 0.00 },
  { kdNr: 'A0001', firmenname: 'AT&S Austria Technologie & Systemtea', ort: 'A-8700 Leoben', ustId: 'ATU29743506', umsatz: 485.07 },
  { kdNr: 'A0125', firmenname: 'Aqqarylic GmbH', ort: 'A-6700 Bludenz', ustId: 'ATU77538167', umsatz: 0.00 },
  { kdNr: 'B0031', firmenname: 'Boehlerit GmbH & Co. KG', ort: 'A- 8605 Kapfenberg', ustId: 'ATU27154600', umsatz: 2670.30 },
  { kdNr: 'B0064', firmenname: 'Boesner GmbH & Co. KG', ort: 'AT- 1110 Wien', ustId: 'ATU47804602', umsatz: 33174.18 },
  { kdNr: 'B0070', firmenname: 'Boesner GmbH & Co KG', ort: 'AT- 1110 Wien', ustId: 'ATU47804602', umsatz: 8768.04 },
  { kdNr: 'B0283', firmenname: 'Boesner GmbH & Co KG', ort: 'AT-1110 Wien', ustId: 'ATU47804602', umsatz: 25496.95 },
  { kdNr: 'C0102', firmenname: 'Canal Instrumente GmbH & Co KG', ort: 'AT- 6830 Rankweil AUSTRIA', ustId: 'ATU71415729', umsatz: 0.00 },
  { kdNr: 'C0212', firmenname: 'CREATION', ort: 'A- 6812 Meiningen', ustId: 'ATU64642426', umsatz: 0.00 },
  { kdNr: 'D0091', firmenname: 'Draco Handels GmbH', ort: 'AT- 4070 Eferding', ustId: 'ATU61146735', umsatz: 18157.56 },
  { kdNr: 'F0058', firmenname: 'Fischer', ort: 'AT 2483 Ebreichsdorf', ustId: 'ATU14653301', umsatz: 0.00 },
  { kdNr: 'F0180', firmenname: 'Fantastique OG', ort: 'AT-5020 Salzburg', ustId: 'ATU73555645', umsatz: 0.00 },
  { kdNr: 'G0025', firmenname: 'Grüne Erde GmbH', ort: 'A-4644 Scharnstein', ustId: 'ATU41215902', umsatz: 0.00 },
  { kdNr: 'H0037', firmenname: 'Hoerbiger Wien GmbH', ort: 'A-1220 Wien', ustId: 'ATU14649905', umsatz: 0.00 },
  { kdNr: 'H0056', firmenname: 'hauck.barista.tools', ort: 'A- 4852 Weyregg am Attersee', ustId: 'ATU68885815', umsatz: 0.00 },
  { kdNr: 'K0004', firmenname: 'Sonja Mödl Keramikbedarf', ort: 'AT-1160 Wien', ustId: 'ATU68299600', umsatz: 0.00 },
  { kdNr: 'K0012', firmenname: 'KLEMA Dentalprodukte GesmbH', ort: 'AT- 6812 Meiningen', ustId: 'ATU36589704', umsatz: 7309.30 },
  { kdNr: 'K0030', firmenname: 'Klager Cosmetics GmbH', ort: 'AT - 1030 Wien', ustId: 'ATU65961328', umsatz: 0.00 },
  { kdNr: 'K0066', firmenname: 'Kellner & Kunz AG', ort: 'AT-4600 Wels', ustId: 'ATU16380002', umsatz: 2361.19 },
  { kdNr: 'K0097', firmenname: 'Krisztina Ujvári', ort: 'AT- 5020 Salzburg', ustId: 'ATU76519705', umsatz: 0.00 },
  { kdNr: 'K0099', firmenname: 'Karl Kastner & Co e.U.', ort: 'A- 3034 Maria Anzbach', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'K0135', firmenname: 'Kastner Erwin', ort: 'AT-3350 Stadt Haag', ustId: 'ATU57612578', umsatz: 441.30 },
  { kdNr: 'K0208', firmenname: 'Heinz Kronawetter', ort: 'AT- 9020 Klagenfurt', ustId: 'ATU52979308', umsatz: 3679.30 },
  { kdNr: 'K0300', firmenname: 'Kaiser Kreativ GmbH', ort: 'AT- 2700 Wiener Neustadt', ustId: 'ATU82548209', umsatz: 835.92 },
  { kdNr: 'K0449', firmenname: 'Florian Knotz GmbH & Co KG', ort: 'AT-1200 Wien', ustId: 'ATU16414306', umsatz: 1040.04 },
  { kdNr: 'L0098', firmenname: 'Les Mains Nailbar', ort: 'AT - 8010 Graz', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'L0200', firmenname: 'Limena GmbH & Co KG', ort: 'AT-1010 Wien', ustId: 'ATU73450419', umsatz: 0.00 },
  { kdNr: 'L0222', firmenname: 'LE JASMIN COSMETICS', ort: 'AT - 8524 Bad Gams', ustId: 'ATU67900104', umsatz: 0.00 },
  { kdNr: 'M0017', firmenname: 'Malervereinigung e. Gen.', ort: 'A- 8010 Graz', ustId: 'ATU28861203', umsatz: 543.86 },
  { kdNr: 'M0165', firmenname: 'MASTA', ort: 'AT - 6134 Vomp', ustId: 'ATU45656400', umsatz: 3416.73 },
  { kdNr: 'M0221', firmenname: 'Meier Bürsten e.U.', ort: 'AT- 1170 Wien', ustId: 'ATU81251039', umsatz: 462.02 },
  { kdNr: 'N0170', firmenname: 'No Planet B GmbH', ort: 'AT-8341 Paldau', ustId: 'ATU72347515', umsatz: 0.00 },
  { kdNr: 'P0255', firmenname: 'Postai Skin Care', ort: 'AT - 6832 Sulz', ustId: 'ATU76839147', umsatz: 293.03 },
  { kdNr: 'R0011', firmenname: 'RAMADRA GmbH', ort: 'AT-1010 Wien', ustId: 'ATU80847826', umsatz: 399.22 },
  { kdNr: 'R0040', firmenname: 'RINGANA GmbH', ort: 'AT-8295 St. Johann', ustId: 'ATU29154704', umsatz: 20877.32 },
  { kdNr: 'S0111', firmenname: 'SC Cosmetics Handels GmbH', ort: 'AT- 6320 Angerberg', ustId: 'ATU66238467', umsatz: 0.00 },
  { kdNr: 'S0124', firmenname: 'SYNTHESA GRUPPE', ort: 'AT 4320 Perg', ustId: 'ATU23545304', umsatz: 521.84 },

  // Blatt 7 (Österreich, Estland, Lettland, Litauen, Polen, Tschechien)
  { kdNr: 'S0300', firmenname: 'Abraham Karl Selig', ort: 'A-6800 Feldkirch', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'S0400', firmenname: 'Saint Charles Organic GmbH', ort: 'AT-1060 Wien', ustId: 'ATU66724388', umsatz: 0.00 },
  { kdNr: 'SCH0206', firmenname: "Schuller Eh'klar GmbH", ort: 'AT- 4490 St. Florian', ustId: 'ATU14258809', umsatz: 17360.73 },
  { kdNr: 'T0012', firmenname: 'Tino Colino Handels OG', ort: 'AT-3002 Purkersdorf', ustId: 'ATU80883509', umsatz: 2468.95 },
  { kdNr: 'V0038', firmenname: 'Vinoble Cosmetics GmbH', ort: 'A - 8441 Fresing', ustId: 'ATU62194958', umsatz: 876.03 },
  { kdNr: 'Z0010', firmenname: 'R. Zavodsky KG', ort: 'AT- 2521 Trumau', ustId: 'ATU57901523', umsatz: 245.40 },
  { kdNr: 'A0301', firmenname: 'ATRIOOLA', ort: 'EE 13619 Tallinn Estonia', ustId: 'EE100082850', umsatz: 0.00 },
  { kdNr: 'B0221', firmenname: 'BEYOU OÜ', ort: 'EE - 50109 Tartu', ustId: '', umsatz: 287.28 }, // OHNE NUMMER!
  { kdNr: 'I0055', firmenname: 'ImagoPluss OÜ', ort: 'EE- 13616 Tallin', ustId: 'EE101145097', umsatz: 0.00 },
  { kdNr: 'L0018', firmenname: 'Light Elegance OÜ', ort: 'EE - 10141 Tallinn', ustId: 'EE101029388', umsatz: 0.00 },
  { kdNr: 'M0033', firmenname: 'MERENEID Trading OÜ', ort: 'EE - 13917 Tallinn', ustId: 'EE100572933', umsatz: 1585.96 },
  { kdNr: 'N0130', firmenname: 'NANA OÜ', ort: 'EE - 10141 Tallin', ustId: 'EE101780520', umsatz: 0.00 },
  { kdNr: 'S0045', firmenname: 'Sally Stuudio', ort: 'EE-11317 Tallinn, Estonia', ustId: 'EE102911288', umsatz: 2793.38 },
  { kdNr: 'W0066', firmenname: 'LEAUTELIER OÜ', ort: 'EE-15551 Tallinn, Estonia', ustId: '', umsatz: 57.57 }, // OHNE NUMMER!
  { kdNr: 'D0039', firmenname: 'SIA EMI LATVIA', ort: 'LV-1082, Riga, Latvia', ustId: 'LV40103607799', umsatz: 438.36 },
  { kdNr: 'P0022', firmenname: 'PEDANTS SIA', ort: 'LV 1030 Riga', ustId: 'LV40003592675', umsatz: 0.00 },
  { kdNr: 'P0101', firmenname: 'Kinetics Nail System SIA', ort: 'LV-1067 Riga', ustId: 'LV40103297500', umsatz: 881.47 },
  { kdNr: 'A0917', firmenname: 'MB "Tapybos studija"', ort: 'LT-10103 Vilnius', ustId: 'LT100014626516', umsatz: 0.00 },
  { kdNr: 'J0090', firmenname: 'UAB Laboratoires Didier', ort: 'LT 03220 Vilnius LT', ustId: 'LT100009905414', umsatz: 1499.79 },
  { kdNr: 'K0043', firmenname: 'KOSMELITA Ltd', ort: 'LT - 51194 Kaunas', ustId: 'LT345197413', umsatz: 0.00 },
  { kdNr: 'M0003', firmenname: 'UAB Medexy Ltd.', ort: 'LT- 07108 Vilnius', ustId: 'LT100001984915', umsatz: 0.00 },
  { kdNr: 'N0034', firmenname: 'Logikrauta UAB', ort: 'LT-13260 Vilniaus r. sav.', ustId: 'LT100010736316', umsatz: 0.00 },
  { kdNr: 'N0370', firmenname: 'MB Nagu Estetikos Mokymo Centras', ort: 'LT- 76356 Siauliai', ustId: 'LT100010943311', umsatz: 0.00 },
  { kdNr: 'A0103', firmenname: '13 arts Aida Domisiewicz', ort: 'PL- 54-117 Wroclaw', ustId: 'PL6911128050', umsatz: 0.00 },
  { kdNr: 'B0199', firmenname: 'BANDI Cosmetics Sp. z o.o.', ort: 'PL - 05-152 Czosnów', ustId: 'PL5342331820', umsatz: 0.00 },
  { kdNr: 'C0047', firmenname: 'CHROME BARBARA JANASZEWSKA', ort: 'PL 92-315 Lodz Poland', ustId: 'PL7282269885', umsatz: 0.00 },
  { kdNr: 'E0018', firmenname: 'Elarto Elzbieta Trzeciak', ort: 'PL - 42-200 Czestochowa', ustId: 'PL5731712226', umsatz: 0.00 },
  { kdNr: 'C0903', firmenname: 'GDD spolka z ograniczona', ort: 'PL-00-552 Warszawa', ustId: 'PL5213587842', umsatz: 0.00 },
  { kdNr: 'J0102', firmenname: 'JACKS beauty GmbH', ort: '10245 Berlin', ustId: 'PL5263754064', umsatz: 98495.14 },
  { kdNr: 'K0180', firmenname: 'Kess Berlin GmbH', ort: '10179 Berlin', ustId: 'DE324017088', umsatz: 150.00 }, // DEUTSCHE USt-ID!
  { kdNr: 'L0190', firmenname: 'Looksus Lashes', ort: 'PL-53033 Wroclaw', ustId: 'PL6342496390', umsatz: 0.00 },
  { kdNr: 'M0280', firmenname: 'MR Group Polska Spolka z o.o.', ort: 'PL-80-377 Gdansk', ustId: 'PL5833223933', umsatz: 0.00 },
  { kdNr: 'R0052', firmenname: 'Rebel Sp. z.o.o.', ort: 'PL-80-298 Gdansk', ustId: 'PL9571068214', umsatz: 28857.15 },
  { kdNr: 'R0189', firmenname: 'Reforma Polska Spolka z.o.o.', ort: 'PL-02-663 Warszawa', ustId: '', umsatz: 0.00 }, // OHNE NUMMER!
  { kdNr: 'S0062', firmenname: 'Solé Professional Sp. Z o.o.', ort: 'PL/ 85-236/ Bydgoszcz', ustId: 'PL9671497618', umsatz: 1135.42 },
  { kdNr: 'S0230', firmenname: 'Swederm SP. Z O. O.', ort: 'PL-81-380 Gdynia', ustId: 'PL5862306308', umsatz: 0.00 },
  { kdNr: 'T0125', firmenname: 'TPP Innovative Chemistry Sp. z o.o.', ort: 'PL - 59-700 Boleslawiec', ustId: 'PL7282835936', umsatz: 0.00 },
  { kdNr: 'A0350', firmenname: 'Art Brush, spol. s.r.o.', ort: 'CZ-39155 Chynov', ustId: 'CZ26101866', umsatz: 2847.48 },
  { kdNr: 'A0990', firmenname: 'AGLIA s.r.o.', ort: 'CZ - 33401 Prestice', ustId: 'CZ29159741', umsatz: 1154.40 },
  { kdNr: 'C0011', firmenname: 'Ciret sr.o.', ort: 'CZ 39301 Pelhrimov', ustId: 'CZ48536709', umsatz: 0.00 },
  { kdNr: 'C0131', firmenname: 'Claudine', ort: 'CZ - 46001 Liberec', ustId: 'CZ9301272728', umsatz: 2205.11 },
  { kdNr: 'E0170', firmenname: 'ENII Private Lab, s.r.o.', ort: 'CZ-10100 Praha-Vrsovice', ustId: 'CZ24264075', umsatz: 0.00 },
  { kdNr: 'F0006', firmenname: 'Gray Owl s.r.o.', ort: 'CZ-15000 Prague', ustId: 'CZ02213141', umsatz: 1742.91 },

  // Blatt 8 (Tschechien, Slowakei, Ungarn, Rumänien, Bulgarien, Moldawien, Slowenien, Kroatien)
  { kdNr: 'L0150', firmenname: 'Lady Invest s.r.o.', ort: 'CZ-60200 Brno', ustId: 'CZ07367261', umsatz: 0.00 },
  { kdNr: 'M0014', firmenname: 'mako color s.r.o.', ort: 'CZ-33033 Mesto Touskov', ustId: 'CZ26352630', umsatz: 8331.92 },
  { kdNr: 'M0255', firmenname: 'E.Mi-International s.r.o.', ort: 'CZ-13000 Praha', ustId: 'CZ24214647', umsatz: 0.00 },
  { kdNr: 'M0310', firmenname: 'Medaprex s.r.o.', ort: 'CZ-11000 Praha', ustId: 'CZ07415320', umsatz: 0.00 },
  { kdNr: 'M0333', firmenname: 'DENATO s.r.o.', ort: 'CZ - 33401 Prestice', ustId: 'CZ04221117', umsatz: 0.00 },
  { kdNr: 'N0003', firmenname: 'Nielsen CZ s r.o.', ort: 'CZ-160 00 Praha 6', ustId: 'CZ63981432', umsatz: 1015.83 },
  { kdNr: 'N0111', firmenname: 'NLS professionals s.r.o.', ort: 'CZ - 46007 Liberec 9', ustId: 'CZ04634951', umsatz: 0.00 },
  { kdNr: 'N0120', firmenname: 'Nehtomania s.r.o.', ort: 'CZ-46312 Liberec', ustId: 'CZ03239721', umsatz: 0.00 },
  { kdNr: 'N0155', firmenname: 'NaniNails s.r.o', ort: 'CZ-73901 Baska', ustId: 'CZ29391920', umsatz: 21125.38 },
  { kdNr: 'R0037', firmenname: 'KLARA ROTT s.r.o.', ort: 'CZ-182 00 Praha', ustId: 'CZ05490367', umsatz: 2476.71 },
  { kdNr: 'B0030', firmenname: 'Belex Ges.m.b.H.', ort: 'SK-97401 Banská Bystrica', ustId: 'SK2020452368', umsatz: 0.00 },
  { kdNr: 'B0320', firmenname: 'Brands Alliance s.r.o.', ort: 'SK-831 06 Bratislava', ustId: 'SK2023040239', umsatz: 0.00 },
  { kdNr: 'G0005', firmenname: 'H2L Company s.r.o. Ltd/GmbH', ort: 'SK 040 11 Kosice Slovakia', ustId: 'SK2023995556', umsatz: 0.00 },
  { kdNr: 'P0180', firmenname: 'Nechtovyraj s.r.o', ort: 'SK-97703 Brezno', ustId: 'SK2023704276', umsatz: 0.00 },
  { kdNr: 'W0110', firmenname: 'WEXA, s.r.o.', ort: 'SK - 85104 Bratislava', ustId: 'SK2022393428', umsatz: 0.00 },
  { kdNr: 'A0109', firmenname: 'Antartyc Köröm Kft', ort: 'HU - 6800 Hodmezovasarhely', ustId: 'HU25747913', umsatz: 0.00 },
  { kdNr: 'B0009', firmenname: 'BÖSZECSET MINTABOLT KFT.', ort: 'HU-1133 BUDAPEST', ustId: 'HU26175919', umsatz: 26020.54 },
  { kdNr: 'C0081', firmenname: 'COLOR BK 2001 Kft.', ort: 'HU-2310 Szigetszentmiklós', ustId: 'HU12566923', umsatz: 2255.01 },
  { kdNr: 'H0078', firmenname: 'HO-KI Modellbolt Kft.', ort: 'H-1073 Budapest', ustId: 'HU32480470', umsatz: 639.95 },
  { kdNr: 'M0071', firmenname: 'Megahobby Kft', ort: 'H-1137 Budapest', ustId: 'HU13507370', umsatz: 1747.20 },
  { kdNr: 'B0172', firmenname: 'Brow Bar More SRL', ort: 'RO 011815 Bucharest', ustId: 'RO35217321', umsatz: 1391.33 },
  { kdNr: 'F0035', firmenname: 'SC. FASHION NAILS SRL', ort: 'RO - 500386 Brasov', ustId: 'RO35794613', umsatz: 0.00 },
  { kdNr: 'L0095', firmenname: 'LL Creative Productions S.R.L', ort: 'RO-707085 Lunca Catatuii', ustId: 'RO39667140', umsatz: 0.00 },
  { kdNr: 'L0130', firmenname: 'SC MIG NAILS & BEAUTY SRL', ort: 'RO- Jud. Brasov Romania', ustId: 'RO24707697', umsatz: 0.00 },
  { kdNr: 'M0052', firmenname: 'Mustash Romania', ort: 'RO - 547185 Cristesti Mures', ustId: 'RO27270200', umsatz: 0.00 },
  { kdNr: 'M0053', firmenname: 'MULTI MASIMEX SRL', ort: 'RO-420186 Bistrita', ustId: 'RO8334928', umsatz: 0.00 },
  { kdNr: 'N0069', firmenname: 'Noa Nails', ort: 'RO-031945 Bucharest', ustId: 'RO37616736', umsatz: 0.00 },
  { kdNr: 'P0098', firmenname: 'S.C. Omnia Plast S.R.L.', ort: 'RO-077060 Jud. Ilfov', ustId: 'RO24789140', umsatz: 2331.49 },
  { kdNr: 'T0084', firmenname: 'Truscada nail srl', ort: 'RO-307375 Timisoara', ustId: 'RO34033541', umsatz: 0.00 },
  { kdNr: 'T0198', firmenname: 'SC Tiger Nails SRL', ort: 'RO - 013954 Bucuresti, ROMANIA', ustId: 'RO22031881', umsatz: 3857.98 },
  { kdNr: 'B0003', firmenname: 'Blink Services New Ltd.', ort: 'BG-5800 Pleven', ustId: 'BG201033610', umsatz: 0.00 },
  { kdNr: 'B0019', firmenname: 'BRITANIKA Co. Ltd.', ort: 'BG- 8000 Bourgas', ustId: 'BG147003456', umsatz: 0.00 },
  { kdNr: 'B0156', firmenname: 'Beauty Profi Ltd', ort: 'BG - 8000 Burgas - Bulgarien', ustId: 'BG204794460', umsatz: 0.00 },
  { kdNr: 'G0027', firmenname: 'TSVETKO GEORGIEV & Sohn', ort: 'BG- 1000 Sofia - BULGARIEN', ustId: 'BG121745518', umsatz: 0.00 },
  { kdNr: 'I0071', firmenname: 'ITT Bulgaria EOOD', ort: 'BG-6000 Stara Zagora', ustId: 'BG123115379', umsatz: 4839.96 },
  { kdNr: 'B0173', firmenname: 'Brow Bar SRL', ort: 'MD 2000 Chisinau', ustId: '1015600006162', umsatz: 1369.01 }, // MOLDAWIEN (NICHT EU!)
  { kdNr: 'H0024', firmenname: 'HOBBY & Art Trgovina', ort: 'SI-4000 KRANJ, SLOVENIJA', ustId: 'SI58154175', umsatz: 6919.85 },
  { kdNr: 'M0402', firmenname: 'Miniaturen d.o.o.', ort: 'SI-4000 KRANJ, SLOVENJA', ustId: 'SI59216735', umsatz: 0.00 },
  { kdNr: 'H0228', firmenname: 'H nailschic, nail care business', ort: 'HR- 10000 Zagreb', ustId: '', umsatz: 41.15 }, // OHNE NUMMER!
  { kdNr: 'J0015', firmenname: 'Jana Nails', ort: 'HR - 10040 Zagreb', ustId: 'HR45729681661', umsatz: 0.00 },
  { kdNr: 'J0160', firmenname: 'Juliana Nails d.o.o.', ort: 'HR-10000 Zagreb', ustId: 'HR31389538793', umsatz: 11673.66 },
  { kdNr: 'M0290', firmenname: 'Metis d.o.o.', ort: 'HR-40000 Cakovec', ustId: 'HR52454026105', umsatz: 0.00 },
  { kdNr: 'R0190', firmenname: 'RITA, obrt za usluge', ort: 'HR-34330 Velika', ustId: 'HR30096254909', umsatz: 0.00 },
  { kdNr: 'S0072', firmenname: 'Studio Sandra D.o.o.', ort: 'HR-21216 Kastel Stari', ustId: 'HR68061602541', umsatz: 0.00 },
];

/**
 * Konvertiert die Kundenliste in das einheitliche CheckRecord-Format
 */
export function getKundenListe2026Records(): CheckRecord[] {
  return RAW_KUNDEN_LISTE_2026.map((item, index) => {
    const cleanedUstId = cleanUstId(item.ustId);
    const validation = validateEuUstId(cleanedUstId);

    // Initialer Status
    let initialStatus: CheckRecord['status'] = 'NOT_CHECKED';
    let resultSummary: string | undefined = undefined;

    if (!cleanedUstId) {
      initialStatus = 'MISSING_USTID';
      resultSummary = 'Keine USt-IdNr. gepflegt ❌';
    } else if (validation.isGerman) {
      initialStatus = 'INVALID';
      resultSummary = 'Deutsche USt-IdNr. ❌';
    } else if (!validation.valid && validation.notes.length > 0) {
      resultSummary = 'Format-Warnung ⚠️';
    }

    // Ort und PLZ zerlegen
    const ortStr = item.ort || '';
    const plzMatch = ortStr.match(/(\d{4,5})/);
    const plz = plzMatch ? plzMatch[1] : '';

    return {
      id: `kl-2026-${index + 1}-${Date.now().toString(36)}`,
      kdNr: item.kdNr,
      ustId: cleanedUstId,
      firmenname: item.firmenname,
      ort: item.ort,
      plz,
      umsatz: item.umsatz,
      status: initialStatus,
      resultSummary,
      detailedStatus: !cleanedUstId ? 'In der Kundenliste ist keine USt-IdNr. für diese Firma hinterlegt.' : undefined,
      retryCount: 0,
      validationNotes: validation.notes.length > 0 ? validation.notes : undefined,
    };
  });
}
