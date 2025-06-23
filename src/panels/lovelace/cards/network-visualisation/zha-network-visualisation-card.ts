import { mdiRefresh } from "@mdi/js";
import type {
  CallbackDataParams,
  TopLevelFormatterParams,
} from "echarts/types/dist/shared";
import type { PropertyValues } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { navigate } from "../../../../common/navigate";
import type {
  NetworkData,
  NetworkLink,
  NetworkNode,
} from "../../../../components/chart/ha-network-graph";
import "../../../../components/chart/ha-network-graph";
import "../../../../components/ha-card";
import "../../../../components/ha-icon-button";
import type { LovelaceCardConfig } from "../../../../data/lovelace/config/card";
import type { LovelaceCard, LovelaceCardEditor } from "../../types";
import {
  fetchDevices,
  refreshTopology,
  type ZHADevice,
} from "../../../../data/zha";
import { colorVariables } from "../../../../resources/theme/color.globals";
import type { HomeAssistant } from "../../../../types";
import { formatAsPaddedHex } from "../../../config/integrations/integration-panels/zha/functions";

export interface ZHANetworkVisualizationCardConfig extends LovelaceCardConfig {
  // no options
}

@customElement("zha-network-visualization-card")
export class ZHANetworkVisualizationCard
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state()
  private _networkData: NetworkData = {
    nodes: [],
    links: [],
    categories: [],
  };

  @state()
  private _devices: ZHADevice[] = [];

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import(
      "../../editor/card-editor/network-visualisation/zha-network-visualisation-card-editor"
    );
    return document.createElement("zha-network-visualization-card-editor");
  }

  public static getStubConfig(): ZHANetworkVisualizationCardConfig {
    return { type: "zha-network-visualization-card" };
  }

  public getCardSize(): number {
    return 15;
  }

  public setConfig(_config: ZHANetworkVisualizationCardConfig): void {
    // This card doesn't have any configuration.
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    if (this.hass) {
      this._fetchData();
    }
  }

  protected render() {
    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">
            ${this.hass.localize("ui.panel.config.zha.visualization.header")}
          </div>
          <ha-icon-button
            .path=${mdiRefresh}
            .label=${this.hass.localize(
              "ui.panel.config.zha.visualization.refresh_topology"
            )}
            @click=${this._refreshTopology}
          ></ha-icon-button>
        </div>
        <div class="card-content">
          <ha-network-graph
            .hass=${this.hass}
            .data=${this._networkData}
            .tooltipFormatter=${this._tooltipFormatter}
            @chart-click=${this._handleChartClick}
          >
          </ha-network-graph>
        </div>
      </ha-card>
    `;
  }

  private async _fetchData() {
    this._devices = await fetchDevices(this.hass!);
    this._networkData = this._createChartData(this._devices);
  }

  private _tooltipFormatter = (params: TopLevelFormatterParams): string => {
    const { dataType, data, name } = params as CallbackDataParams;
    if (dataType === "edge") {
      const { source, target, value } = data as any;
      const targetName = this._networkData.nodes.find(
        (node) => node.id === target
      )!.name;
      const sourceName = this._networkData.nodes.find(
        (node) => node.id === source
      )!.name;
      const tooltipText = `${sourceName} → ${targetName}${
        value ? ` <b>LQI:</b> ${value}` : ""
      }`;

      const reverseValue = this._networkData.links.find(
        (link) => link.source === source && link.target === target
      )?.reverseValue;
      if (reverseValue) {
        return `${tooltipText}<br>${targetName} → ${sourceName} <b>LQI:</b> ${reverseValue}`;
      }
      return tooltipText;
    }
    const device = this._devices.find((d) => d.ieee === (data as any).id);
    if (!device) {
      return name;
    }
    let label = `<b>IEEE: </b>${device.ieee}`;
    label += `<br><b>${this.hass.localize(
      "ui.panel.config.zha.visualization.device_type"
    )}: </b>${device.device_type.replace("_", " ")}`;
    if (device.nwk != null) {
      label += `<br><b>NWK: </b>${formatAsPaddedHex(device.nwk)}`;
    }
    if (device.manufacturer != null && device.model != null) {
      label += `<br><b>${this.hass.localize(
        "ui.panel.config.zha.visualization.device"
      )}: </b>${device.manufacturer} ${device.model}`;
    } else {
      label += `<br><b>${this.hass.localize(
        "ui.panel.config.zha.visualization.device_not_in_db"
      )}</b>`;
    }
    if (device.area_id) {
      const area = this.hass.areas[device.area_id];
      if (area) {
        label += `<br><b>${this.hass.localize(
          "ui.panel.config.zha.visualization.area"
        )}: </b>${area.name}`;
      }
    }
    return label;
  };

  private async _refreshTopology(): Promise<void> {
    await refreshTopology(this.hass);
    await this._fetchData();
  }

  private _handleChartClick(e: CustomEvent): void {
    if (
      e.detail.dataType === "node" &&
      e.detail.event.target.cursor === "pointer"
    ) {
      const { id } = e.detail.data;
      const device = this._devices.find((d) => d.ieee === id);
      if (device) {
        navigate(`/config/devices/device/${device.device_reg_id}`);
      }
    }
  }

  private _createChartData(devices: ZHADevice[]): NetworkData {
    const primaryColor = colorVariables["primary-color"];
    const routerColor = colorVariables["cyan-color"];
    const endDeviceColor = colorVariables["teal-color"];
    const offlineColor = colorVariables["error-color"];
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    const categories = [
      {
        name: this.hass.localize(
          "ui.panel.config.zha.visualization.coordinator"
        ),
        symbol: "roundRect",
        itemStyle: { color: primaryColor },
      },
      {
        name: this.hass.localize("ui.panel.config.zha.visualization.router"),
        symbol: "circle",
        itemStyle: { color: routerColor },
      },
      {
        name: this.hass.localize(
          "ui.panel.config.zha.visualization.end_device"
        ),
        symbol: "circle",
        itemStyle: { color: endDeviceColor },
      },
      {
        name: this.hass.localize("ui.panel.config.zha.visualization.offline"),
        symbol: "circle",
        itemStyle: { color: offlineColor },
      },
    ];

    devices.forEach((device) => {
      const isCoordinator = device.device_type === "Coordinator";
      let category: number;
      if (!device.available) {
        category = 3; // Offline
      } else if (isCoordinator) {
        category = 0;
      } else if (device.device_type === "Router") {
        category = 1;
      } else {
        category = 2; // End Device
      }

      nodes.push({
        id: device.ieee,
        name: device.user_given_name || device.name || device.ieee,
        category,
        value: isCoordinator ? 3 : device.device_type === "Router" ? 2 : 1,
        symbolSize: isCoordinator
          ? 40
          : device.device_type === "Router"
            ? 30
            : 20,
        symbol: isCoordinator ? "roundRect" : "circle",
        itemStyle: {
          color: device.available
            ? isCoordinator
              ? primaryColor
              : device.device_type === "Router"
                ? routerColor
                : endDeviceColor
            : offlineColor,
        },
        polarDistance: category === 0 ? 0 : category === 1 ? 0.5 : 0.9,
      });

      const existingLinks = links.filter(
        (link) => link.source === device.ieee || link.target === device.ieee
      );
      if (device.routes && device.routes.length > 0) {
        device.routes.forEach((route) => {
          const neighbor = device.neighbors.find(
            (n) => n.nwk === route.next_hop
          );
          if (!neighbor) {
            return;
          }
          const existingLink = existingLinks.find(
            (link) =>
              link.source === neighbor.ieee || link.target === neighbor.ieee
          );

          if (existingLink) {
            if (existingLink.source === device.ieee) {
              existingLink.value = Math.max(
                existingLink.value!,
                parseInt(neighbor.lqi)
              );
            } else {
              existingLink.reverseValue = Math.max(
                existingLink.reverseValue ?? 0,
                parseInt(neighbor.lqi)
              );
            }
            const width = this._getLQIWidth(parseInt(neighbor.lqi));
            existingLink.symbolSize = (width / 4) * 6 + 3;
            existingLink.lineStyle = {
              ...existingLink.lineStyle,
              width,
              color:
                route.route_status === "Active"
                  ? primaryColor
                  : existingLink.lineStyle!.color,
              type: ["Child", "Parent"].includes(neighbor.relationship)
                ? "solid"
                : existingLink.lineStyle!.type,
            };
          } else {
            const width = this._getLQIWidth(parseInt(neighbor.lqi));
            const link: NetworkLink = {
              source: device.ieee,
              target: neighbor.ieee,
              value: parseInt(neighbor.lqi),
              lineStyle: {
                width,
                color:
                  route.route_status === "Active"
                    ? primaryColor
                    : colorVariables["disabled-color"],
                type: ["Child", "Parent"].includes(neighbor.relationship)
                  ? "solid"
                  : "dotted",
              },
              symbolSize: (width / 4) * 6 + 3,
              ignoreForceLayout: true,
            };
            links.push(link);
            existingLinks.push(link);
          }
        });
      } else if (existingLinks.length === 0) {
        const neighbors: { ieee: string; lqi: string }[] =
          device.neighbors ?? [];
        if (neighbors.length === 0) {
          devices.forEach((d) => {
            if (d.neighbors && d.neighbors.length > 0) {
              const neighbor = d.neighbors.find((n) => n.ieee === device.ieee);
              if (neighbor) {
                neighbors.push({ ieee: d.ieee, lqi: neighbor.lqi });
              }
            }
          });
        }
        const closestNeighbor = neighbors.sort(
          (a, b) => parseInt(b.lqi) - parseInt(a.lqi)
        )[0];
        if (closestNeighbor) {
          links.push({
            source: device.ieee,
            target: closestNeighbor.ieee,
            value: parseInt(closestNeighbor.lqi),
            symbolSize: 5,
            lineStyle: {
              width: 1,
              color: colorVariables["disabled-color"],
              type: "dotted",
            },
            ignoreForceLayout: true,
          });
        }
      }
    });

    devices.forEach((device) => {
      if (device.device_type === "Coordinator") {
        links.forEach((link) => {
          if (link.source === device.ieee || link.target === device.ieee) {
            link.ignoreForceLayout = false;
          }
        });
      } else {
        let strongestLink: NetworkLink | undefined;
        links.forEach((link) => {
          if (
            (link.source === device.ieee || link.target === device.ieee) &&
            link.value! > (strongestLink?.value ?? 0)
          ) {
            strongestLink = link;
          }
        });

        if (strongestLink) {
          strongestLink.ignoreForceLayout = false;
        }
      }
    });

    return { nodes, links, categories };
  }

  private _getLQIWidth(lqi: number): number {
    return lqi > 200 ? 3 : lqi > 100 ? 2 : 1;
  }

  static styles = css`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .name {
      font-size: var(--ha-card-header-font-size, 24px);
      font-weight: 400;
    }
    .card-content {
      padding: 16px;
    }
    ha-network-graph {
      display: block;
      height: 500px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-network-visualization-card": ZHANetworkVisualizationCard;
  }
}
