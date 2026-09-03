export const INTEGRATION = "tplink_easy_smart";

const PORT_FUNCTIONS = [
  "total_estimated_mbps",
  "tx_estimated_mbps",
  "rx_estimated_mbps",
  "tx_good_packets",
  "rx_good_packets",
  "tx_bad_packets",
  "rx_bad_packets",
  "qos_priority",
  "flow_control",
  "cable_status",
  "cable_length",
  "cable_test",
  "poe_enabled",
  "poe_state",
  "enabled",
  "speed",
  "state",
];

const GLOBAL_FUNCTIONS = [
  "igmp_report_suppression",
  "8021q_vlan_configuration",
  "port_vlan_configuration",
  "mtu_vlan_configuration",
  "lag_configuration",
  "pvid_configuration",
  "loop_prevention",
  "poe_consumption",
  "igmp_snooping",
  "network_info",
  "qos_mode",
  "reboot",
  "leds",
];

const UNAVAILABLE_STATES = new Set(["unavailable", "unknown"]);

export function normalizeConfig(config = {}) {
  return {
    type: "custom:tplink-easy-smart-card",
    device_id: config.device_id || "",
    title: config.title || "",
    view: ["compact", "front_panel", "detailed"].includes(config.view)
      ? config.view
      : "front_panel",
    show_traffic: config.show_traffic !== false,
    show_controls: config.show_controls !== false,
    show_configuration: config.show_configuration !== false,
    confirm_actions: config.confirm_actions !== false,
    port_labels:
      config.port_labels && typeof config.port_labels === "object"
        ? config.port_labels
        : {},
  };
}

function containsFunction(source, functionId) {
  const escaped = functionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|_)${escaped}(?:_|$)`).test(source);
}

export function inferFunctionId(entry) {
  const source = [entry?.unique_id, entry?.entity_id, entry?.original_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  const portMatch = source.match(/(?:^|_)port_(\d+)_([a-z0-9_]+)/);
  if (portMatch) {
    const port = Number(portMatch[1]);
    const tail = portMatch[2];
    const functionName = PORT_FUNCTIONS.find(
      (candidate) =>
        tail === candidate ||
        tail.startsWith(`${candidate}_`) ||
        (candidate === "speed" && tail.startsWith("speed_and_duplex")),
    );
    if (functionName) return `port_${port}_${functionName}`;
  }

  return GLOBAL_FUNCTIONS.find((candidate) =>
    containsFunction(source, candidate),
  );
}

export function discoverDevices(hass) {
  const ids = new Set(
    Object.values(hass?.entities || {})
      .filter((entry) => entry.platform === INTEGRATION && entry.device_id)
      .map((entry) => entry.device_id),
  );

  return [...ids]
    .map((id) => {
      const device = hass?.devices?.[id] || {};
      return {
        id,
        name: device.name_by_user || device.name || id,
        model: device.model || "TP-Link Easy Smart",
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function entityState(hass, entity) {
  return entity ? hass?.states?.[entity.entity_id] : undefined;
}

export function isAvailable(state) {
  return Boolean(state && !UNAVAILABLE_STATES.has(state.state));
}

export function isActionAvailable(state) {
  return Boolean(state && state.state !== "unavailable");
}

function numericState(state) {
  if (!isAvailable(state)) return undefined;
  const value = Number(state.state);
  return Number.isFinite(value) ? value : undefined;
}

function makePort(number, entities, hass, labels) {
  const getEntity = (name) => entities[`port_${number}_${name}`];
  const getState = (name) => entityState(hass, getEntity(name));
  const linkEntity = getEntity("state");
  const linkState = getState("state");
  const attributes = linkState?.attributes || {};

  return {
    number,
    label: labels[String(number)] || labels[number] || "",
    entities: Object.fromEntries(
      PORT_FUNCTIONS.map((name) => [name, getEntity(name)]).filter(
        ([, entity]) => Boolean(entity),
      ),
    ),
    linkEntity,
    available: isAvailable(linkState),
    linked: isAvailable(linkState) && linkState.state === "on",
    speed: attributes.speed || "Link Down",
    tx:
      numericState(getState("tx_estimated_mbps")) ??
      attributes.tx_estimated_bandwidth_mbps,
    rx:
      numericState(getState("rx_estimated_mbps")) ??
      attributes.rx_estimated_bandwidth_mbps,
    total:
      numericState(getState("total_estimated_mbps")) ??
      attributes.total_estimated_bandwidth_mbps,
    cableStatus: getState("cable_status")?.state,
    cableLength: numericState(getState("cable_length")),
    poeActive: getState("poe_state")?.state === "on",
    packets: {
      txGood: numericState(getState("tx_good_packets")),
      rxGood: numericState(getState("rx_good_packets")),
      txBad: numericState(getState("tx_bad_packets")),
      rxBad: numericState(getState("rx_bad_packets")),
    },
  };
}

export function buildModel(hass, rawConfig = {}) {
  const config = normalizeConfig(rawConfig);
  const devices = discoverDevices(hass);
  const deviceId =
    config.device_id || (devices.length === 1 ? devices[0].id : "");
  const registryEntries = Object.values(hass?.entities || {}).filter(
    (entry) => entry.device_id === deviceId,
  );
  const entities = {};

  for (const entry of registryEntries) {
    const functionId = inferFunctionId(entry);
    if (functionId && !entities[functionId]) entities[functionId] = entry;
  }

  const portNumbers = new Set();
  for (const functionId of Object.keys(entities)) {
    const match = functionId.match(/^port_(\d+)_/);
    if (match) portNumbers.add(Number(match[1]));
  }
  const ports = [...portNumbers]
    .sort((left, right) => left - right)
    .map((number) => makePort(number, entities, hass, config.port_labels));
  const device = hass?.devices?.[deviceId] || {};
  const network = entityState(hass, entities.network_info);
  const online = isAvailable(network) || ports.some((port) => port.available);

  return {
    deviceId,
    device,
    entities,
    ports,
    network,
    online,
    title:
      config.title ||
      device.name_by_user ||
      device.name ||
      "TP-Link Easy Smart",
    activePorts: ports.filter((port) => port.linked).length,
  };
}

export function speedMbps(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "").toLowerCase();
  const number = Number.parseFloat(normalized.replace(",", "."));
  if (!Number.isFinite(number)) return 0;
  if (/\b(?:g|gb|gbit)/.test(normalized)) return number * 1000;
  return number;
}

export function speedClass(value, linked = true) {
  if (!linked) return "down";
  const speed = speedMbps(value);
  if (speed >= 2500) return "multi-gig";
  if (speed >= 1000) return "gigabit";
  if (speed > 0) return "fast";
  return "linked";
}

export function formatBandwidth(value) {
  const bandwidth = Number(value);
  if (!Number.isFinite(bandwidth) || bandwidth <= 0) return "0 Mbps";
  if (bandwidth >= 1000) return `${(bandwidth / 1000).toFixed(2)} Gbps`;
  if (bandwidth < 1) return `${Math.round(bandwidth * 1000)} Kbps`;
  return `${bandwidth.toFixed(bandwidth < 10 ? 2 : 1)} Mbps`;
}

export function entityOptions(hass, entity) {
  return entityState(hass, entity)?.attributes?.options || [];
}

export function safeHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
