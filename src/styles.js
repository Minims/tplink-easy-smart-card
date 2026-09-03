import { css } from "lit";

export const cardStyles = css`
  :host {
    display: block;
    --tesc-green: var(--success-color, #43a047);
    --tesc-amber: var(--warning-color, #f9a825);
    --tesc-blue: #00acc1;
    --tesc-muted: var(--secondary-text-color, #727272);
    --tesc-border: color-mix(
      in srgb,
      var(--divider-color, #888) 68%,
      transparent
    );
  }

  * {
    box-sizing: border-box;
  }

  ha-card {
    overflow: hidden;
  }

  button,
  select {
    font: inherit;
  }

  button {
    color: inherit;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 20px 14px;
  }

  .heading {
    min-width: 0;
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    overflow: hidden;
    font-size: 1.3rem;
    font-weight: 500;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
  }

  .summary,
  .metadata {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    margin-top: 5px;
    color: var(--tesc-muted);
    font-size: 0.82rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color, #db4437);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--error-color, #db4437) 18%, transparent);
  }

  .status-dot.online {
    background: var(--tesc-green);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--tesc-green) 18%, transparent);
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }

  .icon-button,
  .close-button {
    display: inline-grid;
    width: 40px;
    height: 40px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }

  .icon-button:hover,
  .close-button:hover {
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
  }

  .icon-button:disabled,
  .control:disabled,
  .action:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .panel {
    margin: 0 16px 16px;
    padding: 14px;
    border: 1px solid var(--tesc-border);
    border-radius: 15px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 60%),
      color-mix(
        in srgb,
        var(--card-background-color) 94%,
        var(--primary-text-color)
      );
  }

  .front-panel {
    position: relative;
    background: linear-gradient(145deg, #30363a, #15191c);
    color: #f4f7f8;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 12%),
      0 5px 16px rgb(0 0 0 / 16%);
  }

  .front-panel::before,
  .front-panel::after {
    position: absolute;
    top: 12px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #050607;
    box-shadow: inset 0 1px 1px rgb(255 255 255 / 24%);
    content: "";
  }

  .front-panel::before {
    left: 12px;
  }

  .front-panel::after {
    right: 12px;
  }

  .brand-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 12px 11px;
    color: #aeb8bd;
    font-size: 0.68rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .ports {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
    gap: 10px;
  }

  .port {
    min-width: 0;
    padding: 5px 5px 7px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .port:hover,
  .port.selected {
    border-color: rgb(255 255 255 / 22%);
    background: rgb(255 255 255 / 7%);
  }

  .jack {
    display: block;
    position: relative;
    width: min(58px, 100%);
    height: 43px;
    margin: 0 auto 6px;
    border: 3px solid #090b0c;
    border-radius: 5px 5px 8px 8px;
    background: #050708;
    box-shadow:
      inset 0 0 0 1px #444,
      0 1px 0 rgb(255 255 255 / 10%);
  }

  .jack::before {
    position: absolute;
    top: 6px;
    right: 7px;
    left: 7px;
    height: 7px;
    background: repeating-linear-gradient(
      90deg,
      #c49a35 0 2px,
      transparent 2px 5px
    );
    content: "";
  }

  .jack::after {
    position: absolute;
    right: 14px;
    bottom: 0;
    left: 14px;
    height: 11px;
    border-radius: 4px 4px 0 0;
    background: #15191b;
    content: "";
  }

  .link-light {
    position: absolute;
    right: 3px;
    bottom: 3px;
    z-index: 1;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #30363a;
  }

  .fast .link-light {
    background: var(--tesc-amber);
    box-shadow: 0 0 7px var(--tesc-amber);
  }

  .gigabit .link-light,
  .linked .link-light {
    background: #53d769;
    box-shadow: 0 0 7px #53d769;
  }

  .multi-gig .link-light {
    background: #29d8ef;
    box-shadow: 0 0 8px #29d8ef;
  }

  .port-number {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .port-speed,
  .port-label {
    display: block;
    overflow: hidden;
    color: #aeb8bd;
    font-size: 0.68rem;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .port-label {
    color: #e7ecef;
  }

  .details-header,
  .section-title,
  .cable-row,
  .configuration-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .details-header {
    margin-bottom: 14px;
  }

  .link-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    color: var(--tesc-muted);
    font-size: 0.8rem;
  }

  .traffic-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }

  .metric {
    min-width: 0;
    padding: 10px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
  }

  .metric span {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--tesc-muted);
    font-size: 0.72rem;
  }

  .metric strong {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .packet-title {
    margin: -2px 0 6px;
    color: var(--tesc-muted);
    font-size: 0.75rem;
  }

  .packet-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 14px;
  }

  .packet-grid div {
    min-width: 0;
    padding: 7px 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
  }

  .packet-grid span,
  .packet-grid strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .packet-grid span {
    color: var(--tesc-muted);
    font-size: 0.68rem;
  }

  .packet-grid strong {
    margin-top: 2px;
    font-size: 0.82rem;
  }

  .control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .control,
  .select-control,
  .configuration-row {
    min-height: 48px;
    border: 0;
    border-radius: 10px;
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 11px;
    cursor: pointer;
  }

  .control-label,
  .select-control label {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    font-size: 0.84rem;
  }

  .control-state {
    width: 30px;
    height: 17px;
    padding: 2px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--primary-text-color) 22%, transparent);
    transition: background 150ms ease;
  }

  .control-state::after {
    display: block;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--card-background-color, white);
    box-shadow: 0 1px 3px rgb(0 0 0 / 35%);
    transition: transform 150ms ease;
    content: "";
  }

  .control.on .control-state {
    background: var(--primary-color);
  }

  .control.on .control-state::after {
    transform: translateX(13px);
  }

  .select-control {
    padding: 7px 10px;
  }

  .select-control label {
    margin-bottom: 4px;
    color: var(--tesc-muted);
    font-size: 0.7rem;
  }

  .select-control select {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--primary-text-color);
  }

  .section-title {
    margin-bottom: 10px;
  }

  .section-title ha-icon {
    color: var(--tesc-muted);
  }

  .cable-row {
    margin-top: 10px;
    padding: 10px 0 0;
    border-top: 1px solid var(--tesc-border);
    font-size: 0.84rem;
  }

  .cable-result {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 12px;
    color: var(--tesc-muted);
  }

  .action {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    gap: 6px;
    padding: 6px 11px;
    border: 0;
    border-radius: 9px;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
    cursor: pointer;
  }

  .configuration-list {
    display: grid;
    gap: 7px;
  }

  .configuration-row {
    width: 100%;
    padding: 8px 11px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .configuration-name {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .configuration-value {
    overflow: hidden;
    max-width: 45%;
    color: var(--tesc-muted);
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty,
  .error {
    padding: 24px 20px;
    color: var(--tesc-muted);
    text-align: center;
  }

  .error ha-icon {
    display: block;
    margin: 0 auto 8px;
    color: var(--warning-color);
  }

  .compact .header {
    padding-bottom: 10px;
  }

  .compact .front-panel {
    margin-bottom: 16px;
  }

  @media (max-width: 520px) {
    .header {
      padding: 16px 16px 12px;
    }

    .panel {
      margin: 0 12px 12px;
      padding: 12px;
    }

    .ports {
      grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
      gap: 5px;
    }

    .control-grid {
      grid-template-columns: 1fr;
    }

    .traffic-grid {
      gap: 5px;
    }

    .packet-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .metric {
      padding: 8px 6px;
    }

    .header-actions .icon-button {
      width: 36px;
      height: 36px;
    }
  }
`;

export const editorStyles = css`
  :host {
    display: block;
  }

  * {
    box-sizing: border-box;
  }

  .editor {
    display: grid;
    gap: 16px;
    padding: 8px 0;
  }

  label {
    display: grid;
    gap: 6px;
    color: var(--secondary-text-color);
    font-size: 0.85rem;
  }

  input,
  select {
    width: 100%;
    min-height: 42px;
    padding: 8px 10px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    outline: none;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font: inherit;
  }

  input:focus,
  select:focus {
    border-color: var(--primary-color);
  }

  fieldset {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 10px;
  }

  legend {
    padding: 0 5px;
    color: var(--primary-text-color);
    font-size: 0.85rem;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--primary-text-color);
  }

  .checkbox input {
    width: 18px;
    min-height: 18px;
  }

  .labels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
`;
