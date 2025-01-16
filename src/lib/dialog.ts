export const init = () => {
  document
    .querySelectorAll<HTMLElement>('[data-dialog-target]')
    .forEach(element => {
      const dialogId = element.dataset.dialogTarget;
      if (!dialogId) return;
      const dialog = document.getElementById(dialogId);

      element.addEventListener('click', () => {
        // @ts-expect-error TS hasn't caught up with this yet
        dialog?.showModal();
      });

      dialog?.querySelectorAll('[data-dialog-close]').forEach(closer => {
        closer.addEventListener('click', () => {
          // @ts-expect-error TS hasn't caught up with this yet
          dialog?.close();
        });
      });
    });
};
