/**
 * breakeven-calculator.js
 * Calcola il punto di break-even: la % di compenso al figlio
 * al quale l'IRPEF della madre diventa più vantaggiosa della Cedolare Secca.
 */

class BreakevenCalculator {
    constructor(params) {
        this.incassoLordo = params.incassoLordo || 120000;
        this.speseVive = params.speseVive || 15000;
        this.aliquotaForfettario = params.aliquotaForfettario || 0.05;
        this.coeffRedditivita = 0.86;
        this.aliquotaInps = 0.2607;

        this.irpef = new IrpefCalculator();
        this.cedolare = new CedolareCalculator(0.21);
    }

    /**
     * Per una data percentuale di compenso PM, calcola il carico fiscale
     * familiare sia in regime IRPEF (madre) che Cedolare Secca (madre).
     */
    calcolaPerPercentuale(percentualePm) {
        const compensoPm = this.incassoLordo * percentualePm;
        const imponibileForfettario = compensoPm * this.coeffRedditivita;
        const impostaFiglio = imponibileForfettario * this.aliquotaForfettario;
        const inpsFiglio = imponibileForfettario * this.aliquotaInps;
        const tasseFiglio = impostaFiglio + inpsFiglio;

        // Opzione A: Madre in IRPEF (può dedurre compenso + spese)
        const imponibileMadreIrpef = Math.max(0, this.incassoLordo - compensoPm - this.speseVive);
        const tasseMadreIrpef = this.irpef.calcola(imponibileMadreIrpef);
        const totaleIrpef = tasseMadreIrpef + tasseFiglio;

        // Opzione B: Madre in Cedolare Secca (nessuna deduzione)
        const tasseMadreCedolare = this.cedolare.calcola(this.incassoLordo);
        const totaleCedolare = tasseMadreCedolare + tasseFiglio;

        return {
            percentuale: percentualePm,
            compensoPm,
            totaleIrpef,
            totaleCedolare,
            differenza: totaleCedolare - totaleIrpef,
            irpefConveniente: totaleIrpef < totaleCedolare,
        };
    }

    /**
     * Genera i dati per il grafico break-even dal 0% al 100%.
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
     * Trova la percentuale di break-even (dove IRPEF = Cedolare).
     */
    trovaBreakeven() {
        const dati = this.generaDatiGrafico(0.001);
        let breakeven = null;

        for (let i = 1; i < dati.length; i++) {
            const prev = dati[i - 1];
            const curr = dati[i];

            if (prev.differenza <= 0 && curr.differenza > 0) {
                // Interpolazione lineare
                const ratio = Math.abs(prev.differenza) / (Math.abs(prev.differenza) + Math.abs(curr.differenza));
                breakeven = prev.percentuale + ratio * (curr.percentuale - prev.percentuale);
                break;
            }
        }

        return breakeven !== null ? Math.round(breakeven * 10000) / 100 : null;
    }
}
