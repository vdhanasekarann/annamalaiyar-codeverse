let volatileDeviceId = null;

export function getDeviceId() {
  try {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }
    volatileDeviceId = id;
    return id;
  } catch {
    if (!volatileDeviceId) {
      volatileDeviceId = crypto.randomUUID();
    }
    return volatileDeviceId;
  }
}
