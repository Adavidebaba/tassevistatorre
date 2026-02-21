/**
 * dashboard-renderer.js
 * Renderizza la tabella scenari e il grafico break-even su canvas.
 */

// ─── Dashboard Renderer ─────────────────────────────────────────────
class DashboardRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    renderScenari(scenari) {
        this.container.innerHTML = '';
        scenari.forEach(scenario => {
            this.container.appendChild(this.creaCardScenario(scenario));
        });
    }

    creaCardScenario(scenario) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        const tooltips = this.getTooltipsPerScenario(scenario);

        const riskClass = scenario.rischio === 'ALTO' ? 'risk-alto'
            : scenario.rischio === 'MEDIO' ? 'risk-medio' : 'risk-basso';

        const strategiaKey = scenario.nome.replace('Scenario ', 'scenario');
        const strategiaTooltip = TOOLTIP_STRATEGIA[strategiaKey] || '';
        const strategiaIcon = strategiaTooltip ? this.renderTooltipIcon(strategiaTooltip) : '';

        card.innerHTML = `
      <div class="scenario-header">
        <div>
          <span class="scenario-label">${scenario.nome}</span>
          <h3>${scenario.titolo} ${strategiaIcon}</h3>
        </div>
        <span class="risk-badge ${riskClass}">⚡ ${scenario.rischio}</span>
      </div>
      <div class="scenario-body">
        ${this.renderSezione('👩 Madre — ' + scenario.madre.regime, [
            { label: 'Base Imponibile', value: this.euro(scenario.madre.baseImponibile), tooltip: tooltips.madre.baseImponibile },
            { label: 'Tasse', value: this.euro(scenario.madre.tasse), tooltip: tooltips.madre.tasse },
            { label: '💶 Netto Madre', value: this.euro(scenario.madre.netto), evidenziato: true, colore: '#38bdf8', tooltip: tooltips.madre.netto },
        ], scenario.madre.note)}

        ${this.renderSezioneFiglio(scenario, tooltips)}

        ${this.renderRiepilogo(scenario)}
      </div>
    `;
        return card;
    }

    renderSezioneFiglio(scenario, tooltips) {
        const f = scenario.figlio;
        const labelImposta = f.labelImposta || 'Imposta';
        const deduzioniTooltip = f.deduzioniDettaglio
            ? 'DEDUZIONI FIGLIO\nCalcolo: ' + f.deduzioniDettaglio + '.\nIn regime semplificato (IRPEF) le spese operative e il canone alla madre sono deducibili al 100%, riducendo la base imponibile.'
            : null;

        const righe = [
            { label: 'Ricavi', value: this.euro(f.ricavi), tooltip: tooltips.figlio.ricavi },
        ];

        if (f.deduzioni !== null && f.deduzioni !== undefined) {
            righe.push({ label: '➖ Deduzioni', value: '- ' + this.euro(f.deduzioni), tooltip: deduzioniTooltip });
        }

        righe.push(
            { label: 'Imponibile', value: this.euro(f.imponibile), tooltip: tooltips.figlio.imponibile },
            { label: labelImposta, value: this.euro(f.imposta), tooltip: tooltips.figlio.imposta },
            { label: 'INPS', value: this.euro(f.inps), tooltip: tooltips.figlio.inps },
            { label: 'Totale Tasse Figlio', value: this.euro(f.totaleTasse), tooltip: TOOLTIP_FIGLIO.totaleTasse },
            { label: '💶 Netto Figlio', value: this.euro(f.netto), evidenziato: true, colore: '#38bdf8', tooltip: tooltips.figlio.netto },
        );

        return this.renderSezione('👨 Figlio — ' + f.regime, righe, f.note || '');
    }

    getTooltipsPerScenario(scenario) {
        const isCedolare = scenario.madre.regime.includes('Cedolare');
        const isSublocazione = scenario.titolo.includes('Sublocazione');
        const isForfettario = scenario.figlio.regime.includes('Forfettario');
        const is5pct = scenario.figlio.regime.includes('5%');
        const isIrpefForfettario = scenario.madre.regime.includes('Forfettaria');

        let madreBaseImponibile, madreTasse, madreNetto;
        if (isCedolare) {
            madreBaseImponibile = isSublocazione ? TOOLTIP_MADRE.baseImponibile.cedolareCanone : TOOLTIP_MADRE.baseImponibile.cedolarePiena;
            madreTasse = TOOLTIP_MADRE.tasse.cedolare;
            madreNetto = isSublocazione ? TOOLTIP_MADRE.netto.cedolareCanone : TOOLTIP_MADRE.netto.cedolarePiena;
        } else if (isIrpefForfettario) {
            madreBaseImponibile = TOOLTIP_MADRE.baseImponibile.irpefForfettario;
            madreTasse = TOOLTIP_MADRE.tasse.irpefForfettario;
            madreNetto = TOOLTIP_MADRE.netto.irpefForfettario;
        } else {
            madreBaseImponibile = TOOLTIP_MADRE.baseImponibile.irpef;
            madreTasse = TOOLTIP_MADRE.tasse.irpef;
            madreNetto = TOOLTIP_MADRE.netto.irpef;
        }

        return {
            madre: {
                baseImponibile: madreBaseImponibile,
                tasse: madreTasse,
                netto: madreNetto,
            },
            figlio: {
                ricavi: isForfettario ? TOOLTIP_FIGLIO.ricavi.forfettario : TOOLTIP_FIGLIO.ricavi.semplificato,
                imponibile: isForfettario ? TOOLTIP_FIGLIO.imponibile.forfettario : TOOLTIP_FIGLIO.imponibile.semplificato,
                imposta: isForfettario
                    ? (is5pct ? TOOLTIP_FIGLIO.imposta.forfettario5 : TOOLTIP_FIGLIO.imposta.forfettario15)
                    : TOOLTIP_FIGLIO.imposta.irpef,
                inps: isForfettario ? TOOLTIP_FIGLIO.inps.forfettario : TOOLTIP_FIGLIO.inps.semplificato,
                netto: isForfettario ? TOOLTIP_FIGLIO.netto.forfettario : TOOLTIP_FIGLIO.netto.semplificato,
            },
        };
    }

    renderSezione(titolo, righe, nota) {
        let html = `<div class="data-section">
      <div class="data-section-title">${titolo}</div>`;
        righe.forEach(r => {
            const tooltipHtml = r.tooltip ? this.renderTooltipIcon(r.tooltip) : '';
            if (r.evidenziato) {
                html += `<div class="data-row highlight">
        <span class="label">${r.label} ${tooltipHtml}</span>
        <span class="value" style="color: ${r.colore || 'var(--accent-blue)'}; font-size: 1.05rem">${r.value}</span>
      </div>`;
            } else {
                html += `<div class="data-row">
        <span class="label">${r.label} ${tooltipHtml}</span>
        <span class="value">${r.value}</span>
      </div>`;
            }
        });
        if (nota) {
            html += `<div class="risk-note">ℹ️ ${nota}</div>`;
        }
        html += `</div>`;
        return html;
    }

    renderTooltipIcon(testo) {
        const escaped = testo.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
        return `<span class="tooltip-trigger" data-tooltip="${escaped}">ℹ️</span>`;
    }

    renderRiepilogo(scenario) {
        return `
      <div class="data-section">
        <div class="data-section-title">📊 Riepilogo Famiglia</div>
        <div class="data-row">
          <span class="label">Spese Vive ${this.renderTooltipIcon(TOOLTIP_RIEPILOGO.speseVive)}</span>
          <span class="value">${this.euro(scenario.speseVive)}</span>
        </div>
        <div class="data-row highlight">
          <span class="label">💰 Tasse Totali Famiglia ${this.renderTooltipIcon(TOOLTIP_RIEPILOGO.tasseTotali)}</span>
          <span class="value" style="color: var(--accent-red)">${this.euro(scenario.tasseTotaliFamiglia)}</span>
        </div>
        <div class="data-row highlight">
          <span class="label">✅ Netto Famiglia ${this.renderTooltipIcon(TOOLTIP_RIEPILOGO.nettoFamiglia)}</span>
          <span class="value" style="color: var(--accent-green)">${this.euro(scenario.nettoFamiglia)}</span>
        </div>
        <div class="risk-note" style="color: ${scenario.rischioColore}">
          ⚠️ ${scenario.rischioMotivo}
        </div>
      </div>
    `;
    }

    euro(valore) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency', currency: 'EUR',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(valore);
    }
}

// ─── Break-Even Chart (Canvas nativo) ────────────────────────────────
class BreakevenChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.padding = { top: 40, right: 30, bottom: 55, left: 75 };
    }

    disegna(datiGrafico, breakevenPct) {
        this.setupCanvas();
        const { width, height } = this.getAreaDisegno();

        const maxY = this.calcolaMaxY(datiGrafico);
        const minY = this.calcolaMinY(datiGrafico);
        const rangeY = maxY - minY;

        this.disegnaGriglia(width, height, minY, maxY);
        this.disegnaLinea(datiGrafico, 'totaleIrpef', '#6366f1', width, height, minY, rangeY);
        this.disegnaLinea(datiGrafico, 'totaleCedolare', '#a855f7', width, height, minY, rangeY);

        if (breakevenPct !== null) {
            this.disegnaBreakeven(breakevenPct, width, height);
        }

        this.disegnaLegenda(width);
    }

    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    getAreaDisegno() {
        return {
            width: this.displayWidth - this.padding.left - this.padding.right,
            height: this.displayHeight - this.padding.top - this.padding.bottom,
        };
    }

    calcolaMaxY(dati) {
        let max = 0;
        dati.forEach(d => {
            max = Math.max(max, d.totaleIrpef, d.totaleCedolare);
        });
        return Math.ceil(max / 5000) * 5000;
    }

    calcolaMinY(dati) {
        let min = Infinity;
        dati.forEach(d => {
            min = Math.min(min, d.totaleIrpef, d.totaleCedolare);
        });
        return Math.max(0, Math.floor(min / 5000) * 5000);
    }

    disegnaGriglia(w, h, minY, maxY) {
        const ctx = this.ctx;
        const steps = 6;
        const stepVal = (maxY - minY) / steps;

        ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

        for (let i = 0; i <= steps; i++) {
            const y = this.padding.top + h - (i / steps) * h;
            const val = minY + i * stepVal;

            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.padding.left, y);
            ctx.lineTo(this.padding.left + w, y);
            ctx.stroke();

            ctx.fillStyle = '#6a6a80';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(this.euroCompatto(val), this.padding.left - 10, y + 4);
        }

        // Asse X
        for (let i = 0; i <= 10; i++) {
            const x = this.padding.left + (i / 10) * w;
            ctx.fillStyle = '#6a6a80';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText((i * 10) + '%', x, this.padding.top + h + 25);
        }

        // Label assi
        ctx.fillStyle = '#9a9ab0';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('% Compenso PM al Figlio', this.padding.left + w / 2, this.displayHeight - 5);
    }

    disegnaLinea(dati, campo, colore, w, h, minY, rangeY) {
        const ctx = this.ctx;
        ctx.strokeStyle = colore;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        dati.forEach((d, i) => {
            const x = this.padding.left + (d.percentuale * w);
            const y = this.padding.top + h - ((d[campo] - minY) / rangeY) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Area glow
        const gradient = ctx.createLinearGradient(0, this.padding.top, 0, this.padding.top + h);
        gradient.addColorStop(0, colore + '20');
        gradient.addColorStop(1, colore + '00');
        ctx.lineTo(this.padding.left + w, this.padding.top + h);
        ctx.lineTo(this.padding.left, this.padding.top + h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    disegnaBreakeven(pct, w, h) {
        const ctx = this.ctx;
        const x = this.padding.left + (pct / 100) * w;

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(x, this.padding.top);
        ctx.lineTo(x, this.padding.top + h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Break-even', x, this.padding.top - 18);
        ctx.fillText(pct.toFixed(1) + '%', x, this.padding.top - 5);
    }

    disegnaLegenda(w) {
        const ctx = this.ctx;
        const startX = this.padding.left + w / 2 - 150;
        const y = this.displayHeight - 38;

        const items = [
            { label: 'IRPEF Madre + Forfettario Figlio', color: '#6366f1' },
            { label: 'Cedolare Madre + Forfettario Figlio', color: '#a855f7' },
        ];

        items.forEach((item, i) => {
            const x = startX + i * 220;
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y - 5, 14, 14);
            ctx.fillStyle = '#9a9ab0';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x + 20, y + 6);
        });
    }

    euroCompatto(val) {
        if (val >= 1000) return (val / 1000).toFixed(0) + 'k €';
        return val + ' €';
    }
}
