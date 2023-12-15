import asyncio
import random
import socketio

sio = socketio.AsyncClient()

# Define Turkiye's boundaries
TURKIYE_LATITUDE_RANGE = (36, 42)
TURKIYE_LONGITUDE_RANGE = (26, 45)


async def send_data():
    uri = "ws://localhost:3001"
    await sio.connect(uri)

    device_id = 1  # Initialize user_id to 1

    while True:
        # Increase user_id from 1 to 10 and reset it when it reaches 10
        device_id = device_id % 10 + 1
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

        await asyncio.sleep(0.3)


if __name__ == "__main__":
    asyncio.get_event_loop().create_task(send_data())
    asyncio.get_event_loop().run_forever()
