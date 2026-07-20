# Aegis Master Industrial Knowledge Base
**Version:** 3.1.4
**Department:** Plant Operations & Safety
**Classification:** Internal / Restricted

This document contains the comprehensive standard operating procedures (SOPs), safety protocols, equipment profiles, and emergency response guidelines for the industrial plant.

---

## 1. Safety Procedures & Protocols

### 1.1 Lockout-Tagout (LOTO) Protocol
The Lockout-Tagout (LOTO) protocol is a critical safety procedure designed to ensure that dangerous machines are properly shut off and not able to be started up again prior to the completion of maintenance or repair work.

**Execution Steps for LOTO:**
1. **Preparation:** Notify all affected operators that a LOTO procedure is initiating. Identify all energy sources (electrical, mechanical, pneumatic, hydraulic, thermal, chemical).
2. **Shutdown:** Stop the machine or equipment using normal operating procedures (e.g., depress stop button, open toggle switch).
3. **Isolation:** Isolate the equipment from all energy sources. Throw main breakers, close valves, and disconnect air lines.
4. **Lock and Tag:** Apply lockout devices (padlocks) and highly visible tagout devices (warning tags) to the energy isolating devices. Only the authorized employee performing the maintenance can apply their specific lock.
5. **Stored Energy:** Safely release, restrain, or dissipate any stored or residual energy. This includes bleeding pressure from lines, blocking elevated parts that could fall by gravity, and discharging capacitors.
6. **Verification (The "Try" Step):** Verify isolation by attempting to start the equipment. If it does not start, the equipment is confirmed secure. Return controls to the "off" position after verification.
7. **Removal:** After maintenance is complete, clear all tools from the area, ensure guards are replaced, and notify affected employees before the lock and tag are removed by the authorized employee.

### 1.2 Hazardous Chemical Handling Procedures
Handling of hazardous chemicals (e.g., sulfuric acid, sodium hydroxide, volatile organic solvents) requires strict adherence to Safety Data Sheet (SDS) guidelines.

**Core Chemical Safety Rules:**
- **Ventilation:** Always use local exhaust ventilation (fume hoods or extraction arms) when decanting volatile or fuming chemicals.
- **Personal Protective Equipment (PPE):** Minimum required PPE includes chemical-resistant apron (Viton or Neoprene), full-face respirator with appropriate vapor cartridges, heavy-duty nitrile gloves, and chemical splash goggles.
- **Storage:** Secondary containment pallets must be used for all chemical drums and IBC totes to capture potential leaks. Never store strong oxidizers near flammable solvents.
- **Incompatibilities:** Never mix strong acids with organic solvents due to the risk of violent exothermic reactions and spontaneous combustion.
- **Spill Response:** In the event of a chemical spill exceeding 5 gallons, immediately evacuate the immediate area, activate the chemical spill alarm, and utilize the neutralizing agents located in the yellow bins at Safety Station C.

---

## 2. Equipment Maintenance & Profiles

### 2.1 Pump Maintenance Safety Procedure (Centrifugal Pumps)
Before initiating any maintenance on industrial centrifugal pumps (such as PUMP-101, PUMP-202, or PUMP-305), operators must strictly follow these procedures to prevent injury from high-pressure fluids or rotating parts.

**Centrifugal Pump Maintenance SOP:**
- **Isolation:** Ensure the pump is completely isolated from the piping system using double block and bleed valves on both the suction and discharge lines.
- **Depressurization:** Depressurize the system and drain any residual fluid into an approved containment vessel. Do not drain hazardous fluids into the general floor trench.
- **Thermal Safety:** Verify that the pump casing has cooled to ambient temperature (< 40°C / 104°F) before opening the casing.
- **PPE Requirements:** Face shields, heavy-duty impact gloves, and steel-toed boots are mandatory.
- **Seal Replacement:** When replacing mechanical seals, alignment must be verified using laser alignment tools. Misalignment greater than 0.002 inches will cause premature seal failure and severe cavitation.
- **Startup Rule:** Never operate the pump dry under any circumstances. Dry running will cause immediate catastrophic mechanical seal failure due to thermal shock.

### 2.2 Equipment Profile: VALVE-402
**ID:** VALVE-402
**Type:** 12-inch Pneumatic Gate Valve
**Location:** High-Pressure Cooling Water Loop (Sector 4)

- **Operating Parameters:** Normal Operating Pressure is 150 PSI. Maximum allowable working pressure (MAWP) is 250 PSI.
- **Actuator Specifications:** Features a spring-return pneumatic actuator (Fail-Closed configuration). It requires an instrument air supply of 80 PSI to actuate fully.
- **Maintenance Frequency:** Requires quarterly inspection. Maintenance involves stem lubrication using lithium-based grease and calibration of the electronic limit switches.
- **Known Issues & Troubleshooting:** VALVE-402 is susceptible to stem binding if lubrication schedules are missed, or if the limit switches are misaligned due to pipeline vibration. If the valve fails to close fully, check the actuator air pressure and lubricate the stem before attempting manual override.
- **Parts:** Replacement parts must meet ANSI Class 300 specifications.

### 2.3 Equipment Profile: COMP-703
**ID:** COMP-703
**Type:** Two-Stage Rotary Screw Compressor
**Location:** Instrument Air Plant

- **Function:** Supplies clean, dry compressed air to pneumatic actuators plant-wide.
- **Operating Parameters:** Discharge pressure setpoint: 110 PSI.
- **Maintenance & Alerts:** If the high discharge temperature alarm is triggered, immediately check the cooling water inlet flow. The most common cause of high temperature in this unit is a fouled or blocked bypass valve on the primary heat exchanger.

### 2.4 Equipment Profile: GEN-501
**ID:** GEN-501
**Type:** Backup Diesel Generator (2.5 MW)
**Location:** Power Utility Building

- **Function:** Provides emergency power to critical safety systems (fire pumps, control room) during grid failures.
- **Maintenance:** Weekly no-load test runs. Quarterly full-load bank testing.
- **Alerts:** Stator temperature alarms typically indicate fouled air intake filters or a malfunctioning cooling fan pitch controller. Immediate filter cleaning is required if stator temps exceed 95°C.

---

## 3. Emergency Response Plans

### 3.1 Fire Response Protocol
- **Detection:** Upon smelling smoke or seeing flames, immediately activate the nearest red manual pull station.
- **Evacuation:** Evacuate via the designated green emergency exit routes. Do not use elevators. Muster at Assembly Point Alpha (North Parking Lot).
- **Suppression:** Only attempt to extinguish small, incipient-stage fires using portable extinguishers if you are trained and it is safe to do so. Use Class B/C (CO2 or Dry Chemical) on electrical fires. Do NOT use water on electrical fires or chemical metal fires.

### 3.2 High-Pressure Steam Leak Response
- High-pressure steam leaks may be invisible to the naked eye. If you hear a loud hissing sound near the steam headers, STOP immediately.
- Use the "broom test" (waving a broom handle in front of you) to detect invisible steam jets.
- Evacuate the area and notify the Control Room to trigger the emergency steam shutoff sequence. Do not attempt to close manual steam valves locally during an active high-pressure leak.
