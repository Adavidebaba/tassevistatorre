/**
 * scenario-engine.test.js
 * Test di integrazione per ScenarioEngine con nettoMadreTarget = 24000.
 * Verifica i risultati completi di ogni scenario.
 */

describe('ScenarioEngine — nettoMadreTarget = 24000', () => {
    let engine;
    let scenari;

    beforeAll(() => {
        engine = new ScenarioEngine({
            incassoLordo: 120000,
            speseVive: 15000,
            percentualePmScenario1: 0.70,
            canoneSublocazione: 30000,
            percentualePmScenario3: 0.25,
            aliquotaForfettario: 0.05,
            nettoMadreTarget: 24000,
        });
        scenari = engine.calcolaTutti();
    });

    // ─── Test di congruenza globale ─────────────────────────────────────
    describe('Congruenza: netto madre = 24000 in tutti gli scenari', () => {
        it('Scenario 1 → madre.netto = 24000', () => {
            expect(scenari[0].madre.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 2 → madre.netto = 24000', () => {
            expect(scenari[1].madre.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 3 → madre.netto = 24000', () => {
            expect(scenari[2].madre.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 4 → madre.netto = 24000', () => {
            expect(scenari[3].madre.netto).toBeCloseTo(24000, 0);
        });
    });

    // ─── Scenario 1: Mandato PM + IRPEF Madre ──────────────────────────
    describe('Scenario 1 — Mandato PM + IRPEF Madre', () => {
        let s;

        beforeAll(() => {
            s = scenari[0];
        });

        it('compenso PM derivato = 73246.15', () => {
            expect(s.compensoPmDerivato).toBe(73246.15);
        });

        it('madre: regime è IRPEF Ordinaria', () => {
            expect(s.madre.regime).toBe('IRPEF Ordinaria');
        });

        it('madre: base imponibile ≈ 31753.85', () => {
            expect(s.madre.baseImponibile).toBeCloseTo(31753.85, 2);
        });

        it('madre: tasse IRPEF = 7753.85', () => {
            expect(s.madre.tasse).toBe(7753.85);
        });

        it('madre: netto ≈ 24000', () => {
            expect(s.madre.netto).toBeCloseTo(24000, 2);
        });

        it('figlio: regime è Forfettario 5%', () => {
            expect(s.figlio.regime).toContain('Forfettario');
            expect(s.figlio.regime).toContain('5');
        });

        it('figlio: ricavi = compenso PM = 73246.15', () => {
            expect(s.figlio.ricavi).toBe(73246.15);
        });

        it('figlio: imponibile = 62991.69', () => {
            expect(s.figlio.imponibile).toBe(62991.69);
        });

        it('figlio: imposta sostitutiva = 3149.58', () => {
            expect(s.figlio.imposta).toBe(3149.58);
        });

        it('figlio: INPS = 16421.93', () => {
            expect(s.figlio.inps).toBe(16421.93);
        });

        it('figlio: totale tasse ≈ 19571.51', () => {
            expect(s.figlio.totaleTasse).toBeCloseTo(19571.51, 2);
        });

        it('figlio: netto ≈ 53674.64', () => {
            expect(s.figlio.netto).toBeCloseTo(53674.64, 0);
        });

        it('tasse totali famiglia ≈ 27325.36', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(27325.36, 0);
        });

        it('netto famiglia ≈ 77674.64', () => {
            expect(s.nettoFamiglia).toBeCloseTo(77674.64, 0);
        });

        it('verifica algebrica: netto madre + netto figlio = netto famiglia', () => {
            expect(s.madre.netto + s.figlio.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse madre + tasse figlio = tasse famiglia', () => {
            expect(s.madre.tasse + s.figlio.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
        });
    });

    // ─── Scenario 2: Sublocazione + Cedolare Secca ─────────────────────
    describe('Scenario 2 — Sublocazione + Cedolare Secca', () => {
        let s;

        beforeAll(() => {
            s = scenari[1];
        });

        it('canone derivato ≈ 30379.75', () => {
            expect(s.canoneDerivato).toBeCloseTo(30379.75, 2);
        });

        it('madre: regime è Cedolare Secca 21%', () => {
            expect(s.madre.regime).toContain('Cedolare Secca');
        });

        it('madre: base imponibile = canone', () => {
            expect(s.madre.baseImponibile).toBeCloseTo(30379.75, 2);
        });

        it('madre: tasse cedolare ≈ 6379.75', () => {
            expect(s.madre.tasse).toBeCloseTo(6379.75, 2);
        });

        it('madre: netto ≈ 24000', () => {
            expect(s.madre.netto).toBeCloseTo(24000, 2);
        });

        it('figlio: regime è IRPEF Semplificato', () => {
            expect(s.figlio.regime).toContain('IRPEF');
        });

        it('figlio: ricavi = 120000', () => {
            expect(s.figlio.ricavi).toBe(120000);
        });

        it('figlio: imponibile = 120000 - canone - spese', () => {
            expect(s.figlio.imponibile).toBeCloseTo(74620.25, 2);
        });

        it('figlio: IRPEF ≈ 24726.71', () => {
            expect(s.figlio.imposta).toBeCloseTo(24726.71, 2);
        });

        it('figlio: INPS ≈ 19453.50', () => {
            expect(s.figlio.inps).toBeCloseTo(19453.50, 2);
        });

        it('figlio: netto ≈ 30440.04', () => {
            expect(s.figlio.netto).toBeCloseTo(30440.04, 0);
        });

        it('netto famiglia ≈ 54440.04', () => {
            expect(s.nettoFamiglia).toBeCloseTo(54440.04, 0);
        });

        it('verifica algebrica: netto madre + netto figlio = netto famiglia', () => {
            expect(s.madre.netto + s.figlio.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });
    });

    // ─── Scenario 3: Mandato Market + Cedolare Secca ───────────────────
    describe('Scenario 3 — Mandato Market + Cedolare Secca', () => {
        let s;

        beforeAll(() => {
            s = scenari[2];
        });

        it('compenso PM derivato = 55800', () => {
            expect(s.compensoPmDerivato).toBe(55800);
        });

        it('madre: regime è Cedolare Secca 21%', () => {
            expect(s.madre.regime).toContain('Cedolare Secca');
        });

        it('madre: base imponibile = 120000 (incasso lordo)', () => {
            expect(s.madre.baseImponibile).toBe(120000);
        });

        it('madre: tasse cedolare = 25200', () => {
            expect(s.madre.tasse).toBe(25200);
        });

        it('madre: netto = 24000', () => {
            expect(s.madre.netto).toBe(24000);
        });

        it('figlio: ricavi = compenso PM = 55800', () => {
            expect(s.figlio.ricavi).toBe(55800);
        });

        it('figlio: imponibile = 47988', () => {
            expect(s.figlio.imponibile).toBe(47988);
        });

        it('figlio: imposta sostitutiva = 2399.40', () => {
            expect(s.figlio.imposta).toBe(2399.4);
        });

        it('figlio: INPS = 12510.47', () => {
            expect(s.figlio.inps).toBe(12510.47);
        });

        it('figlio: totale tasse = 14909.87', () => {
            expect(s.figlio.totaleTasse).toBeCloseTo(14909.87, 2);
        });

        it('figlio: netto ≈ 40890.13', () => {
            expect(s.figlio.netto).toBeCloseTo(40890.13, 2);
        });

        it('tasse totali famiglia ≈ 40109.87', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(40109.87, 2);
        });

        it('netto famiglia ≈ 64890.13', () => {
            expect(s.nettoFamiglia).toBeCloseTo(64890.13, 2);
        });

        it('verifica algebrica: netto madre + netto figlio = netto famiglia', () => {
            expect(s.madre.netto + s.figlio.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse madre + tasse figlio = tasse famiglia', () => {
            expect(s.madre.tasse + s.figlio.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
        });
    });

    // ─── Scenario 4: Persona Fisica — IRPEF Forfettaria ───────────────
    describe('Scenario 4 — Persona Fisica (No P.IVA Madre)', () => {
        let s;

        beforeAll(() => {
            s = scenari[3];
        });

        it('compenso PM derivato = 39340', () => {
            expect(s.compensoPmDerivato).toBe(39340);
        });

        it('madre: regime contiene Deduzione Forfettaria', () => {
            expect(s.madre.regime).toContain('Forfettaria');
        });

        it('madre: base imponibile = 114000 (lordo × 95%)', () => {
            expect(s.madre.baseImponibile).toBe(114000);
        });

        it('madre: tasse IRPEF = 41660', () => {
            expect(s.madre.tasse).toBe(41660);
        });

        it('madre: netto = 24000', () => {
            expect(s.madre.netto).toBe(24000);
        });

        it('figlio: ricavi = compenso PM = 39340', () => {
            expect(s.figlio.ricavi).toBe(39340);
        });

        it('figlio: imponibile = 33832.40', () => {
            expect(s.figlio.imponibile).toBe(33832.4);
        });

        it('figlio: imposta sostitutiva = 1691.62', () => {
            expect(s.figlio.imposta).toBe(1691.62);
        });

        it('figlio: INPS = 8820.11', () => {
            expect(s.figlio.inps).toBe(8820.11);
        });

        it('figlio: totale tasse ≈ 10511.73', () => {
            expect(s.figlio.totaleTasse).toBeCloseTo(10511.73, 2);
        });

        it('figlio: netto ≈ 28828.27', () => {
            expect(s.figlio.netto).toBeCloseTo(28828.27, 2);
        });

        it('tasse totali famiglia ≈ 52171.73', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(52171.73, 0);
        });

        it('netto famiglia ≈ 52828.27', () => {
            expect(s.nettoFamiglia).toBeCloseTo(52828.27, 0);
        });

        it('verifica algebrica: netto madre + netto figlio = netto famiglia', () => {
            expect(s.madre.netto + s.figlio.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse madre + tasse figlio = tasse famiglia', () => {
            expect(s.madre.tasse + s.figlio.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
        });
    });

    // ─── Confronto tra scenari ─────────────────────────────────────────
    describe('Confronto tra scenari', () => {
        it('Scenario 1 è il più conveniente per il netto famiglia', () => {
            expect(scenari[0].nettoFamiglia).toBeGreaterThan(scenari[1].nettoFamiglia);
            expect(scenari[0].nettoFamiglia).toBeGreaterThan(scenari[2].nettoFamiglia);
            expect(scenari[0].nettoFamiglia).toBeGreaterThan(scenari[3].nettoFamiglia);
        });

        it('Scenario 3 è più conveniente dello Scenario 2', () => {
            expect(scenari[2].nettoFamiglia).toBeGreaterThan(scenari[1].nettoFamiglia);
        });

        it('Scenario 3 è più conveniente dello Scenario 4', () => {
            expect(scenari[2].nettoFamiglia).toBeGreaterThan(scenari[3].nettoFamiglia);
        });

        it('Scenario 4 ha tasse madre più alte di tutti (IRPEF su quasi tutto il lordo)', () => {
            expect(scenari[3].madre.tasse).toBeGreaterThan(scenari[0].madre.tasse);
            expect(scenari[3].madre.tasse).toBeGreaterThan(scenari[1].madre.tasse);
            expect(scenari[3].madre.tasse).toBeGreaterThan(scenari[2].madre.tasse);
        });

        it('Scenario 1 ha le tasse famiglia più basse', () => {
            expect(scenari[0].tasseTotaliFamiglia).toBeLessThan(scenari[1].tasseTotaliFamiglia);
            expect(scenari[0].tasseTotaliFamiglia).toBeLessThan(scenari[2].tasseTotaliFamiglia);
            expect(scenari[0].tasseTotaliFamiglia).toBeLessThan(scenari[3].tasseTotaliFamiglia);
        });
    });
});
