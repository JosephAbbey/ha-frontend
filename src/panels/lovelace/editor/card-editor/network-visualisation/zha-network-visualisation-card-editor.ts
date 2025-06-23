import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { LovelaceCardEditor } from "../../../types";
import type { HomeAssistant } from "../../../../../types";
import type { ZHANetworkVisualizationCardConfig } from "../../../cards/network-visualisation/zha-network-visualisation-card";

@customElement("zha-network-visualization-card-editor")
export class ZHANetworkVisualizationCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ZHANetworkVisualizationCardConfig;

  public setConfig(config: ZHANetworkVisualizationCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass) {
      return nothing;
    }

    return html`
      <div class="card-config">
        There are no configuration options for this card.
      </div>
    `;
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-network-visualization-card-editor": ZHANetworkVisualizationCardEditor;
  }
}
