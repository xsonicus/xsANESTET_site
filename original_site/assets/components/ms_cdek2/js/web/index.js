import(`./core/mscdek.js${window.mscdekConfig.version}`)
  .then(({ Mscdek }) => {
    window.mscdek = new Mscdek();

    window.mscdek.initialize()
      .then(() => {})
      .catch(console.error);
  })
  .catch((err) => {
    console.error("Ошибка загрузки модуля:", err);
  });
