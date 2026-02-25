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
        this.aliquotaInpsGestSep = 0.2607;
        this.aliquotaInpsComm = 0.2448;
        this.ivaIncasso = 0.10;
        this.ivaSpese = 0.22;

        this.srl = new SrlCalculator();
        this.irpef = new IrpefCalculator();
        this.cedolare = new CedolareCalculator(0.21);
    }

    calcolaTasseForfettario(compensoPm) {
        const imponibile = compensoPm * this.coeffRedditivita;
        const imposta = imponibile * this.aliquotaForfettario;
        const inps = imponibile * this.aliquotaInpsGestSep;
        return imposta + inps;
    }

    nettoForfettario(compensoPm) {
        return compensoPm - this.calcolaTasseForfettario(compensoPm);
    }

    calcolaScenario1(pct) {
        const compensoPm = this.incassoLordo * pct;
        const imponibileSrl = Math.max(0, this.incassoLordo - compensoPm - this.speseVive);
        const srl = this.srl.calcola(imponibileSrl);
        const tasse = srl.tasseTotali + this.calcolaTasseForfettario(compensoPm);
        const nettoAff = this.nettoForfettario(compensoPm);
        return { tasse, nettoAff };
    }

    calcolaScenario2(pct) {
        const canone = this.incassoLordo * pct;
        const incassoConIva = this.incassoLordo * (1 + this.ivaIncasso);
        const speseConIva = this.speseVive * (1 + this.ivaSpese);
        const tasseProprietaria = canone * 0.21;
        const imponibileAff = Math.max(0, incassoConIva - canone - speseConIva);
        const tasseAffIrpef = this.irpef.calcola(imponibileAff);
        const inpsAff = Math.round(imponibileAff * this.aliquotaInpsComm * 100) / 100;
        const tasse = tasseProprietaria + tasseAffIrpef + inpsAff;
        const nettoAff = incassoConIva - canone - speseConIva - tasseAffIrpef - inpsAff;
        return { tasse, nettoAff };
    }

    calcolaScenario3(pct) {
        const compensoPm = this.incassoLordo * pct;
        const incassoConIva = this.incassoLordo * (1 + this.ivaIncasso);
        const tasseProprietaria = this.cedolare.calcola(incassoConIva);
        const tasse = tasseProprietaria + this.calcolaTasseForfettario(compensoPm);
        const nettoAff = this.nettoForfettario(compensoPm);
        return { tasse, nettoAff };
    }

    calcolaScenario4(pct) {
        const compensoPm = this.incassoLordo * pct;
        const baseImponibile = this.incassoLordo * 0.95;
        const tasseProprietaria = this.irpef.calcola(baseImponibile);
        const tasse = tasseProprietaria + this.calcolaTasseForfettario(compensoPm);
        const nettoAff = this.nettoForfettario(compensoPm);
        return { tasse, nettoAff };
    }

    /**
     * Per una data %, restituisce tasse e netto affittuario per ogni scenario.
     */
    calcolaPerPercentuale(percentualePm) {
        const s1 = this.calcolaScenario1(percentualePm);
        const s2 = this.calcolaScenario2(percentualePm);
        const s3 = this.calcolaScenario3(percentualePm);
        const s4 = this.calcolaScenario4(percentualePm);
        return {
            percentuale: percentualePm,
            totaleSrl: s1.tasse,
            totaleSublocazione: s2.tasse,
            totaleCedolareMandato: s3.tasse,
            totalePersonaFisica: s4.tasse,
            nettoAffSrl: s1.nettoAff,
            nettoAffSublocazione: s2.nettoAff,
            nettoAffCedolareMandato: s3.nettoAff,
            nettoAffPersonaFisica: s4.nettoAff,
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
