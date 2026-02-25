/**
 * scenario-engine.test.js
 * Test di integrazione per ScenarioEngine con nettoProprietariaTarget = 24000.
 * Verifica i risultati completi di ogni scenario.
 */

describe('ScenarioEngine — nettoProprietariaTarget = 24000', () => {
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
            nettoProprietariaTarget: 24000,
        });
        scenari = engine.calcolaTutti();
    });

    // ─── Test di congruenza globale ─────────────────────────────────────
    describe('Congruenza: netto proprietaria = 24000 in tutti gli scenari', () => {
        it('Scenario 1 → proprietaria.netto = 24000', () => {
            expect(scenari[0].proprietaria.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 2 → proprietaria.netto = 24000', () => {
            expect(scenari[1].proprietaria.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 3 → proprietaria.netto = 24000', () => {
            expect(scenari[2].proprietaria.netto).toBeCloseTo(24000, 0);
        });

        it('Scenario 4 → proprietaria.netto = 24000', () => {
            expect(scenari[3].proprietaria.netto).toBeCloseTo(24000, 0);
        });
    });

    // ─── Scenario 1: Mandato PM + SRL Proprietaria ──────────────────────────
    describe('Scenario 1 — Mandato PM + SRL Proprietaria', () => {
        let s;

        beforeAll(() => {
            s = scenari[0];
        });

        it('compenso PM derivato = 60017.43', () => {
            expect(s.compensoPmDerivato).toBe(60017.43);
        });

        it('proprietaria: regime è SRL', () => {
            expect(s.proprietaria.regime).toContain('SRL');
        });

        it('proprietaria: base imponibile ≈ 44982.57', () => {
            expect(s.proprietaria.baseImponibile).toBeCloseTo(44982.57, 2);
        });

        it('proprietaria: IRES = 10795.82', () => {
            expect(s.proprietaria.ires).toBe(10795.82);
        });

        it('proprietaria: IRAP = 1754.32', () => {
            expect(s.proprietaria.irap).toBe(1754.32);
        });

        it('proprietaria: utile netto SRL = 32432.43', () => {
            expect(s.proprietaria.utileNetto).toBe(32432.43);
        });

        it('proprietaria: ritenuta dividendi = 8432.43', () => {
            expect(s.proprietaria.ritenutaDividendi).toBe(8432.43);
        });

        it('proprietaria: tasse totali = 20982.57', () => {
            expect(s.proprietaria.tasse).toBe(20982.57);
        });


        it('proprietaria: netto ≈ 24000', () => {
            expect(s.proprietaria.netto).toBeCloseTo(24000, 2);
        });

        it('affittuario: regime è Forfettario 5%', () => {
            expect(s.affittuario.regime).toContain('Forfettario');
            expect(s.affittuario.regime).toContain('5');
        });

        it('affittuario: ricavi = compenso PM = 60017.43', () => {
            expect(s.affittuario.ricavi).toBe(60017.43);
        });

        it('affittuario: imponibile = 51614.99', () => {
            expect(s.affittuario.imponibile).toBe(51614.99);
        });

        it('affittuario: imposta sostitutiva = 2580.75', () => {
            expect(s.affittuario.imposta).toBe(2580.75);
        });

        it('affittuario: INPS = 13456.03', () => {
            expect(s.affittuario.inps).toBe(13456.03);
        });

        it('affittuario: totale tasse ≈ 16036.78', () => {
            expect(s.affittuario.totaleTasse).toBeCloseTo(16036.78, 2);
        });

        it('affittuario: netto ≈ 43980.65', () => {
            expect(s.affittuario.netto).toBeCloseTo(43980.65, 0);
        });

        it('tasse totali famiglia ≈ 37019.35', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(37019.35, 0);
        });

        it('netto famiglia ≈ 67980.65', () => {
            expect(s.nettoFamiglia).toBeCloseTo(67980.65, 0);
        });

        it('verifica algebrica: netto proprietaria + netto affittuario = netto famiglia', () => {
            expect(s.proprietaria.netto + s.affittuario.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse proprietaria + tasse affittuario = tasse famiglia', () => {
            expect(s.proprietaria.tasse + s.affittuario.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
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

        it('proprietaria: regime è Cedolare Secca 21%', () => {
            expect(s.proprietaria.regime).toContain('Cedolare Secca');
        });

        it('proprietaria: base imponibile = canone', () => {
            expect(s.proprietaria.baseImponibile).toBeCloseTo(30379.75, 2);
        });

        it('proprietaria: tasse cedolare ≈ 6379.75', () => {
            expect(s.proprietaria.tasse).toBeCloseTo(6379.75, 2);
        });

        it('proprietaria: netto ≈ 24000', () => {
            expect(s.proprietaria.netto).toBeCloseTo(24000, 2);
        });

        it('affittuario: regime è IRPEF Semplificato', () => {
            expect(s.affittuario.regime).toContain('IRPEF');
        });

        it('affittuario: ricavi = incasso con IVA 10% = 132000', () => {
            expect(s.affittuario.ricavi).toBe(132000);
        });

        it('affittuario: imponibile = 132000 - canone - speseConIva', () => {
            expect(s.affittuario.imponibile).toBeCloseTo(83320.25, 2);
        });

        it('affittuario: IRPEF ≈ 28467.71', () => {
            expect(s.affittuario.imposta).toBeCloseTo(28467.71, 2);
        });

        it('affittuario: INPS ≈ 20396.80 (Gestione Commercianti 24.48%)', () => {
            expect(s.affittuario.inps).toBeCloseTo(20396.80, 2);
        });

        it('affittuario: netto ≈ 34455.74', () => {
            expect(s.affittuario.netto).toBeCloseTo(34455.74, 0);
        });

        it('netto famiglia ≈ 58455.74', () => {
            expect(s.nettoFamiglia).toBeCloseTo(58455.74, 0);
        });

        it('verifica algebrica: netto proprietaria + netto affittuario = netto famiglia', () => {
            expect(s.proprietaria.netto + s.affittuario.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });
    });

    // ─── Scenario 3: Mandato Market + Cedolare Secca ───────────────────
    describe('Scenario 3 — Mandato Market + Cedolare Secca (con IVA)', () => {
        let s;

        beforeAll(() => {
            s = scenari[2];
        });

        it('compenso PM derivato = 61980', () => {
            expect(s.compensoPmDerivato).toBe(61980);
        });

        it('proprietaria: regime è Cedolare Secca 21%', () => {
            expect(s.proprietaria.regime).toContain('Cedolare Secca');
        });

        it('proprietaria: base imponibile = 132000 (incasso con IVA 10%)', () => {
            expect(s.proprietaria.baseImponibile).toBe(132000);
        });

        it('proprietaria: tasse cedolare = 27720', () => {
            expect(s.proprietaria.tasse).toBe(27720);
        });

        it('proprietaria: netto = 24000', () => {
            expect(s.proprietaria.netto).toBe(24000);
        });

        it('affittuario: ricavi = compenso PM = 61980', () => {
            expect(s.affittuario.ricavi).toBe(61980);
        });

        it('affittuario: imponibile = 53302.80', () => {
            expect(s.affittuario.imponibile).toBe(53302.8);
        });

        it('affittuario: imposta sostitutiva = 2665.14', () => {
            expect(s.affittuario.imposta).toBe(2665.14);
        });

        it('affittuario: INPS = 13896.04', () => {
            expect(s.affittuario.inps).toBe(13896.04);
        });

        it('affittuario: totale tasse = 16561.18', () => {
            expect(s.affittuario.totaleTasse).toBeCloseTo(16561.18, 2);
        });

        it('affittuario: netto ≈ 45418.82', () => {
            expect(s.affittuario.netto).toBeCloseTo(45418.82, 2);
        });

        it('tasse totali famiglia ≈ 44281.18', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(44281.18, 2);
        });

        it('netto famiglia ≈ 69418.82', () => {
            expect(s.nettoFamiglia).toBeCloseTo(69418.82, 2);
        });

        it('verifica algebrica: netto proprietaria + netto affittuario = netto famiglia', () => {
            expect(s.proprietaria.netto + s.affittuario.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse proprietaria + tasse affittuario = tasse famiglia', () => {
            expect(s.proprietaria.tasse + s.affittuario.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
        });
    });

    // ─── Scenario 4: Persona Fisica — IRPEF Forfettaria ───────────────
    describe('Scenario 4 — Persona Fisica (No P.IVA Proprietaria)', () => {
        let s;

        beforeAll(() => {
            s = scenari[3];
        });

        it('compenso PM derivato = 39340', () => {
            expect(s.compensoPmDerivato).toBe(39340);
        });

        it('proprietaria: regime contiene Deduzione Forfettaria', () => {
            expect(s.proprietaria.regime).toContain('Forfettaria');
        });

        it('proprietaria: base imponibile = 114000 (lordo × 95%)', () => {
            expect(s.proprietaria.baseImponibile).toBe(114000);
        });

        it('proprietaria: tasse IRPEF = 41660', () => {
            expect(s.proprietaria.tasse).toBe(41660);
        });

        it('proprietaria: netto = 24000', () => {
            expect(s.proprietaria.netto).toBe(24000);
        });

        it('affittuario: ricavi = compenso PM = 39340', () => {
            expect(s.affittuario.ricavi).toBe(39340);
        });

        it('affittuario: imponibile = 33832.40', () => {
            expect(s.affittuario.imponibile).toBe(33832.4);
        });

        it('affittuario: imposta sostitutiva = 1691.62', () => {
            expect(s.affittuario.imposta).toBe(1691.62);
        });

        it('affittuario: INPS = 8820.11', () => {
            expect(s.affittuario.inps).toBe(8820.11);
        });

        it('affittuario: totale tasse ≈ 10511.73', () => {
            expect(s.affittuario.totaleTasse).toBeCloseTo(10511.73, 2);
        });

        it('affittuario: netto ≈ 28828.27', () => {
            expect(s.affittuario.netto).toBeCloseTo(28828.27, 2);
        });

        it('tasse totali famiglia ≈ 52171.73', () => {
            expect(s.tasseTotaliFamiglia).toBeCloseTo(52171.73, 0);
        });

        it('netto famiglia ≈ 52828.27', () => {
            expect(s.nettoFamiglia).toBeCloseTo(52828.27, 0);
        });

        it('verifica algebrica: netto proprietaria + netto affittuario = netto famiglia', () => {
            expect(s.proprietaria.netto + s.affittuario.netto).toBeCloseTo(s.nettoFamiglia, 2);
        });

        it('verifica algebrica: tasse proprietaria + tasse affittuario = tasse famiglia', () => {
            expect(s.proprietaria.tasse + s.affittuario.totaleTasse).toBeCloseTo(s.tasseTotaliFamiglia, 2);
        });
    });

    // ─── Confronto tra scenari ─────────────────────────────────────────
    describe('Confronto tra scenari', () => {
        it('Scenario 3 è più conveniente dello Scenario 2', () => {
            expect(scenari[2].nettoFamiglia).toBeGreaterThan(scenari[1].nettoFamiglia);
        });

        it('Scenario 1 (SRL) è più conveniente dello Scenario 2', () => {
            expect(scenari[0].nettoFamiglia).toBeGreaterThan(scenari[1].nettoFamiglia);
        });

        it('Scenario 3 è più conveniente dello Scenario 4', () => {
            expect(scenari[2].nettoFamiglia).toBeGreaterThan(scenari[3].nettoFamiglia);
        });

        it('Scenario 4 ha tasse proprietaria più alte di tutti (IRPEF su quasi tutto il lordo)', () => {
            expect(scenari[3].proprietaria.tasse).toBeGreaterThan(scenari[0].proprietaria.tasse);
            expect(scenari[3].proprietaria.tasse).toBeGreaterThan(scenari[1].proprietaria.tasse);
            expect(scenari[3].proprietaria.tasse).toBeGreaterThan(scenari[2].proprietaria.tasse);
        });
    });
});
