import uvicorn
import multiprocessing
from server import user as server_app
from Delivery_partner import app1 as delivery_app
from Restaurant_owner import app as restaurant_app

def run_app(app, port):
    uvicorn.run(app, host='0.0.0.0', port=port)

if __name__ == "__main__":
    apps = [(server_app, 8000), (delivery_app, 8001), (restaurant_app, 8002)]
    processes = []

    for app, port in apps:
        process = multiprocessing.Process(target=run_app, args=(app, port))
        processes.append(process)

    for process in processes:
        process.start()
        
    for process in processes:
        process.join()
