/**
 * app.js
 * Entry point: inizializza i calcolatori, collega gli input,
 * e gestisce l'aggiornamento live della dashboard.
 */

class DashboardApp {
    constructor() {
        this.inputs = {
            incassoLordo: document.getElementById('input-incasso'),
            speseVive: document.getElementById('input-spese'),
            nettoMadre: document.getElementById('input-netto-madre'),
            pctPmScenario1: document.getElementById('input-pct-pm1'),
            canoneSublocazione: document.getElementById('input-canone'),
            pctPmScenario3: document.getElementById('input-pct-pm3'),
            pctPmScenario4: document.getElementById('input-pct-pm4'),
            aliquotaForfettario: document.getElementById('input-aliquota-forf'),
        };

        this.displays = {
            pctPm1Value: document.getElementById('pct-pm1-value'),
            pctPm3Value: document.getElementById('pct-pm3-value'),
            pctPm4Value: document.getElementById('pct-pm4-value'),
        };

        this.renderer = new DashboardRenderer('scenari-container');
        this.chart = new BreakevenChart('breakeven-canvas');

        this.collegaEventi();
        this.aggiorna();
    }

    collegaEventi() {
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', () => this.aggiorna());
        });

        window.addEventListener('resize', () => this.disegnaGrafico());
    }

    leggiParametri() {
        const nettoMadreRaw = this.inputs.nettoMadre.value.trim();
        return {
            incassoLordo: parseFloat(this.inputs.incassoLordo.value) || 120000,
            speseVive: parseFloat(this.inputs.speseVive.value) || 15000,
            nettoMadreTarget: nettoMadreRaw !== '' ? parseFloat(nettoMadreRaw) : null,
            percentualePmScenario1: parseFloat(this.inputs.pctPmScenario1.value) / 100,
            canoneSublocazione: parseFloat(this.inputs.canoneSublocazione.value) || 30000,
            percentualePmScenario3: parseFloat(this.inputs.pctPmScenario3.value) / 100,
            percentualePmScenario4: parseFloat(this.inputs.pctPmScenario4.value) / 100,
            aliquotaForfettario: parseFloat(this.inputs.aliquotaForfettario.value) / 100,
        };
    }

    aggiorna() {
        const params = this.leggiParametri();
        this.calcolaERenderizza(params);
        this.aggiornaDisplays(params);
        this.disegnaGrafico(params);
        this.aggiornaSummary(params);
    }

    aggiornaDisplays(params) {
        const isInverso = !!params.nettoMadreTarget;

        this.inputs.pctPmScenario1.disabled = isInverso;
        this.inputs.canoneSublocazione.disabled = isInverso;
        this.inputs.pctPmScenario3.disabled = isInverso;
        this.inputs.pctPmScenario4.disabled = isInverso;

        this.inputs.pctPmScenario1.closest('.control-group').style.opacity = isInverso ? '0.4' : '1';
        this.inputs.canoneSublocazione.closest('.control-group').style.opacity = isInverso ? '0.4' : '1';
        this.inputs.pctPmScenario3.closest('.control-group').style.opacity = isInverso ? '0.4' : '1';
        this.inputs.pctPmScenario4.closest('.control-group').style.opacity = isInverso ? '0.4' : '1';

        if (isInverso && this.scenari) {
            const s1 = this.scenari[0];
            const s3 = this.scenari[2];
            const s4 = this.scenari[3];
            this.displays.pctPm1Value.textContent =
                `${Math.round((s1.compensoPmDerivato / params.incassoLordo) * 100)}% = ${this.euro(s1.compensoPmDerivato)} (calcolato)`;
            this.displays.pctPm3Value.textContent =
                `${Math.round((s3.compensoPmDerivato / params.incassoLordo) * 100)}% = ${this.euro(s3.compensoPmDerivato)} (calcolato)`;
            this.displays.pctPm4Value.textContent =
                `${Math.round((s4.compensoPmDerivato / params.incassoLordo) * 100)}% = ${this.euro(s4.compensoPmDerivato)} (calcolato)`;
        } else {
            this.displays.pctPm1Value.textContent =
                `${Math.round(params.percentualePmScenario1 * 100)}% = ${this.euro(params.incassoLordo * params.percentualePmScenario1)}`;
            this.displays.pctPm3Value.textContent =
                `${Math.round(params.percentualePmScenario3 * 100)}% = ${this.euro(params.incassoLordo * params.percentualePmScenario3)}`;
            this.displays.pctPm4Value.textContent =
                `${Math.round(params.percentualePmScenario4 * 100)}% = ${this.euro(params.incassoLordo * params.percentualePmScenario4)}`;
        }
    }

    calcolaERenderizza(params) {
        const engine = new ScenarioEngine(params);
        this.scenari = engine.calcolaTutti();
        this.renderer.renderScenari(this.scenari);
    }

    disegnaGrafico(params) {
        if (!params) params = this.leggiParametri();

        const bkCalc = new BreakevenCalculator({
            incassoLordo: params.incassoLordo,
            speseVive: params.speseVive,
            aliquotaForfettario: params.aliquotaForfettario || 0.05,
        });

        const dati = bkCalc.generaDatiGrafico(0.01);
        const breakevenPct = bkCalc.trovaBreakeven();

        this.chart.disegna(dati, breakevenPct);

        const infoEl = document.getElementById('breakeven-info');
        if (breakevenPct !== null) {
            infoEl.innerHTML = `Il punto di break-even è al <strong>${breakevenPct.toFixed(1)}%</strong> di compenso PM. ` +
                `Sopra questa soglia, l'IRPEF ordinaria per la madre diventa più conveniente della Cedolare Secca.`;
        } else {
            infoEl.innerHTML = `Con i parametri attuali, la Cedolare Secca rimane sempre più conveniente.`;
        }
    }

    aggiornaSummary() {
        if (!this.scenari) return;

        const migliore = this.scenari.reduce((best, s) =>
            s.nettoFamiglia > best.nettoFamiglia ? s : best
        );

        const summaryContainer = document.getElementById('summary-bar');
        summaryContainer.innerHTML = '';

        this.scenari.forEach(s => {
            const isBest = s === migliore;
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
        <div class="summary-label">${s.nome} — Netto Famiglia</div>
        <div class="summary-value" style="color: ${isBest ? 'var(--accent-green)' : 'var(--text-primary)'}">
          ${this.euro(s.nettoFamiglia)}
        </div>
        ${isBest ? '<span class="best-badge">✨ Più Conveniente</span>' : ''}
      `;
            summaryContainer.appendChild(item);
        });
    }

    euro(valore) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency', currency: 'EUR',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(valore);
    }
}

// ─── Avvio ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new DashboardApp();
    new TooltipManager();
});
