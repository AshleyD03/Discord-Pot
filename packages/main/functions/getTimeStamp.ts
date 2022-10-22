export default () => {
  const date = new Date();
  return `[${date.toLocaleTimeString()} ${date.getDay()}/${date.getMonth()}]`
}