/**
 * forfettario-calculator.test.js
 * Test unitari per ForfettarioCalculator — Regime Forfettario.
 */

describe('ForfettarioCalculator', () => {
    let calc;

    beforeEach(() => {
        calc = new ForfettarioCalculator(0.86, 0.05, 0.2607);
    });

    it('calcola imponibile = ricavi × 0.86', () => {
        expect(calc.calcolaImponibile(100000)).toBe(86000);
    });

    it('calcola imposta sostitutiva al 5%', () => {
        // 100000 × 0.86 = 86000 → 86000 × 0.05 = 4300
        expect(calc.calcolaImposta(100000)).toBe(4300);
    });

    it('calcola INPS al 26.07%', () => {
        // 100000 × 0.86 = 86000 → 86000 × 0.2607 = 22420.2
        expect(calc.calcolaInps(100000)).toBe(22420.2);
    });

    describe('calcolaTotale con ricavi = 73246.15 (scenario 1, netto proprietaria 24000)', () => {
        let result;

        beforeEach(() => {
            result = calc.calcolaTotale(73246.15);
        });

        it('ricavi è corretto', () => {
            expect(result.ricavi).toBe(73246.15);
        });

        it('imponibile = 73246.15 × 0.86 = 62991.69', () => {
            expect(result.imponibile).toBe(62991.69);
        });

        it('imposta = 62991.69 × 0.05 = 3149.58', () => {
            expect(result.imposta).toBe(3149.58);
        });

        it('inps = 62991.69 × 0.2607 ≈ 16421.93', () => {
            expect(result.inps).toBe(16421.93);
        });

        it('totaleTasse = imposta + inps', () => {
            expect(result.totaleTasse).toBeCloseTo(3149.58 + 16421.93, 2);
        });
    });

    describe('calcolaTotale con ricavi = 55800 (scenario 3, netto proprietaria 24000)', () => {
        let result;

        beforeEach(() => {
            result = calc.calcolaTotale(55800);
        });

        it('imponibile = 55800 × 0.86 = 47988', () => {
            expect(result.imponibile).toBe(47988);
        });

        it('imposta = 47988 × 0.05 = 2399.40', () => {
            expect(result.imposta).toBe(2399.4);
        });

        it('inps = 47988 × 0.2607 = 12510.47', () => {
            expect(result.inps).toBe(12510.47);
        });

        it('totaleTasse = imposta + inps', () => {
            expect(result.totaleTasse).toBe(2399.4 + 12510.47);
        });
    });
});
