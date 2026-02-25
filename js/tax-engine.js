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

// ─── SRL Calculator (IRES + IRAP + Dividendi) ──────────────────────
class SrlCalculator {
  constructor(aliquotaIres = 0.24, aliquotaIrap = 0.039, aliquotaDividendi = 0.26) {
    this.aliquotaIres = aliquotaIres;
    this.aliquotaIrap = aliquotaIrap;
    this.aliquotaDividendi = aliquotaDividendi;
  }

  calcola(imponibile) {
    if (imponibile <= 0) return this.risultatoZero();
    const ires = Math.round(imponibile * this.aliquotaIres * 100) / 100;
    const irap = Math.round(imponibile * this.aliquotaIrap * 100) / 100;
    const utileNetto = Math.round((imponibile - ires - irap) * 100) / 100;
    const ritenutaDividendi = Math.round(utileNetto * this.aliquotaDividendi * 100) / 100;
    const nettoDividendo = Math.round((utileNetto - ritenutaDividendi) * 100) / 100;
    const tasseTotali = Math.round((ires + irap + ritenutaDividendi) * 100) / 100;

    return { ires, irap, utileNetto, ritenutaDividendi, nettoDividendo, tasseTotali };
  }

  /** Fattore netto: quanto resta di 1€ di imponibile dopo IRES+IRAP+dividendi */
  fattoreNetto() {
    return (1 - this.aliquotaIres - this.aliquotaIrap) * (1 - this.aliquotaDividendi);
  }

  risultatoZero() {
    return { ires: 0, irap: 0, utileNetto: 0, ritenutaDividendi: 0, nettoDividendo: 0, tasseTotali: 0 };
  }
}

// ─── Scenario Engine ────────────────────────────────────────────────
class ScenarioEngine {
  constructor(params) {
    this.incassoLordo = params.incassoLordo ?? 120000;
    this.speseVive = params.speseVive ?? 15000;
    this.percentualePmScenario1 = params.percentualePmScenario1 ?? 0.70;
    this.canoneSublocazione = params.canoneSublocazione ?? 30000;
    this.percentualePmScenario3 = params.percentualePmScenario3 ?? 0.25;
    this.percentualePmScenario4 = params.percentualePmScenario4 ?? 0.25;
    this.aliquotaForfettario = params.aliquotaForfettario ?? 0.05;
    this.nettoProprietariaTarget = params.nettoProprietariaTarget ?? null;

    // IVA: impatta solo scenari cedolare secca (2 e 3)
    this.ivaIncasso = 0.10;  // IVA 10% sugli affitti turistici
    this.ivaSpese = 0.22;    // IVA 22% sulle spese

    this.irpef = new IrpefCalculator();
    this.cedolare = new CedolareCalculator(0.21);
    this.forfettario = new ForfettarioCalculator(0.86, this.aliquotaForfettario, 0.2607);
    this.srl = new SrlCalculator();
  }

  calcolaScenario1() {
    const compensoPm = this.nettoProprietariaTarget
      ? ReverseCalculator.calcolaCompensoPmScenario1(
        this.nettoProprietariaTarget, this.incassoLordo, this.speseVive, this.srl)
      : this.incassoLordo * this.percentualePmScenario1;
    const imponibileSrl = Math.max(0, this.incassoLordo - compensoPm - this.speseVive);
    const risultatoSrl = this.srl.calcola(imponibileSrl);

    const affittuario = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = risultatoSrl.tasseTotali + affittuario.imposta + affittuario.inps;
    const nettoProprietaria = risultatoSrl.nettoDividendo;
    const nettoAffittuario = compensoPm - affittuario.totaleTasse;
    const nettoFamiglia = nettoProprietaria + nettoAffittuario;

    return {
      nome: 'Scenario 1',
      titolo: 'SRL con Mandato Gestione con Rappresentanza',
      descrizione: 'Affittuario PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% — SRL Proprietaria',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / this.incassoLordo,
      proprietaria: {
        regime: 'SRL — IRES + IRAP + Dividendi',
        baseImponibile: imponibileSrl,
        ires: risultatoSrl.ires,
        irap: risultatoSrl.irap,
        utileNetto: risultatoSrl.utileNetto,
        ritenutaDividendi: risultatoSrl.ritenutaDividendi,
        tasse: risultatoSrl.tasseTotali,
        netto: nettoProprietaria,
        note: `SRL deduce compenso PM (${this.formatEuro(compensoPm)}) + spese vive. Utile distribuito come dividendo.`,
      },
      affittuario: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: affittuario.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: affittuario.imposta,
        inps: affittuario.inps,
        totaleTasse: affittuario.totaleTasse,
        netto: nettoAffittuario,
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
    // IVA: proprietaria senza P.IVA incassa +10%, spese +22% (non detraibile)
    const incassoConIva = Math.round(this.incassoLordo * (1 + this.ivaIncasso) * 100) / 100;
    const speseConIva = Math.round(this.speseVive * (1 + this.ivaSpese) * 100) / 100;

    const canone = this.nettoProprietariaTarget
      ? ReverseCalculator.calcolaCanoneScenario2(this.nettoProprietariaTarget)
      : this.canoneSublocazione;
    const tasseProprietaria = this.cedolare.calcola(canone);

    // Affittuario incassa lordo+IVA: FUORI dal forfettario → Regime Semplificato IRPEF
    const imponibileAffittuario = Math.max(0, incassoConIva - canone - speseConIva);
    const tasseAffittuario = this.irpef.calcola(imponibileAffittuario);
    const aliquotaInpsCommercianti = 0.2448;
    const inpsAffittuario = Math.round(imponibileAffittuario * aliquotaInpsCommercianti * 100) / 100;

    const tasseTotaliFamiglia = tasseProprietaria + tasseAffittuario + inpsAffittuario;
    const nettoProprietaria = canone - tasseProprietaria;
    const nettoAffittuario = incassoConIva - canone - speseConIva - tasseAffittuario - inpsAffittuario;
    const nettoFamiglia = nettoProprietaria + nettoAffittuario;

    return {
      nome: 'Scenario 2',
      titolo: 'Sublocazione Standard',
      descrizione: `Proprietaria affitta all'Affittuario a ${this.formatEuro(canone)}/anno`,
      canoneDerivato: canone,
      incassoConIva,
      speseConIva,
      proprietaria: {
        regime: 'Cedolare Secca 21%',
        baseImponibile: canone,
        tasse: tasseProprietaria,
        netto: nettoProprietaria,
        note: 'Canone fisso, nessun costo deducibile',
      },
      affittuario: {
        regime: 'IRPEF Semplificato (fuori Forfettario)',
        ricavi: incassoConIva,
        deduzioni: canone + speseConIva,
        deduzioniDettaglio: `Canone proprietaria (${this.formatEuro(canone)}) + Spese vive con IVA (${this.formatEuro(speseConIva)})`,
        imponibile: imponibileAffittuario,
        labelImposta: 'IRPEF Ordinaria',
        imposta: tasseAffittuario,
        inps: inpsAffittuario,
        totaleTasse: tasseAffittuario + inpsAffittuario,
        netto: nettoAffittuario,
        note: 'Ricavi > 85k → esce dal Forfettario. Spese deducibili al 100%. Importi IVA inclusa.',
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: speseConIva,
      rischio: 'MEDIO',
      rischioMotivo: 'Verifica canone di mercato tra parenti. Rischio riqualificazione.',
      rischioColore: '#ffaa00',
    };
  }

  calcolaScenario3() {
    // IVA: proprietaria senza P.IVA incassa +10%, spese +22% (non detraibile)
    const incassoConIva = Math.round(this.incassoLordo * (1 + this.ivaIncasso) * 100) / 100;
    const speseConIva = Math.round(this.speseVive * (1 + this.ivaSpese) * 100) / 100;

    const compensoPm = this.nettoProprietariaTarget
      ? ReverseCalculator.calcolaCompensoPmScenario3(
        this.nettoProprietariaTarget, this.incassoLordo, this.speseVive,
        this.ivaIncasso, this.ivaSpese)
      : incassoConIva * this.percentualePmScenario3;
    const tasseProprietaria = this.cedolare.calcola(incassoConIva);

    const affittuario = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = tasseProprietaria + affittuario.imposta + affittuario.inps;
    const nettoProprietaria = incassoConIva - compensoPm - speseConIva - tasseProprietaria;
    const nettoAffittuario = compensoPm - affittuario.totaleTasse;
    const nettoFamiglia = nettoProprietaria + nettoAffittuario;

    return {
      nome: 'Scenario 3',
      titolo: 'Mandato Market Standard',
      descrizione: 'Affittuario PM al ' + Math.round((compensoPm / incassoConIva) * 100) + '% — Cedolare Proprietaria',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / incassoConIva,
      incassoConIva,
      speseConIva,
      proprietaria: {
        regime: 'Cedolare Secca 21%',
        baseImponibile: incassoConIva,
        tasse: tasseProprietaria,
        netto: nettoProprietaria,
        note: 'Base imponibile = incasso + IVA 10%. Nessun costo dedotto (cedolare secca)',
      },
      affittuario: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: affittuario.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: affittuario.imposta,
        inps: affittuario.inps,
        totaleTasse: affittuario.totaleTasse,
        netto: nettoAffittuario,
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: speseConIva,
      rischio: 'BASSO',
      rischioMotivo: 'Compenso al ' + Math.round((compensoPm / incassoConIva) * 100) + '% in linea con il mercato. Nessun rischio.',
      rischioColore: '#44cc44',
    };
  }

  calcolaScenario4() {
    const compensoPm = this.nettoProprietariaTarget
      ? ReverseCalculator.calcolaCompensoPmScenario4(
        this.nettoProprietariaTarget, this.incassoLordo, this.speseVive, this.irpef)
      : this.incassoLordo * this.percentualePmScenario4;
    const baseImponibile = this.incassoLordo * 0.95;
    const tasseProprietaria = this.irpef.calcola(baseImponibile);

    const affittuario = this.forfettario.calcolaTotale(compensoPm);

    const tasseTotaliFamiglia = tasseProprietaria + affittuario.imposta + affittuario.inps;
    const nettoProprietaria = this.incassoLordo - compensoPm - this.speseVive - tasseProprietaria;
    const nettoAffittuario = compensoPm - affittuario.totaleTasse;
    const nettoFamiglia = nettoProprietaria + nettoAffittuario;

    return {
      nome: 'Scenario 4',
      titolo: 'Persona Fisica — Mandato Senza P.IVA Proprietaria',
      descrizione: 'Affittuario PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% — IRPEF Forfettaria Proprietaria',
      compensoPmDerivato: compensoPm,
      percentualePmDerivata: compensoPm / this.incassoLordo,
      proprietaria: {
        regime: 'IRPEF (Deduzione Forfettaria 5%)',
        baseImponibile: baseImponibile,
        tasse: tasseProprietaria,
        netto: nettoProprietaria,
        note: `Deduzione forfettaria 5%. Compenso PM (${this.formatEuro(compensoPm)}) e spese NON deducibili`,
      },
      affittuario: {
        regime: 'Forfettario ' + Math.round(this.aliquotaForfettario * 100) + '%',
        ricavi: compensoPm,
        deduzioni: null,
        imponibile: affittuario.imponibile,
        labelImposta: 'Imposta Sostitutiva',
        imposta: affittuario.imposta,
        inps: affittuario.inps,
        totaleTasse: affittuario.totaleTasse,
        netto: nettoAffittuario,
      },
      tasseTotaliFamiglia,
      nettoFamiglia,
      speseVive: this.speseVive,
      rischio: 'BASSO',
      rischioMotivo: 'Struttura semplice, proprietaria senza P.IVA. Compenso PM al ' + Math.round((compensoPm / this.incassoLordo) * 100) + '% da verificare.',
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
