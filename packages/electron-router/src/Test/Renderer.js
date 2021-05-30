(async function test() {
  document.body.innerText = await window.TestApi.method();
})();
