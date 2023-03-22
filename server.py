#!/usr/bin/env python

import asyncio
import time

import serial
from websockets import serve

time.sleep(1)

async def main():
    ser = serial.Serial('/dev/ttyUSB0', baudrate=115200, timeout=1)

    # Send the "Get Current Sensor Data" command (opcode 142)
    ser.write(bytes([142]))

    # Request the Battery Charge (packet ID 25) from the sensor data (opcode 19)
    ser.write(bytes([25]))

    # Read the response (2 bytes)
    response = ser.read(2)

    # Extract the battery level (in millivolts) from the response
    cur = int.from_bytes(response, byteorder='big')

    # Send the "Get Current Sensor Data" command (opcode 142)
    ser.write(bytes([142]))

    # Request the Battery Charge (packet ID 25) from the sensor data (opcode 19)
    ser.write(bytes([26]))

    # Read the response (2 bytes)
    response = ser.read(2)

    # Extract the battery level (in millivolts) from the response
    cap = int.from_bytes(response, byteorder='big')

    print(f"Current battery level: {cur / cap}mah")

    async def control_roomba(websocket):
        async for message in websocket:
            ser.write(message)
            await asyncio.sleep(0.1)

    async with serve(control_roomba, "0.0.0.0", 8765):
        # run forever
        await asyncio.Future()

    ser.close()

asyncio.run(main())
