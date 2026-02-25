/**
 * tooltip-definitions.js
 * Definizioni dei tooltip per ogni voce della dashboard.
 * Ogni tooltip spiega: cosa è, come si calcola, motivazione fiscale.
 */

const TOOLTIP_PROPRIETARIA = {
    baseImponibile: {
        irpef: 'BASE IMPONIBILE IRPEF\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive deducibili.\n' +
            'In IRPEF ordinaria le spese e il compenso al gestore sono interamente deducibili, riducendo la base su cui si calcolano le tasse.',
        irpefForfettario: 'BASE IMPONIBILE IRPEF (DEDUZIONE FORFETTARIA)\n' +
            'Calcolo: Incasso Lordo × 95% (deduzione forfettaria del 5%).\n' +
            'Senza P.IVA la proprietaria NON può dedurre costi reali (compenso PM, spese vive). La legge concede solo una riduzione forfettaria del 5% per spese di manutenzione ordinaria.',
        srl: 'BASE IMPONIBILE SRL\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive.\n' +
            'La SRL con P.IVA deduce interamente il compenso al Property Manager e le spese operative. La base imponibile determina IRES e IRAP.',
        cedolarePiena: 'BASE IMPONIBILE CEDOLARE SECCA\n' +
            'Calcolo: Coincide con l\'intero Incasso Lordo annuo.\n' +
            'La Cedolare Secca è un\'imposta sostitutiva al 21%: si applica sul lordo incassato, senza possibilità di dedurre spese, compensi o costi di gestione.',
        cedolareCanone: 'BASE IMPONIBILE CEDOLARE SECCA\n' +
            'Calcolo: Coincide con il canone di locazione concordato.\n' +
            'La proprietaria percepisce solo il canone fisso dall\'affittuario. La Cedolare Secca 21% si applica su questo importo, senza deduzioni.',
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
        srl: 'TASSE TOTALI SRL\n' +
            'Calcolo: IRES (24%) + IRAP (3,9%) + Ritenuta Dividendi (26% sull\'utile netto).\n' +
            'La SRL paga IRES e IRAP sull\'utile. Quando distribuisce i dividendi alla socia, si applica la ritenuta del 26%.',
        cedolare: 'CEDOLARE SECCA 21%\n' +
            'Calcolo: Base Imponibile × 21%.\n' +
            'Imposta sostitutiva dell\'IRPEF per affitti brevi (<30 giorni). Aliquota fissa, nessuna deduzione. Conviene quando le spese sono basse rispetto al lordo.',
    },
    netto: {
        irpef: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM all\'Affittuario − Spese Vive − IRPEF.\n' +
            'È ciò che rimane effettivamente alla proprietaria dopo aver pagato il gestore, le spese operative e le tasse.',
        irpefForfettario: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive − IRPEF (su lordo×95%).\n' +
            'Compenso e spese escono dal cash flow ma NON riducono la base IRPEF. Il netto è quindi più basso rispetto allo scenario con P.IVA.',
        srl: 'NETTO IN TASCA ALLA PROPRIETARIA (DIVIDENDO)\n' +
            'Calcolo: Utile Netto SRL × (1 − 26% ritenuta dividendi).\n' +
            'Dopo che la SRL ha pagato IRES e IRAP, l\'utile viene distribuito alla socia come dividendo. La ritenuta del 26% è definitiva.',
        cedolarePiena: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Incasso Lordo − Compenso PM − Spese Vive − Cedolare Secca (su tutto il lordo).\n' +
            'Attenzione: la Cedolare si paga sull\'intero incasso, ma compenso e spese escono comunque dal lordo.',
        cedolareCanone: 'NETTO IN TASCA ALLA MADRE\n' +
            'Calcolo: Canone di Locazione − Cedolare Secca (21% del canone).\n' +
            'La proprietaria incassa solo il canone fisso e paga il 21% di cedolare. Non ha spese operative (a carico dell\'affittuario).',
    },
};

const TOOLTIP_AFFITTUARIO = {
    ricavi: {
        forfettario: 'RICAVI LORDI DEL FIGLIO\n' +
            'Corrisponde al compenso di Property Management ricevuto dalla proprietaria per la gestione dell\'immobile.',
        semplificato: 'RICAVI LORDI DEL FIGLIO\n' +
            'Corrisponde all\'intero incasso dai turisti. L\'affittuario subaffitta l\'immobile e incassa direttamente. Se supera 85.000 € esce dal Regime Forfettario.',
    },
    imponibile: {
        forfettario: 'IMPONIBILE FORFETTARIO\n' +
            'Calcolo: Ricavi × Coefficiente di Redditività (86% per ATECO 68.32.00).\n' +
            'Il Forfettario non ammette deduzioni analitiche: il reddito tassabile è determinato applicando un coefficiente fisso ai ricavi.',
        semplificato: 'IMPONIBILE REGIME SEMPLIFICATO\n' +
            'Calcolo: Ricavi dai turisti − Canone alla proprietaria − Spese Vive.\n' +
            'In regime semplificato le spese effettive sono deducibili, incluso il canone pagato alla proprietaria.',
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
            'L\'affittuario esce dal Forfettario perché i ricavi superano 85.000 €. Passa al Regime Semplificato con IRPEF ordinaria.',
    },
    inps: {
        forfettario: 'CONTRIBUTI INPS (GESTIONE SEPARATA)\n' +
            'Calcolo: Imponibile Forfettario × 26,07% (25% IVS + 1,07% tutele).\n\n' +
            'Il Property Manager (ATECO 68.32.00) è un libero professionista senza cassa dedicata → iscritto alla Gestione Separata INPS.\n\n' +
            'Differenze rispetto alla Gestione Commercianti:\n' +
            '• Nessun contributo fisso minimo (si paga solo sul reddito effettivo)\n' +
            '• NON esiste la riduzione del 35% (riservata solo a Commercianti/Artigiani forfettari)\n' +
            '• I contributi sono un costo aggiuntivo oltre all\'imposta sostitutiva.',
        semplificato: 'CONTRIBUTI INPS (GESTIONE COMMERCIANTI)\n' +
            'Calcolo: Imponibile × 24,48% (24% base + 0,48% indennizzo cessazione attività).\n\n' +
            'La sublocazione turistica è attività d\'impresa → iscrizione alla Gestione Commercianti INPS (non Gestione Separata).\n\n' +
            'Gestione Commercianti prevede:\n' +
            '• Contributo fisso minimo: ~4.611 €/anno (su reddito minimale 18.808 €), dovuto anche se il reddito è inferiore\n' +
            '• Aliquota 24,48% fino a 56.224 €, poi 25,48% sull\'eccedenza\n' +
            '• Riduzione 35%: disponibile SOLO per chi è nel Regime Forfettario\n\n' +
            'In questo scenario l\'affittuario supera 85.000 € di ricavi → esce dal Forfettario → NON può beneficiare della riduzione 35%.',
    },
    totaleTasse: 'TOTALE ONERI FISCALI FIGLIO\n' +
        'Calcolo: Imposta (sostitutiva o IRPEF) + Contributi INPS.\n' +
        'Rappresenta il carico fiscale complessivo dell\'affittuario, somma di tasse e contributi previdenziali.',
    netto: {
        forfettario: 'NETTO IN TASCA AL FIGLIO\n' +
            'Calcolo: Ricavi (compenso PM) − Imposta Sostitutiva − INPS.\n' +
            'Importo che l\'affittuario trattiene dopo aver pagato tasse e contributi. Non ci sono altre spese a suo carico.',
        semplificato: 'NETTO IN TASCA AL FIGLIO\n' +
            'Calcolo: Ricavi dai turisti − Canone alla proprietaria − Spese Vive − IRPEF − INPS.\n' +
            'Importo effettivo trattenuto dall\'affittuario dopo tutti i costi operativi e fiscali.',
    },
};

const TOOLTIP_RIEPILOGO = {
    speseVive: 'SPESE VIVE OPERATIVE\n' +
        'Include: utenze, pulizie, manutenzione, commissioni piattaforme, biancheria, ecc.\n' +
        'In Cedolare Secca queste spese NON sono deducibili fiscalmente, ma escono comunque dal lordo. In IRPEF sono deducibili al 100%.',
    tasseTotali: 'TASSE TOTALI NUCLEO FAMILIARE\n' +
        'Calcolo: Tasse Proprietaria + Imposta Figlio + INPS Figlio.\n' +
        'Somma di tutti gli oneri fiscali e previdenziali che la famiglia paga complessivamente allo Stato.',
    nettoFamiglia: 'NETTO DISPONIBILE FAMIGLIA\n' +
        'Calcolo: Netto Proprietaria + Netto Affittuario.\n' +
        'Liquidità complessiva disponibile per il nucleo familiare dopo tutte le tasse, contributi e spese operative.',
};

const TOOLTIP_STRATEGIA = {
    scenario1: '⚖️ STRATEGIA FISCALE — SRL CON MANDATO\n\n' +
        'Idea di base: La proprietaria opera tramite una SRL con P.IVA. La SRL incassa il lordo, paga il compenso al PM e le spese vive, e paga IRES (24%) e IRAP (3,9%) sull\'utile. L\'utile netto viene poi distribuito alla socia come dividendo, con ritenuta del 26%.\n\n' +
        'Meccanismo: L\'affittuario opera come Property Manager con P.IVA forfettaria. La SRL firma i contratti con i turisti (mandato con rappresentanza), incassa il lordo, e paga all\'affittuario una fee di gestione.\n\n' +
        'Vantaggi: La SRL può dedurre tutti i costi operativi. La tassazione combinata (IRES+IRAP+dividendi) su redditi medio-bassi può risultare vantaggiosa. Protezione patrimoniale della socia.\n\n' +
        'Rischio: Un compenso PM del 70% tra parenti è ALTAMENTE SOSPETTO per il Fisco. La media di mercato per un PM è 20-30%. L\'Agenzia delle Entrate potrebbe riqualificare l\'operazione come elusione fiscale, con sanzioni dal 100% al 200% dell\'imposta evasa.',

    scenario2: '⚖️ STRATEGIA FISCALE — SUBLOCAZIONE\n\n' +
        'Idea di base: La proprietaria affitta l\'immobile all\'affittuario con un canone fisso (es. 30.000 €/anno), e l\'affittuario subaffitta ai turisti incassando tutto il lordo. La proprietaria paga la Cedolare Secca 21% solo sul canone, tassazione bassa e certa.\n\n' +
        'Meccanismo: Esistono DUE contratti separati: (1) locazione proprietaria→affittuario a canone fisso, (2) sublocazioni figlio→turisti. Il rischio operativo è tutto sull\'affittuario.\n\n' +
        'Problema Critico: L\'affittuario incassa direttamente 120.000 € dai turisti. Questo fa SUPERARE la soglia di 85.000 € del Forfettario, obbligandolo al Regime Semplificato con IRPEF ordinaria (aliquote 23-43%). Le tasse dell\'affittuario esplodono.\n\n' +
        'Rischio: Il Fisco potrebbe contestare il canone "di favore" tra parenti se è significativamente sotto il valore di mercato. Tuttavia il rischio è inferiore allo Scenario 1 perché la struttura contrattuale è più trasparente.',

    scenario3: '⚖️ STRATEGIA FISCALE — MANDATO MARKET STANDARD\n\n' +
        'Idea di base: Equilibrio tra ottimizzazione fiscale e sicurezza. La proprietaria usa la Cedolare Secca 21% (tassazione fissa senza deduzioni), l\'affittuario opera come PM con un compenso in linea con il mercato (20-30%).\n\n' +
        'Meccanismo: Come lo Scenario 1, ma con un compenso PM ragionevole. La proprietaria firma i contratti, incassa il lordo, e paga all\'affittuario il compenso. La differenza chiave è che la proprietaria sceglie la Cedolare Secca (non l\'IRPEF) perché con un compenso PM basso non c\'è abbastanza da dedurre per giustificare l\'IRPEF.\n\n' +
        'Vantaggi: Rischio fiscale quasi nullo. Il compenso è congruente con il mercato, la struttura contrattuale è limpida. L\'affittuario resta nel Forfettario con tassazione molto bassa (5-15% su 86% dei ricavi).\n\n' +
        'Svantaggi: La proprietaria paga il 21% sull\'intero incasso lordo (120k), senza poter dedurre nulla. Il netto familiare è inferiore allo Scenario 1, ma il risparmio reale è nella CERTEZZA di non ricevere un accertamento.',

    scenario4: '⚖️ STRATEGIA FISCALE — PERSONA FISICA (NO P.IVA MADRE)\n\n' +
        'Idea di base: La proprietaria non ha P.IVA e dichiara il reddito come persona fisica. L\'IRPEF si calcola su Incasso Lordo × 95% (deduzione forfettaria del 5% per manutenzione ordinaria). Non può dedurre il compenso PM né le spese vive.\n\n' +
        'Meccanismo: La proprietaria firma i contratti con i turisti, incassa il lordo, e paga all\'affittuario una fee di gestione. La differenza con lo Scenario 1 è che la proprietaria NON ha P.IVA, quindi i costi reali non sono fiscalmente deducibili.\n\n' +
        'Vantaggi: Struttura semplice, madre non deve aprire P.IVA né gestire contabilità. L\'affittuario opera regolarmente come PM forfettario.\n\n' +
        'Svantaggi: Il carico IRPEF sulla proprietaria è molto alto perché la base imponibile è quasi tutto il lordo. Il netto familiare è il più basso di tutti gli scenari con mandato.',
};

