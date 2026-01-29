import { apiPublic } from "./apiLocal";


export const dwsGetLatest = (deviceId) =>
  apiPublic.get("/dws/medicoes/latest", {
    headers: { "X-DEVICE-TOKEN": "projeto-m3-esp32-2026" },
    params: deviceId ? { device_id: deviceId } : undefined,
  });
