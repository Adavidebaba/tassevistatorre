/**
 * cedolare-calculator.test.js
 * Test unitari per CedolareCalculator — Cedolare Secca 21%.
 */

describe('CedolareCalculator', () => {
    let calc;

    beforeEach(() => {
        calc = new CedolareCalculator(0.21);
    });

    it('restituisce 0 per base imponibile zero', () => {
        expect(calc.calcola(0)).toBe(0);
    });

    it('restituisce 0 per base imponibile negativa', () => {
        expect(calc.calcola(-1000)).toBe(0);
    });

    it('calcola correttamente cedolare su 30379.75 (canone scenario 2)', () => {
        // 30379.75 × 21% = 6379.7475 → arrotondato 6379.75
        expect(calc.calcola(30379.75)).toBe(6379.75);
    });

    it('calcola correttamente cedolare su 120000 (incasso lordo scenario 3)', () => {
        // 120000 × 21% = 25200
        expect(calc.calcola(120000)).toBe(25200);
    });

    it('calcola correttamente cedolare su importo generico', () => {
        // 50000 × 21% = 10500
        expect(calc.calcola(50000)).toBe(10500);
    });
});
