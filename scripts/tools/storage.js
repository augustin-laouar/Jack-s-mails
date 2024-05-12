export async function store(jsonValue) {
    await browser.storage.local.set(jsonValue);
}

export async function read(key) {
    const data = await browser.storage.local.get(key);
    return data;
}

export async function remove(key) {
    browser.storage.local.remove(key);
}