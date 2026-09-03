# TP-Link Easy Smart Card

A modern Home Assistant dashboard card for switches managed by
[`hass_tplink_easy_smart`](https://github.com/Minims/hass_tplink_easy_smart). It presents the
switch as a responsive front panel and exposes monitoring, configuration, and diagnostics without
requiring direct access to the switch from the browser.

[![Validate](https://github.com/Minims/tplink-easy-smart-card/actions/workflows/validate.yml/badge.svg)](https://github.com/Minims/tplink-easy-smart-card/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/Minims/tplink-easy-smart-card)](https://github.com/Minims/tplink-easy-smart-card/releases/latest)
[![License](https://img.shields.io/github/license/Minims/tplink-easy-smart-card)](LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/Buy_me_a_coffee-minims-FFDD00?logo=buymeacoffee&logoColor=000)](https://www.buymeacoffee.com/minims)

## Companion repositories

The integration and dashboard card are maintained together but installed as two separate HACS
repositories:

| Component                  | Repository                                                                          | Open in HACS                                                                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home Assistant integration | [`Minims/hass_tplink_easy_smart`](https://github.com/Minims/hass_tplink_easy_smart) | [![Open the TP-Link Easy Smart integration in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Minims&repository=hass_tplink_easy_smart&category=integration) |
| Dashboard card             | [`Minims/tplink-easy-smart-card`](https://github.com/Minims/tplink-easy-smart-card) | [![Open the TP-Link Easy Smart Card in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Minims&repository=tplink-easy-smart-card&category=plugin)             |

## Features

- Automatic switch and port discovery by Home Assistant `device_id`; renamed entity IDs work.
- Link state and negotiated-speed colors, optional port labels, RX/TX/total estimated bandwidth.
- Per-port enable, flow control, speed/duplex, QoS priority, PoE, and cable-test controls when exposed.
- Switch-wide LED, IGMP snooping, IGMP report suppression, loop prevention, and QoS controls.
- Reboot confirmation, direct switch web-interface shortcut, and VLAN/LAG/PVID summaries.
- Compact, front-panel, and detailed layouts suitable for Sections dashboards and mobile screens.
- English and French interface, Home Assistant theme support, and a visual card editor.
- Card-picker suggestions when starting from an Easy Smart entity on Home Assistant 2026.6 or newer.

Controls and sections are capability-driven: unsupported entities are omitted instead of displayed as
broken controls. VLAN and LAG rows only appear when the integration detects the corresponding firmware
pages. They may report a disabled or empty configuration when the feature exists but is not configured.

## Requirements

- Home Assistant with the [TP-Link Easy Smart integration](https://github.com/Minims/hass_tplink_easy_smart)
  installed and configured. Version `2026.9.7` or newer is recommended.
- HACS with Dashboard repositories enabled, or manual installation of the release asset.

## Installation

### HACS

1. Select the Dashboard card badge above, or add `https://github.com/Minims/tplink-easy-smart-card`
   as a custom **Dashboard** repository in HACS.
2. Install **TP-Link Easy Smart Card** and restart Home Assistant if HACS requests it.
3. Refresh the browser cache, then add the card from the dashboard editor.

HACS normally registers the JavaScript resource automatically. If needed, add
`/hacsfiles/tplink-easy-smart-card/tplink-easy-smart-card.js` as a JavaScript module under
**Settings → Dashboards → Resources**.

### Manual

Download `tplink-easy-smart-card.js` from the latest GitHub release into `config/www/`, then register
`/local/tplink-easy-smart-card.js` as a JavaScript module.

## Configuration

The visual editor discovers all devices provided by `tplink_easy_smart`. If exactly one compatible
device exists, the card can select it automatically.

```yaml
type: custom:tplink-easy-smart-card
device_id: 0123456789abcdef0123456789abcdef
title: Bureau
view: front_panel # compact, front_panel, or detailed
show_traffic: true
show_controls: true
show_configuration: true
confirm_actions: true
port_labels:
  "1": Routeur
  "2": Point d'accès
  "5": NAS
```

| Option               | Default       | Description                                                              |
| -------------------- | ------------- | ------------------------------------------------------------------------ |
| `device_id`          | auto          | Home Assistant device registry ID; required when several switches exist. |
| `title`              | device name   | Optional card title.                                                     |
| `view`               | `front_panel` | `compact` hides details; other layouts expose a selected port.           |
| `show_traffic`       | `true`        | Shows estimated RX, TX, and total bandwidth.                             |
| `show_controls`      | `true`        | Shows available port and global controls.                                |
| `show_configuration` | `true`        | Shows available VLAN, PVID, and LAG summaries.                           |
| `confirm_actions`    | `true`        | Confirms reboot, port disable, and cable test.                           |
| `port_labels`        | `{}`          | Maps physical port numbers to friendly labels.                           |

Estimated bandwidth is derived from packet counters and polling intervals; it is not hardware-grade
traffic accounting. Configuration changes and cable tests may briefly interrupt connectivity. Test
write operations on a non-critical port first.

## Development

Requires Node.js 20.19 or newer.

```bash
npm ci             # install locked dependencies
npm test           # run unit tests
npm run lint       # run ESLint
npm run build      # create dist/tplink-easy-smart-card.js
npm run check      # run formatting, lint, tests, and build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution details. This project is released under the
[MIT License](LICENSE).
