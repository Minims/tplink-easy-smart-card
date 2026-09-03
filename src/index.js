import { TpLinkEasySmartCard } from "./card.js";
import { TpLinkEasySmartCardEditor } from "./editor.js";

/* global __CARD_VERSION__ */

if (!customElements.get("tplink-easy-smart-card")) {
  customElements.define("tplink-easy-smart-card", TpLinkEasySmartCard);
}

if (!customElements.get("tplink-easy-smart-card-editor")) {
  customElements.define(
    "tplink-easy-smart-card-editor",
    TpLinkEasySmartCardEditor,
  );
}

window.customCards = window.customCards || [];
const cardMetadata = {
  type: "tplink-easy-smart-card",
  name: "TP-Link Easy Smart Card",
  description:
    "Front-panel monitoring and controls for TP-Link Easy Smart switches.",
  preview: true,
  documentationURL: "https://github.com/Minims/tplink-easy-smart-card",
  getEntitySuggestion: (hass, entityId) => {
    const entry = hass?.entities?.[entityId];
    if (entry?.platform !== "tplink_easy_smart" || !entry.device_id)
      return null;
    return {
      config: {
        type: "custom:tplink-easy-smart-card",
        device_id: entry.device_id,
      },
    };
  },
};

if (!window.customCards.some((card) => card.type === cardMetadata.type)) {
  window.customCards.push(cardMetadata);
}

console.info(
  `%c TP-LINK-EASY-SMART-CARD %c ${__CARD_VERSION__} `,
  "color: white; background: #00897b; font-weight: 700;",
  "color: #00897b; background: white; font-weight: 700;",
);
