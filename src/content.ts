import browser from "webextension-polyfill"

function recreateNode(el: HTMLElement): HTMLElement {
  const newEl = el.cloneNode(false);
  while (el.hasChildNodes()) {
    newEl.appendChild(el.firstChild!);
  }
  el.parentNode!.replaceChild(newEl, el);
  return newEl as HTMLElement
}

function newClickHandler(e: MouseEvent) {
  e.stopImmediatePropagation()
  e.preventDefault()

  const a = (e.currentTarget as HTMLElement).querySelector("a#video-title-link")
  if (!a) {
    alert("Could not find video link!")
    return
  }
  const href = a.getAttribute("href")
  if (!href) {
    alert("Could not find video link!")
    return
  }

  const url = new URL(href, window.location.toString())
  const freetubeUrl = `freetube://${url}`

  browser.runtime.sendMessage(browser.runtime.id, freetubeUrl)
  console.log(freetubeUrl)
}

function wrapHomepage() {
  const components = document.querySelectorAll("ytd-rich-grid-media")
  components.forEach((c) => {
    if (c.getAttribute("freetube-hooked") === "true") {
      return
    }
    recreateNode(c as HTMLElement).addEventListener("click", newClickHandler)
    c.setAttribute("freetube-hooked", "true")
  })
}

function debounce(fn: () => void, timeout: number): () => void {
  let lastTime: number = new Date().getTime()
  let timer: number | undefined

  const exec = () => {
    lastTime = new Date().getTime()
    timer = undefined
    fn()
  }

  return () => {
    const now = new Date().getTime()
    if (now - lastTime >= timeout) {
      exec()
      return
    }
    lastTime = now
    clearTimeout(timer)
    timer = setTimeout(exec, timeout)
  }
}

const observer = new MutationObserver(debounce(() => {
  observer.disconnect()
  wrapHomepage()
  observer.observe(document.body, {
    attributes: false,
    childList: true,
    subtree: true,
  })
}, 500))

observer.observe(document.body, {
  attributes: false,
  childList: true,
  subtree: true,
})

