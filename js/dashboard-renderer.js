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
      ${this.renderSezioneProprietaria(scenario, tooltips)}

        ${this.renderSezioneAffittuario(scenario, tooltips)}

        ${this.renderRiepilogo(scenario)}
      </div>
    `;
        return card;
    }

    renderSezioneAffittuario(scenario, tooltips) {
        const f = scenario.affittuario;
        const labelImposta = f.labelImposta || 'Imposta';
        const deduzioniTooltip = f.deduzioniDettaglio
            ? 'DEDUZIONI FIGLIO\nCalcolo: ' + f.deduzioniDettaglio + '.\nIn regime semplificato (IRPEF) le spese operative e il canone alla proprietaria sono deducibili al 100%, riducendo la base imponibile.'
            : null;

        const righe = [
            { label: 'Ricavi', value: this.euro(f.ricavi), tooltip: tooltips.affittuario.ricavi },
        ];

        if (f.deduzioni !== null && f.deduzioni !== undefined) {
            righe.push({ label: '➖ Deduzioni', value: '- ' + this.euro(f.deduzioni), tooltip: deduzioniTooltip });
        }

        righe.push(
            { label: 'Imponibile', value: this.euro(f.imponibile), tooltip: tooltips.affittuario.imponibile },
            { label: labelImposta, value: this.euro(f.imposta), tooltip: tooltips.affittuario.imposta },
            { label: 'INPS', value: this.euro(f.inps), tooltip: tooltips.affittuario.inps },
            { label: 'Totale Tasse Affittuario', value: this.euro(f.totaleTasse), tooltip: TOOLTIP_AFFITTUARIO.totaleTasse },
            { label: '💶 Netto Affittuario', value: this.euro(f.netto), evidenziato: true, colore: '#38bdf8', tooltip: tooltips.affittuario.netto },
        );

        return this.renderSezione('👨 Affittuario — ' + f.regime, righe, f.note || '');
    }

    renderSezioneProprietaria(scenario, tooltips) {
        const p = scenario.proprietaria;
        const isSrl = p.regime.includes('SRL');
        const righe = [
            { label: 'Base Imponibile', value: this.euro(p.baseImponibile), tooltip: tooltips.proprietaria.baseImponibile },
        ];

        if (isSrl) {
            righe.push(
                { label: 'IRES (24%)', value: this.euro(p.ires) },
                { label: 'IRAP (3,9%)', value: this.euro(p.irap) },
                { label: 'Utile Netto SRL', value: this.euro(p.utileNetto) },
                { label: 'Ritenuta Dividendi (26%)', value: this.euro(p.ritenutaDividendi) },
            );
        }

        righe.push(
            { label: isSrl ? 'Totale Tasse (IRES+IRAP+Div.)' : 'Tasse', value: this.euro(p.tasse), tooltip: tooltips.proprietaria.tasse },
            { label: '💶 Netto Proprietaria', value: this.euro(p.netto), evidenziato: true, colore: '#38bdf8', tooltip: tooltips.proprietaria.netto },
        );

        return this.renderSezione('👩 Proprietaria — ' + p.regime, righe, p.note);
    }

    getTooltipsPerScenario(scenario) {
        const isCedolare = scenario.proprietaria.regime.includes('Cedolare');
        const isSublocazione = scenario.titolo.includes('Sublocazione');
        const isForfettario = scenario.affittuario.regime.includes('Forfettario');
        const is5pct = scenario.affittuario.regime.includes('5%');
        const isIrpefForfettario = scenario.proprietaria.regime.includes('Forfettaria');
        const isSrl = scenario.proprietaria.regime.includes('SRL');

        let proprietariaBaseImponibile, proprietariaTasse, proprietariaNetto;
        if (isSrl) {
            proprietariaBaseImponibile = TOOLTIP_PROPRIETARIA.baseImponibile.srl;
            proprietariaTasse = TOOLTIP_PROPRIETARIA.tasse.srl;
            proprietariaNetto = TOOLTIP_PROPRIETARIA.netto.srl;
        } else if (isCedolare) {
            proprietariaBaseImponibile = isSublocazione ? TOOLTIP_PROPRIETARIA.baseImponibile.cedolareCanone : TOOLTIP_PROPRIETARIA.baseImponibile.cedolarePiena;
            proprietariaTasse = TOOLTIP_PROPRIETARIA.tasse.cedolare;
            proprietariaNetto = isSublocazione ? TOOLTIP_PROPRIETARIA.netto.cedolareCanone : TOOLTIP_PROPRIETARIA.netto.cedolarePiena;
        } else if (isIrpefForfettario) {
            proprietariaBaseImponibile = TOOLTIP_PROPRIETARIA.baseImponibile.irpefForfettario;
            proprietariaTasse = TOOLTIP_PROPRIETARIA.tasse.irpefForfettario;
            proprietariaNetto = TOOLTIP_PROPRIETARIA.netto.irpefForfettario;
        } else {
            proprietariaBaseImponibile = TOOLTIP_PROPRIETARIA.baseImponibile.irpef;
            proprietariaTasse = TOOLTIP_PROPRIETARIA.tasse.irpef;
            proprietariaNetto = TOOLTIP_PROPRIETARIA.netto.irpef;
        }

        return {
            proprietaria: {
                baseImponibile: proprietariaBaseImponibile,
                tasse: proprietariaTasse,
                netto: proprietariaNetto,
            },
            affittuario: {
                ricavi: isForfettario ? TOOLTIP_AFFITTUARIO.ricavi.forfettario : TOOLTIP_AFFITTUARIO.ricavi.semplificato,
                imponibile: isForfettario ? TOOLTIP_AFFITTUARIO.imponibile.forfettario : TOOLTIP_AFFITTUARIO.imponibile.semplificato,
                imposta: isForfettario
                    ? (is5pct ? TOOLTIP_AFFITTUARIO.imposta.forfettario5 : TOOLTIP_AFFITTUARIO.imposta.forfettario15)
                    : TOOLTIP_AFFITTUARIO.imposta.irpef,
                inps: isForfettario ? TOOLTIP_AFFITTUARIO.inps.forfettario : TOOLTIP_AFFITTUARIO.inps.semplificato,
                netto: isForfettario ? TOOLTIP_AFFITTUARIO.netto.forfettario : TOOLTIP_AFFITTUARIO.netto.semplificato,
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
        const ivaRows = scenario.incassoConIva ? `
        <div class="data-row">
          <span class="label">📥 Incasso Effettivo (IVA 10% incl.) ${this.renderTooltipIcon('La proprietaria non ha P.IVA, quindi l\'IVA 10% sugli affitti turistici che incassa non viene versata. Diventa un guadagno aggiuntivo.')}</span>
          <span class="value">${this.euro(scenario.incassoConIva)}</span>
        </div>
        <div class="data-row">
          <span class="label">📤 Spese Effettive (IVA 22% incl.) ${this.renderTooltipIcon('Senza P.IVA, la proprietaria non può detrarre l\'IVA 22% sulle spese. Il costo reale è maggiorato del 22%.')}</span>
          <span class="value">${this.euro(scenario.speseConIva)}</span>
        </div>` : '';

        return `
      <div class="data-section">
        <div class="data-section-title">📊 Riepilogo Famiglia</div>
        ${ivaRows}
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

