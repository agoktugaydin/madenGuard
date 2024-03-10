import asyncio
import random
import socketio

sio = socketio.AsyncClient()


async def send_data():
    uri = "ws://10.3.12.209:5600"  # Change the WebSocket server address and port
    await sio.connect(uri)

    device_id_list = [
        "3bf76280-6ca9-4d83-9ffb-db112de00c24",
        "51b8b9eb-6dae-4f75-99f0-84740a2fe42a",
        "5872dede-9499-487f-a8db-f199d6522160",
        "796bcaa5-986f-4e16-b123-ea77aaf0485f",
        "a3cb5588-dbe4-4358-a175-9c3249f9efac",
        "ae4b6b80-06b2-4238-bc32-c4415b4aa686",
        "e19670df-e141-41cd-b64c-889c76806847",
    ]

    while True:
        gas_intensity = random.randint(0, 10)
        zone = str(random.randint(1, 81)) + "C" + str(random.randint(1, 81))

        if random.random() < 0.1:
            gas_intensity = random.randint(60, 70)

        data = {
            "deviceId": random.choice(device_id_list),
            "gasIntensity": gas_intensity,
            "zone": zone,
        }

        try:
            await sio.emit("message", data)
            print(f"Sent data: {data}")
        except Exception as e:
            print(f"Error: {e}")

        await asyncio.sleep(0.8)


if __name__ == "__main__":
    asyncio.get_event_loop().create_task(send_data())
    asyncio.get_event_loop().run_forever()
