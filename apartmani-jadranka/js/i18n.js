// Apartmani Jadranka — 5-language (HR/EN/DE/PL/CS) text system.
// Add new UI text here as { hr: '...', en: '...', de: '...', pl: '...', cs: '...' }
// under a dot-namespaced key, then reference it in HTML with data-i18n="that.key"
// (or data-i18n-placeholder for input placeholders, data-i18n-aria-label for
// aria-labels). Everything else (toggle UI, persistence) is automatic. If a
// translation is missing for a language, the Croatian (hr) text is used as
// the fallback.

(function () {
  var STORAGE_KEY = 'jadranka-lang';
  var SUPPORTED_LANGS = ['hr', 'en', 'de', 'pl', 'cs'];
  var LANG_LABELS = { hr: 'Hrvatski', en: 'English', de: 'Deutsch', pl: 'Polski', cs: 'Čeština' };

  var DICT = {
    // --- Navigation ---
    // "Stan" / "Istok" are internal identifiers only (filenames, form values,
    // JSON keys) — guests always see one of the two guest-facing names below.
    // Short form: nav, breadcrumbs, small eyebrow labels. Full form
    // (*.display_name): page H1s, homepage unit cards, <title> tags, the
    // apartment picker, and the inquiry email subject.
    'nav.home': { hr: 'Početna', en: 'Home', de: 'Startseite', pl: 'Strona główna', cs: 'Domů' },
    'nav.stan': { hr: 'Apartman s pogledom na jugozapad', en: 'South West View Apartment', de: 'Apartment mit Blick nach Südwesten', pl: 'Apartament z widokiem na południowy zachód', cs: 'Apartmán s výhledem na jihozápad' },
    'nav.istok': { hr: 'Apartman s pogledom na jugoistok', en: 'South East View Apartment', de: 'Apartment mit Blick nach Südosten', pl: 'Apartament z widokiem na południowy wschód', cs: 'Apartmán s výhledem na jihovýchod' },
    'nav.mimice': { hr: 'Mimice', en: 'Mimice', de: 'Mimice', pl: 'Mimice', cs: 'Mimice' },
    'nav.contact': { hr: 'Kontakt', en: 'Contact', de: 'Kontakt', pl: 'Kontakt', cs: 'Kontakt' },

    'stan.display_name': { hr: 'Apartman s panoramskim pogledom na more i prostranom terasom', en: 'Panoramic Sea View Apartment with Spacious Terrace', de: 'Apartment mit Panorama-Meerblick und großer Terrasse', pl: 'Apartament z panoramicznym widokiem na morze i przestronnym tarasem', cs: 'Apartmán s panoramatickým výhledem na moře a prostornou terasou' },
    'stan.title_tag': { hr: 'Apartman s panoramskim pogledom na more i prostranom terasom | Apartmani Jadranka', en: 'Panoramic Sea View Apartment with Spacious Terrace | Apartmani Jadranka', de: 'Apartment mit Panorama-Meerblick und großer Terrasse | Apartmani Jadranka', pl: 'Apartament z panoramicznym widokiem na morze i przestronnym tarasem | Apartmani Jadranka', cs: 'Apartmán s panoramatickým výhledem na moře a prostornou terasou | Apartmani Jadranka' },
    'istok.display_name': { hr: 'Apartman s dvije spavaće sobe i prekrasnim pogledom na more', en: 'Two-Bedroom Apartment with Stunning Sea View', de: 'Apartment mit zwei Schlafzimmern und herrlichem Meerblick', pl: 'Apartament z dwiema sypialniami i przepięknym widokiem na morze', cs: 'Apartmán se dvěma ložnicemi a nádherným výhledem na moře' },
    'istok.title_tag': { hr: 'Apartman s dvije spavaće sobe i prekrasnim pogledom na more | Apartmani Jadranka', en: 'Two-Bedroom Apartment with Stunning Sea View | Apartmani Jadranka', de: 'Apartment mit zwei Schlafzimmern und herrlichem Meerblick | Apartmani Jadranka', pl: 'Apartament z dwiema sypialniami i przepięknym widokiem na morze | Apartmani Jadranka', cs: 'Apartmán se dvěma ložnicemi a nádherným výhledem na moře | Apartmani Jadranka' },

    // --- Homepage: Hero ---
    'home.hero.eyebrow': { hr: 'Mimice · Dalmatinska obala', en: 'Mimice · Dalmatian Coast', de: 'Mimice · Dalmatinische Küste', pl: 'Mimice · Wybrzeże Dalmacji', cs: 'Mimice · Dalmatské pobřeží' },
    'home.hero.headline': { hr: 'Mirna jutra, beskrajan pogled na more', en: 'Slow Mornings, Endless Sea Views', de: 'Ruhige Morgen, endloser Meerblick', pl: 'Spokojne poranki, niekończący się widok na morze', cs: 'Klidná rána, nekonečný výhled na moře' },
    'home.hero.subtitle': { hr: 'Obiteljski apartmani na Jadranu, nekoliko koraka od mora.', en: 'Family-run apartments on the Adriatic, steps from the sea.', de: 'Familiengeführte Apartments an der Adria, nur wenige Schritte vom Meer entfernt.', pl: 'Rodzinne apartamenty nad Adriatykiem, tuż przy morzu.', cs: 'Rodinné apartmány na Jadranu, jen pár kroků od moře.' },

    // --- Homepage: Units overview ---
    'home.units.eyebrow': { hr: 'Naši apartmani', en: 'Our Apartments', de: 'Unsere Apartments', pl: 'Nasze apartamenty', cs: 'Naše apartmány' },
    'home.units.title': { hr: 'Dva doma uz more', en: 'Two Homes by the Sea', de: 'Zwei Zuhause am Meer', pl: 'Dwa domy nad morzem', cs: 'Dva domovy u moře' },
    'home.units.subtitle': { hr: 'Samostalni apartmani, svaki sa svojim karakterom — oba na kratkoj šetnji od mora.', en: 'Independent, self-contained apartments — each with its own character, both a short walk from the water.', de: 'Unabhängige, komplett eigenständige Apartments – jedes mit eigenem Charakter, beide nur einen kurzen Spaziergang vom Meer entfernt.', pl: 'Niezależne apartamenty z osobnym wejściem — każdy z własnym charakterem, oba w krótkim spacerze od morza.', cs: 'Samostatné apartmány, každý se svým charakterem — oba jen kousek chůze od moře.' },
    'home.units.stan_desc': { hr: 'Prostran, sa panoramskim pogledom na more i velikom terasom — idealan za obitelji i manje grupe.', en: 'Spacious, with panoramic sea views and a large terrace — ideal for families and small groups.', de: 'Geräumig, mit Panorama-Meerblick und großer Terrasse — ideal für Familien und kleine Gruppen.', pl: 'Przestronny, z panoramicznym widokiem na morze i dużym tarasem — idealny dla rodzin i małych grup.', cs: 'Prostorný, s panoramatickým výhledem na moře a velkou terasou — ideální pro rodiny a menší skupiny.' },
    'home.units.stan_meta1': { hr: '4 gosta', en: 'Sleeps 4', de: '4 Gäste', pl: '4 osoby', cs: '4 hosté' },
    'home.units.stan_meta2': { hr: 'Terasa 50 m²', en: '50 m² Terrace', de: '50 m² Terrasse', pl: 'Taras 50 m²', cs: 'Terasa 50 m²' },
    'home.units.rooms': { hr: '2 spavaće sobe · 2 kupaonice', en: '2 bedrooms · 2 bathrooms', de: '2 Schlafzimmer · 2 Badezimmer', pl: '2 sypialnie · 2 łazienki', cs: '2 ložnice · 2 koupelny' },
    'home.units.stan_link': { hr: 'Pogledajte detalje →', en: 'View Details →', de: 'Details ansehen →', pl: 'Zobacz szczegóły →', cs: 'Zobrazit podrobnosti →' },
    'home.units.cta': { hr: 'Pošalji upit', en: 'Send Inquiry', de: 'Anfrage senden', pl: 'Wyślij zapytanie', cs: 'Odeslat poptávku' },
    'home.units.istok_desc': { hr: 'Prostran i moderan apartman od 80 m² u srcu Mimica, na koracima od plaže.', en: 'A spacious, modern 80 m² apartment in the heart of Mimice, steps from the beach.', de: 'Ein geräumiges, modernes 80-m²-Apartment im Herzen von Mimice, nur wenige Schritte vom Strand entfernt.', pl: 'Przestronny, nowoczesny apartament o powierzchni 80 m² w sercu Mimic, tuż przy plaży.', cs: 'Prostorný, moderní apartmán o rozloze 80 m² v srdci Mimic, jen pár kroků od pláže.' },
    'home.units.istok_meta1': { hr: '4 gosta', en: 'Sleeps 4', de: '4 Gäste', pl: '4 osoby', cs: '4 hosté' },
    'home.units.istok_meta2': { hr: 'Balkon', en: 'Balcony', de: 'Balkon', pl: 'Balkon', cs: 'Balkon' },
    'home.units.istok_link': { hr: 'Pogledajte detalje →', en: 'View Details →', de: 'Details ansehen →', pl: 'Zobacz szczegóły →', cs: 'Zobrazit podrobnosti →' },

    // --- Homepage: Guest reviews (real Airbnb reviews, translated) ---
    'reviews.eyebrow': { hr: 'Recenzije gostiju', en: 'Guest Reviews', de: 'Gästebewertungen', pl: 'Opinie gości', cs: 'Recenze hostů' },
    'reviews.title': { hr: 'Što kažu naši gosti', en: 'What Our Guests Say', de: 'Was unsere Gäste sagen', pl: 'Co mówią nasi goście', cs: 'Co říkají naši hosté' },
    'reviews.subtitle': { hr: 'Preko 100 recenzija na Airbnbu — nekoliko naših omiljenih.', en: 'Over 100 reviews on Airbnb — a few of our favorites.', de: 'Über 100 Bewertungen auf Airbnb — einige unserer Favoriten.', pl: 'Ponad 100 opinii na Airbnb — kilka naszych ulubionych.', cs: 'Přes 100 recenzí na Airbnb — několik našich oblíbených.' },
    'reviews.read_more': { hr: 'Pročitaj više', en: 'Read more', de: 'Mehr lesen', pl: 'Czytaj więcej', cs: 'Číst více' },
    'reviews.1.quote': { hr: 'Izvanredan pogled!!! Prekrasan stan smješten pored prekrasne male plaže.', en: 'Outstanding view!!! A beautiful apartment right next to a gorgeous little beach.', de: 'Herausragender Blick!!! Eine wunderschöne Wohnung direkt neben einem traumhaften kleinen Strand.', pl: 'Niesamowity widok!!! Piękny apartament tuż obok przepięknej, małej plaży.', cs: 'Úžasný výhled!!! Krásný apartmán hned vedle nádherné malé pláže.' },
    'reviews.2.quote': { hr: 'Imali smo fantastičan boravak u stanu i u Mimicama. Pogled s balkona je zaista nevjerojatan; ovdje vam nikada neće dosaditi! Stan je također lijepo uređen, opremljen svim udobnostima i čist. Jadranka je vrlo draga domaćica i dala je sjajne savjete. Također nam se jako svidjelo selo Mimice. Na pješačkoj udaljenosti nalazi se mala luka s nekoliko restorana. Smatrali smo da je plaža Kutleša fantastično lijepa i preporučili bismo odlazak na nju s malom djecom! Bili smo vrlo sretni što smo daleko od vreve Makarske. Plaže su tamo prekrasne, ali tako strašno prepune (čak i u lipnju); često je nemoguće parkirati automobil ili plaćate puno za parkiranje. Skrenuli smo nekoliko puta desno i vratili se na prekrasnu plažu koja je bila na pješačkoj udaljenosti od apartmana! Toplo preporučujemo!', en: "We had a fantastic stay in the apartment and in Mimice. The view from the balcony is truly incredible — you'll never get bored here! The apartment is also beautifully decorated, well equipped, and clean. Jadranka is a lovely host and gave us great tips. We also really loved the village of Mimice. There's a small harbor with a few restaurants within walking distance. We found Kutleša beach fantastically beautiful and would recommend it for families with young children! We were very happy to be away from the hustle of Makarska — the beaches there are gorgeous but incredibly crowded (even in June); it's often impossible to park, or parking is very expensive. We turned off a few times and found our way back to a beautiful beach within walking distance of the apartment! Highly recommend!", de: 'Wir hatten einen fantastischen Aufenthalt in der Wohnung und in Mimice. Der Blick vom Balkon ist wirklich unglaublich — hier wird es einem nie langweilig! Die Wohnung ist zudem wunderschön eingerichtet, gut ausgestattet und sauber. Jadranka ist eine reizende Gastgeberin und gab uns großartige Tipps. Auch das Dorf Mimice hat uns sehr gefallen. In Gehweite gibt es einen kleinen Hafen mit ein paar Restaurants. Den Strand Kutleša fanden wir fantastisch schön und würden ihn Familien mit kleinen Kindern empfehlen! Wir waren sehr froh, dem Trubel von Makarska fernzubleiben — die Strände dort sind zwar wunderschön, aber unglaublich überfüllt (selbst im Juni); oft ist es unmöglich zu parken, oder das Parken ist sehr teuer. Wir sind ein paar Mal abgebogen und haben so einen wunderschönen Strand in Gehweite der Wohnung gefunden! Sehr zu empfehlen!', pl: 'Mieliśmy fantastyczny pobyt w apartamencie i w Mimicach. Widok z balkonu jest naprawdę niesamowity — nigdy się tu nie nudzi! Apartament jest też pięknie urządzony, dobrze wyposażony i czysty. Jadranka jest wspaniałą gospodynią i dała nam świetne wskazówki. Bardzo spodobała nam się też wioska Mimice. W odległości spaceru znajduje się mała przystań z kilkoma restauracjami. Plażę Kutleša uznaliśmy za fantastycznie piękną i polecilibyśmy ją rodzinom z małymi dziećmi! Byliśmy bardzo zadowoleni, że jesteśmy z dala od zgiełku Makarskiej — tamtejsze plaże są przepiękne, ale niesamowicie zatłoczone (nawet w czerwcu); często nie można znaleźć miejsca do parkowania albo parking jest bardzo drogi. Kilka razy skręciliśmy i trafiliśmy z powrotem na piękną plażę w odległości spaceru od apartamentu! Gorąco polecamy!', cs: 'Měli jsme fantastický pobyt v apartmánu i v Mimicích. Výhled z balkonu je opravdu neuvěřitelný — tady se nikdy nebudete nudit! Apartmán je navíc krásně zařízený, dobře vybavený a čistý. Jadranka je skvělá hostitelka a dala nám skvělé tipy. Moc se nám líbila i vesnice Mimice. V docházkové vzdálenosti je malý přístav s několika restauracemi. Pláž Kutleša nám přišla fantasticky krásná a doporučili bychom ji rodinám s malými dětmi! Byli jsme velmi rádi, že jsme stranou od rušné Makarské — tamní pláže jsou nádherné, ale neuvěřitelně přeplněné (i v červnu); často není možné zaparkovat, nebo je parkování velmi drahé. Několikrát jsme odbočili a našli cestu zpět na krásnou pláž v docházkové vzdálenosti od apartmánu! Vřele doporučujeme!' },
    'reviews.3.quote': { hr: 'Vrlo lijep i moderan stan na pješačkoj udaljenosti od dvije različite lijepe plaže. Predivan pogled! Jadranka je bila profesionalna, prijateljski nastrojena i vrlo dobra domaćica.', en: 'Very nice and modern apartment within walking distance of two different beautiful beaches. Amazing view! Jadranka was professional, friendly, and a great host.', de: 'Sehr schöne und moderne Wohnung in Gehweite zu zwei verschiedenen wunderschönen Stränden. Toller Blick! Jadranka war professionell, freundlich und eine großartige Gastgeberin.', pl: 'Bardzo ładny i nowoczesny apartament w odległości spaceru od dwóch różnych, pięknych plaż. Niesamowity widok! Jadranka była profesjonalna, przyjazna i wspaniała jako gospodyni.', cs: 'Velmi hezký a moderní apartmán v docházkové vzdálenosti od dvou různých krásných pláží. Úžasný výhled! Jadranka byla profesionální, přátelská a skvělá hostitelka.' },
    'reviews.4.quote': { hr: 'Domaćin je bio iznimno susretljiv i uslužan. Jadranka je vrlo brzo odgovarala na pitanja. Pogled s terase bio je vrlo lijep i opuštajući. Apartman je bio vrlo lijepo i moderno uređen. U potpunosti preporučujemo!', en: 'The host was extremely welcoming and helpful. Jadranka responded to questions very quickly. The view from the terrace was beautiful and relaxing. The apartment was very nicely and modernly furnished. We fully recommend it!', de: 'Die Gastgeberin war äußerst freundlich und hilfsbereit. Jadranka beantwortete Fragen sehr schnell. Der Blick von der Terrasse war wunderschön und entspannend. Die Wohnung war sehr schön und modern eingerichtet. Wir empfehlen sie uneingeschränkt!', pl: 'Gospodyni była niezwykle gościnna i pomocna. Jadranka bardzo szybko odpowiadała na pytania. Widok z tarasu był piękny i relaksujący. Apartament był bardzo ładnie i nowocześnie urządzony. Gorąco polecamy!', cs: 'Hostitelka byla nesmírně vstřícná a ochotná. Jadranka odpovídala na dotazy velmi rychle. Výhled z terasy byl krásný a uklidňující. Apartmán byl velmi pěkně a moderně zařízený. Vřele doporučujeme!' },
    'reviews.5.quote': { hr: 'Gostoljubiv, čist dom, besprijekorno čist s prekrasnim pogledom. Jadranka je bila od velike pomoći. Željeli bismo tamo ostati duže.', en: 'Hospitable, clean home, spotless with a beautiful view. Jadranka was very helpful. We wished we could have stayed longer.', de: 'Gastfreundliches, sauberes Zuhause, makellos mit wunderschönem Blick. Jadranka war sehr hilfsbereit. Wir hätten gerne länger bleiben wollen.', pl: 'Gościnny, czysty dom, nieskazitelny, z pięknym widokiem. Jadranka była bardzo pomocna. Chcielibyśmy zostać dłużej.', cs: 'Pohostinný, čistý domov, bezvadný, s krásným výhledem. Jadranka byla velmi ochotná. Přáli jsme si zůstat déle.' },
    'reviews.6.quote': { hr: 'Smještaj nam je savršeno odgovarao. Moj sin i njegova djevojka imali su zasebnu sobu s kupaonicom, što nam je jamčilo dovoljno privatnosti. Velika terasa je bila sjajna. Tamo smo provodili vrijeme uživajući u prekrasnom pogledu na more i okolno zelenilo. Kuhinja je bila iznenađujuće dobro opremljena, uključujući kvalitetne dodatke. Sobe su bile dovoljno velike, ukusno uređene i udobne te smo se vrlo brzo osjećali kao kod kuće. Prilično dobro opskrbljena trgovina bila je udaljena nekoliko stotina metara, što je bila prednost. Iako su na plaže u luci još uvijek bile u fazi izgradnje, obližnje plaže s prekrasnim krajolikom, ugodnim ulaskom u vodu i čistim morem bile su više nego odlična zamjena. Ako sljedeći put odlučimo provesti odmor u Mimicama, sigurno ćemo odabrati smještaj kod Jadranke, koja je bila vrlo ljubazna i pažljiva. Bili smo više nego zadovoljni.', en: "The accommodation suited us perfectly. My son and his girlfriend had a separate room with a bathroom, which gave us plenty of privacy. The large terrace was fantastic — we spent our time there enjoying the beautiful sea view and the greenery around. The kitchen was surprisingly well equipped, including quality extras. The rooms were spacious enough, tastefully decorated and comfortable, and we felt at home very quickly. A well-stocked shop was just a few hundred meters away, which was a real plus. Although the beaches by the harbor were still under construction, the nearby beaches — with beautiful scenery, easy water access, and clean sea — were more than a great substitute. If we decide to spend our next holiday in Mimice, we'll definitely book with Jadranka again, who was very kind and attentive. We were more than satisfied.", de: 'Die Unterkunft passte perfekt zu uns. Mein Sohn und seine Freundin hatten ein eigenes Zimmer mit Bad, was uns viel Privatsphäre gab. Die große Terrasse war fantastisch — dort verbrachten wir unsere Zeit und genossen den wunderschönen Meerblick und das Grün ringsum. Die Küche war überraschend gut ausgestattet, inklusive hochwertiger Extras. Die Zimmer waren ausreichend groß, geschmackvoll eingerichtet und komfortabel, und wir fühlten uns sehr schnell wie zu Hause. Ein gut sortierter Laden war nur wenige hundert Meter entfernt, was ein echter Vorteil war. Auch wenn die Strände am Hafen noch im Bau waren, waren die nahegelegenen Strände — mit wunderschöner Landschaft, leichtem Zugang zum Wasser und klarem Meer — mehr als ein guter Ersatz. Sollten wir uns entscheiden, unseren nächsten Urlaub in Mimice zu verbringen, werden wir definitiv wieder bei Jadranka buchen, die sehr freundlich und aufmerksam war. Wir waren mehr als zufrieden.', pl: 'Zakwaterowanie idealnie nam odpowiadało. Mój syn z dziewczyną mieli osobny pokój z łazienką, co dało nam sporo prywatności. Duży taras był fantastyczny — spędzaliśmy tam czas, ciesząc się pięknym widokiem na morze i otaczającą zielenią. Kuchnia była zaskakująco dobrze wyposażona, łącznie z dodatkami wysokiej jakości. Pokoje były wystarczająco przestronne, gustownie urządzone i wygodne, dzięki czemu bardzo szybko poczuliśmy się jak w domu. Dobrze zaopatrzony sklep znajdował się zaledwie kilkaset metrów dalej, co było prawdziwym plusem. Choć plaże przy przystani były jeszcze w budowie, pobliskie plaże — z piękną scenerią, łatwym dostępem do wody i czystym morzem — były więcej niż dobrym zamiennikiem. Jeśli zdecydujemy się spędzić kolejne wakacje w Mimicach, na pewno ponownie zarezerwujemy nocleg u Jadranki, która była bardzo miła i troskliwa. Byliśmy więcej niż zadowoleni.', cs: 'Ubytování nám perfektně vyhovovalo. Můj syn s přítelkyní měli samostatný pokoj s koupelnou, což nám dopřálo dostatek soukromí. Velká terasa byla fantastická — trávili jsme tam čas a užívali si krásný výhled na moře a okolní zeleň. Kuchyň byla překvapivě dobře vybavená, včetně kvalitních doplňků. Pokoje byly dostatečně prostorné, vkusně zařízené a pohodlné, takže jsme se velmi rychle cítili jako doma. Dobře zásobený obchod byl jen pár set metrů daleko, což byl skutečný plus. Ačkoliv pláže u přístavu byly ještě ve výstavbě, okolní pláže — s krásnou scenérií, snadným přístupem do vody a čistým mořem — byly více než skvělou náhradou. Pokud se rozhodneme strávit příští dovolenou v Mimicích, určitě si znovu zarezervujeme pobyt u Jadranky, která byla velmi milá a pozorná. Byli jsme více než spokojeni.' },
    'reviews.7.quote': { hr: 'Jadrankin prekrasni apartman smješten je na vrhu sela i ima prostrani balkon s besprijekornim pogledom. Soba je čista i udobna. Jadranka je simpatična i susretljiva, došla nas je dočekati jednog vrućeg dana i dala nam mnogo preporuka za lokalne aktivnosti. Od stana je 5 minuta pješice do plaže, voda je sredinom svibnja bistra i svježa, blaženstvo je uživati u nježnim valovima i plivati s malim ribicama. Uživam u svakom trenutku svog boravka ovdje.', en: "Jadranka's beautiful apartment is located at the top of the village and has a spacious balcony with a flawless view. The room is clean and comfortable. Jadranka is kind and welcoming — she came to greet us on a hot day and gave us lots of recommendations for local activities. It's a 5-minute walk from the apartment to the beach; the water in mid-May is clear and fresh, and it's blissful to enjoy the gentle waves and swim alongside little fish. I'm enjoying every moment of my stay here.", de: 'Jadrankas wunderschöne Wohnung liegt am oberen Ende des Dorfes und verfügt über einen geräumigen Balkon mit makellosem Blick. Das Zimmer ist sauber und komfortabel. Jadranka ist freundlich und herzlich — sie kam an einem heißen Tag, um uns zu begrüßen, und gab uns viele Empfehlungen für Aktivitäten vor Ort. Vom Apartment sind es 5 Minuten zu Fuß zum Strand; das Wasser ist Mitte Mai klar und frisch, und es ist herrlich, die sanften Wellen zu genießen und zwischen kleinen Fischen zu schwimmen. Ich genieße jeden Moment meines Aufenthalts hier.', pl: 'Piękny apartament Jadranki znajduje się na górze wioski i ma przestronny balkon z bezbłędnym widokiem. Pokój jest czysty i wygodny. Jadranka jest miła i gościnna — przyszła nas przywitać w upalny dzień i dała nam wiele wskazówek dotyczących lokalnych atrakcji. Z apartamentu do plaży jest 5 minut spacerem; woda w połowie maja jest czysta i orzeźwiająca, a rozkoszą jest cieszyć się łagodnymi falami i pływać wśród małych rybek. Cieszę się każdą chwilą mojego pobytu tutaj.', cs: 'Jadrančin krásný apartmán se nachází na horním konci vesnice a má prostorný balkon s bezvadným výhledem. Pokoj je čistý a pohodlný. Jadranka je milá a vstřícná — přišla nás přivítat v horkém dni a dala nám spoustu doporučení na místní aktivity. Z apartmánu je to 5 minut chůze na pláž; voda je v polovině května čistá a svěží a je blažené užívat si jemné vlny a plavat mezi malými rybkami. Užívám si každý okamžik svého pobytu zde.' },
    'reviews.8.quote': { hr: 'Odlično smo se zabavili u ovom stanu, sve je izgledalo baš kao na fotografijama. Pogled s terase bio je predivan. Jadranka je bila vrlo ljubazna domaćica koja nam je dala mnogo savjeta o tome što raditi u okolici.', en: 'We had a great time in this apartment — everything looked just like in the photos. The view from the terrace was gorgeous. Jadranka was a very kind host who gave us lots of tips on what to do in the area.', de: 'Wir hatten eine tolle Zeit in dieser Wohnung — alles sah genauso aus wie auf den Fotos. Der Blick von der Terrasse war herrlich. Jadranka war eine sehr freundliche Gastgeberin, die uns viele Tipps für die Umgebung gab.', pl: 'Świetnie spędziliśmy czas w tym apartamencie — wszystko wyglądało dokładnie tak jak na zdjęciach. Widok z tarasu był przepiękny. Jadranka była bardzo miłą gospodynią, która dała nam wiele wskazówek, co robić w okolicy.', cs: 'Měli jsme skvělý čas v tomto apartmánu — vše vypadalo přesně jako na fotkách. Výhled z terasy byl nádherný. Jadranka byla velmi milá hostitelka, která nám dala spoustu tipů, co dělat v okolí.' },
    'reviews.9.quote': { hr: 'Udoban, prostran stan, poseban balkon, prekrasno okruženje i vrlo dobar, veseo i susretljiv domaćin, od kojeg smo dobili sve informacije za super odmor. Toplo preporučujem.', en: 'Comfortable, spacious apartment, a special balcony, beautiful surroundings, and a very good, cheerful, and helpful host, from whom we got all the information for a great holiday. Highly recommend.', de: 'Komfortable, geräumige Wohnung, ein besonderer Balkon, wunderschöne Umgebung und eine sehr gute, fröhliche und hilfsbereite Gastgeberin, von der wir alle Informationen für einen tollen Urlaub bekamen. Sehr zu empfehlen.', pl: 'Wygodny, przestronny apartament, wyjątkowy balkon, piękna okolica oraz bardzo dobra, pogodna i pomocna gospodyni, od której otrzymaliśmy wszystkie informacje na temat udanego wypoczynku. Gorąco polecam.', cs: 'Pohodlný, prostorný apartmán, výjimečný balkon, krásné okolí a velmi dobrá, veselá a ochotná hostitelka, od které jsme dostali všechny informace pro skvělou dovolenou. Vřele doporučuji.' },
    'reviews.10.quote': { hr: 'Stan je bio odličan, a plaža je udaljena 5 minuta. U selu postoji nekoliko manjih restorana, a Omiš je udaljen 20 minuta, a Split sat vremena. Restoran Konoba Tadići preporučuje se za zalazak sunca na planinama i udaljen je 20 minuta. Smještaj je odličan, a s balkona se pruža prekrasan pogled na zalazak sunca.', en: 'The apartment was excellent, and the beach is 5 minutes away. There are a few small restaurants in the village, Omiš is 20 minutes away, and Split about an hour. Konoba Tadići restaurant is recommended for a mountain sunset and is about 20 minutes away. The accommodation is excellent, and the balcony has a beautiful sunset view.', de: 'Die Wohnung war ausgezeichnet, und der Strand ist 5 Minuten entfernt. Im Dorf gibt es ein paar kleine Restaurants, Omiš ist 20 Minuten entfernt und Split etwa eine Stunde. Das Restaurant Konoba Tadići wird für einen Sonnenuntergang in den Bergen empfohlen und ist etwa 20 Minuten entfernt. Die Unterkunft ist ausgezeichnet, und der Balkon bietet einen wunderschönen Blick auf den Sonnenuntergang.', pl: 'Apartament był doskonały, a plaża jest 5 minut stąd. We wsi jest kilka małych restauracji, Omiš jest 20 minut stąd, a Split około godziny. Restaurację Konoba Tadići poleca się na zachód słońca w górach, jest ona oddalona o około 20 minut. Zakwaterowanie jest doskonałe, a z balkonu roztacza się piękny widok na zachód słońca.', cs: 'Apartmán byl vynikající a pláž je vzdálená 5 minut. Ve vesnici je několik malých restaurací, Omiš je 20 minut daleko a Split asi hodinu. Restaurace Konoba Tadići se doporučuje na západ slunce v horách a je vzdálená asi 20 minut. Ubytování je vynikající a z balkonu je krásný výhled na západ slunce.' },
    'reviews.11.quote': { hr: 'Odlično smo se proveli u svom Airbnb smještaju... bilo je tako ugodno da smo odlučili ostati u Mimicama umjesto da idemo na jednodnevne izlete u okolna područja! Udaljen je 2 minute hoda od dvije različite plaže, s terase se pruža prekrasan pogled, sam stan je predivan, prostran i ima sve potrebne sadržaje, a gradić Mimice je vrlo miran i tih. Jedina je loša strana bila to što smo na kraju morali otići!', en: "We had a wonderful time at this Airbnb... it was so comfortable that we decided to stay in Mimice instead of going on day trips to nearby areas! It's a 2-minute walk from two different beaches, the terrace has a beautiful view, the apartment itself is gorgeous, spacious, and has everything you need, and the little town of Mimice is very quiet and peaceful. The only downside was having to leave in the end!", de: 'Wir hatten eine wundervolle Zeit in diesem Airbnb ... es war so gemütlich, dass wir beschlossen, in Mimice zu bleiben, anstatt Tagesausflüge in die Umgebung zu machen! Es sind nur 2 Minuten zu Fuß zu zwei verschiedenen Stränden, die Terrasse hat einen wunderschönen Blick, die Wohnung selbst ist herrlich, geräumig und hat alles, was man braucht, und das kleine Städtchen Mimice ist sehr ruhig und friedlich. Der einzige Nachteil war, dass wir am Ende abreisen mussten!', pl: 'Świetnie spędziliśmy czas w tym Airbnb... było tak przytulnie, że postanowiliśmy zostać w Mimicach zamiast jeździć na jednodniowe wycieczki w okolicę! To 2 minuty spacerem od dwóch różnych plaż, taras ma piękny widok, sam apartament jest przepiękny, przestronny i ma wszystko, czego potrzeba, a małe miasteczko Mimice jest bardzo ciche i spokojne. Jedynym minusem było to, że w końcu trzeba było wyjechać!', cs: 'Měli jsme nádherný čas v tomto Airbnb... bylo to tak pohodlné, že jsme se rozhodli zůstat v Mimicích místo jednodenních výletů do okolí! Je to 2 minuty chůze od dvou různých pláží, terasa má krásný výhled, samotný apartmán je nádherný, prostorný a má vše, co potřebujete, a městečko Mimice je velmi klidné a tiché. Jedinou nevýhodou bylo, že jsme nakonec museli odjet!' },

    // --- Homepage: Why stay ---
    'home.why.eyebrow': { hr: 'Iskustvo', en: 'The Experience', de: 'Das Erlebnis', pl: 'Doświadczenie', cs: 'Zážitek' },
    'home.why.title': { hr: 'Zašto odsjesti kod nas', en: 'Why Stay With Us', de: 'Warum bei uns wohnen', pl: 'Dlaczego warto u nas zamieszkać', cs: 'Proč se ubytovat u nás' },
    'home.why.f1_title': { hr: 'Pogled na more', en: 'Sea Views', de: 'Meerblick', pl: 'Widok na morze', cs: 'Výhled na moře' },
    'home.why.f1_desc': { hr: 'Kratka šetnja do mora.', en: "A short walk to the water's edge.", de: 'Ein kurzer Spaziergang zum Wasser.', pl: 'Krótki spacer do morza.', cs: 'Krátká procházka k moři.' },
    'home.why.f2_title': { hr: 'Mirna lokacija', en: 'Quiet Location', de: 'Ruhige Lage', pl: 'Spokojna lokalizacja', cs: 'Klidná lokalita' },
    'home.why.f2_desc': { hr: 'Mirne Mimice, daleko od gužve.', en: 'Peaceful Mimice, away from the crowds.', de: 'Das friedliche Mimice, fernab der Menschenmassen.', pl: 'Spokojne Mimice, z dala od tłumów.', cs: 'Klidné Mimice, stranou davů.' },
    'home.why.f3_title': { hr: 'Samostalni smještaj', en: 'Self-Catering', de: 'Selbstversorgung', pl: 'Zakwaterowanie z aneksem kuchennym', cs: 'Vlastní stravování' },
    'home.why.f3_desc': { hr: 'Potpuno opremljene kuhinje, udobnost doma.', en: 'Fully equipped kitchens, home comforts.', de: 'Voll ausgestattete Küchen, Komfort wie zu Hause.', pl: 'W pełni wyposażone kuchnie, domowy komfort.', cs: 'Plně vybavené kuchyně, pohodlí domova.' },
    'home.why.f4_title': { hr: '40 godina iskustva', en: '40 Years of Hospitality', de: '40 Jahre Gastfreundschaft', pl: '40 lat gościnności', cs: '40 let pohostinnosti' },
    'home.why.f4_desc': { hr: 'Obiteljski posao s dugom tradicijom — goste u Mimicama ugošćujemo više od 40 godina.', en: 'A family business with a long tradition — we have been welcoming guests in Mimice for more than 40 years.', de: 'Ein Familienbetrieb mit langer Tradition — wir empfangen seit über 40 Jahren Gäste in Mimice.', pl: 'Rodzinny biznes o długiej tradycji — od ponad 40 lat gościmy gości w Mimicach.', cs: 'Rodinný podnik s dlouhou tradicí — hosty v Mimicích vítáme již více než 40 let.' },
    'home.why.notice': { hr: 'Dobro je znati: oba apartmana nalaze se na drugom katu. Mimice su smještene na brdovitom terenu, pa je povratak s plaže uzbrdo. Slobodno nas pitajte o pristupu prije rezervacije.', en: 'Good to know: both apartments are on the second floor. Mimice sits on a hillside, so the walk back from the beach is uphill. Feel free to ask us about access before booking.', de: 'Gut zu wissen: Beide Apartments befinden sich im zweiten Stock. Mimice liegt an einem Hang, daher geht es vom Strand zurück bergauf. Fragen Sie uns gerne vor der Buchung nach den Zugangsmöglichkeiten.', pl: 'Warto wiedzieć: oba apartamenty znajdują się na drugim piętrze. Mimice leżą na wzgórzu, więc powrót z plaży prowadzi pod górę. Przed rezerwacją śmiało zapytaj nas o dostęp.', cs: 'Dobré vědět: oba apartmány se nacházejí ve druhém patře. Mimice leží na kopci, takže cesta zpět od pláže vede do kopce. Neváhejte se nás před rezervací zeptat na přístup.' },

    // --- Gallery lightbox (shared: unit pages) ---
    'gallery.show_all': { hr: 'Prikaži sve fotografije', en: 'Show all photos', de: 'Alle Fotos anzeigen', pl: 'Pokaż wszystkie zdjęcia', cs: 'Zobrazit všechny fotky' },

    // --- Contact / inquiry (shared: home + unit pages link here) ---
    'contact.eyebrow': { hr: 'Kontaktirajte nas', en: 'Get in Touch', de: 'Kontaktieren Sie uns', pl: 'Skontaktuj się z nami', cs: 'Kontaktujte nás' },
    'contact.title': { hr: 'Poruka domaćinu', en: 'Message Your Host', de: 'Nachricht an den Gastgeber', pl: 'Wiadomość do gospodarza', cs: 'Zpráva hostiteli' },
    'contact.subtitle': { hr: 'Imate pitanja o svom boravku? Pošaljite nam poruku i odgovorit ćemo direktno na vaš email.', en: "Questions about your stay? Send us a message and we'll reply directly to your email.", de: 'Fragen zu Ihrem Aufenthalt? Senden Sie uns eine Nachricht und wir antworten direkt per E-Mail.', pl: 'Masz pytania dotyczące pobytu? Wyślij nam wiadomość, a odpowiemy bezpośrednio na Twój e-mail.', cs: 'Máte dotazy ohledně svého pobytu? Napište nám zprávu a odpovíme přímo na váš e-mail.' },
    'contact.host_name': { hr: 'Jadranka', en: 'Jadranka', de: 'Jadranka', pl: 'Jadranka', cs: 'Jadranka' },
    'contact.host_role': { hr: 'Vaš domaćin', en: 'Your Host', de: 'Ihre Gastgeberin', pl: 'Twoja gospodyni', cs: 'Vaše hostitelka' },
    'contact.host_blurb': { hr: 'Obiteljski vodimo apartmane Jadranka i rado ćemo odgovoriti na sva vaša pitanja o smještaju i dolasku.', en: 'We run Apartmani Jadranka as a family and are always happy to answer your questions about the apartments and your stay.', de: 'Wir führen Apartmani Jadranka als Familie und beantworten gerne alle Ihre Fragen zu den Apartments und Ihrer Anreise.', pl: 'Prowadzimy Apartmani Jadranka jako rodzina i zawsze chętnie odpowiemy na wszystkie pytania dotyczące apartamentów i Twojego przyjazdu.', cs: 'Apartmány Jadranka vedeme jako rodina a rádi zodpovíme veškeré vaše dotazy ohledně apartmánů a vašeho příjezdu.' },
    'contact.message_host_cta': { hr: 'Poruka domaćinu', en: 'Message Host', de: 'Gastgeberin kontaktieren', pl: 'Napisz do gospodarza', cs: 'Napsat hostiteli' },
    'contact.modal_title': { hr: 'Pošaljite poruku', en: 'Send a Message', de: 'Nachricht senden', pl: 'Wyślij wiadomość', cs: 'Odeslat zprávu' },
    'contact.modal_close': { hr: 'Zatvori', en: 'Close', de: 'Schließen', pl: 'Zamknij', cs: 'Zavřít' },
    'contact.form_name': { hr: 'Ime i prezime', en: 'Full Name', de: 'Vor- und Nachname', pl: 'Imię i nazwisko', cs: 'Celé jméno' },
    'contact.form_name_ph': { hr: 'Vaše ime', en: 'Your name', de: 'Ihr Name', pl: 'Twoje imię', cs: 'Vaše jméno' },
    'contact.form_email': { hr: 'Email', en: 'Email', de: 'E-Mail', pl: 'E-mail', cs: 'E-mail' },
    'contact.form_message': { hr: 'Poruka', en: 'Message', de: 'Nachricht', pl: 'Wiadomość', cs: 'Zpráva' },
    'contact.form_message_ph': { hr: 'Recite nam nešto o vašem boravku — broj gostiju, datumi, posebni zahtjevi, itd.', en: 'Tell us about your stay — number of guests, dates, special requests, etc.', de: 'Erzählen Sie uns von Ihrem Aufenthalt — Anzahl der Gäste, Daten, besondere Wünsche usw.', pl: 'Opowiedz nam o swoim pobycie — liczba gości, daty, specjalne życzenia itp.', cs: 'Řekněte nám něco o svém pobytu — počet hostů, termíny, zvláštní požadavky atd.' },
    'contact.form_submit': { hr: 'Pošalji poruku', en: 'Send Message', de: 'Nachricht senden', pl: 'Wyślij wiadomość', cs: 'Odeslat zprávu' },
    'contact.form_error': { hr: 'Molimo unesite ime, email i kratku poruku.', en: 'Please fill in your name, email, and a short message.', de: 'Bitte geben Sie Ihren Namen, Ihre E-Mail-Adresse und eine kurze Nachricht ein.', pl: 'Podaj imię, adres e-mail i krótką wiadomość.', cs: 'Vyplňte prosím jméno, e-mail a krátkou zprávu.' },
    'contact.form_sending': { hr: 'Slanje poruke…', en: 'Sending message…', de: 'Nachricht wird gesendet…', pl: 'Wysyłanie wiadomości…', cs: 'Odesílání zprávy…' },
    'contact.form_success': { hr: 'Hvala, {name}! Vaša poruka je poslana — javit ćemo vam se uskoro putem emaila.', en: 'Thank you, {name}! Your message has been sent — we will get back to you by email shortly.', de: 'Danke, {name}! Ihre Nachricht wurde gesendet — wir melden uns in Kürze per E-Mail bei Ihnen.', pl: 'Dziękujemy, {name}! Twoja wiadomość została wysłana — wkrótce odpowiemy e-mailem.', cs: 'Děkujeme, {name}! Vaše zpráva byla odeslána — brzy se vám ozveme e-mailem.' },
    'contact.form_send_error': { hr: 'Nešto je pošlo po zlu. Pokušajte ponovno ili nam pišite izravno na email.', en: 'Something went wrong. Please try again or email us directly.', de: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.', pl: 'Coś poszło nie tak. Spróbuj ponownie lub napisz do nas bezpośrednio na e-mail.', cs: 'Něco se pokazilo. Zkuste to prosím znovu nebo nám napište přímo e-mail.' },

    'mimice.eyebrow': { hr: 'Upoznajte Mimice', en: 'Discover Mimice', de: 'Entdecken Sie Mimice', pl: 'Odkryj Mimice', cs: 'Objevte Mimice' },
    'mimice.title': { hr: 'Dobrodošli u Mimice', en: 'Welcome to Mimice', de: 'Willkommen in Mimice', pl: 'Witamy w Mimicach', cs: 'Vítejte v Mimicích' },
    'mimice.intro': { hr: 'Mimice su malo dalmatinsko mjesto stvoreno za sporiji ritam odmora. Kristalno čisto more, šljunčane plaže Kutleša i Juto te hlad borova stvaraju onu jednostavnu mediteransku atmosferu zbog koje se ovdje lako ostaje duže nego što ste planirali.', en: 'Mimice is a small Dalmatian village made for a slower kind of holiday. Crystal-clear sea, the pebble beaches of Kutleša and Juto, and the shade of pine trees create that simple Mediterranean feeling that makes it easy to stay longer than you planned.', de: 'Mimice ist ein kleines dalmatinisches Dorf, wie geschaffen für einen ruhigeren Urlaub. Kristallklares Meer, die Kieselstrände Kutleša und Juto sowie der Schatten der Pinien schaffen jenes einfache mediterrane Gefühl, wegen dem man hier leicht länger bleibt als geplant.', pl: 'Mimice to małe dalmatyńskie miejsce stworzone do wolniejszego wypoczynku. Krystalicznie czyste morze, kamieniste plaże Kutleša i Juto oraz cień sosen tworzą tę prostą, śródziemnomorską atmosferę, przez którą łatwo zostać tu dłużej, niż się planowało.', cs: 'Mimice je malá dalmatská vesnice stvořená pro pomalejší tempo dovolené. Křišťálově čisté moře, oblázkové pláže Kutleša a Juto a stín borovic vytvářejí tu jednoduchou středomořskou atmosféru, kvůli které se tu snadno zůstane déle, než jste plánovali.' },
    'mimice.intro2': { hr: 'Prošećite kamenim ulicama starog sela, otkrijte skrivene poglede prema moru i uživajte u miru mjesta koje je sačuvalo svoj autentični dalmatinski karakter.', en: 'Wander the stone streets of the old village, discover hidden glimpses of the sea, and enjoy the peace of a place that has kept its authentic Dalmatian character.', de: 'Schlendern Sie durch die steinernen Gassen des alten Dorfes, entdecken Sie versteckte Ausblicke aufs Meer und genießen Sie die Ruhe eines Ortes, der seinen authentischen dalmatinischen Charakter bewahrt hat.', pl: 'Spaceruj kamiennymi uliczkami starej wioski, odkrywaj ukryte widoki na morze i ciesz się spokojem miejsca, które zachowało swój autentyczny, dalmatyński charakter.', cs: 'Projděte se kamennými uličkami staré vesnice, objevte skryté výhledy na moře a užijte si klid místa, které si zachovalo svůj autentický dalmatský charakter.' },
    'mimice.dist_omis': { hr: 'od Omiša', en: 'from Omiš', de: 'von Omiš', pl: 'od Omišu', cs: 'od Omiše' },
    'mimice.dist_split': { hr: 'od Splita', en: 'from Split', de: 'von Split', pl: 'od Splitu', cs: 'od Splitu' },
    'mimice.dist_makarska': { hr: 'od Makarske', en: 'from Makarska', de: 'von Makarska', pl: 'od Makarskiej', cs: 'od Makarské' },

    'mimice.highlight1_title': { hr: 'Plaže Kutleša i Juto', en: 'Kutleša & Juto Beaches', de: 'Strände Kutleša und Juto', pl: 'Plaże Kutleša i Juto', cs: 'Pláže Kutleša a Juto' },
    'mimice.highlight1_desc': { hr: 'Šljunčane plaže s kristalno čistim morem, tik uz mjesto. Ponesite obuću za kupanje — povratak kući je uzbrdo.', en: 'Pebble beaches with crystal-clear water, right by the village. Bring water shoes — the walk back home is uphill.', de: 'Kieselstrände mit kristallklarem Wasser, direkt beim Dorf. Bringen Sie Badeschuhe mit — der Rückweg geht bergauf.', pl: 'Kamieniste plaże z krystalicznie czystą wodą, tuż przy miejscowości. Zabierz buty do wody — powrót prowadzi pod górę.', cs: 'Oblázkové pláže s křišťálově čistou vodou, hned u vesnice. Vezměte si boty do vody — cesta zpět vede do kopce.' },
    'mimice.highlight2_title': { hr: 'Staro selo Mimice', en: 'The Old Stone Village', de: 'Das alte Steindorf', pl: 'Stara kamienna wioska', cs: 'Stará kamenná vesnice' },
    'mimice.highlight2_desc': { hr: 'Prošećite kamenim uličicama starog dijela mjesta, između kamenih kuća i pogleda na more koji se otvaraju iznenada.', en: 'Wander the stone lanes of the old village, between traditional houses and sudden glimpses of the sea.', de: 'Schlendern Sie durch die steinernen Gassen des alten Dorfteils, vorbei an traditionellen Häusern und plötzlichen Ausblicken aufs Meer.', pl: 'Spaceruj kamiennymi uliczkami starej części miejscowości, pomiędzy tradycyjnymi domami i nagle odsłaniającymi się widokami na morze.', cs: 'Projděte se kamennými uličkami staré části vesnice, mezi tradičními domy a náhlými výhledy na moře.' },
    'mimice.highlight3_title': { hr: 'Jelen – izlet brodom i riblji piknik', en: 'Jelen – Boat Tour & Fish Picnic', de: 'Jelen – Bootstour & Fisch-Picknick', pl: 'Jelen – rejs statkiem i piknik z rybą', cs: 'Jelen – výlet lodí a rybí piknik' },
    'mimice.highlight3_desc': { hr: 'Cijeli dan na moru s tradicionalnim dalmatinskim ručkom od svježe ribe, u organizaciji lokalne tvrtke Jelen — izlet polazi direktno iz Mimica.', en: 'A full day on the water with a traditional Dalmatian fish lunch, run by the local Jelen boat tours — departing right from Mimice.', de: 'Ein ganzer Tag auf dem Wasser mit einem traditionellen dalmatinischen Fischmittagessen, organisiert vom lokalen Anbieter Jelen — die Tour startet direkt in Mimice.', pl: 'Cały dzień na morzu z tradycyjnym dalmatyńskim obiadem rybnym, organizowany przez lokalną firmę Jelen — rejs wyrusza bezpośrednio z Mimic.', cs: 'Celý den na moři s tradičním dalmatským rybím obědem, který pořádá místní firma Jelen — výlet vyplouvá přímo z Mimic.' },
    'mimice.highlight3_link': { hr: 'Pogledajte ponudu →', en: 'View their tours →', de: 'Angebote ansehen →', pl: 'Zobacz ofertę →', cs: 'Zobrazit nabídku →' },
    'mimice.highlight4_title': { hr: 'Pitajte lokalca', en: 'Ask a Local', de: 'Fragen Sie einen Einheimischen', pl: 'Zapytaj lokalsa', cs: 'Zeptejte se místního' },
    'mimice.highlight4_desc': { hr: 'Za restorane, trgovine ili izlete prema Omišu samo nas pitajte — rado ćemo prilagoditi preporuke vašem boravku.', en: 'For restaurants, shops, or trips toward Omiš, just ask us — we are happy to tailor suggestions to your stay.', de: 'Für Restaurants, Geschäfte oder Ausflüge Richtung Omiš fragen Sie einfach uns — wir passen unsere Empfehlungen gerne Ihrem Aufenthalt an.', pl: 'W sprawie restauracji, sklepów czy wycieczek w stronę Omišu po prostu zapytaj nas — chętnie dopasujemy wskazówki do Twojego pobytu.', cs: 'Ohledně restaurací, obchodů nebo výletů směrem na Omiš se nás jen zeptejte — rádi přizpůsobíme doporučení vašemu pobytu.' },

    'mimice.gallery.1': { hr: 'Obala Mimica', en: 'Mimice Coastline', de: 'Küste von Mimice', pl: 'Wybrzeże Mimic', cs: 'Pobřeží Mimic' },
    'mimice.gallery.2': { hr: 'Uličica starog sela', en: 'Old Village Alley', de: 'Gasse im alten Dorf', pl: 'Uliczka starej wioski', cs: 'Ulička staré vesnice' },
    'mimice.gallery.3': { hr: 'Seoska luka', en: 'Village Harbour', de: 'Dorfhafen', pl: 'Wiejska przystań', cs: 'Vesnický přístav' },
    'mimice.gallery.4': { hr: 'Pogled na staro selo', en: 'View Over the Old Village', de: 'Blick über das alte Dorf', pl: 'Widok na starą wioskę', cs: 'Výhled na starou vesnici' },
    'mimice.gallery.5': { hr: 'Mimice iz zraka', en: 'Mimice from Above', de: 'Mimice aus der Vogelperspektive', pl: 'Mimice z lotu ptaka', cs: 'Mimice z ptačí perspektivy' },
    'mimice.gallery.6': { hr: 'Uz plažu', en: 'Along the Beach', de: 'Am Strand entlang', pl: 'Wzdłuż plaży', cs: 'Podél pláže' },
    'mimice.gallery.7': { hr: 'Ljetni dani na plaži', en: 'Summer Days at the Beach', de: 'Sommertage am Strand', pl: 'Letnie dni na plaży', cs: 'Letní dny na pláži' },
    'mimice.gallery.8': { hr: 'Kristalno čisto more', en: 'Crystal-Clear Water', de: 'Kristallklares Wasser', pl: 'Krystalicznie czysta woda', cs: 'Křišťálově čistá voda' },
    'mimice.gallery.9': { hr: 'Mirna uvala', en: 'A Quiet Cove', de: 'Eine ruhige Bucht', pl: 'Cicha zatoczka', cs: 'Klidná zátoka' },
    'mimice.gallery.10': { hr: 'Skriveni kutak obale', en: 'Hidden Corner of the Coast', de: 'Versteckter Winkel der Küste', pl: 'Ukryty zakątek wybrzeża', cs: 'Skrytý kout pobřeží' },
    'mimice.gallery.11': { hr: 'Zalazak sunca uz more', en: 'Sunset by the Sea', de: 'Sonnenuntergang am Meer', pl: 'Zachód słońca nad morzem', cs: 'Západ slunce u moře' },
    'mimice.gallery.12': { hr: 'Večer na Jadranu', en: 'Evening on the Adriatic', de: 'Abend an der Adria', pl: 'Wieczór nad Adriatykiem', cs: 'Večer na Jadranu' },
    'mimice.gallery.13': { hr: 'Mimice u sumrak', en: 'Mimice at Dusk', de: 'Mimice in der Abenddämmerung', pl: 'Mimice o zmierzchu', cs: 'Mimice za soumraku' },
    'mimice.gallery.14': { hr: 'Mimice noću', en: 'Mimice by Night', de: 'Mimice bei Nacht', pl: 'Mimice nocą', cs: 'Mimice v noci' },

    // --- Footer ---
    'footer.address': { hr: 'Prilaz Moru 6, 21318 Mimice, Hrvatska', en: 'Prilaz Moru 6, 21318 Mimice, Croatia', de: 'Prilaz Moru 6, 21318 Mimice, Kroatien', pl: 'Prilaz Moru 6, 21318 Mimice, Chorwacja', cs: 'Prilaz Moru 6, 21318 Mimice, Chorvatsko' },
    'footer.rights': { hr: 'Sva prava pridržana.', en: 'All rights reserved.', de: 'Alle Rechte vorbehalten.', pl: 'Wszelkie prawa zastrzeżone.', cs: 'Všechna práva vyhrazena.' },

    // --- Istok page ---
    'istok.breadcrumb': { hr: 'Početna', en: 'Home', de: 'Startseite', pl: 'Strona główna', cs: 'Domů' },
    'istok.tagline': { hr: '80 m² udobnog prostora u srcu Mimica, na koracima od plaže.', en: '80 m² of comfortable space in the heart of Mimice, steps from the beach.', de: '80 m² komfortabler Wohnraum im Herzen von Mimice, nur wenige Schritte vom Strand entfernt.', pl: '80 m² komfortowej przestrzeni w sercu Mimic, tuż przy plaży.', cs: '80 m² pohodlného prostoru v srdci Mimic, jen pár kroků od pláže.' },
    'istok.gallery.living': { hr: 'Dnevni boravak', en: 'Living room', de: 'Wohnzimmer', pl: 'Salon', cs: 'Obývací pokoj' },
    'istok.gallery.bedroom1': { hr: 'Spavaća soba 1', en: 'Bedroom 1', de: 'Schlafzimmer 1', pl: 'Sypialnia 1', cs: 'Ložnice 1' },
    'istok.gallery.bedroom2': { hr: 'Spavaća soba 2', en: 'Bedroom 2', de: 'Schlafzimmer 2', pl: 'Sypialnia 2', cs: 'Ložnice 2' },
    'istok.gallery.kitchen': { hr: 'Kuhinja', en: 'Kitchen', de: 'Küche', pl: 'Kuchnia', cs: 'Kuchyň' },
    'istok.gallery.balcony': { hr: 'Balkon', en: 'Balcony', de: 'Balkon', pl: 'Balkon', cs: 'Balkon' },
    'istok.gallery.bathroom1': { hr: 'Kupaonica 1', en: 'Bathroom 1', de: 'Badezimmer 1', pl: 'Łazienka 1', cs: 'Koupelna 1' },
    'istok.gallery.bathroom2': { hr: 'Kupaonica 2', en: 'Bathroom 2', de: 'Badezimmer 2', pl: 'Łazienka 2', cs: 'Koupelna 2' },
    'istok.gallery.exterior': { hr: 'Vanjski prostor', en: 'Outdoor area', de: 'Außenbereich', pl: 'Przestrzeń zewnętrzna', cs: 'Venkovní prostor' },
    'istok.about_title': { hr: 'Prostran i moderan, u srcu Mimica', en: 'Spacious and Modern, in the Heart of Mimice', de: 'Geräumig und modern, im Herzen von Mimice', pl: 'Przestronny i nowoczesny, w sercu Mimic', cs: 'Prostorný a moderní, v srdci Mimic' },
    'istok.sleeps': { hr: '4 gosta · 2 spavaće sobe · 2 kupaonice', en: '4 guests · 2 bedrooms · 2 bathrooms', de: '4 Gäste · 2 Schlafzimmer · 2 Badezimmer', pl: '4 osoby · 2 sypialnie · 2 łazienki', cs: '4 hosté · 2 ložnice · 2 koupelny' },
    'istok.desc_p1': { hr: 'Smješten u srcu Mimica, samo 2-3 minute hoda od plaže, kafića i restorana, apartman se nalazi na drugom katu obiteljske kuće i nudi 80 m² udobnog i lijepo uređenog prostora — dvije udobne spavaće sobe, dvije moderne kupaonice, potpuno opremljenu kuhinju (hladnjak sa zamrzivačem, štednjak, pećnica, posuđe i pribor) i prostran dnevni boravak idealan za zajedničko opuštanje.', en: 'Located in the heart of Mimice, just a 2–3 minute walk from the beach, cafés, and restaurants, the apartment sits on the second floor of a family house and offers 80 m² of comfortable, well-designed living space — two cozy bedrooms, two modern bathrooms, a fully equipped kitchen (fridge with freezer, stove, oven, cookware, and utensils), and a spacious living area ideal for relaxing together.', de: 'Das Apartment liegt im Herzen von Mimice, nur 2–3 Gehminuten von Strand, Cafés und Restaurants entfernt, im zweiten Stock eines Familienhauses, und bietet 80 m² komfortablen, durchdachten Wohnraum — zwei gemütliche Schlafzimmer, zwei moderne Badezimmer, eine voll ausgestattete Küche (Kühlschrank mit Gefrierfach, Herd, Backofen, Kochgeschirr und Utensilien) sowie einen geräumigen Wohnbereich, ideal zum gemeinsamen Entspannen.', pl: 'Apartament znajduje się w sercu Mimic, zaledwie 2–3 minuty spacerem od plaży, kawiarni i restauracji, na drugim piętrze domu rodzinnego, i oferuje 80 m² komfortowej, dobrze zaprojektowanej przestrzeni mieszkalnej — dwie przytulne sypialnie, dwie nowoczesne łazienki, w pełni wyposażoną kuchnię (lodówka z zamrażarką, kuchenka, piekarnik, naczynia i przybory) oraz przestronny salon idealny do wspólnego relaksu.', cs: 'Apartmán se nachází v srdci Mimic, jen 2–3 minuty chůze od pláže, kaváren a restaurací, ve druhém patře rodinného domu, a nabízí 80 m² pohodlného, dobře navrženého obytného prostoru — dvě útulné ložnice, dvě moderní koupelny, plně vybavenou kuchyň (lednice s mrazákem, sporák, trouba, nádobí a náčiní) a prostorný obývací prostor ideální ke společnému odpočinku.' },
    'istok.desc_p2': { hr: 'Uživajte na prekrasnom balkonu s fantastičnim pogledom, uz lagan hod do plaže — savršeno mjesto za usporavanje, opuštanje i bijeg od svakodnevnih obaveza. Nalazi se tik uz Stan, dijeleći isti miran vrt i jednostavno parkiranje — idealno za zajedničku rezervaciju oba apartmana za veće grupe.', en: 'Enjoy a beautiful balcony with a truly stunning view, and an easy walk to the beach — the perfect place to slow down, feel good, and leave everyday worries behind. Sits just steps from Stan, sharing the same peaceful garden and easy parking — ideal for booking both units together for larger group getaways.', de: 'Genießen Sie einen wunderschönen Balkon mit einem wirklich atemberaubenden Blick und einen kurzen Spaziergang zum Strand — der perfekte Ort, um zur Ruhe zu kommen, sich wohlzufühlen und den Alltag hinter sich zu lassen. Liegt nur wenige Schritte von Stan entfernt und teilt sich den gleichen ruhigen Garten und die unkomplizierten Parkmöglichkeiten — ideal, um beide Einheiten gemeinsam für größere Gruppenreisen zu buchen.', pl: 'Ciesz się pięknym balkonem z naprawdę zapierającym dech widokiem oraz łatwym dojściem do plaży — idealnym miejscem, by zwolnić tempo, poczuć się dobrze i zostawić codzienne zmartwienia za sobą. Znajduje się tuż obok apartamentu Stan, dzieląc ten sam spokojny ogród i wygodny parking — idealne rozwiązanie do rezerwacji obu apartamentów razem na wyjazdy większych grup.', cs: 'Užijte si krásný balkon s opravdu úchvatným výhledem a snadnou docházkovou vzdálenost na pláž — dokonalé místo, kde zpomalit, cítit se dobře a nechat za sebou každodenní starosti. Nachází se jen pár kroků od apartmánu Stan, se kterým sdílí stejnou klidnou zahradu a snadné parkování — ideální pro rezervaci obou jednotek společně na pobyt větších skupin.' },
    'istok.amenities_heading': { hr: 'Sadržaji', en: 'Amenities', de: 'Ausstattung', pl: 'Udogodnienia', cs: 'Vybavení' },

    'istok.cat.scenic': { hr: 'Pogled', en: 'Scenic Views', de: 'Aussicht', pl: 'Widoki', cs: 'Výhledy' },
    'istok.cat.scenic.1': { hr: 'Pogled na planinu', en: 'Mountain view', de: 'Blick auf die Berge', pl: 'Widok na góry', cs: 'Výhled na hory' },
    'istok.cat.scenic.2': { hr: 'Pogled na more', en: 'Sea view', de: 'Meerblick', pl: 'Widok na morze', cs: 'Výhled na moře' },

    'istok.cat.kitchen': { hr: 'Kuhinja i blagovanje', en: 'Kitchen & Dining', de: 'Küche & Essbereich', pl: 'Kuchnia i jadalnia', cs: 'Kuchyně a jídelna' },
    'istok.cat.kitchen.1': { hr: 'Potpuno opremljena kuhinja', en: 'Fully equipped kitchen', de: 'Voll ausgestattete Küche', pl: 'W pełni wyposażona kuchnia', cs: 'Plně vybavená kuchyň' },
    'istok.cat.kitchen.2': { hr: 'Hladnjak i zamrzivač', en: 'Refrigerator & freezer', de: 'Kühlschrank & Gefrierfach', pl: 'Lodówka i zamrażarka', cs: 'Lednice a mraznička' },
    'istok.cat.kitchen.3': { hr: 'Mikrovalna pećnica', en: 'Microwave', de: 'Mikrowelle', pl: 'Mikrofalówka', cs: 'Mikrovlnná trouba' },
    'istok.cat.kitchen.4': { hr: 'Osnovni pribor za kuhanje (lonci, tave, ulje, sol i papar)', en: 'Cooking basics (pots, pans, oil, salt & pepper)', de: 'Grundausstattung zum Kochen (Töpfe, Pfannen, Öl, Salz & Pfeffer)', pl: 'Podstawowe akcesoria kuchenne (garnki, patelnie, olej, sól i pieprz)', cs: 'Základní vybavení na vaření (hrnce, pánve, olej, sůl a pepř)' },
    'istok.cat.kitchen.5': { hr: 'Posuđe i pribor za jelo', en: 'Dishes & silverware', de: 'Geschirr & Besteck', pl: 'Naczynia i sztućce', cs: 'Nádobí a příbory' },
    'istok.cat.kitchen.6': { hr: 'Perilica posuđa', en: 'Dishwasher', de: 'Geschirrspüler', pl: 'Zmywarka', cs: 'Myčka nádobí' },
    'istok.cat.kitchen.7': { hr: 'Električni štednjak', en: 'Electric stove', de: 'Elektroherd', pl: 'Kuchenka elektryczna', cs: 'Elektrický sporák' },
    'istok.cat.kitchen.8': { hr: 'Pećnica', en: 'Oven', de: 'Backofen', pl: 'Piekarnik', cs: 'Trouba' },
    'istok.cat.kitchen.9': { hr: 'Kuhalo za vodu', en: 'Hot water kettle', de: 'Wasserkocher', pl: 'Czajnik elektryczny', cs: 'Rychlovarná konvice' },
    'istok.cat.kitchen.10': { hr: 'Aparat za kavu (pour-over)', en: 'Coffee maker (pour-over)', de: 'Kaffeebereiter (Pour-over)', pl: 'Ekspres do kawy (przelewowy)', cs: 'Kávovar (překapávací)' },
    'istok.cat.kitchen.11': { hr: 'Čaše za vino', en: 'Wine glasses', de: 'Weingläser', pl: 'Kieliszki do wina', cs: 'Sklenice na víno' },
    'istok.cat.kitchen.12': { hr: 'Toster', en: 'Toaster', de: 'Toaster', pl: 'Toster', cs: 'Toustovač' },
    'istok.cat.kitchen.13': { hr: 'Blender', en: 'Blender', de: 'Mixer', pl: 'Blender', cs: 'Mixér' },
    'istok.cat.kitchen.14': { hr: 'Stol za blagovanje', en: 'Dining table', de: 'Esstisch', pl: 'Stół jadalny', cs: 'Jídelní stůl' },
    'istok.cat.kitchen.15': { hr: 'Kava', en: 'Coffee', de: 'Kaffee', pl: 'Kawa', cs: 'Káva' },

    'istok.cat.bathroom': { hr: 'Kupaonica', en: 'Bathroom', de: 'Badezimmer', pl: 'Łazienka', cs: 'Koupelna' },
    'istok.cat.bathroom.1': { hr: 'Fen za kosu', en: 'Hair dryer', de: 'Föhn', pl: 'Suszarka do włosów', cs: 'Fén' },
    'istok.cat.bathroom.2': { hr: 'Sredstva za čišćenje', en: 'Cleaning products', de: 'Reinigungsmittel', pl: 'Środki czystości', cs: 'Čisticí prostředky' },
    'istok.cat.bathroom.3': { hr: 'Šampon', en: 'Shampoo', de: 'Shampoo', pl: 'Szampon', cs: 'Šampon' },
    'istok.cat.bathroom.4': { hr: 'Topla voda', en: 'Hot water', de: 'Warmwasser', pl: 'Ciepła woda', cs: 'Teplá voda' },

    'istok.cat.bedroom': { hr: 'Spavaća soba i rublje', en: 'Bedroom & Laundry', de: 'Schlafzimmer & Wäsche', pl: 'Sypialnia i pranie', cs: 'Ložnice a prádlo' },
    'istok.cat.bedroom.1': { hr: 'Besplatna perilica rublja (u zgradi)', en: 'Free washer (in building)', de: 'Kostenlose Waschmaschine (im Gebäude)', pl: 'Bezpłatna pralka (w budynku)', cs: 'Bezplatná pračka (v budově)' },
    'istok.cat.bedroom.2': { hr: 'Ručnici, posteljina, sapun i toaletni papir', en: 'Towels, bed sheets, soap & toilet paper', de: 'Handtücher, Bettwäsche, Seife & Toilettenpapier', pl: 'Ręczniki, pościel, mydło i papier toaletowy', cs: 'Ručníky, ložní prádlo, mýdlo a toaletní papír' },
    'istok.cat.bedroom.3': { hr: 'Vješalice', en: 'Hangers', de: 'Kleiderbügel', pl: 'Wieszaki', cs: 'Ramínka' },
    'istok.cat.bedroom.4': { hr: 'Pamučna posteljina', en: 'Cotton bed linens', de: 'Bettwäsche aus Baumwolle', pl: 'Pościel bawełniana', cs: 'Bavlněné povlečení' },
    'istok.cat.bedroom.5': { hr: 'Dodatni jastuci i deke', en: 'Extra pillows & blankets', de: 'Zusätzliche Kissen & Decken', pl: 'Dodatkowe poduszki i koce', cs: 'Přidatné polštáře a deky' },
    'istok.cat.bedroom.6': { hr: 'Glačalo', en: 'Iron', de: 'Bügeleisen', pl: 'Żelazko', cs: 'Žehlička' },
    'istok.cat.bedroom.7': { hr: 'Sušilo za odjeću (stalak)', en: 'Drying rack for clothing', de: 'Wäscheständer', pl: 'Suszarka na ubrania (stojak)', cs: 'Sušák na prádlo' },

    'istok.cat.entertainment': { hr: 'Zabava', en: 'Entertainment', de: 'Unterhaltung', pl: 'Rozrywka', cs: 'Zábava' },
    'istok.cat.entertainment.1': { hr: 'HDTV', en: 'HDTV', de: 'HDTV', pl: 'HDTV', cs: 'HDTV' },

    'istok.cat.climate': { hr: 'Grijanje i hlađenje', en: 'Heating & Cooling', de: 'Heizung & Kühlung', pl: 'Ogrzewanie i klimatyzacja', cs: 'Topení a chlazení' },
    'istok.cat.climate.1': { hr: 'Centralna klimatizacija', en: 'Central air conditioning', de: 'Zentrale Klimaanlage', pl: 'Centralna klimatyzacja', cs: 'Centrální klimatizace' },
    'istok.cat.climate.2': { hr: 'Prozorska klima jedinica', en: 'Window AC unit', de: 'Fenster-Klimagerät', pl: 'Klimatyzator okienny', cs: 'Okenní klimatizace' },
    'istok.cat.climate.3': { hr: 'Grijanje', en: 'Heating', de: 'Heizung', pl: 'Ogrzewanie', cs: 'Topení' },

    'istok.cat.internet': { hr: 'Internet i radni prostor', en: 'Internet & Office', de: 'Internet & Arbeitsbereich', pl: 'Internet i przestrzeń do pracy', cs: 'Internet a pracovní prostor' },
    'istok.cat.internet.1': { hr: 'Wi-Fi', en: 'Wi-Fi', de: 'Wi-Fi', pl: 'Wi-Fi', cs: 'Wi-Fi' },
    'istok.cat.internet.2': { hr: 'Prostor za rad', en: 'Dedicated workspace', de: 'Eigener Arbeitsbereich', pl: 'Wydzielona przestrzeń do pracy', cs: 'Vyhrazený pracovní prostor' },

    'istok.cat.outdoor': { hr: 'Vanjski prostor', en: 'Outdoor', de: 'Außenbereich', pl: 'Na zewnątrz', cs: 'Venkovní prostor' },
    'istok.cat.outdoor.1': { hr: 'Privatna terasa ili balkon', en: 'Private patio or balcony', de: 'Privater Balkon oder Terrasse', pl: 'Prywatny taras lub balkon', cs: 'Soukromá terasa nebo balkon' },
    'istok.cat.outdoor.2': { hr: 'Vanjski namještaj', en: 'Outdoor furniture', de: 'Gartenmöbel', pl: 'Meble ogrodowe', cs: 'Venkovní nábytek' },

    'istok.cat.location': { hr: 'Lokacija', en: 'Location', de: 'Lage', pl: 'Lokalizacja', cs: 'Poloha' },
    'istok.cat.location.1': { hr: 'Pristup plaži', en: 'Beach access', de: 'Strandzugang', pl: 'Dostęp do plaży', cs: 'Přístup na pláž' },
    'istok.cat.location.2': { hr: 'Zaseban ulaz', en: 'Private entrance', de: 'Separater Eingang', pl: 'Osobne wejście', cs: 'Samostatný vchod' },

    'istok.cat.parking': { hr: 'Parking', en: 'Parking', de: 'Parkplatz', pl: 'Parking', cs: 'Parkování' },
    'istok.cat.parking.1': { hr: 'Besplatan parking na posjedu', en: 'Free parking on premises', de: 'Kostenloser Parkplatz auf dem Grundstück', pl: 'Bezpłatny parking na miejscu', cs: 'Bezplatné parkování v areálu' },

    'istok.cat.services': { hr: 'Usluge', en: 'Services', de: 'Services', pl: 'Usługi', cs: 'Služby' },
    'istok.cat.services.1': { hr: 'Dopušteno ostavljanje prtljage', en: 'Luggage drop-off allowed', de: 'Gepäckaufbewahrung möglich', pl: 'Możliwość pozostawienia bagażu', cs: 'Možnost úschovy zavazadel' },
    'istok.cat.services.2': { hr: 'Dopušten dugotrajni boravak (28+ noćenja)', en: 'Long-term stays allowed (28+ nights)', de: 'Langzeitaufenthalte möglich (28+ Nächte)', pl: 'Możliwy długi pobyt (28+ nocy)', cs: 'Umožněn dlouhodobý pobyt (28+ nocí)' },
    'istok.cat.services.3': { hr: 'Samostalni check-in', en: 'Self check-in', de: 'Selbständiger Check-in', pl: 'Samodzielne zameldowanie', cs: 'Samostatný check-in' },
    'istok.cat.services.4': { hr: 'Osoblje dostupno 24 sata', en: 'Staff available 24 hours', de: 'Personal 24 Stunden erreichbar', pl: 'Personel dostępny 24 godziny', cs: 'Personál k dispozici 24 hodin' },

    'istok.not_included_heading': { hr: 'Nije uključeno', en: 'Not Included', de: 'Nicht enthalten', pl: 'Nie wliczone', cs: 'Není zahrnuto' },
    'istok.not_included.1': { hr: 'Sušilica za rublje', en: 'Dryer', de: 'Wäschetrockner', pl: 'Suszarka do ubrań', cs: 'Sušička prádla' },
    'istok.not_included.2': { hr: 'Detektor dima', en: 'Smoke alarm', de: 'Rauchmelder', pl: 'Czujnik dymu', cs: 'Detektor kouře' },
    'istok.not_included.3': { hr: 'Detektor ugljičnog monoksida', en: 'Carbon monoxide alarm', de: 'Kohlenmonoxidmelder', pl: 'Czujnik czadu', cs: 'Detektor oxidu uhelnatého' },
    'istok.pricing_title': { hr: 'Cijene', en: 'Pricing', de: 'Preise', pl: 'Ceny', cs: 'Ceny' },
    'istok.pricing_desc': { hr: 'Cijene ovise o sezoni i duljini boravka. Odaberite datume dolaska i odlaska da vidite točnu cijenu i dostupnost.', en: 'Rates vary by season and length of stay. Select your check-in and check-out dates to see the exact price and availability.', de: 'Die Preise variieren je nach Saison und Aufenthaltsdauer. Wählen Sie Ihr An- und Abreisedatum, um den genauen Preis und die Verfügbarkeit zu sehen.', pl: 'Ceny zależą od sezonu i długości pobytu. Wybierz daty przyjazdu i wyjazdu, aby zobaczyć dokładną cenę i dostępność.', cs: 'Ceny se liší podle sezóny a délky pobytu. Vyberte datum příjezdu a odjezdu a zobrazí se přesná cena a dostupnost.' },
    'istok.pricing_cta': { hr: 'Kontaktirajte za cijene', en: 'Contact for Rates', de: 'Für Preise kontaktieren', pl: 'Skontaktuj się w sprawie cen', cs: 'Kontaktujte nás ohledně cen' },
    'istok.pricing_note': { hr: 'Bez naknada za rezervaciju — rezervirajte izravno kod naše obitelji.', en: 'No booking fees — reserve directly with our family.', de: 'Keine Buchungsgebühren — buchen Sie direkt bei unserer Familie.', pl: 'Bez opłat rezerwacyjnych — rezerwuj bezpośrednio u naszej rodziny.', cs: 'Žádné rezervační poplatky — rezervujte přímo u naší rodiny.' },

    // --- Stan page ---
    'stan.breadcrumb': { hr: 'Početna', en: 'Home', de: 'Startseite', pl: 'Strona główna', cs: 'Domů' },
    'stan.tagline': { hr: 'Panoramski pogled na more i prostrana terasa.', en: 'Panoramic sea views and a spacious terrace.', de: 'Panorama-Meerblick und eine großzügige Terrasse.', pl: 'Panoramiczny widok na morze i przestronny taras.', cs: 'Panoramatický výhled na moře a prostorná terasa.' },
    'stan.gallery.living': { hr: 'Dnevni boravak', en: 'Living room', de: 'Wohnzimmer', pl: 'Salon', cs: 'Obývací pokoj' },
    'stan.gallery.bedroom1': { hr: 'Spavaća soba 1', en: 'Bedroom 1', de: 'Schlafzimmer 1', pl: 'Sypialnia 1', cs: 'Ložnice 1' },
    'stan.gallery.bedroom2': { hr: 'Spavaća soba 2', en: 'Bedroom 2', de: 'Schlafzimmer 2', pl: 'Sypialnia 2', cs: 'Ložnice 2' },
    'stan.gallery.kitchen': { hr: 'Kuhinja', en: 'Kitchen', de: 'Küche', pl: 'Kuchnia', cs: 'Kuchyň' },
    'stan.gallery.terrace': { hr: 'Terasa', en: 'Terrace', de: 'Terrasse', pl: 'Taras', cs: 'Terasa' },
    'stan.gallery.bathroom1': { hr: 'Kupaonica 1', en: 'Bathroom 1', de: 'Badezimmer 1', pl: 'Łazienka 1', cs: 'Koupelna 1' },
    'stan.gallery.bathroom2': { hr: 'Kupaonica 2', en: 'Bathroom 2', de: 'Badezimmer 2', pl: 'Łazienka 2', cs: 'Koupelna 2' },
    'stan.gallery.exterior': { hr: 'Vanjski prostor', en: 'Outdoor area', de: 'Außenbereich', pl: 'Przestrzeń zewnętrzna', cs: 'Venkovní prostor' },
    'stan.about_title': { hr: 'Prostor, tišina i pogled koji pamtite', en: "Space, Quiet, and a View You'll Remember", de: 'Platz, Ruhe und ein Ausblick, den Sie nie vergessen', pl: 'Przestrzeń, cisza i widok, który zapamiętasz', cs: 'Prostor, klid a výhled, na který nezapomenete' },
    'stan.sleeps': { hr: '4 gosta · 2 spavaće sobe · 2 kupaonice', en: '4 guests · 2 bedrooms · 2 bathrooms', de: '4 Gäste · 2 Schlafzimmer · 2 Badezimmer', pl: '4 osoby · 2 sypialnie · 2 łazienki', cs: '4 hosté · 2 ložnice · 2 koupelny' },
    'stan.desc_p1': { hr: 'Smješten na drugom katu obiteljske kuće, prostrani stan od 90 m² nudi udobnost, privatnost i nezaboravan pogled. Velika terasa okrenuta jugozapadu (oko 50 m²), opremljena stolom za blagovanje i sjedećom garniturom za odmor, savršena je za objedovanje na otvorenom i uživanje u dalmatinskom suncu.', en: 'Set on the second floor of a family house, this spacious 90 m² apartment offers comfort, privacy, and unforgettable views. The large southwest-facing terrace (about 50 m²), furnished with a dining table and lounge seating, is perfect for outdoor dining, relaxing, and soaking up the Dalmatian sun.', de: 'Im zweiten Stock eines Familienhauses gelegen, bietet dieses geräumige 90-m²-Apartment Komfort, Privatsphäre und unvergessliche Ausblicke. Die große, nach Südwesten ausgerichtete Terrasse (ca. 50 m²), ausgestattet mit Esstisch und Loungemöbeln, ist perfekt zum Essen im Freien, Entspannen und Genießen der dalmatinischen Sonne.', pl: 'Apartament o powierzchni 90 m², usytuowany na drugim piętrze domu rodzinnego, oferuje komfort, prywatność i niezapomniane widoki. Duży taras skierowany na południowy zachód (około 50 m²), wyposażony w stół do jedzenia i meble wypoczynkowe, jest idealny do jedzenia na świeżym powietrzu, relaksu i kąpieli w dalmatyńskim słońcu.', cs: 'Tento prostorný apartmán o rozloze 90 m², umístěný ve druhém patře rodinného domu, nabízí pohodlí, soukromí a nezapomenutelné výhledy. Velká terasa orientovaná na jihozápad (asi 50 m²), vybavená jídelním stolem a lounge sezením, je perfektní pro stolování venku, odpočinek a vychutnávání si dalmatského slunce.' },
    'stan.desc_p2': { hr: 'Stan ima dvije spavaće sobe — jednu s bračnim krevetom, dodatnim krevetom, privatnom kupaonicom i izlazom na terasu, te drugu okrenutu borovima za mirne i hladne noći — dvije kupaonice, potpuno opremljenu kuhinju i svijetli otvoreni dnevni boravak s pogledom na Jadransko more, otoke Brač i Hvar, poluotok Pelješac i planinu Biokovo. Nalazi se u mirnom području ispod glavne ceste, samo 170 metara od mora.', en: 'The apartment has two bedrooms — one with a double bed, an extra bed, a private bathroom, and terrace access, and another facing the pine trees for quiet, cool nights — two bathrooms, a fully equipped kitchen, and a bright, open living room looking out over the Adriatic Sea, the islands of Brač and Hvar, the Pelješac peninsula, and Mount Biokovo. Set in a peaceful area below the main road, just 170 meters from the sea.', de: 'Das Apartment verfügt über zwei Schlafzimmer — eines mit Doppelbett, einem Zusatzbett, eigenem Bad und Zugang zur Terrasse, und ein weiteres mit Blick auf die Pinien für ruhige, kühle Nächte — zwei Badezimmer, eine voll ausgestattete Küche und ein helles, offenes Wohnzimmer mit Blick auf die Adria, die Inseln Brač und Hvar, die Halbinsel Pelješac und den Berg Biokovo. Gelegen in einer ruhigen Gegend unterhalb der Hauptstraße, nur 170 Meter vom Meer entfernt.', pl: 'Apartament ma dwie sypialnie — jedną z podwójnym łóżkiem, dodatkowym łóżkiem, prywatną łazienką i wyjściem na taras, oraz drugą z widokiem na sosny, zapewniającą ciche, chłodne noce — dwie łazienki, w pełni wyposażoną kuchnię oraz jasny, otwarty salon z widokiem na Adriatyk, wyspy Brač i Hvar, półwysep Pelješac i górę Biokovo. Znajduje się w spokojnej okolicy poniżej głównej drogi, zaledwie 170 metrów od morza.', cs: 'Apartmán má dvě ložnice — jednu s manželskou postelí, přistýlkou, soukromou koupelnou a přístupem na terasu, a druhou s výhledem na borovice pro klidné, chladné noci — dvě koupelny, plně vybavenou kuchyň a světlý, otevřený obývací pokoj s výhledem na Jadranské moře, ostrovy Brač a Hvar, poloostrov Pelješac a horu Biokovo. Nachází se v klidné oblasti pod hlavní silnicí, jen 170 metrů od moře.' },
    'stan.amenities_heading': { hr: 'Sadržaji', en: 'Amenities', de: 'Ausstattung', pl: 'Udogodnienia', cs: 'Vybavení' },

    'stan.cat.kitchen': { hr: 'Kuhinja', en: 'Kitchen', de: 'Küche', pl: 'Kuchnia', cs: 'Kuchyň' },
    'stan.cat.kitchen.1': { hr: 'Potpuno opremljena kuhinja', en: 'Fully equipped kitchen', de: 'Voll ausgestattete Küche', pl: 'W pełni wyposażona kuchnia', cs: 'Plně vybavená kuchyň' },
    'stan.cat.kitchen.2': { hr: 'Perilica posuđa', en: 'Dishwasher', de: 'Geschirrspüler', pl: 'Zmywarka', cs: 'Myčka nádobí' },
    'stan.cat.kitchen.3': { hr: 'Štednjak', en: 'Stove', de: 'Herd', pl: 'Kuchenka', cs: 'Sporák' },
    'stan.cat.kitchen.4': { hr: 'Pećnica', en: 'Oven', de: 'Backofen', pl: 'Piekarnik', cs: 'Trouba' },
    'stan.cat.kitchen.5': { hr: 'Aparat za filter kavu', en: 'Coffee maker', de: 'Kaffeemaschine', pl: 'Ekspres do kawy', cs: 'Kávovar' },
    'stan.cat.kitchen.6': { hr: 'Hladnjak', en: 'Refrigerator', de: 'Kühlschrank', pl: 'Lodówka', cs: 'Lednice' },
    'stan.cat.kitchen.7': { hr: 'Mikrovalna pećnica', en: 'Microwave', de: 'Mikrowelle', pl: 'Mikrofalówka', cs: 'Mikrovlnná trouba' },
    'stan.cat.kitchen.8': { hr: 'Osnovni pribor za kuhanje', en: 'Basic cooking essentials', de: 'Grundausstattung zum Kochen', pl: 'Podstawowe akcesoria kuchenne', cs: 'Základní vybavení na vaření' },

    'stan.cat.bathroom': { hr: 'Kupaonica', en: 'Bathroom', de: 'Badezimmer', pl: 'Łazienka', cs: 'Koupelna' },
    'stan.cat.bathroom.1': { hr: 'Sušilo za kosu', en: 'Hair dryer', de: 'Föhn', pl: 'Suszarka do włosów', cs: 'Fén' },
    'stan.cat.bathroom.2': { hr: 'Šampon', en: 'Shampoo', de: 'Shampoo', pl: 'Szampon', cs: 'Šampon' },
    'stan.cat.bathroom.3': { hr: 'Topla voda', en: 'Hot water', de: 'Warmwasser', pl: 'Ciepła woda', cs: 'Teplá voda' },

    'stan.cat.bedroom': { hr: 'Spavaća soba i rublje', en: 'Bedroom & Linens', de: 'Schlafzimmer & Wäsche', pl: 'Sypialnia i pościel', cs: 'Ložnice a prádlo' },
    'stan.cat.bedroom.1': { hr: 'Perilica rublja', en: 'Washing machine', de: 'Waschmaschine', pl: 'Pralka', cs: 'Pračka' },
    'stan.cat.bedroom.2': { hr: 'Ručnici, posteljina, sapun, WC papir', en: 'Towels, bed linen, soap, toilet paper', de: 'Handtücher, Bettwäsche, Seife, Toilettenpapier', pl: 'Ręczniki, pościel, mydło, papier toaletowy', cs: 'Ručníky, povlečení, mýdlo, toaletní papír' },
    'stan.cat.bedroom.3': { hr: 'Vješalice', en: 'Hangers', de: 'Kleiderbügel', pl: 'Wieszaki', cs: 'Ramínka' },
    'stan.cat.bedroom.4': { hr: 'Dodatni jastuci i prekrivači', en: 'Extra pillows & blankets', de: 'Zusätzliche Kissen & Decken', pl: 'Dodatkowe poduszki i koce', cs: 'Přidatné polštáře a deky' },
    'stan.cat.bedroom.5': { hr: 'Glačalo', en: 'Iron', de: 'Bügeleisen', pl: 'Żelazko', cs: 'Žehlička' },

    'stan.cat.climate': { hr: 'Grijanje i hlađenje', en: 'Heating & Cooling', de: 'Heizung & Kühlung', pl: 'Ogrzewanie i klimatyzacja', cs: 'Topení a chlazení' },
    'stan.cat.climate.1': { hr: 'Klima uređaj', en: 'Air conditioning', de: 'Klimaanlage', pl: 'Klimatyzacja', cs: 'Klimatizace' },
    'stan.cat.climate.2': { hr: 'Grijanje', en: 'Heating', de: 'Heizung', pl: 'Ogrzewanie', cs: 'Topení' },

    'stan.cat.entertainment': { hr: 'Zabava', en: 'Entertainment', de: 'Unterhaltung', pl: 'Rozrywka', cs: 'Zábava' },
    'stan.cat.entertainment.1': { hr: 'TV sa standardnim kabelskim paketom', en: 'TV with standard cable', de: 'TV mit Standard-Kabelpaket', pl: 'Telewizor z podstawowym pakietem kablowym', cs: 'TV se standardním kabelovým balíčkem' },
    'stan.cat.entertainment.2': { hr: 'Knjige i igračke za djecu', en: 'Books and toys for children', de: 'Bücher und Spielzeug für Kinder', pl: 'Książki i zabawki dla dzieci', cs: 'Knihy a hračky pro děti' },

    'stan.cat.internet': { hr: 'Internet', en: 'Internet', de: 'Internet', pl: 'Internet', cs: 'Internet' },
    'stan.cat.internet.1': { hr: 'Wi-Fi', en: 'Wi-Fi', de: 'Wi-Fi', pl: 'Wi-Fi', cs: 'Wi-Fi' },

    'stan.cat.outdoor': { hr: 'Vanjski sadržaji', en: 'Outdoor', de: 'Außenbereich', pl: 'Na zewnątrz', cs: 'Venkovní prostory' },
    'stan.cat.outdoor.1': { hr: 'Terasa s pogledom na more', en: 'Terrace with sea view', de: 'Terrasse mit Meerblick', pl: 'Taras z widokiem na morze', cs: 'Terasa s výhledem na moře' },

    'stan.cat.location': { hr: 'Lokacija', en: 'Location', de: 'Lage', pl: 'Lokalizacja', cs: 'Poloha' },
    'stan.cat.location.1': { hr: 'Pristup obližnjoj plaži (170 m)', en: 'Access to nearby beach (170 m)', de: 'Zugang zum nahegelegenen Strand (170 m)', pl: 'Dostęp do pobliskiej plaży (170 m)', cs: 'Přístup na nedalekou pláž (170 m)' },
    'stan.cat.location.2': { hr: 'Mirno područje ispod glavne ceste', en: 'Peaceful area below the main road', de: 'Ruhige Lage unterhalb der Hauptstraße', pl: 'Spokojna okolica poniżej głównej drogi', cs: 'Klidná oblast pod hlavní silnicí' },

    'stan.cat.other': { hr: 'Ostalo', en: 'Other', de: 'Sonstiges', pl: 'Inne', cs: 'Ostatní' },
    'stan.cat.other.1': { hr: 'Besplatan parking u sklopu objekta', en: 'Free parking on premises', de: 'Kostenloser Parkplatz auf dem Grundstück', pl: 'Bezpłatny parking na miejscu', cs: 'Bezplatné parkování v areálu' },
    'stan.cat.other.2': { hr: 'Moguće ostaviti prtljagu', en: 'Luggage drop-off allowed', de: 'Gepäckaufbewahrung möglich', pl: 'Możliwość pozostawienia bagażu', cs: 'Možnost úschovy zavazadel' },
    'stan.cat.other.3': { hr: 'Boravak 28+ dana moguć', en: 'Long-term stays allowed (28+ nights)', de: 'Langzeitaufenthalte möglich (28+ Nächte)', pl: 'Możliwy długi pobyt (28+ nocy)', cs: 'Umožněn dlouhodobý pobyt (28+ nocí)' },
    'stan.cat.other.4': { hr: 'Samostalni dolazak (self check-in)', en: 'Self check-in', de: 'Selbständiger Check-in', pl: 'Samodzielne zameldowanie', cs: 'Samostatný check-in' },
    'stan.cat.other.5': { hr: 'Osoblje dostupno 0-24', en: 'Staff available 24 hours', de: 'Personal 24 Stunden erreichbar', pl: 'Personel dostępny 24 godziny', cs: 'Personál k dispozici 24 hodin' },

    // --- Stan: availability & pricing ---
    'calendar.avail.eyebrow': { hr: 'Rezervacija', en: 'Booking', de: 'Buchung', pl: 'Rezerwacja', cs: 'Rezervace' },
    'calendar.avail.title': { hr: 'Dostupnost i cijene', en: 'Availability & Pricing', de: 'Verfügbarkeit & Preise', pl: 'Dostępność i ceny', cs: 'Dostupnost a ceny' },
    'calendar.avail.subtitle': { hr: 'Odaberite datume dolaska i odlaska da vidite cijenu i dostupnost.', en: 'Select your check-in and check-out dates to see pricing and availability.', de: 'Wählen Sie An- und Abreisedatum, um Preise und Verfügbarkeit zu sehen.', pl: 'Wybierz daty przyjazdu i wyjazdu, aby zobaczyć ceny i dostępność.', cs: 'Vyberte datum příjezdu a odjezdu a zobrazí se ceny a dostupnost.' },
    'calendar.avail.legend_available': { hr: 'Dostupno', en: 'Available', de: 'Verfügbar', pl: 'Dostępne', cs: 'Dostupné' },
    'calendar.avail.legend_unavailable': { hr: 'Zauzeto', en: 'Unavailable', de: 'Nicht verfügbar', pl: 'Niedostępne', cs: 'Nedostupné' },
    'calendar.avail.legend_selected': { hr: 'Odabrano', en: 'Selected', de: 'Ausgewählt', pl: 'Wybrane', cs: 'Vybráno' },
    'calendar.avail.prev': { hr: 'Prethodni mjesec', en: 'Previous month', de: 'Vorheriger Monat', pl: 'Poprzedni miesiąc', cs: 'Předchozí měsíc' },
    'calendar.avail.next': { hr: 'Sljedeći mjesec', en: 'Next month', de: 'Nächster Monat', pl: 'Następny miesiąc', cs: 'Další měsíc' },
    'calendar.avail.prompt_checkin': { hr: 'Odaberite datum dolaska', en: 'Select a check-in date', de: 'Anreisedatum auswählen', pl: 'Wybierz datę przyjazdu', cs: 'Vyberte datum příjezdu' },
    'calendar.avail.prompt_checkout': { hr: 'Odaberite datum odlaska', en: 'Select a check-out date', de: 'Abreisedatum auswählen', pl: 'Wybierz datę wyjazdu', cs: 'Vyberte datum odjezdu' },
    'calendar.avail.nights': { hr: 'noćenja', en: 'nights', de: 'Nächte', pl: 'noce', cs: 'nocí' },
    'calendar.avail.price_per_night': { hr: 'Cijena po noći', en: 'Price per night', de: 'Preis pro Nacht', pl: 'Cena za noc', cs: 'Cena za noc' },
    'calendar.avail.total': { hr: 'Ukupno', en: 'Total', de: 'Gesamt', pl: 'Razem', cs: 'Celkem' },
    'calendar.avail.clear': { hr: 'Poništi odabir', en: 'Clear selection', de: 'Auswahl zurücksetzen', pl: 'Wyczyść zaznaczenie', cs: 'Zrušit výběr' },
    'calendar.avail.unavailable_msg': { hr: 'Odabrani termin nije dostupan. Molimo odaberite druge datume.', en: 'Selected dates are not available. Please choose different dates.', de: 'Der ausgewählte Zeitraum ist nicht verfügbar. Bitte wählen Sie andere Daten.', pl: 'Wybrany termin jest niedostępny. Wybierz inne daty.', cs: 'Vybraný termín není dostupný. Vyberte prosím jiná data.' },
    'calendar.avail.updated': { hr: 'Kalendar se automatski ažurira s Airbnb-a. Zadnje ažuriranje:', en: 'Calendar syncs automatically from Airbnb. Last updated:', de: 'Der Kalender wird automatisch mit Airbnb synchronisiert. Zuletzt aktualisiert:', pl: 'Kalendarz synchronizuje się automatycznie z Airbnb. Ostatnia aktualizacja:', cs: 'Kalendář se automaticky synchronizuje s Airbnb. Naposledy aktualizováno:' },
    'calendar.avail.note': { hr: 'Cijene su okvirne; konačna cijena potvrđuje se prilikom rezervacije.', en: 'Prices are indicative; final price is confirmed at booking.', de: 'Preise sind unverbindlich; der endgültige Preis wird bei der Buchung bestätigt.', pl: 'Ceny mają charakter orientacyjny; ostateczna cena zostanie potwierdzona przy rezerwacji.', cs: 'Ceny jsou orientační; konečná cena bude potvrzena při rezervaci.' },
    'calendar.avail.min_nights_msg': { hr: 'Za odabrani period minimalni boravak je {min} noćenja. Molimo odaberite dulji period.', en: 'For the selected period, the minimum stay is {min} nights. Please choose a longer period.', de: 'Für den gewählten Zeitraum beträgt der Mindestaufenthalt {min} Nächte. Bitte wählen Sie einen längeren Zeitraum.', pl: 'Dla wybranego okresu minimalny pobyt to {min} noce. Wybierz dłuższy okres.', cs: 'Pro zvolené období je minimální pobyt {min} nocí. Vyberte prosím delší období.' },

    'calendar.avail.inquiry_title': { hr: 'Pošaljite upit za odabrane datume', en: 'Send an Inquiry for These Dates', de: 'Anfrage für diese Daten senden', pl: 'Wyślij zapytanie na wybrane terminy', cs: 'Odeslat poptávku na vybrané termíny' },
    'calendar.avail.form_submit': { hr: 'Pošalji upit', en: 'Send Inquiry', de: 'Anfrage senden', pl: 'Wyślij zapytanie', cs: 'Odeslat poptávku' },
    'calendar.avail.form_adults': { hr: 'Broj odraslih', en: 'Number of adults', de: 'Anzahl der Erwachsenen', pl: 'Liczba dorosłych', cs: 'Počet dospělých' },
    'calendar.avail.form_children': { hr: 'Broj djece', en: 'Number of children', de: 'Anzahl der Kinder', pl: 'Liczba dzieci', cs: 'Počet dětí' },
    'calendar.avail.guests_decrease': { hr: 'Smanji broj', en: 'Decrease', de: 'Verringern', pl: 'Zmniejsz', cs: 'Snížit' },
    'calendar.avail.guests_increase': { hr: 'Povećaj broj', en: 'Increase', de: 'Erhöhen', pl: 'Zwiększ', cs: 'Zvýšit' },
    'calendar.avail.form_phone': { hr: 'Telefon', en: 'Phone', de: 'Telefon', pl: 'Telefon', cs: 'Telefon' },
    'calendar.avail.form_phone_ph': { hr: 'Vaš broj telefona', en: 'Your phone number', de: 'Ihre Telefonnummer', pl: 'Twój numer telefonu', cs: 'Vaše telefonní číslo' },
    'calendar.avail.form_message_ph': { hr: 'Napomene, posebni zahtjevi...', en: 'Notes, special requests...', de: 'Anmerkungen, besondere Wünsche...', pl: 'Uwagi, specjalne życzenia...', cs: 'Poznámky, zvláštní požadavky...' },
    'calendar.avail.form_error': { hr: 'Molimo unesite ime, email i telefon.', en: 'Please fill in your name, email, and phone.', de: 'Bitte geben Sie Name, E-Mail und Telefonnummer ein.', pl: 'Podaj imię, e-mail i numer telefonu.', cs: 'Vyplňte prosím jméno, e-mail a telefon.' },
    'calendar.avail.email_subject': { hr: 'Upit za {unit} – {checkin} do {checkout}', en: 'Inquiry for {unit} – {checkin} to {checkout}', de: 'Anfrage für {unit} – {checkin} bis {checkout}', pl: 'Zapytanie o {unit} – {checkin} do {checkout}', cs: 'Poptávka na {unit} – {checkin} až {checkout}' },
    'calendar.avail.email_label_name': { hr: 'Ime i prezime', en: 'Full name', de: 'Vor- und Nachname', pl: 'Imię i nazwisko', cs: 'Celé jméno' },
    'calendar.avail.email_label_email': { hr: 'Email', en: 'Email', de: 'E-Mail', pl: 'E-mail', cs: 'E-mail' },
    'calendar.avail.email_label_phone': { hr: 'Telefon', en: 'Phone', de: 'Telefon', pl: 'Telefon', cs: 'Telefon' },
    'calendar.avail.email_label_checkin': { hr: 'Datum dolaska', en: 'Check-in date', de: 'Anreisedatum', pl: 'Data przyjazdu', cs: 'Datum příjezdu' },
    'calendar.avail.email_label_checkout': { hr: 'Datum odlaska', en: 'Check-out date', de: 'Abreisedatum', pl: 'Data wyjazdu', cs: 'Datum odjezdu' },
    'calendar.avail.email_label_nights': { hr: 'Broj noćenja', en: 'Number of nights', de: 'Anzahl der Nächte', pl: 'Liczba nocy', cs: 'Počet nocí' },
    'calendar.avail.email_label_adults': { hr: 'Broj odraslih', en: 'Number of adults', de: 'Anzahl der Erwachsenen', pl: 'Liczba dorosłych', cs: 'Počet dospělých' },
    'calendar.avail.email_label_children': { hr: 'Broj djece', en: 'Number of children', de: 'Anzahl der Kinder', pl: 'Liczba dzieci', cs: 'Počet dětí' },
    'calendar.avail.email_label_total': { hr: 'Ukupna cijena', en: 'Total price', de: 'Gesamtpreis', pl: 'Cena całkowita', cs: 'Celková cena' },
    'calendar.avail.email_label_message': { hr: 'Poruka', en: 'Message', de: 'Nachricht', pl: 'Wiadomość', cs: 'Zpráva' },

    // --- Calendar month/weekday names ---
    'calendar.month.0': { hr: 'Siječanj', en: 'January', de: 'Januar', pl: 'Styczeń', cs: 'Leden' },
    'calendar.month.1': { hr: 'Veljača', en: 'February', de: 'Februar', pl: 'Luty', cs: 'Únor' },
    'calendar.month.2': { hr: 'Ožujak', en: 'March', de: 'März', pl: 'Marzec', cs: 'Březen' },
    'calendar.month.3': { hr: 'Travanj', en: 'April', de: 'April', pl: 'Kwiecień', cs: 'Duben' },
    'calendar.month.4': { hr: 'Svibanj', en: 'May', de: 'Mai', pl: 'Maj', cs: 'Květen' },
    'calendar.month.5': { hr: 'Lipanj', en: 'June', de: 'Juni', pl: 'Czerwiec', cs: 'Červen' },
    'calendar.month.6': { hr: 'Srpanj', en: 'July', de: 'Juli', pl: 'Lipiec', cs: 'Červenec' },
    'calendar.month.7': { hr: 'Kolovoz', en: 'August', de: 'August', pl: 'Sierpień', cs: 'Srpen' },
    'calendar.month.8': { hr: 'Rujan', en: 'September', de: 'September', pl: 'Wrzesień', cs: 'Září' },
    'calendar.month.9': { hr: 'Listopad', en: 'October', de: 'Oktober', pl: 'Październik', cs: 'Říjen' },
    'calendar.month.10': { hr: 'Studeni', en: 'November', de: 'November', pl: 'Listopad', cs: 'Listopad' },
    'calendar.month.11': { hr: 'Prosinac', en: 'December', de: 'Dezember', pl: 'Grudzień', cs: 'Prosinec' },
    'calendar.weekday.0': { hr: 'Pon', en: 'Mon', de: 'Mo', pl: 'Pon', cs: 'Po' },
    'calendar.weekday.1': { hr: 'Uto', en: 'Tue', de: 'Di', pl: 'Wt', cs: 'Út' },
    'calendar.weekday.2': { hr: 'Sri', en: 'Wed', de: 'Mi', pl: 'Śr', cs: 'St' },
    'calendar.weekday.3': { hr: 'Čet', en: 'Thu', de: 'Do', pl: 'Czw', cs: 'Čt' },
    'calendar.weekday.4': { hr: 'Pet', en: 'Fri', de: 'Fr', pl: 'Pt', cs: 'Pá' },
    'calendar.weekday.5': { hr: 'Sub', en: 'Sat', de: 'Sa', pl: 'Sob', cs: 'So' },
    'calendar.weekday.6': { hr: 'Ned', en: 'Sun', de: 'So', pl: 'Ndz', cs: 'Ne' },

    // --- Season names (used by calendar.js pricing config) ---
    'season.low': { hr: 'niska sezona', en: 'low season', de: 'Nebensaison', pl: 'sezon niski', cs: 'nízká sezóna' },
    'season.mid': { hr: 'srednja sezona', en: 'mid season', de: 'Zwischensaison', pl: 'sezon średni', cs: 'střední sezóna' },
    'season.high': { hr: 'visoka sezona', en: 'high season', de: 'Hochsaison', pl: 'sezon wysoki', cs: 'vysoká sezóna' }
  };

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.indexOf(stored) !== -1 ? stored : 'hr';
  }

  function t(key, vars) {
    var entry = DICT[key];
    var text = entry ? (entry[getLang()] || entry.hr) : key;
    if (vars) {
      Object.keys(vars).forEach(function (v) {
        text = text.replace('{' + v + '}', vars[v]);
      });
    }
    return text;
  }

  function closeAllLangMenus() {
    document.querySelectorAll('.lang-menu.open').forEach(function (menu) {
      menu.classList.remove('open');
      var toggle = menu.parentElement.querySelector('.lang-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function applyLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = 'hr';
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n')];
      if (entry) el.textContent = entry[lang] || entry.hr;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n-placeholder')];
      if (entry) el.setAttribute('placeholder', entry[lang] || entry.hr);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var entry = DICT[el.getAttribute('data-i18n-aria-label')];
      if (entry) el.setAttribute('aria-label', entry[lang] || entry.hr);
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.lang-current').forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });

    closeAllLangMenus();

    document.dispatchEvent(new CustomEvent('jadranka:languagechange', { detail: { lang: lang } }));
  }

  function initLanguageToggle() {
    document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = toggle.parentElement.querySelector('.lang-menu');
        if (!menu) return;
        var isOpen = menu.classList.contains('open');
        closeAllLangMenus();
        if (!isOpen) {
          menu.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        applyLanguage(btn.getAttribute('data-lang-btn'));
      });
    });

    document.addEventListener('click', closeAllLangMenus);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllLangMenus();
    });

    applyLanguage(getLang());
  }

  window.Jadranka = {
    t: t,
    getLang: getLang,
    applyLanguage: applyLanguage,
    supportedLangs: SUPPORTED_LANGS,
    langLabels: LANG_LABELS
  };

  document.addEventListener('DOMContentLoaded', initLanguageToggle);
})();
