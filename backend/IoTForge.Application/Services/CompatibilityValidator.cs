using IoTForge.Application.DTOs;
using IoTForge.Application.Interfaces;

namespace IoTForge.Application.Services;

public class CompatibilityValidator : ICompatibilityValidator
{
    public CompatibilityValidationResult Validate(StructuredProjectOutput project)
    {
        var result = new CompatibilityValidationResult();
        var controller = project.Project.Controller.ToUpperInvariant();
        var isEsp32 = controller.Contains("ESP32");
        var is33vLogic = isEsp32 || controller.Contains("STM32") || controller.Contains("RP2040") || controller.Contains("RASPBERRY");

        // 1. Motor & Inductive Load Direct GPIO Check
        foreach (var comp in project.Components)
        {
            var compName = comp.Name.ToLowerInvariant();
            var isInductive = compName.Contains("motor") || compName.Contains("pump") || compName.Contains("solenoid") || compName.Contains("fan");
            if (isInductive)
            {
                // Verify there is a relay, mosfet driver, or motor driver shield
                var hasDriver = project.Components.Any(c =>
                {
                    var n = c.Name.ToLowerInvariant();
                    return n.Contains("relay") || n.Contains("mosfet") || n.Contains("driver") || n.Contains("h-bridge") || n.Contains("l298") || n.Contains("transistor");
                });

                if (!hasDriver)
                {
                    result.Issues.Add(new CompatibilityIssue
                    {
                        Severity = "Critical",
                        Title = "Direct GPIO Motor/Pump Connection Hazard",
                        Description = $"Component '{comp.Name}' is an inductive load and draws high current with back-EMF spikes.",
                        Recommendation = "Add a 5V/12V Relay module, Optocoupler, or Logic-Level N-Channel MOSFET (e.g., IRLZ44N) with a flyback diode to prevent microcontroller destruction."
                    });
                    result.SafetyReviewRequired = true;
                    result.SafetyReviewReason = "High-current inductive load requires intermediate switching stage (relay or MOSFET driver).";
                }
            }

            // 2. Mains Voltage (110V - 240V AC) Warning
            var isMains = compName.Contains("mains") || compName.Contains("220v") || compName.Contains("110v") || compName.Contains("ac power") || compName.Contains("high voltage");
            if (isMains)
            {
                result.Issues.Add(new CompatibilityIssue
                {
                    Severity = "Critical",
                    Title = "High Voltage Mains AC Hazard",
                    Description = "The project interfaces with household/industrial alternating current (110V–240V AC). Risk of lethal electrocution or fire.",
                    Recommendation = "Ensure galvanic isolation with CE/UL certified opto-isolated relay modules. Enclose all AC contacts in an IP-rated junction box. Certified electrician installation recommended."
                });
                result.SafetyReviewRequired = true;
                result.SafetyReviewReason = "Project interfaces with hazardous mains AC voltages.";
            }
        }

        // 3. Logic Level Clashes (3.3V vs 5V)
        if (is33vLogic)
        {
            foreach (var conn in project.Connections)
            {
                var isVccOrGnd = conn.Signal.Equals("VCC", StringComparison.OrdinalIgnoreCase) ||
                                 conn.Signal.Equals("GND", StringComparison.OrdinalIgnoreCase) ||
                                 conn.Signal.Equals("5V", StringComparison.OrdinalIgnoreCase);

                if (!isVccOrGnd && conn.Voltage.Contains("5V") && !conn.Description.ToLowerInvariant().Contains("divider") && !conn.Description.ToLowerInvariant().Contains("shifter"))
                {
                    result.Issues.Add(new CompatibilityIssue
                    {
                        Severity = "Warning",
                        Title = "Logic Level Mismatch (5V into 3.3V GPIO)",
                        Description = $"Connection '{conn.FromComponent} {conn.FromPin} -> {conn.ToComponent} {conn.ToPin}' carries a 5V signal into a 3.3V tolerant microcontroller pin.",
                        Recommendation = "Use a bi-directional logic level converter (BSS138 based) or a resistor voltage divider (1kΩ / 2kΩ) on input lines to protect the GPIO."
                    });
                }
            }
        }

        // 4. Pin Conflict Check (Exclusive GPIO overlap)
        var pinUsage = new Dictionary<string, List<string>>();
        foreach (var conn in project.Connections)
        {
            string mcuPin = "";
            string peripheral = "";

            if (conn.FromComponent.Contains("ESP", StringComparison.OrdinalIgnoreCase) ||
                conn.FromComponent.Contains("Arduino", StringComparison.OrdinalIgnoreCase) ||
                conn.FromComponent.Contains("STM32", StringComparison.OrdinalIgnoreCase) ||
                conn.FromComponent.Contains("Raspberry", StringComparison.OrdinalIgnoreCase))
            {
                mcuPin = conn.FromPin;
                peripheral = $"{conn.ToComponent}:{conn.Signal}";
            }
            else if (conn.ToComponent.Contains("ESP", StringComparison.OrdinalIgnoreCase) ||
                     conn.ToComponent.Contains("Arduino", StringComparison.OrdinalIgnoreCase) ||
                     conn.ToComponent.Contains("STM32", StringComparison.OrdinalIgnoreCase) ||
                     conn.ToComponent.Contains("Raspberry", StringComparison.OrdinalIgnoreCase))
            {
                mcuPin = conn.ToPin;
                peripheral = $"{conn.FromComponent}:{conn.Signal}";
            }

            if (!string.IsNullOrEmpty(mcuPin) && !mcuPin.Equals("GND", StringComparison.OrdinalIgnoreCase) &&
                !mcuPin.Equals("VCC", StringComparison.OrdinalIgnoreCase) && !mcuPin.Equals("3V3", StringComparison.OrdinalIgnoreCase) &&
                !mcuPin.Equals("5V", StringComparison.OrdinalIgnoreCase) && !mcuPin.Equals("VIN", StringComparison.OrdinalIgnoreCase))
            {
                var isBusPin = mcuPin.Contains("SDA", StringComparison.OrdinalIgnoreCase) ||
                               mcuPin.Contains("SCL", StringComparison.OrdinalIgnoreCase) ||
                               mcuPin.Contains("SCK", StringComparison.OrdinalIgnoreCase) ||
                               mcuPin.Contains("MOSI", StringComparison.OrdinalIgnoreCase) ||
                               mcuPin.Contains("MISO", StringComparison.OrdinalIgnoreCase) ||
                               conn.Signal.Contains("SDA", StringComparison.OrdinalIgnoreCase) ||
                               conn.Signal.Contains("SCL", StringComparison.OrdinalIgnoreCase) ||
                               conn.Signal.Contains("I2C", StringComparison.OrdinalIgnoreCase) ||
                               conn.Signal.Contains("SPI", StringComparison.OrdinalIgnoreCase);

                if (!isBusPin)
                {
                    if (!pinUsage.ContainsKey(mcuPin))
                        pinUsage[mcuPin] = new List<string>();

                    pinUsage[mcuPin].Add(peripheral);
                }
            }
        }

        foreach (var kvp in pinUsage)
        {
            if (kvp.Value.Count > 1)
            {
                result.Issues.Add(new CompatibilityIssue
                {
                    Severity = "Error",
                    Title = $"GPIO Pin Conflict on {kvp.Key}",
                    Description = $"Pin {kvp.Key} is assigned to multiple devices ({string.Join(", ", kvp.Value)}) simultaneously.",
                    Recommendation = "Assign each dedicated digital/analog peripheral to a distinct GPIO pin on the microcontroller."
                });
                result.IsValid = false;
            }
        }

        if (result.Issues.Any(i => i.Severity == "Critical"))
        {
            result.SafetyReviewRequired = true;
        }

        return result;
    }
}
