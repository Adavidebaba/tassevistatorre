/**
 * breakeven-calculator.js
 * Calcola le tasse totali famiglia per tutti e 4 gli scenari
 * al variare della % di compenso PM all'affittuario.
 */

class BreakevenCalculator {
    constructor(params) {
        this.incassoLordo = params.incassoLordo || 120000;
        this.speseVive = params.speseVive || 15000;
        this.aliquotaForfettario = params.aliquotaForfettario || 0.05;
        this.coeffRedditivita = 0.86;
        this.aliquotaInps = 0.2607;
        this.ivaIncasso = 0.10;
        this.ivaSpese = 0.22;

        this.srl = new SrlCalculator();
        this.irpef = new IrpefCalculator();
        this.cedolare = new CedolareCalculator(0.21);
    }

    calcolaTasseForfettario(compensoPm) {
        const imponibile = compensoPm * this.coeffRedditivita;
        const imposta = imponibile * this.aliquotaForfettario;
        const inps = imponibile * this.aliquotaInps;
        return imposta + inps;
    }

    calcolaScenario1(pct) {
        const compensoPm = this.incassoLordo * pct;
        const imponibileSrl = Math.max(0, this.incassoLordo - compensoPm - this.speseVive);
        const srl = this.srl.calcola(imponibileSrl);
        return srl.tasseTotali + this.calcolaTasseForfettario(compensoPm);
    }

    calcolaScenario2(pct) {
        const canone = this.incassoLordo * pct;
        const incassoConIva = this.incassoLordo * (1 + this.ivaIncasso);
        const speseConIva = this.speseVive * (1 + this.ivaSpese);
        const tasseProprietaria = canone * 0.21;
        const imponibileAff = Math.max(0, incassoConIva - canone - speseConIva);
        const tasseAffIrpef = this.irpef.calcola(imponibileAff);
        const inpsAff = Math.round(imponibileAff * this.aliquotaInps * 100) / 100;
        return tasseProprietaria + tasseAffIrpef + inpsAff;
    }

    calcolaScenario3(pct) {
        const compensoPm = this.incassoLordo * pct;
        const incassoConIva = this.incassoLordo * (1 + this.ivaIncasso);
        const tasseProprietaria = this.cedolare.calcola(incassoConIva);
        return tasseProprietaria + this.calcolaTasseForfettario(compensoPm);
    }

    calcolaScenario4(pct) {
        const compensoPm = this.incassoLordo * pct;
        const baseImponibile = this.incassoLordo * 0.95;
        const tasseProprietaria = this.irpef.calcola(baseImponibile);
        return tasseProprietaria + this.calcolaTasseForfettario(compensoPm);
    }

    /**
     * Per una data %, restituisce le tasse totali famiglia per ogni scenario.
     */
    calcolaPerPercentuale(percentualePm) {
        return {
            percentuale: percentualePm,
            totaleSrl: this.calcolaScenario1(percentualePm),
            totaleSublocazione: this.calcolaScenario2(percentualePm),
            totaleCedolareMandato: this.calcolaScenario3(percentualePm),
            totalePersonaFisica: this.calcolaScenario4(percentualePm),
        };
    }

    /**
     * Genera i dati per il grafico dal 0% al 100%.
     */
    generaDatiGrafico(stepPercentuale = 0.01) {
        const dati = [];
        for (let p = 0; p <= 1.001; p += stepPercentuale) {
            const pct = Math.round(p * 100) / 100;
            dati.push(this.calcolaPerPercentuale(pct));
        }
        return dati;
    }

    /**
     * Trova lo scenario più conveniente per una data percentuale.
     */
    trovaMigliore(percentualePm) {
        const d = this.calcolaPerPercentuale(percentualePm);
        const scenari = [
            { nome: 'Scenario 1 (SRL)', tasse: d.totaleSrl },
            { nome: 'Scenario 2 (Sublocazione)', tasse: d.totaleSublocazione },
            { nome: 'Scenario 3 (Cedolare+Mandato)', tasse: d.totaleCedolareMandato },
            { nome: 'Scenario 4 (Persona Fisica)', tasse: d.totalePersonaFisica },
        ];
        return scenari.reduce((best, s) => s.tasse < best.tasse ? s : best);
    }
}
