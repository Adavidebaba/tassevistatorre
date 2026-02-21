/**
 * reverse-calculator.test.js
 * Test unitari per ReverseCalculator — Calcolo inverso scenari.
 */

describe('ReverseCalculator', () => {
    let irpefCalc;

    beforeEach(() => {
        irpefCalc = new IrpefCalculator();
    });

    describe('invertiIrpef', () => {
        it('restituisce 0 per netto target zero', () => {
            expect(ReverseCalculator.invertiIrpef(0, irpefCalc)).toBe(0);
        });

        it('restituisce 0 per netto target negativo', () => {
            expect(ReverseCalculator.invertiIrpef(-1000, irpefCalc)).toBe(0);
        });

        it('inverte correttamente nel 1° scaglione', () => {
            // netto = 15400 → imponibile = 15400 / 0.77 = 20000
            expect(ReverseCalculator.invertiIrpef(15400, irpefCalc)).toBe(20000);
        });

        it('inverte correttamente netto 24000 → imponibile 31753.85', () => {
            const imponibile = ReverseCalculator.invertiIrpef(24000, irpefCalc);
            expect(imponibile).toBe(31753.85);
        });

        it('verifica round-trip: irpef(invertiIrpef(netto)) produce il netto corretto', () => {
            const netto = 24000;
            const imponibile = ReverseCalculator.invertiIrpef(netto, irpefCalc);
            const tasse = irpefCalc.calcola(imponibile);
            expect(imponibile - tasse).toBeCloseTo(netto, 2);
        });
    });

    describe('calcolaCompensoPmScenario1', () => {
        it('calcola compenso PM per netto madre 24000', () => {
            const compenso = ReverseCalculator.calcolaCompensoPmScenario1(
                24000, 120000, 15000, irpefCalc
            );
            expect(compenso).toBe(73246.15);
        });
    });

    describe('calcolaCanoneScenario2', () => {
        it('calcola canone per netto madre 24000', () => {
            // 24000 / 0.79 = 30379.7468... → 30379.75
            const canone = ReverseCalculator.calcolaCanoneScenario2(24000);
            expect(canone).toBe(30379.75);
        });
    });

    describe('calcolaCompensoPmScenario3', () => {
        it('calcola compenso PM per netto madre 24000', () => {
            // 120000 × 0.79 - 15000 - 24000 = 55800
            const compenso = ReverseCalculator.calcolaCompensoPmScenario3(
                24000, 120000, 15000
            );
            expect(compenso).toBe(55800);
        });
    });

    describe('calcolaCompensoPmScenario4', () => {
        it('calcola compenso PM per netto madre 24000 (IRPEF su lordo×95%)', () => {
            // tasseMadre = irpef(114000) = 41660
            // compensoPM = 120000 - 15000 - 41660 - 24000 = 39340
            const compenso = ReverseCalculator.calcolaCompensoPmScenario4(
                24000, 120000, 15000, irpefCalc
            );
            expect(compenso).toBe(39340);
        });
    });
});
