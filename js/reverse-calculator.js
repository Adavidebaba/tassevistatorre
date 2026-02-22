/**
 * reverse-calculator.js
 * Calcolo inverso: dato un "Netto Proprietaria Desiderato",
 * determina compenso PM o canone necessario in ogni scenario.
 */

class ReverseCalculator {

    /**
     * Scenario 1 (SRL — IRES + IRAP + Dividendi):
     * nettoDividendo = imponibile × fattoreNetto
     * → imponibile = nettoTarget / fattoreNetto
     * → compensoPM = incassoLordo - speseVive - imponibile
     */
    static calcolaCompensoPmScenario1(nettoTarget, incassoLordo, speseVive, srlCalc) {
        const imponibile = Math.round((nettoTarget / srlCalc.fattoreNetto()) * 100) / 100;
        const compensoPm = incassoLordo - speseVive - imponibile;
        return Math.max(0, Math.round(compensoPm * 100) / 100);
    }

    /**
     * Scenario 2 (Cedolare Secca 21% su canone):
     * nettoProprietaria = canone × (1 - 0.21) = canone × 0.79
     * → canone = nettoProprietaria / 0.79
     */
    static calcolaCanoneScenario2(nettoTarget) {
        const canone = nettoTarget / 0.79;
        return Math.max(0, Math.round(canone * 100) / 100);
    }

    /**
     * Scenario 3 (Cedolare Secca 21% su incasso con IVA):
     * incassoConIva = incassoLordo × (1 + ivaIncasso)
     * speseConIva = speseVive × (1 + ivaSpese)
     * nettoProprietaria = incassoConIva - compensoPM - speseConIva - (incassoConIva × 0.21)
     *            = incassoConIva × 0.79 - speseConIva - compensoPM
     * → compensoPM = incassoConIva × 0.79 - speseConIva - nettoProprietaria
     */
    static calcolaCompensoPmScenario3(nettoTarget, incassoLordo, speseVive, ivaIncasso = 0.10, ivaSpese = 0.22) {
        const incassoConIva = Math.round(incassoLordo * (1 + ivaIncasso) * 100) / 100;
        const speseConIva = Math.round(speseVive * (1 + ivaSpese) * 100) / 100;
        const compensoPm = incassoConIva * 0.79 - speseConIva - nettoTarget;
        return Math.max(0, Math.round(compensoPm * 100) / 100);
    }

    /**
     * Scenario 4 (IRPEF Proprietaria su lordo × 95%, NO deduzioni reali):
     * tasseProprietaria = irpef(incassoLordo × 0.95)  ← fisso, non dipende da PM
     * nettoProprietaria = incassoLordo - compensoPM - speseVive - tasseProprietaria
     * → compensoPM = incassoLordo - speseVive - tasseProprietaria - nettoProprietaria
     */
    static calcolaCompensoPmScenario4(nettoTarget, incassoLordo, speseVive, irpefCalc) {
        const baseImponibile = incassoLordo * 0.95;
        const tasseProprietaria = irpefCalc.calcola(baseImponibile);
        const compensoPm = incassoLordo - speseVive - tasseProprietaria - nettoTarget;
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
