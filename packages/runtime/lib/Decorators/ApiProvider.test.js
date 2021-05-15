"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable max-classes-per-file */
const ApiDefinition_1 = require("./ApiDefinition");
const ApiProvider_1 = require("./ApiProvider");
const State_1 = require("./State");
describe('@ApiProvider', () => {
    let Definition1 = class Definition1 {
    };
    Definition1 = tslib_1.__decorate([
        ApiDefinition_1.ApiDefinition('def-1')
    ], Definition1);
    let Definition2 = class Definition2 {
    };
    Definition2 = tslib_1.__decorate([
        ApiDefinition_1.ApiDefinition('def-2')
    ], Definition2);
    beforeEach(() => {
        State_1.resetState();
    });
    it('undecorated', () => {
        class Test {
        }
        expect(ApiProvider_1.getApiProviders(Test)).toEqual([]);
        expect(ApiProvider_1.getApiProviderNames(Test)).toEqual([]);
    });
    it('abstract class', () => {
        // @ts-expect-error
        let Test = 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class Test {
        };
        Test = tslib_1.__decorate([
            ApiProvider_1.ApiProvider(Definition1)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ], Test);
    });
    it('concreate class', () => {
        let Test = class Test {
        };
        Test = tslib_1.__decorate([
            ApiProvider_1.ApiProvider(Definition1)
        ], Test);
        expect(ApiProvider_1.getApiProviders(Test)).toEqual([Definition1]);
        expect(ApiProvider_1.getApiProviderNames(Test)).toEqual(['def-1']);
    });
    it('multiple on one target', () => {
        let Test = class Test {
        };
        Test = tslib_1.__decorate([
            ApiProvider_1.ApiProvider(Definition1),
            ApiProvider_1.ApiProvider(Definition2)
        ], Test);
        expect(ApiProvider_1.getApiProviders(Test)).toEqual([Definition2, Definition1]);
        expect(ApiProvider_1.getApiProviderNames(Test)).toEqual(['def-2', 'def-1']);
    });
});
//# sourceMappingURL=ApiProvider.test.js.map