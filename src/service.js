/* eslint-disable require-jsdoc */
const logger = require('@wdio/logger').default;
const { renderDebugMsg } = require('./utils');
const log = logger('wdio-cucumber-viewport-logger-service');

// eslint-disable-next-line require-jsdoc
// noinspection JSUnusedLocalSymbols
class ViewportLoggerService {
    // eslint-disable-next-line no-unused-vars
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line no-unused-vars
    constructor(serviceOptions, capabilities, config) {
        log.trace('constructor START');
        log.debug(`service options: ${serviceOptions}`);
        this.options = serviceOptions;
        this.scenario = {};
        this.feature = {};
        this.options = serviceOptions || {};
        log.trace('constructor END');
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * this browser object is passed in here for the first time
     */
    before(config, spec, browser) {
        if (this.options.enabled === false) return;
        this.browser = browser;
    }

    async beforeScenario(...args) {
        if (this.options.enabled === false) {
            browser.addCommand(
                'logToViewport',
                (message) => {
                    // dummy
                }
            );
            return
        }
        try {
            log.debug('beforeScenario hook START');
            let uri;
            let feature;
            let scenario;
            let sourceLocation;
            if (!args[0]?.gherkinDocument) { // < WDIO v7
                // eslint-disable-next-line no-unused-vars
                [uri, feature, scenario, sourceLocation] = args;
            } else { // >= WDIO v7
                feature = args[0]?.gherkinDocument.feature;
                scenario = args[0]?.pickle;
            }

            this.scenario = scenario;
            this.feature = feature;

            if (this.options.tag && !scenario.tags.map((x) => x.name)
                .includes(this.options.tag)) {
                log.debug(`beforeScenario: the option tag for visual scenario is not empty (${this.options.tag}), but scenario is not contains such tags`);
                return;
            }

            const $this = this;
            browser.addCommand(
                'logToViewport',
                // eslint-disable-next-line arrow-body-style
                (message) => {
                    renderDebugMsg(browser, { message, styles: this.options.styles })
                }
            );
            log.trace('beforeScenario hook END');
        } catch (e) {
            const errMsg = 'error in Cucumber Viewport Logger service,\n'
                + ` beforeScenario hook: '${e + (e.trace || '')}' read the logs`;
            const errMockFn = () => {
                log.error(errMsg);
                throw new Error(errMsg);
            };

            browser.addCommand(
                'logToViewport',
                // eslint-disable-next-line arrow-body-style
                errMockFn
            );

            log.error(errMsg);
            throw new Error(errMsg);
        }
    }

    beforeStep(...args) {
        if (this.options.enabled === false) return;

        try {
            // v7 or v6
            const message = args[0].text || args[0].step.step.text;
            const keyword = args[0].keyword || args[0].step.step.keyword;

            renderDebugMsg(this.browser,
                {
                    message: message,
                    keyword: keyword,
                    numberOfSteps: this.options.numberOfSteps,
                    styles: this.options.styles,
                });
        } catch (e) {
            const errMsg = 'error in Cucumber Viewport Logger service,\n'
                + ` beforeStep hook: '${e + (e.trace || '')}' read the logs`;
            log.error(errMsg);
            throw new Error(errMsg);
        }
    }
}

module.exports = ViewportLoggerService;
