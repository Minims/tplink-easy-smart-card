import { describe, expect, it } from "vitest";

import {
  buildModel,
  discoverDevices,
  formatBandwidth,
  inferFunctionId,
  isActionAvailable,
  normalizeConfig,
  safeHttpUrl,
  speedClass,
  speedMbps,
} from "../src/model.js";

function createHass() {
  const entities = {
    "binary_sensor.renamed_uplink": {
      entity_id: "binary_sensor.renamed_uplink",
      unique_id: "aa:bb_port_1_state_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
    "switch.renamed_admin": {
      entity_id: "switch.renamed_admin",
      unique_id: "aa:bb_port_1_enabled_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
    "select.renamed_speed": {
      entity_id: "select.renamed_speed",
      unique_id: "aa:bb_port_1_speed_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
    "sensor.renamed_rx": {
      entity_id: "sensor.renamed_rx",
      unique_id: "aa:bb_port_1_rx_estimated_mbps_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
    "sensor.renamed_network": {
      entity_id: "sensor.renamed_network",
      unique_id: "aa:bb_network_info_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
    "button.renamed_cable": {
      entity_id: "button.renamed_cable",
      unique_id: "aa:bb_port_1_cable_test_aa:bb",
      platform: "tplink_easy_smart",
      device_id: "device-1",
    },
  };
  return {
    entities,
    devices: {
      "device-1": {
        name: "Office Switch",
        model: "TL-SG105E",
        hw_version: "5.0",
        sw_version: "1.0.0",
      },
    },
    states: {
      "binary_sensor.renamed_uplink": {
        state: "on",
        attributes: {
          speed: "1000M Full",
          enabled: true,
          tx_estimated_bandwidth_mbps: 1.25,
          total_estimated_bandwidth_mbps: 2,
        },
      },
      "switch.renamed_admin": { state: "on", attributes: {} },
      "select.renamed_speed": {
        state: "Auto",
        attributes: { options: ["Auto", "1000M Full"] },
      },
      "sensor.renamed_rx": { state: "0.75", attributes: {} },
      "sensor.renamed_network": {
        state: "192.0.2.10",
        attributes: { mac: "AA:BB:CC:DD:EE:FF" },
      },
      "button.renamed_cable": { state: "unknown", attributes: {} },
    },
  };
}

describe("entity discovery", () => {
  it("uses integration registry metadata to discover devices", () => {
    const devices = discoverDevices(createHass());
    expect(devices).toEqual([
      { id: "device-1", name: "Office Switch", model: "TL-SG105E" },
    ]);
  });

  it("infers stable functions independently from renamed entity ids", () => {
    const hass = createHass();
    expect(inferFunctionId(hass.entities["binary_sensor.renamed_uplink"])).toBe(
      "port_1_state",
    );
    expect(inferFunctionId(hass.entities["button.renamed_cable"])).toBe(
      "port_1_cable_test",
    );
    expect(inferFunctionId(hass.entities["sensor.renamed_network"])).toBe(
      "network_info",
    );
  });

  it("supports the legacy English speed entity name as a fallback", () => {
    expect(
      inferFunctionId({ entity_id: "select.office_port_2_speed_and_duplex" }),
    ).toBe("port_2_speed");
  });
});

describe("switch model", () => {
  it("auto-selects the only device and aggregates port data", () => {
    const model = buildModel(createHass(), { port_labels: { 1: "Router" } });
    expect(model.deviceId).toBe("device-1");
    expect(model.online).toBe(true);
    expect(model.activePorts).toBe(1);
    expect(model.ports).toHaveLength(1);
    expect(model.ports[0]).toMatchObject({
      number: 1,
      label: "Router",
      linked: true,
      speed: "1000M Full",
      rx: 0.75,
      tx: 1.25,
      total: 2,
    });
  });

  it("requires explicit selection when multiple switches exist", () => {
    const hass = createHass();
    hass.entities["sensor.second_network"] = {
      entity_id: "sensor.second_network",
      unique_id: "cc:dd_network_info_cc:dd",
      platform: "tplink_easy_smart",
      device_id: "device-2",
    };
    hass.devices["device-2"] = { name: "Garage Switch" };
    expect(buildModel(hass, {}).deviceId).toBe("");
  });
});

describe("display helpers", () => {
  it.each([
    ["100M Full", 100, "fast"],
    ["1000M Full", 1000, "gigabit"],
    ["2.5 Gbps", 2500, "multi-gig"],
  ])("classifies %s", (label, speed, className) => {
    expect(speedMbps(label)).toBe(speed);
    expect(speedClass(label)).toBe(className);
  });

  it("marks disconnected links and formats bandwidth", () => {
    expect(speedClass("1000M Full", false)).toBe("down");
    expect(formatBandwidth(0.125)).toBe("125 Kbps");
    expect(formatBandwidth(5.123)).toBe("5.12 Mbps");
    expect(formatBandwidth(1250)).toBe("1.25 Gbps");
    expect(formatBandwidth(undefined)).toBe("0 Mbps");
  });

  it("keeps unpressed Home Assistant buttons actionable", () => {
    expect(isActionAvailable({ state: "unknown" })).toBe(true);
    expect(isActionAvailable({ state: "unavailable" })).toBe(false);
  });

  it("normalizes invalid and omitted options", () => {
    expect(
      normalizeConfig({ view: "invalid", show_traffic: false }),
    ).toMatchObject({
      view: "front_panel",
      show_traffic: false,
      show_controls: true,
      confirm_actions: true,
    });
  });

  it("only permits HTTP links for the device shortcut", () => {
    expect(safeHttpUrl("http://192.0.2.10")).toBe("http://192.0.2.10/");
    expect(safeHttpUrl("https://switch.example.test/ui")).toBe(
      "https://switch.example.test/ui",
    );
    expect(safeHttpUrl("javascript:alert(1)")).toBe("");
    expect(safeHttpUrl("not a URL")).toBe("");
  });
});
