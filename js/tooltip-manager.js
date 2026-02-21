/**
 * tooltip-manager.js
 * Gestisce il posizionamento dinamico dei tooltip
 * mantenendoli sempre all'interno del viewport.
 */

class TooltipManager {
    constructor() {
        this.panel = this.creaPannello();
        this.collegaEventi();
    }

    creaPannello() {
        const panel = document.createElement('div');
        panel.className = 'tooltip-panel';
        document.body.appendChild(panel);
        return panel;
    }

    collegaEventi() {
        document.addEventListener('mouseover', (e) => {
            const trigger = e.target.closest('.tooltip-trigger');
            if (!trigger) return;
            this.mostra(trigger);
        });

        document.addEventListener('mouseout', (e) => {
            const trigger = e.target.closest('.tooltip-trigger');
            if (!trigger) return;
            this.nascondi();
        });
    }

    mostra(trigger) {
        const testo = trigger.getAttribute('data-tooltip');
        if (!testo) return;

        this.panel.textContent = '';
        this.panel.innerText = testo;
        this.panel.classList.add('visible');

        this.posiziona(trigger);
    }

    nascondi() {
        this.panel.classList.remove('visible');
    }

    posiziona(trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const testo = trigger.getAttribute('data-tooltip') || '';
        const panelWidth = testo.length > 200 ? 420 : 320;
        const margin = 12;

        this.panel.style.width = panelWidth + 'px';

        // Calcola posizione orizzontale centrata sull'icona
        let left = triggerRect.left + triggerRect.width / 2 - panelWidth / 2;

        // Correggi se esce a sinistra
        if (left < margin) {
            left = margin;
        }

        // Correggi se esce a destra
        if (left + panelWidth > window.innerWidth - margin) {
            left = window.innerWidth - margin - panelWidth;
        }

        this.panel.style.left = left + 'px';

        // Prova sopra, se non c'è spazio vai sotto
        const panelHeight = this.panel.offsetHeight;
        const spazioSopra = triggerRect.top;

        if (spazioSopra > panelHeight + margin) {
            this.panel.style.top = (triggerRect.top - panelHeight - 8) + 'px';
        } else {
            this.panel.style.top = (triggerRect.bottom + 8) + 'px';
        }
    }
}
