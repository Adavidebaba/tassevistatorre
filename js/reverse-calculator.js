/**
 * reverse-calculator.js
 * Calcolo inverso: dato un "Netto Madre Desiderato",
 * determina compenso PM o canone necessario in ogni scenario.
 */

class ReverseCalculator {

    /**
     * Scenario 1 (IRPEF Madre):
     * nettoMadre = imponibile - irpef(imponibile)
     * → trova imponibile, poi compensoPM = incassoLordo - speseVive - imponibile
     */
    static calcolaCompensoPmScenario1(nettoTarget, incassoLordo, speseVive, irpefCalc) {
        const imponibile = ReverseCalculator.invertiIrpef(nettoTarget, irpefCalc);
        const compensoPm = incassoLordo - speseVive - imponibile;
        return Math.max(0, Math.round(compensoPm * 100) / 100);
    }

    /**
     * Scenario 2 (Cedolare Secca 21% su canone):
     * nettoMadre = canone × (1 - 0.21) = canone × 0.79
     * → canone = nettoMadre / 0.79
     */
    static calcolaCanoneScenario2(nettoTarget) {
        const canone = nettoTarget / 0.79;
        return Math.max(0, Math.round(canone * 100) / 100);
    }

    /**
     * Scenario 3 (Cedolare Secca 21% su incasso lordo):
     * nettoMadre = incassoLordo - compensoPM - speseVive - (incassoLordo × 0.21)
     *            = incassoLordo × 0.79 - speseVive - compensoPM
     * → compensoPM = incassoLordo × 0.79 - speseVive - nettoMadre
     */
    static calcolaCompensoPmScenario3(nettoTarget, incassoLordo, speseVive) {
        const compensoPm = incassoLordo * 0.79 - speseVive - nettoTarget;
        return Math.max(0, Math.round(compensoPm * 100) / 100);
    }

    /**
     * Scenario 4 (IRPEF Madre su lordo × 95%, NO deduzioni reali):
     * tasseMadre = irpef(incassoLordo × 0.95)  ← fisso, non dipende da PM
     * nettoMadre = incassoLordo - compensoPM - speseVive - tasseMadre
     * → compensoPM = incassoLordo - speseVive - tasseMadre - nettoMadre
     */
    static calcolaCompensoPmScenario4(nettoTarget, incassoLordo, speseVive, irpefCalc) {
        const baseImponibile = incassoLordo * 0.95;
        const tasseMadre = irpefCalc.calcola(baseImponibile);
        const compensoPm = incassoLordo - speseVive - tasseMadre - nettoTarget;
        return Math.max(0, Math.round(compensoPm * 100) / 100);
    }

    /**
     * Inversione analitica degli scaglioni IRPEF 2026.
     * Data la funzione: netto = imponibile - irpef(imponibile)
     * che è lineare a tratti, la inverte esattamente.
     */
    static invertiIrpef(nettoTarget, irpefCalc) {
        if (nettoTarget <= 0) return 0;

        const scaglioni = irpefCalc.scaglioni;
        let cumulatoImponibile = 0;
        let cumulatoNetto = 0;

        for (let i = 0; i < scaglioni.length; i++) {
            const limiteInferiore = i === 0 ? 0 : scaglioni[i - 1].limite;
            const limiteSuperiore = scaglioni[i].limite;
            const aliquotaNetta = 1 - scaglioni[i].aliquota;
            const fasciaImponibile = limiteSuperiore === Infinity
                ? Infinity
                : limiteSuperiore - limiteInferiore;
            const fasciaNetta = fasciaImponibile === Infinity
                ? Infinity
                : fasciaImponibile * aliquotaNetta;

            if (nettoTarget <= cumulatoNetto + fasciaNetta) {
                const deltaNetto = nettoTarget - cumulatoNetto;
                const deltaImponibile = deltaNetto / aliquotaNetta;
                return Math.round((cumulatoImponibile + deltaImponibile) * 100) / 100;
            }

            cumulatoImponibile += fasciaImponibile;
            cumulatoNetto += fasciaNetta;
        }

        return 0;
    }
}
