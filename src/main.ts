import { Breakout } from './game/breakout'


const callback = (mutationList: MutationRecord[], observer: MutationObserver) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLDivElement)) return

        node.childNodes.forEach((node) => {
          if (!(node instanceof HTMLDivElement)) return

          node.childNodes.forEach((node) => {
            if (!(node instanceof HTMLDivElement)) {
              return
            }

            if (node.classList.contains('js-yearly-contributions')) {
              const parent = document.getElementsByClassName('js-calendar-graph')[0].childNodes[1] as HTMLDivElement
              if (!parent) return
              parent.style.height = '220px'
              new Breakout(parent)
              observer.disconnect()
            }
          })
        })
      })
    }
  }
}

/**
 * called on github page loaded
 */
function main() {
  const observer = new MutationObserver(callback);

  const targetNode = document.getElementById("user-profile-frame");
  if (!targetNode) return

  observer.observe(targetNode, {
    childList: true,
    subtree: true // needed if the node you're targeting is not the direct parent
  });
}

main()

