import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { LovelaceCardEditor } from "../../../types";
import type { HomeAssistant } from "../../../../../types";
import type { BluetoothNetworkVisualizationCardConfig } from "../../../cards/network-visualisation/bluetooth-network-visualisation-card";

@customElement("bluetooth-network-visualization-card-editor")
export class BluetoothNetworkVisualizationCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: BluetoothNetworkVisualizationCardConfig;

  public setConfig(config: BluetoothNetworkVisualizationCardConfig): void {
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
    "bluetooth-network-visualization-card-editor": BluetoothNetworkVisualizationCardEditor;
  }
}
