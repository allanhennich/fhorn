import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  calculatorItems,
  categoryLabels,
  categoryOrder,
  type CalculatorCategory,
  type CalculatorItem,
} from '../../data/calculatorItems';
import { storageUnits, type StorageUnit } from '../../data/storageUnits';
import { siteConfig } from '../../config/site';

const STORAGE_KEY = 'fhorn-calculator-selection';

interface SelectedItem {
  item: CalculatorItem;
  quantity: number;
}

type Selection = Record<string, number>;

function loadSavedSelection(): Selection {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSelection(sel: Selection) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
  } catch {
    // storage full or disabled
  }
}

export default function SpaceCalculator() {
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('sala');
  const [selection, setSelection] = useState<Selection>(loadSavedSelection);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    saveSelection(selection);
  }, [selection]);

  const addItem = useCallback((itemId: string) => {
    setSelection((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[itemId] && next[itemId] > 1) {
        next[itemId]--;
      } else {
        delete next[itemId];
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelection({});
    setShowResult(false);
  }, []);

  const selectedItems: SelectedItem[] = useMemo(() => {
    return Object.entries(selection)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({
        item: calculatorItems.find((i) => i.id === id)!,
        quantity: qty,
      }))
      .filter((s) => s.item);
  }, [selection]);

  const totalVolume = useMemo(() => {
    return selectedItems.reduce((acc, { item, quantity }) => acc + item.volume * quantity, 0);
  }, [selectedItems]);

  const adjustedVolume = useMemo(() => {
    return totalVolume * siteConfig.calculatorMargin;
  }, [totalVolume]);

  const suggestedUnits: StorageUnit[] = useMemo(() => {
    if (adjustedVolume === 0) return [];
    return storageUnits.filter((u) => u.volume >= adjustedVolume).slice(0, 2);
  }, [adjustedVolume]);

  const bestMatch: StorageUnit | null = useMemo(() => {
    if (suggestedUnits.length === 0 && adjustedVolume > 0) {
      return storageUnits[storageUnits.length - 1]; // largest
    }
    return suggestedUnits[0] || null;
  }, [suggestedUnits, adjustedVolume]);

  const totalItems = useMemo(() => {
    return selectedItems.reduce((acc, s) => acc + s.quantity, 0);
  }, [selectedItems]);

  const categoryItems = calculatorItems.filter((i) => i.category === activeCategory);

  function buildWhatsAppMessage(): string {
    const lines = ['Olá! Gostaria de solicitar um orçamento.', '', 'Objetos selecionados:'];
    for (const { item, quantity } of selectedItems) {
      lines.push(`- ${item.name}: ${quantity}x`);
    }
    lines.push('', `Volume estimado: ${adjustedVolume.toFixed(1)} m³`);
    if (bestMatch) {
      lines.push(`Box sugerido: ${bestMatch.name} (${bestMatch.volume} m³)`);
    }
    lines.push('', 'Aguardo retorno. Obrigado!');
    return lines.join('\n');
  }

  function getWhatsAppUrl(): string | null {
    if (!siteConfig.contact.whatsappRaw) return null;
    const msg = encodeURIComponent(buildWhatsAppMessage());
    return `https://wa.me/${siteConfig.contact.whatsappRaw}?text=${msg}`;
  }

  return (
    <div className="calc-container">
      {/* Category tabs */}
      <div className="calc-tabs" role="tablist" aria-label="Categorias de objetos">
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`calc-tab ${activeCategory === cat ? 'calc-tab-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="calc-items" role="tabpanel">
        {categoryItems.map((item) => {
          const qty = selection[item.id] || 0;
          return (
            <div key={item.id} className={`calc-item ${qty > 0 ? 'calc-item-selected' : ''}`}>
              <div className="calc-item-info">
                <span className="calc-item-name">{item.name}</span>
                <span className="calc-item-vol">{item.volume.toFixed(2)} m³</span>
              </div>
              <div className="calc-item-controls">
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={qty === 0}
                  className="calc-qty-btn"
                  aria-label={`Remover ${item.name}`}
                >
                  −
                </button>
                <span className="calc-qty" aria-live="polite">{qty}</span>
                <button
                  onClick={() => addItem(item.id)}
                  className="calc-qty-btn calc-qty-add"
                  aria-label={`Adicionar ${item.name}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      {totalItems > 0 && (
        <div className="calc-summary">
          <div className="calc-summary-stats">
            <div className="calc-stat">
              <span className="calc-stat-label">Itens</span>
              <span className="calc-stat-value">{totalItems}</span>
            </div>
            <div className="calc-stat">
              <span className="calc-stat-label">Volume</span>
              <span className="calc-stat-value">{totalVolume.toFixed(1)} m³</span>
            </div>
            <div className="calc-stat">
              <span className="calc-stat-label">Estimado</span>
              <span className="calc-stat-value calc-stat-highlight">{adjustedVolume.toFixed(1)} m³</span>
            </div>
          </div>
          <div className="calc-summary-actions">
            <button onClick={clearAll} className="calc-clear-btn">
              Limpar
            </button>
            <button
              onClick={() => setShowResult(true)}
              className="calc-result-btn"
            >
              Ver resultado
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResult && totalItems > 0 && (
        <div className="calc-result">
          <h3 className="calc-result-title">Resultado estimado</h3>

          {/* Selected items summary */}
          <div className="calc-result-items">
            {selectedItems.map(({ item, quantity }) => (
              <div key={item.id} className="calc-result-item">
                <span>{item.name}</span>
                <span className="calc-result-qty">{quantity}x</span>
              </div>
            ))}
          </div>

          <div className="calc-result-volume">
            <div className="calc-result-row">
              <span>Volume dos objetos:</span>
              <strong>{totalVolume.toFixed(1)} m³</strong>
            </div>
            <div className="calc-result-row">
              <span>Margem para acomodação (+{Math.round((siteConfig.calculatorMargin - 1) * 100)}%):</span>
              <strong>{adjustedVolume.toFixed(1)} m³</strong>
            </div>
          </div>

          {/* Suggestion */}
          {bestMatch && (
            <div className="calc-suggestion">
              <p className="calc-suggestion-label">Box sugerido:</p>
              <div className="calc-suggestion-box">
                <div>
                  <strong className="calc-suggestion-name">{bestMatch.name}</strong>
                  <span className="calc-suggestion-vol">{bestMatch.volumeLabel}</span>
                </div>
                <span className="calc-suggestion-dims">
                  {bestMatch.dimensionLabel}
                </span>
              </div>
              {suggestedUnits.length > 1 && (
                <p className="calc-suggestion-alt">
                  Alternativa: <strong>{suggestedUnits[1].name}</strong> ({suggestedUnits[1].volumeLabel})
                </p>
              )}
            </div>
          )}

          {adjustedVolume > 0 && suggestedUnits.length === 0 && (
            <div className="calc-suggestion">
              <p className="calc-suggestion-label">Box sugerido:</p>
              <div className="calc-suggestion-box">
                <div>
                  <strong className="calc-suggestion-name">{storageUnits[storageUnits.length - 1].name}</strong>
                  <span className="calc-suggestion-vol">{storageUnits[storageUnits.length - 1].volumeLabel}</span>
                </div>
                <p className="calc-notice-text" style={{ marginTop: '0.5rem' }}>
                  O volume estimado é alto. Recomendamos uma avaliação presencial.
                </p>
              </div>
            </div>
          )}

          <p className="calc-disclaimer">
            Esta é uma estimativa baseada em volumes. O encaixe real depende das dimensões individuais de cada objeto, possibilidade de empilhamento e organização interna. Consulte nossa equipe para uma avaliação precisa.
          </p>

          {/* Actions */}
          <div className="calc-result-actions">
            {(() => {
              const url = getWhatsAppUrl();
              return url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calc-whatsapp-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Solicitar orçamento via WhatsApp
                </a>
              ) : (
                <a href="/contato/" className="calc-whatsapp-btn" style={{ backgroundColor: 'var(--color-brand-700)' }}>
                  Solicitar orçamento
                </a>
              );
            })()}
            <button onClick={() => setShowResult(false)} className="calc-back-btn">
              Voltar ao simulador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
