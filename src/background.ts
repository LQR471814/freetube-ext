import browser from "webextension-polyfill"

browser.runtime.onInstalled.addListener(() => {
  console.log("Backend installed!")
})

browser.runtime.onMessage.addListener(async (details) => {
  console.log(details)
  if (typeof details !== "string") {
    return
  }

  const originalTab = (await browser.tabs.query({ active: true, lastFocusedWindow: true }))[0]
  const tab = await browser.tabs.create({
    url: details,
  })

  if (tab.id) {
    await browser.tabs.remove(tab.id)
  }
  if (originalTab.id) {
    await browser.tabs.update(originalTab.id, {
      active: true
    })
  }
})

