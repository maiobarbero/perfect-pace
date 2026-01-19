# Google Analytics 4 Configuration Guide

To fully utilize the custom events implemented in "Perfect Pace", you need to configure **Custom Definitions** (Custom Dimensions and Metrics) in your Google Analytics 4 property.

## Custom Events Overview

The application tracks the following custom events:

1.  **`pwa_install`**
    *   Triggered when the user installs the PWA.
    *   Parameters: `value` (always 1), `event_category` ('pwa'), `event_label` ('install').

2.  **`recalculate_plan`**
    *   Triggered when the user calculates a new pace strategy.
    *   Parameters: `distance` (km), `strategy` (name), `target_time` (hh:mm:ss), `event_category`, `event_label`.

3.  **`export_csv`**
    *   Triggered when the user exports the plan to CSV.
    *   Parameters: `distance` (km), `event_category`, `event_label`.

4.  **`print_wristband`**
    *   Triggered when the user clicks the "Print Now" button.
    *   Parameters: `distance` (km), `event_category`, `event_label`.

## Configuration Steps

To see these parameters in your reports (e.g., to see which `strategy` is most popular), you must register them as Custom Dimensions.

1.  Go to **Admin** > **Data display** > **Custom definitions**.
2.  Click **Create custom dimension**.
3.  Add the following dimensions:

| Dimension Name | Scope | Event Parameter | Description |
| :--- | :--- | :--- | :--- |
| **Race Distance** | Event | `distance` | The distance selected by the user (e.g., 42.195). |
| **Pacing Strategy** | Event | `strategy` | The strategy name (e.g., 'negative-half'). |
| **Target Time** | Event | `target_time` | The target time input by the user. |
| **Event Category** | Event | `event_category` | Category of the event (Legacy GA style). |
| **Event Label** | Event | `event_label` | Label of the event (Legacy GA style). |

### Optional Metrics

If you want to aggregate the `value` parameter (used in `pwa_install`), create a Custom Metric:

1.  Click **Create custom metric**.
2.  Enter details:
    *   **Metric name**: PWA Installs (Value)
    *   **Scope**: Event
    *   **Event parameter**: `value`
    *   **Unit of measurement**: Standard

## Verification

After configuration, wait 24-48 hours for data to populate in standard reports. You can verify immediate data flow using the **DebugView** in GA4:
1.  Enable the "Analytics" cookie on the site.
2.  Perform actions (Calculate Plan, etc.).
3.  Check **Admin** > **Data display** > **DebugView** to see events and their parameters in real-time.
