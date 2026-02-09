import json
import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict

lines = []
with open("resultado.json") as f:
    for line in f:
        lines.append(json.loads(line))

# Latencias
response_times = [
    e["data"]["value"]
    for e in lines
    if e.get("type") == "Point"
    and e.get("metric") == "http_req_duration"
]

# Throughput
requests_per_second = defaultdict(int)
for i in range(len(response_times)):
    second = i // 20
    requests_per_second[second] += 1

seconds = sorted(requests_per_second.keys())
reqs = [requests_per_second[s] for s in seconds]

# Percentiles
p50 = np.percentile(response_times, 50)
p95 = np.percentile(response_times, 95)
p99 = np.percentile(response_times, 99)

# ===============================
# GRAFICAS
# ===============================
fig, axs = plt.subplots(3, 1, figsize=(8, 10))

# 1️⃣ Latencia
axs[0].plot(response_times)
axs[0].set_title("Tiempo de respuesta (ms)")
axs[0].set_xlabel("Request")
axs[0].set_ylabel("ms")

# 2️⃣ Throughput
axs[1].plot(seconds, reqs)
axs[1].set_title("Throughput (req/s)")
axs[1].set_xlabel("Tiempo (s)")
axs[1].set_ylabel("Requests")

# 3️⃣ Percentiles
axs[2].bar(["p50", "p95", "p99"], [p50, p95, p99])
axs[2].set_title("Percentiles de latencia")
axs[2].set_ylabel("ms")

plt.tight_layout()
plt.show()