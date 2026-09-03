import { LitElement, html, nothing } from "lit";

import {
  buildModel,
  entityOptions,
  entityState,
  formatBandwidth,
  isActionAvailable,
  isAvailable,
  normalizeConfig,
  safeHttpUrl,
  speedClass,
} from "./model.js";
import { localize } from "./localize.js";
import { cardStyles } from "./styles.js";

const CONFIGURATION_ENTITIES = [
  ["lag_configuration", "LAG", "mdi:link-variant"],
  ["mtu_vlan_configuration", "MTU VLAN", "mdi:lan"],
  ["port_vlan_configuration", "Port VLAN", "mdi:lan-connect"],
  ["8021q_vlan_configuration", "802.1Q VLAN", "mdi:tag-multiple"],
  ["pvid_configuration", "PVID", "mdi:tag-arrow-down"],
];

export class TpLinkEasySmartCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _selectedPort: { state: true },
  };

  static styles = cardStyles;

  setConfig(config) {
    this._config = normalizeConfig(config);
  }

  getCardSize() {
    const portCount = this.hass
      ? buildModel(this.hass, this._config).ports.length
      : 0;
    return this._config?.view === "compact"
      ? 3
      : Math.ceil(Math.max(5, 4 + portCount / 4));
  }

  getGridOptions() {
    const options = {
      columns: 12,
      min_columns: 6,
      min_rows: 3,
    };
    if (this._config?.view === "compact") options.rows = 3;
    return options;
  }

  static getConfigElement() {
    return document.createElement("tplink-easy-smart-card-editor");
  }

  static getStubConfig(hass) {
    const model = buildModel(hass, {});
    return model.deviceId ? { device_id: model.deviceId } : {};
  }

  _t(key) {
    return localize(this.hass?.language, key);
  }

  _state(entity) {
    return entityState(this.hass, entity);
  }

  _showMoreInfo(entity) {
    if (!entity) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: entity.entity_id },
      }),
    );
  }

  _confirmed(message) {
    return !this._config.confirm_actions || window.confirm(message);
  }

  _toggle(entity, confirmation) {
    const state = this._state(entity);
    if (!isAvailable(state)) return;
    const turningOff = state.state === "on";
    if (turningOff && confirmation && !this._confirmed(confirmation)) return;
    this.hass.callService("switch", turningOff ? "turn_off" : "turn_on", {
      entity_id: entity.entity_id,
    });
  }

  _select(entity, option) {
    if (!entity || option === undefined) return;
    this.hass.callService("select", "select_option", {
      entity_id: entity.entity_id,
      option,
    });
  }

  _press(entity, confirmation) {
    if (!entity || (confirmation && !this._confirmed(confirmation))) return;
    this.hass.callService("button", "press", { entity_id: entity.entity_id });
  }

  _openWeb(model) {
    const candidate =
      model.device.configuration_url ||
      (isAvailable(model.network) ? `http://${model.network.state}` : "");
    const url = safeHttpUrl(candidate);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  _renderHeader(model) {
    const networkAttributes = model.network?.attributes || {};
    const reboot = model.entities.reboot;
    const poeConsumption = this._state(model.entities.poe_consumption);
    const webAvailable = Boolean(
      safeHttpUrl(
        model.device.configuration_url ||
          (isAvailable(model.network) ? `http://${model.network.state}` : ""),
      ),
    );
    return html`
      <div class="header">
        <div class="heading">
          <h2>${model.title}</h2>
          <div class="summary">
            <span class="status-dot ${model.online ? "online" : ""}"></span>
            <span
              >${model.online ? this._t("online") : this._t("offline")}</span
            >
            ${
              model.ports.length
                ? html`<span>·</span>
                    <span
                      >${model.activePorts}/${model.ports.length}
                      ${this._t("ports")}</span
                    >`
                : nothing
            }
          </div>
          <div class="metadata">
            ${model.device.model ? html`<span>${model.device.model}</span>` : nothing}
            ${
              model.device.hw_version
                ? html`<span>HW ${model.device.hw_version}</span>`
                : nothing
            }
            ${
              model.device.sw_version
                ? html`<span>FW ${model.device.sw_version}</span>`
                : nothing
            }
            ${isAvailable(model.network) ? html`<span>${model.network.state}</span>` : nothing}
            ${networkAttributes.mac ? html`<span>${networkAttributes.mac}</span>` : nothing}
            ${
              isAvailable(poeConsumption)
                ? html`<span
                    >PoE ${poeConsumption.state}
                    ${poeConsumption.attributes.unit_of_measurement || "W"}</span
                  >`
                : nothing
            }
          </div>
        </div>
        <div class="header-actions">
          <button
            class="icon-button"
            title=${this._t("web_ui")}
            aria-label=${this._t("web_ui")}
            ?disabled=${!webAvailable}
            @click=${() => this._openWeb(model)}
          >
            <ha-icon icon="mdi:web"></ha-icon>
          </button>
          ${
            reboot
              ? html`<button
                  class="icon-button"
                  title=${this._t("reboot")}
                  aria-label=${this._t("reboot")}
                  ?disabled=${!isActionAvailable(this._state(reboot))}
                  @click=${() => this._press(reboot, this._t("confirm_reboot"))}
                >
                  <ha-icon icon="mdi:restart"></ha-icon>
                </button>`
              : nothing
          }
        </div>
      </div>
    `;
  }

  _renderFrontPanel(model, selectedNumber) {
    return html`
      <section class="panel front-panel" aria-label="Network ports">
        <div class="brand-line">
          <span>TP-Link Easy Smart</span>
          <span>${model.ports.length}-port</span>
        </div>
        <div class="ports">
          ${model.ports.map((port) => {
            const portClass = speedClass(port.speed, port.linked);
            return html`
              <button
                class="port ${portClass} ${selectedNumber === port.number ? "selected" : ""}"
                title="${this._t("port")} ${port.number}: ${
                  port.linked ? port.speed : this._t("link_down")
                }"
                aria-pressed=${selectedNumber === port.number}
                @click=${() => (this._selectedPort = port.number)}
              >
                <span class="jack"><span class="link-light"></span></span>
                <span class="port-number">${port.number}</span>
                ${port.label ? html`<span class="port-label">${port.label}</span>` : nothing}
                <span class="port-speed"
                  >${port.linked ? port.speed : this._t("link_down")}</span
                >
              </button>
            `;
          })}
        </div>
      </section>
    `;
  }

  _renderToggle(entity, label, icon, confirmation) {
    if (!entity) return nothing;
    const state = this._state(entity);
    const on = state?.state === "on";
    return html`
      <button
        class="control ${on ? "on" : ""}"
        role="switch"
        aria-checked=${on}
        ?disabled=${!isAvailable(state)}
        @click=${() => this._toggle(entity, confirmation)}
      >
        <span class="control-label"
          ><ha-icon icon=${icon}></ha-icon>${label}</span
        >
        <span class="control-state" aria-hidden="true"></span>
      </button>
    `;
  }

  _renderSelect(entity, label, icon) {
    if (!entity) return nothing;
    const state = this._state(entity);
    const options = entityOptions(this.hass, entity);
    return html`
      <div class="select-control">
        <label for=${entity.entity_id}
          ><ha-icon icon=${icon}></ha-icon>${label}</label
        >
        <select
          id=${entity.entity_id}
          ?disabled=${!isAvailable(state)}
          @change=${(event) => this._select(entity, event.currentTarget.value)}
        >
          ${options.map(
            (option) =>
              html`<option value=${option} ?selected=${state?.state === option}>
                ${option}
              </option>`,
          )}
        </select>
      </div>
    `;
  }

  _renderTraffic(port) {
    return html`
      <div class="traffic-grid" aria-label=${this._t("traffic")}>
        <div class="metric">
          <span
            ><ha-icon icon="mdi:download-network"></ha-icon
            >${this._t("download")}</span
          >
          <strong>${formatBandwidth(port.rx)}</strong>
        </div>
        <div class="metric">
          <span
            ><ha-icon icon="mdi:upload-network"></ha-icon
            >${this._t("upload")}</span
          >
          <strong>${formatBandwidth(port.tx)}</strong>
        </div>
        <div class="metric">
          <span
            ><ha-icon icon="mdi:swap-horizontal"></ha-icon
            >${this._t("total")}</span
          >
          <strong>${formatBandwidth(port.total)}</strong>
        </div>
      </div>
    `;
  }

  _renderPortDetails(port) {
    const entities = port.entities;
    const hasCable =
      entities.cable_test || entities.cable_status || entities.cable_length;
    return html`
      <section class="panel port-details">
        <div class="details-header">
          <div>
            <h3>
              ${this._t("port")}
              ${port.number}${port.label ? ` · ${port.label}` : ""}
            </h3>
            <span class="link-chip">
              <span class="status-dot ${port.linked ? "online" : ""}"></span>
              ${port.linked ? port.speed : this._t("link_down")}
              ${
                port.poeActive
                  ? html`· <ha-icon icon="mdi:lightning-bolt"></ha-icon> PoE`
                  : nothing
              }
            </span>
          </div>
          ${
            port.linkEntity
              ? html`<button
                  class="icon-button"
                  title="Home Assistant"
                  aria-label="Home Assistant entity details"
                  @click=${() => this._showMoreInfo(port.linkEntity)}
                >
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                </button>`
              : nothing
          }
        </div>
        ${this._config.show_traffic ? this._renderTraffic(port) : nothing}
        ${
          this._config.view === "detailed"
            ? this._renderPacketCounters(port)
            : nothing
        }
        ${
          this._config.show_controls
            ? html`<div class="control-grid">
                ${this._renderToggle(
                  entities.enabled,
                  this._t("enabled"),
                  "mdi:ethernet",
                  this._t("confirm_disable"),
                )}
                ${this._renderToggle(
                  entities.flow_control,
                  this._t("flow_control"),
                  "mdi:swap-horizontal",
                )}
                ${this._renderToggle(
                  entities.poe_enabled,
                  this._t("poe"),
                  "mdi:lightning-bolt-outline",
                )}
                ${this._renderSelect(
                  entities.speed,
                  this._t("speed_duplex"),
                  "mdi:speedometer",
                )}
                ${this._renderSelect(
                  entities.qos_priority,
                  this._t("qos_priority"),
                  "mdi:priority-high",
                )}
              </div>`
            : nothing
        }
        ${
          hasCable
            ? html`<div class="cable-row">
                <div>
                  <strong>${this._t("cable")}</strong>
                  <div class="cable-result">
                    ${
                      port.cableStatus &&
                      !["unknown", "unavailable"].includes(port.cableStatus)
                        ? html`<span>${port.cableStatus}</span>`
                        : nothing
                    }
                    ${
                      Number.isFinite(port.cableLength)
                        ? html`<span
                            >${this._t("cable_length")}: ${port.cableLength}
                            m</span
                          >`
                        : nothing
                    }
                  </div>
                </div>
                ${
                  entities.cable_test
                    ? html`<button
                        class="action"
                        ?disabled=${!isActionAvailable(
                          this._state(entities.cable_test),
                        )}
                        @click=${() =>
                          this._press(
                            entities.cable_test,
                            this._t("confirm_cable"),
                          )}
                      >
                        <ha-icon icon="mdi:ethernet-cable"></ha-icon>
                        ${this._t("cable_test")}
                      </button>`
                    : nothing
                }
              </div>`
            : nothing
        }
      </section>
    `;
  }

  _renderPacketCounters(port) {
    const counters = [
      [this._t("upload"), this._t("good"), port.packets.txGood],
      [this._t("download"), this._t("good"), port.packets.rxGood],
      [this._t("upload"), this._t("bad"), port.packets.txBad],
      [this._t("download"), this._t("bad"), port.packets.rxBad],
    ].filter(([, , value]) => Number.isFinite(value));
    if (!counters.length) return nothing;
    return html`
      <div class="packet-title">${this._t("packets")}</div>
      <div class="packet-grid">
        ${counters.map(
          ([direction, quality, value]) =>
            html`<div>
              <span>${direction} ${quality}</span
              ><strong>${value.toLocaleString()}</strong>
            </div>`,
        )}
      </div>
    `;
  }

  _renderGlobalControls(model) {
    const controls = [
      ["leds", this._t("leds"), "mdi:led-on"],
      ["igmp_snooping", this._t("igmp_snooping"), "mdi:multicast"],
      [
        "igmp_report_suppression",
        this._t("igmp_report_suppression"),
        "mdi:message-off-outline",
      ],
      [
        "loop_prevention",
        this._t("loop_prevention"),
        "mdi:shield-sync-outline",
      ],
    ].filter(([key]) => model.entities[key]);
    const qos = model.entities.qos_mode;
    if (!controls.length && !qos) return nothing;

    return html`
      <section class="panel">
        <div class="section-title">
          <h3>${this._t("controls")}</h3>
          <ha-icon icon="mdi:tune-variant"></ha-icon>
        </div>
        <div class="control-grid">
          ${controls.map(([key, label, icon]) =>
            this._renderToggle(model.entities[key], label, icon),
          )}
          ${this._renderSelect(qos, this._t("qos_mode"), "mdi:priority-high")}
        </div>
      </section>
    `;
  }

  _renderConfiguration(model) {
    const rows = CONFIGURATION_ENTITIES.filter(([key]) => model.entities[key]);
    if (!rows.length) return nothing;
    return html`
      <section class="panel">
        <div class="section-title">
          <h3>${this._t("configuration")}</h3>
          <ha-icon icon="mdi:lan"></ha-icon>
        </div>
        <div class="configuration-list">
          ${rows.map(([key, label, icon]) => {
            const entity = model.entities[key];
            const state = this._state(entity);
            return html`
              <button
                class="configuration-row"
                @click=${() => this._showMoreInfo(entity)}
              >
                <span class="configuration-name"
                  ><ha-icon icon=${icon}></ha-icon>${label}</span
                >
                <span class="configuration-value"
                  >${state?.state || this._t("offline")}</span
                >
              </button>
            `;
          })}
        </div>
      </section>
    `;
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const model = buildModel(this.hass, this._config);
    if (!model.deviceId) {
      return html`<ha-card
        ><div class="error">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon
          >${this._t("no_device")}
        </div></ha-card
      >`;
    }
    if (!model.ports.length) {
      return html`<ha-card
        >${this._renderHeader(model)}
        <div class="empty">${this._t("no_entities")}</div></ha-card
      >`;
    }

    const selectedNumber = model.ports.some(
      (port) => port.number === this._selectedPort,
    )
      ? this._selectedPort
      : (model.ports.find((port) => port.linked)?.number ??
        model.ports[0].number);
    const selectedPort = model.ports.find(
      (port) => port.number === selectedNumber,
    );
    const compact = this._config.view === "compact";

    return html`
      <ha-card class=${compact ? "compact" : ""}>
        ${this._renderHeader(model)}
        ${this._renderFrontPanel(model, selectedNumber)}
        ${
          compact
            ? nothing
            : this._config.view === "detailed"
              ? model.ports.map((port) => this._renderPortDetails(port))
              : this._renderPortDetails(selectedPort)
        }
        ${
          !compact && this._config.show_controls
            ? this._renderGlobalControls(model)
            : nothing
        }
        ${
          !compact && this._config.show_configuration
            ? this._renderConfiguration(model)
            : nothing
        }
      </ha-card>
    `;
  }
}
