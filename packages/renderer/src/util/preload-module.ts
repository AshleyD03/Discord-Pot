console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)


window.ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

export default {}
