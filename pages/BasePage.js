const actions = require('../utils/actions');

// Reusable actions for every page object. Each one accepts a locator or a selector
// string, and every interaction draws a red box around the element first.
class BasePage {
   constructor(page) {
      this.page = page;
   }
   locator(target) {
      return typeof target === 'string' ? this.page.locator(target) : target;
   }
   async click(target, options) {
      await actions.highlightAndClick(this.locator(target), options);
   }
   async doubleClick(target, options) {
      await actions.highlightAndDoubleClick(this.locator(target), options);
   }
   async rightClick(target, options) {
      await actions.highlightAndRightClick(this.locator(target), options);
   }
   async hover(target, options) {
      await actions.highlightAndHover(this.locator(target), options);
   }
   async fill(target, value, options) {
      await actions.highlightAndFill(this.locator(target), value, options);
   }
   async type(target, text, options) {
      await actions.highlightAndType(this.locator(target), text, options);
   }
   async press(target, key, options) {
      await actions.highlightAndPress(this.locator(target), key, options);
   }
   async check(target, options) {
      await actions.highlightAndCheck(this.locator(target), true, options);
   }
   async uncheck(target, options) {
      await actions.highlightAndCheck(this.locator(target), false, options);
   }
   async select(target, option, options) {
      await actions.highlightAndSelect(this.locator(target), option, options);
   }
   async dragTo(source, target, options) {
      await actions.highlightAndDragTo(this.locator(source), this.locator(target), options);
   }
   clickForNewTab(target, options) {
      return actions.clickForNewTab(this.locator(target), options);
   }
   clickAndHandleDialog(target, options) {
      return actions.clickAndHandleDialog(this.locator(target), options);
   }
   getText(target) {
      return actions.getText(this.locator(target));
   }
   getTexts(target) {
      return actions.getTexts(this.locator(target));
   }
   isDisplayed(target, timeout) {
      return actions.isDisplayed(this.locator(target), timeout);
   }
}

module.exports = { BasePage };
