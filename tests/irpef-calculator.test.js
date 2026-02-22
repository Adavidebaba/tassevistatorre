/**
 * irpef-calculator.test.js
 * Test unitari per IrpefCalculator — scaglioni IRPEF 2026.
 */

describe('IrpefCalculator', () => {
    let calc;

    beforeEach(() => {
        calc = new IrpefCalculator();
    });

    it('restituisce 0 per imponibile zero', () => {
        expect(calc.calcola(0)).toBe(0);
    });

    it('restituisce 0 per imponibile negativo', () => {
        expect(calc.calcola(-5000)).toBe(0);
    });

    it('calcola correttamente nel 1° scaglione (23%)', () => {
        // 10000 × 23% = 2300
        expect(calc.calcola(10000)).toBe(2300);
    });

    it('calcola correttamente al limite del 1° scaglione (28000)', () => {
        // 28000 × 23% = 6440
        expect(calc.calcola(28000)).toBe(6440);
    });

    it('calcola correttamente nel 2° scaglione (35%)', () => {
        // 40000: 28000×23% + 12000×35% = 6440 + 4200 = 10640
        expect(calc.calcola(40000)).toBe(10640);
    });

    it('calcola correttamente al limite del 2° scaglione (50000)', () => {
        // 50000: 28000×23% + 22000×35% = 6440 + 7700 = 14140
        expect(calc.calcola(50000)).toBe(14140);
    });

    it('calcola correttamente nel 3° scaglione (43%)', () => {
        // 80000: 28000×23% + 22000×35% + 30000×43%
        //      = 6440 + 7700 + 12900 = 27040
        expect(calc.calcola(80000)).toBe(27040);
    });

    it('calcola correttamente imponibile 31753.85 (caso netto proprietaria 24000)', () => {
        // 28000×23% = 6440
        // 3753.85×35% = 1313.8475 → arrotondato 1313.85
        // Totale = 7753.85
        expect(calc.calcola(31753.85)).toBe(7753.85);
    });
});
