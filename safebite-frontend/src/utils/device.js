export const getDeviceId = () => {
    let id = localStorage.getItem('safeBite_deviceId');
    if (!id) {
        // 🔧 FIX: Use crypto.randomUUID() for collision-proof Unique ID
        id = 'device_' + crypto.randomUUID();
        localStorage.setItem('safeBite_deviceId', id);
    }
    return id;
};