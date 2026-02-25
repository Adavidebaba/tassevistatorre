/**
 * chart-renderer.js
 * Grafico comparativo Canvas: tasse totali famiglia o netto affittuario
 * per 4 scenari al variare della % di compenso PM.
 */

class ScenariChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.padding = { top: 40, right: 30, bottom: 75, left: 75 };
        this.datiCorrente = null;
        this.vistaCorrente = 'tasse';

        // Palette senza rosso e senza verde — safe per daltonismo
        this.colori = [
            { colore: '#0072B2', label: 'S1 — SRL + Forfettario' },
            { colore: '#E69F00', label: 'S2 — Sublocazione (Cedolare+IRPEF)' },
            { colore: '#8B5CF6', label: 'S3 — Cedolare + Forfettario' },
            { colore: '#FACC15', label: 'S4 — Persona Fisica + Forfettario' },
        ];

        this.viste = {
            tasse: {
                campi: ['totaleSrl', 'totaleSublocazione', 'totaleCedolareMandato', 'totalePersonaFisica'],
                titoloAsse: 'Tasse Totali Famiglia (€)',
            },
            nettoAffittuario: {
                campi: ['nettoAffSrl', 'nettoAffSublocazione', 'nettoAffCedolareMandato', 'nettoAffPersonaFisica'],
                titoloAsse: 'Netto Affittuario (€)',
            },
        };
    }

    getLineeCorrente() {
        const vista = this.viste[this.vistaCorrente];
        return vista.campi.map((campo, i) => ({
            campo,
            colore: this.colori[i].colore,
            label: this.colori[i].label,
        }));
    }

    setVista(vista) {
        this.vistaCorrente = vista;
        if (this.datiCorrente) {
            this.disegna(this.datiCorrente);
        }
    }

    disegna(datiGrafico) {
        this.datiCorrente = datiGrafico;
        const linee = this.getLineeCorrente();

        this.setupCanvas();
        const { width, height } = this.getAreaDisegno();
        const { minY, maxY, rangeY } = this.calcolaRange(datiGrafico, linee);

        this.disegnaGriglia(width, height, minY, maxY);

        linee.forEach(linea => {
            this.disegnaLinea(datiGrafico, linea.campo, linea.colore, width, height, minY, rangeY);
        });

        this.disegnaLegenda(width, linee);
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

    calcolaRange(dati, linee) {
        let min = Infinity;
        let max = 0;
        const campi = linee.map(l => l.campo);
        dati.forEach(d => {
            campi.forEach(c => {
                min = Math.min(min, d[c]);
                max = Math.max(max, d[c]);
            });
        });
        const minY = Math.max(0, Math.floor(min / 5000) * 5000);
        const maxY = Math.ceil(max / 5000) * 5000;
        return { minY, maxY, rangeY: maxY - minY };
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

        // Label asse X
        ctx.fillStyle = '#9a9ab0';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('% Compenso PM / Canone all\'Affittuario', this.padding.left + w / 2, this.padding.top + h + 45);
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
        gradient.addColorStop(0, colore + '10');
        gradient.addColorStop(1, colore + '00');
        ctx.lineTo(this.padding.left + w, this.padding.top + h);
        ctx.lineTo(this.padding.left, this.padding.top + h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    disegnaLegenda(w, linee) {
        const ctx = this.ctx;
        const itemWidth = w / 2;
        const baseX = this.padding.left;
        const baseY = this.displayHeight - 28;
        const rowHeight = 18;

        linee.forEach((item, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = baseX + col * itemWidth;
            const y = baseY + row * rowHeight;

            ctx.fillStyle = item.colore;
            ctx.fillRect(x, y - 5, 12, 12);
            ctx.fillStyle = '#9a9ab0';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x + 17, y + 5);
        });
    }

    euroCompatto(val) {
        if (val >= 1000) return (val / 1000).toFixed(0) + 'k €';
        return val + ' €';
    }
}
