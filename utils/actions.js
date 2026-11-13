const { test } = require('@playwright/test');

// Draws a red box around the element and returns a function that removes it again.
async function highlight(locator, { color = 'red', pause = 400 } = {}) {
   await locator.waitFor({ state: 'visible' });
   await locator.scrollIntoViewIfNeeded();
   const element = await locator.elementHandle();
   const prev = await element.evaluate((el, color) => {
      const old = { outline: el.style.outline, offset: el.style.outlineOffset };
      el.style.outline = `3px solid ${color}`;
      el.style.outlineOffset = '2px';
      return old;
   }, color);
   await locator.page().waitForTimeout(pause);
   // the element may be gone after the action (navigation, re-render), so removal is best effort
   return () => element.evaluate((el, p) => {
      el.style.outline = p.outline;
      el.style.outlineOffset = p.offset;
   }, prev).catch(() => {});
}

// Every action below goes through here: red box -> screenshot -> action -> box removed.
// With a title the action is also reported as a named step (HTML and Allure reports),
// and the screenshot, taken while the red box is on the element, is attached to that step.
async function withHighlight(locator, action, options, title) {
   const run = async () => {
      const removeHighlight = await highlight(locator, options);
      try {
         await test.info().attach('screenshot', {
            body: await locator.page().screenshot(),
            contentType: 'image/png'
         });
         return await action();
      } finally {
         await removeHighlight();
      }
   };
   return title ? test.step(title, run) : run();
}

const highlightAndClick = (locator, options) =>
   withHighlight(locator, () => locator.click(), options, `click ${locator}`);

const highlightAndDoubleClick = (locator, options) =>
   withHighlight(locator, () => locator.dblclick(), options, `double click ${locator}`);

const highlightAndRightClick = (locator, options) =>
   withHighlight(locator, () => locator.click({ button: 'right' }), options, `right click ${locator}`);

const highlightAndHover = (locator, options) =>
   withHighlight(locator, () => locator.hover(), options, `hover ${locator}`);

const highlightAndFill = (locator, value, options) =>
   withHighlight(locator, () => locator.fill(value), options, `fill ${locator}`);

// types key by key, for search boxes / autocompletes that react to each keystroke
const highlightAndType = (locator, text, { delay = 100, ...options } = {}) =>
   withHighlight(locator, () => locator.pressSequentially(text, { delay }), options, `type into ${locator}`);

// key: 'Enter', 'Tab', 'Control+A', ...
const highlightAndPress = (locator, key, options) =>
   withHighlight(locator, () => locator.press(key), options, `press ${key} on ${locator}`);

// checkbox / radio; pass checked = false to untick
const highlightAndCheck = (locator, checked = true, options) =>
   withHighlight(locator, () => locator.setChecked(checked), options, `${checked ? 'check' : 'uncheck'} ${locator}`);

// <select> dropdown; option is a value/label string or { label } / { value } / { index }
const highlightAndSelect = (locator, option, options) =>
   withHighlight(locator, () => locator.selectOption(option), options, `select ${JSON.stringify(option)} in ${locator}`);

const highlightAndDragTo = (source, target, options) =>
   test.step(`drag ${source} to ${target}`, async () => {
      const removeTargetHighlight = await highlight(target, { ...options, pause: 0 });
      try {
         await withHighlight(source, () => source.dragTo(target), options);
      } finally {
         await removeTargetHighlight();
      }
   });

// clicks a link/button that opens a new tab and returns that tab's page
async function clickForNewTab(locator, options) {
   const [newPage] = await Promise.all([
      locator.page().context().waitForEvent('page'),
      highlightAndClick(locator, options)
   ]);
   await newPage.waitForLoadState('domcontentloaded');
   return newPage;
}

// clicks something that raises alert/confirm/prompt, answers it and returns its message
async function clickAndHandleDialog(locator, { accept = true, promptText, ...options } = {}) {
   const page = locator.page();
   let message;
   const onDialog = async dialog => {
      message = dialog.message();
      await (accept ? dialog.accept(promptText) : dialog.dismiss());
   };
   page.once('dialog', onDialog);
   try {
      await highlightAndClick(locator, options);
   } finally {
      page.off('dialog', onDialog);
   }
   return message;
}

async function getText(locator) {
   return (await locator.innerText()).trim();
}

// texts of all matching elements; waits for the first one to show up
async function getTexts(locator) {
   await locator.first().waitFor();
   return (await locator.allInnerTexts()).map(text => text.trim());
}

// true/false instead of a failure, for optional elements (banners, popups, empty states)
async function isDisplayed(locator, timeout = 5000) {
   try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
   } catch (error) {
      if (error.name === 'TimeoutError') return false;
      throw error;
   }
}

module.exports = {
   highlight, withHighlight,
   highlightAndClick, highlightAndDoubleClick, highlightAndRightClick, highlightAndHover,
   highlightAndFill, highlightAndType, highlightAndPress, highlightAndCheck, highlightAndSelect,
   highlightAndDragTo, clickForNewTab, clickAndHandleDialog,
   getText, getTexts, isDisplayed
};
