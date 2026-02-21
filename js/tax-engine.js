/**
 * tax-engine.js
 * Motore di calcolo fiscale per scenari di gestione immobiliare 2026.
 * Contiene: IrpefCalculator, CedolareCalculator, ForfettarioCalculator, ScenarioEngine.
 */

// ─── IRPEF Ordinaria 2026 ───────────────────────────────────────────
class IrpefCalculator {
  constructor() {
    this.scaglioni = [
      { limite: 28000, aliquota: 0.23 },
      { limite: 50000, aliquota: 0.35 },
      { limite: Infinity, aliquota: 0.43 },
    ];
  }

  calcola(imponibile) {
    if (imponibile <= 0) return 0;
    let tassa = 0;
    let residuo = imponibile;

    for (const scaglione of this.scaglioni) {
      const fascia = scaglione === this.scaglioni[0]
        ? scaglione.limite
        : scaglione.limite - this.scaglioni[this.scaglioni.indexOf(scaglione) - 1].limite;

      const tassabile = Math.min(residuo, fascia);
      tassa += tassabile * scaglione.aliquota;
      residuo -= tassabile;
      if (residuo <= 0) break;
    }

    return Math.round(tassa * 100) / 100;
  }
}

// ─── Cedolare Secca ─────────────────────────────────────────────────
class CedolareCalculator {
  constructor(aliquota = 0.21) {
    this.aliquota = aliquota;
  }

  calcola(baseImponibile) {
    if (baseImponibile <= 0) return 0;
    return Math.round(baseImponibile * this.aliquota * 100) / 100;
  }
}

// ─── Regime Forfettario ─────────────────────────────────────────────
class ForfettarioCalculator {
  constructor(coefficienteRedditivita = 0.86, aliquotaSostitutiva = 0.05, aliquotaInps = 0.2607) {
    this.coefficienteRedditivita = coefficienteRedditivita;
    this.aliquotaSostitutiva = aliquotaSostitutiva;
    this.aliquotaInps = aliquotaInps;
  }

  calcolaImponibile(ricavi) {
    return Math.round(ricavi * this.coefficienteRedditivita * 100) / 100;
  }

  calcolaImposta(ricavi) {
    const imponibile = this.calcolaImponibile(ricavi);
    return Math.round(imponibile * this.aliquotaSostitutiva * 100) / 100;
  }

  calcolaInps(ricavi) {
    const imponibile = this.calcolaImponibile(ricavi);
    return Math.round(imponibile * this.aliquotaInps * 100) / 100;
  }

  calcolaTotale(ricavi) {
    return {
      ricavi,
      imponibile: this.calcolaImponibile(ricavi),
      imposta: this.calcolaImposta(ricavi),
      inps: this.calcolaInps(ricavi),
      totaleTasse: this.calcolaImposta(ricavi) + this.calcolaInps(ricavi),
    };
  }
}

// ─── Scenario Engine ────────────────────────────────────────────────
class ScenarioEngine {
  constructor(params) {
    this.incassoLordo = params.incassoLordo || 120000;
    this.speseVive = params.speseVive || 15000;
    this.percentualePmScenario1 = params.percentualePmScenario1 || 0.70;
    this.canoneSublocazione = params.canoneSublocazione || 30000;
    this.percentualePmScenario3 = params.percentualePmScenario3 || 0.25;
    this.percentualePmScenario4 = params.percentualePmScenario4 || 0.25;
    this.aliquotaForfettario = params.aliquotaForfettario || 0.05;
    this.nettoMadreTarget = params.nettoMadreTarget || null;

    this.irpef = new IrpefCalculator();
    this.cedolare = new CedolareCalculator(0.21);
    this.forfettario = new ForfettarioCalculator(0.86, this.aliquotaForfettario, 0.2607);
  }

  calcolaScenario1() {
    const compensoPm = this.nettoMadreTarget
      ? ReverseCalculator.calcolaCompensoPmScenario1(
        this.nettoMadreTarget, this.incassoLordo, this.speseVive, this.irpef)
      : this.incassoLordo * this.percentualePmScenario1;
    const imponibileMadre = Math.max(0, this.incassoLordo - compensoPm - this.speseVive);
    const tasseMadre = this.irpef.calcola(imponibileMadre);

    const figlio = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = tasseMadre + figlio.imposta + figlio.inps;
    const nettoMadre = this.incassoLordo - compensoPm - this.speseVive - tasseMadre;
    const nettoFiglio = compensoPm - figlio.totaleTasse;
    const nettoFamiglia = nettoMadre + nettoFiglio;

    return {
      nome: 'Scenario 1',
      titolo: 'P.IVA con Mandato Gestione con Rappresentanza',
      descrizione: 'Figlio PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% — IRPEF Madre',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / this.incassoLordo,
      madre: {
        regime: 'IRPEF Ordinaria',
        baseImponibile: imponibileMadre,
        tasse: tasseMadre,
        netto: nettoMadre,
        note: `Deduce compenso PM (${this.formatEuro(compensoPm)}) + spese vive`,
      },
      figlio: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: figlio.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: figlio.imposta,
        inps: figlio.inps,
        totaleTasse: figlio.totaleTasse,
        netto: nettoFiglio,
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: this.speseVive,
      ...this.valutaRischioPm(compensoPm),
    };
  }

  valutaRischioPm(compensoPm) {
    const pct = Math.round((compensoPm / this.incassoLordo) * 100);
    if (pct <= 30) {
      return {
        rischio: 'BASSO',
        rischioMotivo: `Compenso PM al ${pct}% in linea con il mercato (media 20-30%). Nessun rischio.`,
        rischioColore: '#44cc44',
      };
    }
    if (pct <= 50) {
      return {
        rischio: 'MEDIO',
        rischioMotivo: `Compenso PM al ${pct}% sopra la media di mercato (20-30%). Rischio moderato.`,
        rischioColore: '#ffaa00',
      };
    }
    return {
      rischio: 'ALTO',
      rischioMotivo: `Compenso PM al ${pct}% molto sopra la media di mercato (20-30%). Alto rischio elusione.`,
      rischioColore: '#ff4444',
    };
  }

  calcolaScenario2() {
    const canone = this.nettoMadreTarget
      ? ReverseCalculator.calcolaCanoneScenario2(this.nettoMadreTarget)
      : this.canoneSublocazione;
    const tasseMadre = this.cedolare.calcola(canone);

    // Figlio incassa 120k: FUORI dal forfettario → Regime Semplificato IRPEF
    const imponibileFiglio = Math.max(0, this.incassoLordo - canone - this.speseVive);
    const tasseFiglio = this.irpef.calcola(imponibileFiglio);
    const inpsFiglio = Math.round(imponibileFiglio * 0.2607 * 100) / 100;

    const tasseTotaliFamiglia = tasseMadre + tasseFiglio + inpsFiglio;
    const nettoMadre = canone - tasseMadre;
    const nettoFiglio = this.incassoLordo - canone - this.speseVive - tasseFiglio - inpsFiglio;
    const nettoFamiglia = nettoMadre + nettoFiglio;

    return {
      nome: 'Scenario 2',
      titolo: 'Sublocazione Standard',
      descrizione: `Madre affitta a Figlio a ${this.formatEuro(canone)}/anno`,
      canoneDerivato: canone,
      madre: {
        regime: 'Cedolare Secca 21%',
        baseImponibile: canone,
        tasse: tasseMadre,
        netto: nettoMadre,
        note: 'Canone fisso, nessun costo deducibile',
      },
      figlio: {
        regime: 'IRPEF Semplificato (fuori Forfettario)',
        ricavi: this.incassoLordo,
        deduzioni: canone + this.speseVive,
        deduzioniDettaglio: `Canone madre (${this.formatEuro(canone)}) + Spese vive (${this.formatEuro(this.speseVive)})`,
        imponibile: imponibileFiglio,
        labelImposta: 'IRPEF Ordinaria',
        imposta: tasseFiglio,
        inps: inpsFiglio,
        totaleTasse: tasseFiglio + inpsFiglio,
        netto: nettoFiglio,
        note: 'Ricavi > 85k → esce dal Forfettario. Spese deducibili al 100%.',
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: this.speseVive,
      rischio: 'MEDIO',
      rischioMotivo: 'Verifica canone di mercato tra parenti. Rischio riqualificazione.',
      rischioColore: '#ffaa00',
    };
  }

  calcolaScenario3() {
    const compensoPm = this.nettoMadreTarget
      ? ReverseCalculator.calcolaCompensoPmScenario3(
        this.nettoMadreTarget, this.incassoLordo, this.speseVive)
      : this.incassoLordo * this.percentualePmScenario3;
    const tasseMadre = this.cedolare.calcola(this.incassoLordo);

    const figlio = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = tasseMadre + figlio.imposta + figlio.inps;
    const nettoMadre = this.incassoLordo - compensoPm - this.speseVive - tasseMadre;
    const nettoFiglio = compensoPm - figlio.totaleTasse;
    const nettoFamiglia = nettoMadre + nettoFiglio;

    return {
      nome: 'Scenario 3',
      titolo: 'Mandato Market Standard',
      descrizione: 'Figlio PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% — Cedolare Madre',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / this.incassoLordo,
      madre: {
        regime: 'Cedolare Secca 21%',
        baseImponibile: this.incassoLordo,
        tasse: tasseMadre,
        netto: nettoMadre,
        note: 'Nessun costo dedotto (cedolare secca)',
      },
      figlio: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: figlio.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: figlio.imposta,
        inps: figlio.inps,
        totaleTasse: figlio.totaleTasse,
        netto: nettoFiglio,
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: this.speseVive,
      rischio: 'BASSO',
      rischioMotivo: 'Compenso al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% in linea con il mercato. Nessun rischio.',
      rischioColore: '#44cc44',
    };
  }

  calcolaScenario4() {
    const compensoPm = this.nettoMadreTarget
      ? ReverseCalculator.calcolaCompensoPmScenario4(
        this.nettoMadreTarget, this.incassoLordo, this.speseVive, this.irpef)
      : this.incassoLordo * this.percentualePmScenario4;
    const baseImponibile = this.incassoLordo * 0.95;
    const tasseMadre = this.irpef.calcola(baseImponibile);

    const figlio = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = tasseMadre + figlio.imposta + figlio.inps;
    const nettoMadre = this.incassoLordo - compensoPm - this.speseVive - tasseMadre;
    const nettoFiglio = compensoPm - figlio.totaleTasse;
    const nettoFamiglia = nettoMadre + nettoFiglio;

    return {
      nome: 'Scenario 4',
      titolo: 'Persona Fisica — Mandato Senza P.IVA Madre',
      descrizione: 'Figlio PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% — IRPEF Forfettaria Madre',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / this.incassoLordo,
      madre: {
        regime: 'IRPEF (Deduzione Forfettaria 5%)',
        baseImponibile: baseImponibile,
        tasse: tasseMadre,
        netto: nettoMadre,
        note: `Deduzione forfettaria 5%. Compenso PM (${this.formatEuro(compensoPm)}) e spese NON deducibili`,
      },
      figlio: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: figlio.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: figlio.imposta,
        inps: figlio.inps,
        totaleTasse: figlio.totaleTasse,
        netto: nettoFiglio,
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: this.speseVive,
      rischio: 'BASSO',
      rischioMotivo: 'Struttura semplice, madre senza P.IVA. Compenso PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% da verificare.',
      rischioColore: '#44cc44',
    };
  }

  calcolaTutti() {
    return [this.calcolaScenario1(), this.calcolaScenario2(), this.calcolaScenario3(), this.calcolaScenario4()];
  }

  formatEuro(valore) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore);
  }
}
