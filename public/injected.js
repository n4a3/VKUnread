window.addEventListener('VKU_NOTIFICATION', () => {
  Notifier.showEvent({
    type: 'mail',
    title: 'VKUnread',
    text: 'Диалог не был прочитан',
    timeoutConf: {
      default: 2000,
      default_am: 2000,
      unfreeze: 1000,
      unfreeze_am: 1000
    }
  });
});
