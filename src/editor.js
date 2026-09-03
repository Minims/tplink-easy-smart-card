import { LitElement, html, nothing } from "lit";

import { buildModel, discoverDevices, normalizeConfig } from "./model.js";
import { localize } from "./localize.js";
import { editorStyles } from "./styles.js";

export class TpLinkEasySmartCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static styles = editorStyles;

  setConfig(config) {
    this._config = normalizeConfig(config);
  }

  _t(key) {
    return localize(this.hass?.language, key);
  }

  _update(key, value) {
    const config = { ...this._config, [key]: value };
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config },
      }),
    );
  }

  _updatePortLabel(port, value) {
    const labels = { ...this._config.port_labels };
    if (value.trim()) labels[String(port)] = value.trim();
    else delete labels[String(port)];
    this._update("port_labels", labels);
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const devices = discoverDevices(this.hass);
    const model = buildModel(this.hass, this._config);
    const checkboxes = [
      ["show_traffic", "show_traffic"],
      ["show_controls", "show_controls"],
      ["show_configuration", "show_configuration"],
      ["confirm_actions", "confirm_actions"],
    ];

    return html`
      <div class="editor">
        <label>
          ${this._t("choose_device")}
          <select
            @change=${(event) => this._update("device_id", event.currentTarget.value)}
          >
            <option value="">—</option>
            ${devices.map(
              (device) =>
                html`<option
                  value=${device.id}
                  ?selected=${model.deviceId === device.id}
                >
                  ${device.name} · ${device.model}
                </option>`,
            )}
          </select>
        </label>
        <label>
          ${this._t("title")}
          <input
            type="text"
            .value=${this._config.title}
            @change=${(event) => this._update("title", event.currentTarget.value.trim())}
          />
        </label>
        <label>
          ${this._t("view")}
          <select
            @change=${(event) => this._update("view", event.currentTarget.value)}
          >
            ${["compact", "front_panel", "detailed"].map(
              (view) =>
                html`<option
                  value=${view}
                  ?selected=${this._config.view === view}
                >
                  ${this._t(view)}
                </option>`,
            )}
          </select>
        </label>
        <fieldset>
          <legend>${this._t("options")}</legend>
          ${checkboxes.map(
            ([key, label]) =>
              html`<label class="checkbox">
                <input
                  type="checkbox"
                  .checked=${this._config[key]}
                  @change=${(event) => this._update(key, event.currentTarget.checked)}
                />
                ${this._t(label)}
              </label>`,
          )}
        </fieldset>
        ${
          model.ports.length
            ? html`<fieldset>
                <legend>Port labels</legend>
                <div class="labels">
                  ${model.ports.map(
                    (port) =>
                      html`<label>
                        ${this._t("port")} ${port.number}
                        <input
                          type="text"
                          .value=${this._config.port_labels[String(port.number)] || ""}
                          @change=${(event) =>
                            this._updatePortLabel(
                              port.number,
                              event.currentTarget.value,
                            )}
                        />
                      </label>`,
                  )}
                </div>
              </fieldset>`
            : nothing
        }
      </div>
    `;
  }
}
