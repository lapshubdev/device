# Racetrack Hero (codename: Track Idol)

### Overview

Racetrack Hero is a software solution designed to transform your Raspberry Pi into a powerful data acquisition and analysis tool for motorsports enthusiasts. Whether you're a professional racer, amateur driver, or simply passionate about cars and racing, Racetrack Hero provides the tools you need to analyze and improve your performance on the track.

## Join the Racetrack Hero Community! 🏎️

Have questions, want to share your build, or just chat with fellow enthusiasts? Join our Discord server:

[![Join Our Discord](https://img.shields.io/badge/Discord-Join%20Us-blue.svg)](https://discord.gg/R8nzCjyQ)

👉 [Click here to join the conversation!](https://discord.gg/R8nzCjyQ)

### Features

- **Data Logging:** Capture real-time data from your vehicle's onboard sensors, including GPS, acceleration, speed, RPM, and more.
- **Visualization:** Visualize your driving data in real-time or post-session to analyze your performance and identify areas for improvement.
- **Comparison Tools:** Compare your laps side by side to understand where you're gaining or losing time on the track.
- **Customizable Dashboards:** Create custom dashboards tailored to your preferences, displaying the metrics that matter most to you.
- **Export and Sharing:** Export your data for further analysis or share it with friends, coaches, or fellow racers.

### Acceptance
By using Racetrack Hero software and the associated hardware component, you agree to all of the terms and conditions below.

### Racetrack Hero License

This software is licensed under the [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.html).

### No Liability

The Racetrack Hero software and hardware component come as is, without any warranty or condition, and the licensor will not be liable to you for any damages arising out of these terms or the use or nature of the Racetrack Hero software or hardware component, under any kind of legal claim. This includes, but is not limited to, any accidents, injuries, deaths, or damage to property, including vehicles, that may occur as a result of using the Racetrack Hero software or hardware component for building a telemetry device with a lap timer or any related purposes.

### Getting Started

To get started with Racetrack Hero on Raspberry Pi 4 and 0 W with GPS hat ensure to obtain following components:

### Headless Device
<img width="480" src="https://github.com/racetrackhero/device/assets/7461901/e86ad624-afa8-47d7-b406-87adb6317e0f"/>
<img width="480" src="https://github.com/racetrackhero/device/assets/7461901/e9a98945-456f-40da-84e9-e45965a3d4df"/>

### Hardware Components
1. Rasbperry Pi zero W 2. 
2. [Berry GPS-IMU V4](https://ozzmaker.com/product/berrygps-imu). You can also obtain different GPS hats which might be already compatible with this software (look at GPS hat drivers in "./libs/gps" directory).
3. GPS Antenna - 32db High Gain Cirocomm 5cm Active GPS Antenna Ceramic Antenna 25x25x2mm Geekstory
4. ZTE MF833V 4G LTE USB Modem Dongle for data.
5. Case - UniPiCase Pi Zero Case - Tall (Stock Faceplate)
6. [Suction Cup](https://www.amazon.com/dp/B07YJJSCLX?psc=1&ref=product_details)

### Assembly
1. Install the Berry GPS hat onto the Raspberry Pi0. Soldering is required for getting the hat attached to it.
<img width="620" height="480" src="https://github.com/racetrackhero/device/assets/7461901/01eb32f4-33a6-49e3-b488-f37f1a2767d8"/>

2. Obtain the GPS floor either by ordering it from the Racetrack Hero store, or by printing it yourself from the following CAD file.
3. Attach the GPS floor onto the top of the stack.
4. Attach the GPS antenna onto the previously printed/obtained GPS floor.
5. Attach the suction cups into the shell.
6. Glue all thing together, being generous, at the end of the day this will be on your winshield.
7. Insert the GPS angled connector into the mini USB on PI0, and connect the ZTE modem. Angle it like on this picture, glue it all together.



## Touchscreen Device with bigger screen
<img width="480" height="620" src="https://github.com/racetrackhero/device/assets/7461901/6c9e1012-b2a1-4dff-8652-64834cdae670"/>

### Hardware Components
1. Raspberry Pi 4
2. [Berry GPS-IMU V4](https://ozzmaker.com/product/berrygps-imu). You can also obtain different GPS hats which might be already compatible with this software (look at GPS hat drivers in "./libs/gps" directory).
3. External GPS Antenna - GPS/GNSS Magnetic Mount Antenna - 3m (SMA)
4. SMA GPS Connector. 
5. ZTE MF833V 4G LTE USB Modem Dongle for data.
6. Pi Case 
7. Pi Touchscreen 7inch.
   
### Touchscreen Device with smaller screen
<img width="480" height="620" src="https://github.com/racetrackhero/device/assets/7461901/c7ee2db3-504c-4580-96e1-cf88111c5cfa"/>

### Author
- Racetrack Hero was created by Orcha Software, LLC
- Author [wawura](https://github.com/wawura) 
- Website [Racetrack Hero](https://www.racetrackhero.com)


