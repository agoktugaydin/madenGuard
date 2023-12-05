import asyncio
import random
import socketio

sio = socketio.AsyncClient()

# Define TURKIYE boundaries
TURKIYE_LATITUDE_RANGE = (36, 42)
TURKIYE_LONGITUDE_RANGE = (26, 45)


async def send_data():
    uri = "ws://localhost:3001"
    await sio.connect(uri)

    while True:
        device_id = random.randint(1, 10)
        user_id = random.randint(1, 10)
        latitude = random.uniform(*TURKIYE_LATITUDE_RANGE)
        longitude = random.uniform(*TURKIYE_LONGITUDE_RANGE)
        gas_intensity = random.randint(1, 100)

        data = {
            "deviceId": device_id,
            "userId": user_id,
            "gasIntensity": gas_intensity,
            "latitude": latitude,
            "longitude": longitude,
        }

        try:
            await sio.emit("message", data)
            print(f"Sent data: {data}")
        except Exception as e:
            print(f"Error: {e}")

        await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.get_event_loop().create_task(send_data())
    asyncio.get_event_loop().run_forever()
