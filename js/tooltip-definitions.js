/**
 * tooltip-definitions.js
 * Definizioni dei tooltip per ogni voce della dashboard.
 * Ogni tooltip spiega: cosa è, come si calcola, motivazione fiscale.
 */

const TOOLTIP_MADRE = {
    baseImponibile: {
        irpef: 'BASE IMPONIBILE IRPEF\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive deducibili.\n' +
            'In IRPEF ordinaria le spese e il compenso al gestore sono interamente deducibili, riducendo la base su cui si calcolano le tasse.',
        irpefForfettario: 'BASE IMPONIBILE IRPEF (DEDUZIONE FORFETTARIA)\n' +
            'Calcolo: Incasso Lordo × 95% (deduzione forfettaria del 5%).\n' +
            'Senza P.IVA la madre NON può dedurre costi reali (compenso PM, spese vive). La legge concede solo una riduzione forfettaria del 5% per spese di manutenzione ordinaria.',
        cedolarePiena: 'BASE IMPONIBILE CEDOLARE SECCA\n' +
            'Calcolo: Coincide con l\'intero Incasso Lordo annuo.\n' +
            'La Cedolare Secca è un\'imposta sostitutiva al 21%: si applica sul lordo incassato, senza possibilità di dedurre spese, compensi o costi di gestione.',
        cedolareCanone: 'BASE IMPONIBILE CEDOLARE SECCA\n' +
            'Calcolo: Coincide con il canone di locazione concordato.\n' +
            'La madre percepisce solo il canone fisso dal figlio. La Cedolare Secca 21% si applica su questo importo, senza deduzioni.',
    },
    tasse: {
        irpef: 'IRPEF ORDINARIA 2026\n' +
            'Calcolo a scaglioni progressivi:\n' +
            '• 23% fino a 28.000 €\n' +
            '• 35% da 28.001 € a 50.000 €\n' +
            '• 43% oltre 50.000 €\n' +
            'Si applica solo sulla base imponibile (dopo aver dedotto spese e compenso PM).',
        irpefForfettario: 'IRPEF ORDINARIA 2026 (SU BASE FORFETTARIA)\n' +
            'Calcolo a scaglioni progressivi:\n' +
            '• 23% fino a 28.000 €\n' +
            '• 35% da 28.001 € a 50.000 €\n' +
            '• 43% oltre 50.000 €\n' +
            'Si applica su Incasso Lordo × 95%. ATTENZIONE: la base imponibile è quasi tutto il lordo, rendendo il carico fiscale molto alto.',
        cedolare: 'CEDOLARE SECCA 21%\n' +
            'Calcolo: Base Imponibile × 21%.\n' +
            'Imposta sostitutiva dell\'IRPEF per affitti brevi (<30 giorni). Aliquota fissa, nessuna deduzione. Conviene quando le spese sono basse rispetto al lordo.',
    },
    netto: {
        irpef: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM al Figlio − Spese Vive − IRPEF.\n' +
            'È ciò che rimane effettivamente alla madre dopo aver pagato il gestore, le spese operative e le tasse.',
        irpefForfettario: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive − IRPEF (su lordo×95%).\n' +
            'Compenso e spese escono dal cash flow ma NON riducono la base IRPEF. Il netto è quindi più basso rispetto allo scenario con P.IVA.',
        cedolarePiena: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive − Cedolare Secca (su tutto il lordo).\n' +
            'Attenzione: la Cedolare si paga sull\'intero incasso, ma compenso e spese escono comunque dal lordo.',
        cedolareCanone: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Canone di Locazione − Cedolare Secca (21% del canone).\n' +
            'La madre incassa solo il canone fisso e paga il 21% di cedolare. Non ha spese operative (a carico del figlio).',
    },
};

const TOOLTIP_FIGLIO = {
    ricavi: {
        forfettario: 'RICAVI LORDI DEL FIGLIO\n' +
            'Corrisponde al compenso di Property Management ricevuto dalla madre per la gestione dell\'immobile.',
        semplificato: 'RICAVI LORDI DEL FIGLIO\n' +
            'Corrisponde all\'intero incasso dai turisti. Il figlio subaffitta l\'immobile e incassa direttamente. Se supera 85.000 € esce dal Regime Forfettario.',
    },
    imponibile: {
        forfettario: 'IMPONIBILE FORFETTARIO\n' +
            'Calcolo: Ricavi × Coefficiente di Redditività (86% per ATECO 68.32.00).\n' +
            'Il Forfettario non ammette deduzioni analitiche: il reddito tassabile è determinato applicando un coefficiente fisso ai ricavi.',
        semplificato: 'IMPONIBILE REGIME SEMPLIFICATO\n' +
            'Calcolo: Ricavi dai turisti − Canone alla madre − Spese Vive.\n' +
            'In regime semplificato le spese effettive sono deducibili, incluso il canone pagato alla madre.',
    },
    imposta: {
        forfettario5: 'IMPOSTA SOSTITUTIVA 5% (START-UP)\n' +
            'Calcolo: Imponibile Forfettario × 5%.\n' +
            'Aliquota agevolata per i primi 5 anni di attività (start-up). Dopo 5 anni sale al 15%.',
        forfettario15: 'IMPOSTA SOSTITUTIVA 15%\n' +
            'Calcolo: Imponibile Forfettario × 15%.\n' +
            'Aliquota ordinaria del Regime Forfettario, sostitutiva di IRPEF, IRAP e addizionali.',
        irpef: 'IRPEF REGIME SEMPLIFICATO\n' +
            'Calcolo a scaglioni progressivi (23% / 35% / 43%).\n' +
            'Il figlio esce dal Forfettario perché i ricavi superano 85.000 €. Passa al Regime Semplificato con IRPEF ordinaria.',
    },
    inps: {
        forfettario: 'CONTRIBUTI INPS (GESTIONE SEPARATA)\n' +
            'Calcolo: Imponibile Forfettario × 26,07%.\n' +
            'Contributi previdenziali obbligatori calcolati sull\'imponibile forfettario. Sono un costo aggiuntivo oltre all\'imposta sostitutiva.',
        semplificato: 'CONTRIBUTI INPS (GESTIONE SEPARATA)\n' +
            'Calcolo: Imponibile × 26,07%.\n' +
            'Contributi previdenziali obbligatori. In regime semplificato si calcolano sull\'imponibile effettivo (ricavi − costi).',
    },
    totaleTasse: 'TOTALE ONERI FISCALI FIGLIO\n' +
        'Calcolo: Imposta (sostitutiva o IRPEF) + Contributi INPS.\n' +
        'Rappresenta il carico fiscale complessivo del figlio, somma di tasse e contributi previdenziali.',
    netto: {
        forfettario: 'NETTO IN TASCA AL FIGLIO\n' +
            'Calcolo: Ricavi (compenso PM) − Imposta Sostitutiva − INPS.\n' +
            'Importo che il figlio trattiene dopo aver pagato tasse e contributi. Non ci sono altre spese a suo carico.',
        semplificato: 'NETTO IN TASCA AL FIGLIO\n' +
            'Calcolo: Ricavi dai turisti − Canone alla madre − Spese Vive − IRPEF − INPS.\n' +
            'Importo effettivo trattenuto dal figlio dopo tutti i costi operativi e fiscali.',
    },
};

const TOOLTIP_RIEPILOGO = {
    speseVive: 'SPESE VIVE OPERATIVE\n' +
        'Include: utenze, pulizie, manutenzione, commissioni piattaforme, biancheria, ecc.\n' +
        'In Cedolare Secca queste spese NON sono deducibili fiscalmente, ma escono comunque dal lordo. In IRPEF sono deducibili al 100%.',
    tasseTotali: 'TASSE TOTALI NUCLEO FAMILIARE\n' +
        'Calcolo: Tasse Madre + Imposta Figlio + INPS Figlio.\n' +
        'Somma di tutti gli oneri fiscali e previdenziali che la famiglia paga complessivamente allo Stato.',
    nettoFamiglia: 'NETTO DISPONIBILE FAMIGLIA\n' +
        'Calcolo: Netto Madre + Netto Figlio.\n' +
        'Liquidità complessiva disponibile per il nucleo familiare dopo tutte le tasse, contributi e spese operative.',
};

const TOOLTIP_STRATEGIA = {
    scenario1: '⚖️ STRATEGIA FISCALE — MANDATO CON RAPPRESENTANZA\n\n' +
        'Idea di base: La madre sceglie l\'IRPEF ordinaria (anziché la Cedolare Secca) perché in IRPEF può DEDURRE il compenso pagato al figlio e le spese vive. ' +
        'Più alto è il compenso al figlio, più bassa diventa la base imponibile della madre.\n\n' +
        'Meccanismo: Il figlio opera come Property Manager con P.IVA forfettaria. La madre firma i contratti con i turisti (mandato con rappresentanza), incassa il lordo, e paga al figlio una fee di gestione.\n\n' +
        'Vantaggi: Il compenso al figlio "sposta" reddito dalla madre (tassata al 23-43% IRPEF) al figlio (tassato al 5% forfettario). Il risparmio fiscale familiare può essere significativo.\n\n' +
        'Rischio: Un compenso PM del 70% tra parenti è ALTAMENTE SOSPETTO per il Fisco. La media di mercato per un PM è 20-30%. L\'Agenzia delle Entrate potrebbe riqualificare l\'operazione come elusione fiscale, con sanzioni dal 100% al 200% dell\'imposta evasa.',

    scenario2: '⚖️ STRATEGIA FISCALE — SUBLOCAZIONE\n\n' +
        'Idea di base: La madre affitta l\'immobile al figlio con un canone fisso (es. 30.000 €/anno), e il figlio subaffitta ai turisti incassando tutto il lordo. La madre paga la Cedolare Secca 21% solo sul canone, tassazione bassa e certa.\n\n' +
        'Meccanismo: Esistono DUE contratti separati: (1) locazione madre→figlio a canone fisso, (2) sublocazioni figlio→turisti. Il rischio operativo è tutto sul figlio.\n\n' +
        'Problema Critico: Il figlio incassa direttamente 120.000 € dai turisti. Questo fa SUPERARE la soglia di 85.000 € del Forfettario, obbligandolo al Regime Semplificato con IRPEF ordinaria (aliquote 23-43%). Le tasse del figlio esplodono.\n\n' +
        'Rischio: Il Fisco potrebbe contestare il canone "di favore" tra parenti se è significativamente sotto il valore di mercato. Tuttavia il rischio è inferiore allo Scenario 1 perché la struttura contrattuale è più trasparente.',

    scenario3: '⚖️ STRATEGIA FISCALE — MANDATO MARKET STANDARD\n\n' +
        'Idea di base: Equilibrio tra ottimizzazione fiscale e sicurezza. La madre usa la Cedolare Secca 21% (tassazione fissa senza deduzioni), il figlio opera come PM con un compenso in linea con il mercato (20-30%).\n\n' +
        'Meccanismo: Come lo Scenario 1, ma con un compenso PM ragionevole. La madre firma i contratti, incassa il lordo, e paga al figlio il compenso. La differenza chiave è che la madre sceglie la Cedolare Secca (non l\'IRPEF) perché con un compenso PM basso non c\'è abbastanza da dedurre per giustificare l\'IRPEF.\n\n' +
        'Vantaggi: Rischio fiscale quasi nullo. Il compenso è congruente con il mercato, la struttura contrattuale è limpida. Il figlio resta nel Forfettario con tassazione molto bassa (5-15% su 86% dei ricavi).\n\n' +
        'Svantaggi: La madre paga il 21% sull\'intero incasso lordo (120k), senza poter dedurre nulla. Il netto familiare è inferiore allo Scenario 1, ma il risparmio reale è nella CERTEZZA di non ricevere un accertamento.',

    scenario4: '⚖️ STRATEGIA FISCALE — PERSONA FISICA (NO P.IVA MADRE)\n\n' +
        'Idea di base: La madre non ha P.IVA e dichiara il reddito come persona fisica. L\'IRPEF si calcola su Incasso Lordo × 95% (deduzione forfettaria del 5% per manutenzione ordinaria). Non può dedurre il compenso PM né le spese vive.\n\n' +
        'Meccanismo: La madre firma i contratti con i turisti, incassa il lordo, e paga al figlio una fee di gestione. La differenza con lo Scenario 1 è che la madre NON ha P.IVA, quindi i costi reali non sono fiscalmente deducibili.\n\n' +
        'Vantaggi: Struttura semplice, madre non deve aprire P.IVA né gestire contabilità. Il figlio opera regolarmente come PM forfettario.\n\n' +
        'Svantaggi: Il carico IRPEF sulla madre è molto alto perché la base imponibile è quasi tutto il lordo. Il netto familiare è il più basso di tutti gli scenari con mandato.',
};

